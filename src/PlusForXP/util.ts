import {decode as tifDecode} from 'tiff'
import {decode as jpgDecode} from 'jpeg-js'
import { FakeTextureHolder } from '../TextureHolder.js';
import { DataFetcher } from '../DataFetcher.js';
import { Interpolation, Keyframe, Object, PlusSceneData } from './data_types.js';

export const decodeImageData = (path: string, data: ArrayBufferLike) : {data: Uint8Array, width: number, height: number} | null => {
  const extension = path.toLowerCase().split(".").pop();
  switch (extension) {
    case "tif": 
    case "tiff": {
      const result = tifDecode(data)[0];
      const { width, height, components } = result;
      if (components === 3) {
        return {
          width, 
          height, 
          data: new Uint8Array(Array(result.size).fill(0).flatMap((_, i) => [...result.data.slice(i * 3, (i + 1) * 3), 0xFF]))
        }
      }
      return {width, height, data: new Uint8Array(result.data)};
    }
    case "jpg":
    case "jpeg": {
      return jpgDecode(data as ArrayBuffer, {useTArray: true});
    }
  }
  return null;
};

export type PlusTexture = {
  path: string,
  width: number,
  height: number,
  data: Uint8Array
}

export const fetchTextures = async (dataFetcher: DataFetcher, basePath: string, sceneData: PlusSceneData[]) : Promise<PlusTexture[]> => {
  const texturePaths = sceneData
        .flatMap(({shaders}) => shaders ?? [])
        .map(shader => shader.texture)
        .filter(texture => texture != null)
        .map(texturePath => texturePath.replaceAll("\\", "/"));

    const textureData = await Promise.all(
      texturePaths.map(path => dataFetcher.fetchData(`${basePath}/${path}`).then(data => ({path, data}))));
    
    return textureData.map(({path, data}) => ({
      ...decodeImageData(path, data.arrayBuffer)!,
      path
    }));
}

export const makeTextureHolder = (textures: PlusTexture[]) => new FakeTextureHolder(
  textures.map((texture) => {
    const {path: name, data: rgba8, width, height} = texture;
    const canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = [width, height];
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(rgba8);
    ctx.putImageData(imageData, 0, 0);
    return { name, surfaces: [canvas] }
  })
);

type InterpolationFunc = (toKey: Keyframe, fromKey: Keyframe, now: number, duration: number) => number;

const interpolations: Record<Interpolation, InterpolationFunc> = {
  linear: (toKey, fromKey, now, duration) => {
    const percent = now / duration;
    return toKey.value * percent + fromKey.value * (1 - percent);
  },
  hermite: (toKey, fromKey, now, duration) => {
    const p1 = now / duration;
    const p2 = p1 ** 2;
    const p3 = p1 ** 3;

    const [r1, r2, r3, r4] = [
      +(2 * p3 - 3 * p2) + 1,
      -(2 * p3 - 3 * p2),
       (p3 - p2) - p2 + p1,
       (p3 - p2),
    ];

    return (
      r1 * fromKey.value +
      r2 * toKey.value +
      r3 * fromKey.tangentOut! +
      r4 * toKey.tangentIn!
    );
  }
};
