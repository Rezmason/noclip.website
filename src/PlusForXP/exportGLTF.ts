import { mat4 } from "gl-matrix";
import { Material, Mesh, SceneNode, Texture, Transform } from "./types";

type GLTFNode = {
  name: string,
  children?: number[],
  mesh?: number,
  matrix: number[]
};

type GLTFMesh = {
  primitives: GLTFPrimitive[]
};

type GLTFPrimitive = {
  mode: number,
  material: number,
  indices: number,
  attributes: Record<string, number>
};

type GLTFTexture = {
  name: string,
  source: number
};

type GLTFImage = {
  uri: string
}

type GLTFMaterial = {
  name: string,
  doubleSided: boolean,
  pbrMetallicRoughness:{
    baseColorFactor?:[number, number, number, number],
    baseColorTexture?: { index: number },
    metallicFactor: number,
    roughnessFactor: number
  },
  extensions?: { KHR_materials_unlit: {} }
};

type GLTFBuffer = {
  byteLength: number,
  uri: string
};

type GLTFBufferView = {
  buffer: number,
  byteLength: number,
  byteOffset: number,
  target: number
};

type GLTFAccessorType = "SCALAR" | "VEC2" | "VEC3" | "VEC4";

type GLTFAccessor = {
  bufferView: number,
  count: number,
  componentType: number,
  type: GLTFAccessorType,
  max?: number[],
  min?: number[]
};

const getMinMax = (positions: number[]) => {
  const [min, max] = [positions.slice(0, 3), positions.slice(0, 3)];
  for (let i = 0; i < positions.length; i += 3) {
    min[0] = Math.min(min[0], positions[i + 0]);
    min[1] = Math.min(min[1], positions[i + 1]);
    min[2] = Math.min(min[2], positions[i + 2]);

    max[0] = Math.max(max[0], positions[i + 0]);
    max[1] = Math.max(max[1], positions[i + 1]);
    max[2] = Math.max(max[2], positions[i + 2]);
  }
  return {min, max};
}

export default async (name: string, root: SceneNode, materialsByName: Map<string, Material>, texturesByPath:Record<string, Texture>) => {
  const nodes : SceneNode[] = [root];
  const meshes : Mesh[] = [];
  const materials : Material[] = [];
  const textureNames : string[] = [];

  for (const material of materialsByName.values()) {
    materials.push(material);
    const texture = material.shader.texture;
    if (texture != null) {
      textureNames.push(texture.replaceAll("\\", "/"));
    }
  }

  const findAll = (node: SceneNode) => {
    for (const mesh of node.meshes) {
      meshes.push(mesh);
    }
    for (const child of node.children) {
      nodes.push(child);
      findAll(child);
    }
  }
  findAll(root);

  const nodesWithMultipleMeshes = nodes.filter(node => node.meshes.length > 1);
  const wrappers = new Map<SceneNode, SceneNode[]>();
  const wrapperTransform: Transform = { trans: [0, 0, 0], rot: [0, 0, 0], scale: [1, 1, 1] };
  for (const node of nodesWithMultipleMeshes) {
    wrappers.set(node, node.meshes.map((mesh, i) => ({...node, transform: wrapperTransform, name:`${node.name}_mesh_wrap_${i}`, meshes: [mesh]})));
  }
  nodes.push(...[...wrappers.values()].flat());

  const gltfNodes: GLTFNode[] = nodes.map((node) => {
    const {name, transform, meshes: nodeMeshes} = node;
    const children = [...(node.children ?? []), ...(wrappers.get(node) ?? [])];
    return {
      name,
      ...(children.length > 0 ? {children: children.map(child => nodes.indexOf(child))} : {}),
      matrix: transformToMatrix(transform),
      ...(nodeMeshes.length === 1 ? {mesh: meshes.indexOf(nodeMeshes[0])} : {})
    };
  });

  const gltfMaterials: GLTFMaterial[] = materials.map(({shader}) => {
    const { name, diffuse, texture } = shader;
    return {
      name,
      doubleSided: true,
      pbrMetallicRoughness: (texture != null 
        ? { 
          baseColorTexture: { index: textureNames.indexOf(texture.replaceAll("\\", "/"))} ,
          metallicFactor: 0,
          roughnessFactor: 1
        } 
        : {
          baseColorFactor: [...diffuse, 1],
          metallicFactor: 1,
          roughnessFactor: 0
        }),
      ...(texture != null ? { extensions: { KHR_materials_unlit: {} } } : {})
    }
  });

  const gltfTextures: GLTFTexture[] = textureNames.map((name, index) => ({ name, source: index }));

  const gltfImages: GLTFImage[] = await Promise.all(textureNames.map(async (name) => {
    const texture = texturesByPath[name];
    const {rgba8, width, height} = texture;
    const canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = [width, height];
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(rgba8);
    ctx.putImageData(imageData, 0, 0);
    const blob:Blob = await new Promise(resolve => canvas.toBlob((result => resolve(result!))));
    const uri: string = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target!.result as string);
      reader.readAsDataURL(blob);
    });
    return { uri };
  }));

  const gltfBuffers: GLTFBuffer[] = await Promise.all(meshes.map(({positions, normals, bakedColors, texCoords, indices}) => {
    return [
      new Float32Array(positions),
      new Float32Array(normals),
      new Float32Array(bakedColors.map(x => Math.max(0, Math.min(1, x)))),
      new Float32Array(texCoords),
      new Uint16Array(indices)
    ]
  }).flat().map(async a => ({
    byteLength: a.byteLength,
    uri: await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target!.result as string);
      reader.readAsDataURL(new Blob([a.buffer], {type: "application/octet-stream"}));
    })
  })));

  const gltfBufferViews: GLTFBufferView[] = meshes.map((_, i) => ([
      {buffer: i * 5 + 0, byteLength: gltfBuffers[i * 5 + 0].byteLength, byteOffset: 0, target: 34962},
      {buffer: i * 5 + 1, byteLength: gltfBuffers[i * 5 + 1].byteLength, byteOffset: 0, target: 34962},
      {buffer: i * 5 + 2, byteLength: gltfBuffers[i * 5 + 2].byteLength, byteOffset: 0, target: 34962},
      {buffer: i * 5 + 3, byteLength: gltfBuffers[i * 5 + 3].byteLength, byteOffset: 0, target: 34962},
      {buffer: i * 5 + 4, byteLength: gltfBuffers[i * 5 + 4].byteLength, byteOffset: 0, target: 34963},
  ])).flat();

  const gltfAccessors: GLTFAccessor[] = meshes.map(({vertexcount, indexCount, positions}, i) => ([
    {bufferView: i * 5 + 0, count: vertexcount, byteOffset: 0, componentType: 5126, type: "VEC3" as GLTFAccessorType, ...getMinMax(positions)}, // POSITION
    {bufferView: i * 5 + 1, count: vertexcount, byteOffset: 0, componentType: 5126, type: "VEC3" as GLTFAccessorType}, // NORMAL
    {bufferView: i * 5 + 2, count: vertexcount, byteOffset: 0, componentType: 5126, type: "VEC4" as GLTFAccessorType}, // COLOR_0
    {bufferView: i * 5 + 3, count: vertexcount, byteOffset: 0, componentType: 5126, type: "VEC2" as GLTFAccessorType}, // TEXCOORD_0
    {bufferView: i * 5 + 4, count: indexCount, byteOffset: 0, componentType: 5123, type: "SCALAR" as GLTFAccessorType}, // index
  ])).flat();

  const gltfMeshes: GLTFMesh[] = meshes.map(({material}, i) => ({
    primitives: [{
        mode: 4,
        material: materials.indexOf(material),
        attributes: {
          ["POSITION"]: i * 5 + 0,
          ["NORMAL"]: i * 5 + 1,
          ["COLOR_0"]: i * 5 + 2,
          ["TEXCOORD_0"]: i * 5 + 3,
        },
        indices: i * 5 + 4
    }]
  }));

  const gltf = JSON.stringify({
    asset: { version: "2.0" },
    nodes: gltfNodes, 
    materials: gltfMaterials, 
    textures: gltfTextures, 
    images: gltfImages, 
    buffers: gltfBuffers, 
    bufferViews: gltfBufferViews,
    accessors: gltfAccessors,
    meshes: gltfMeshes,
    extensionsRequired: [ "KHR_materials_unlit" ],
    extensionsUsed: [
      "KHR_materials_unlit"
    ],
    scenes: [{
      name: "Scene",
      nodes: [0] // root
    }],
    scene: 0
  }, null, 1);

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([gltf], {type:"model/gltf+json"}));
  link.download = `${name}_noclip.gltf`;
  const event = new MouseEvent("click", {cancelable: true, bubbles: true, view: window});
  document.body.appendChild(link);
  link.dispatchEvent(event);
  document.body.removeChild(link);
};

const transformToMatrix = (transform: Transform) : number[] => {
  const matrix = mat4.create();
  mat4.translate(matrix, matrix, transform.trans);
  mat4.rotateZ(matrix, matrix, transform.rot[2]);
  mat4.rotateY(matrix, matrix, transform.rot[1]);
  mat4.rotateX(matrix, matrix, transform.rot[0]);
  mat4.scale(matrix, matrix, transform.scale);
  return [...matrix];
}