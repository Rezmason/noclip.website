import {decode as tifDecode} from 'tiff'
import {decode as jpgDecode} from 'jpeg-js'

import * as Viewer from '../viewer.js';
import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { SceneContext, SceneDesc, SceneGroup } from "../SceneBase.js";
import { SceneGfx } from "../viewer.js";
import { FakeTextureHolder, TextureHolder } from '../TextureHolder.js';
import { NamedArrayBufferSlice } from '../DataFetcher.js';

import { PlusSceneData, parse as parseSCX } from './scx_parser.js'
import { dataSets } from "./data_sets.js"
class PlusForXPSceneDesc implements SceneDesc {
  
  constructor(private screensaverID: string, private variety: string, public name: string) {}

  get id() {
    return `${this.screensaverID}-${this.variety}`
  }

  decodeImageData(path: string, data: ArrayBufferLike) : {data: Uint8Array, width: number, height: number} | null {
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
  }
  
  async createScene(device: GfxDevice, sceneContext: SceneContext): Promise<SceneGfx> {
    const viewerTextures: Viewer.Texture[] = [];

    const dataFetcher = sceneContext.dataFetcher;
    // TODO: wrap it in a cache
    
    const {screensaverID, variety} = this;
    const basePath = `${id}/${dataSets[screensaverID].basePath}`
    const dataPaths = dataSets[screensaverID].variants[variety];

    const fetchedData: NamedArrayBufferSlice[] = await Promise.all(dataPaths.map(path => dataFetcher.fetchData(`${basePath}/${path}`)));
    const data: PlusSceneData[] = await Promise.all(fetchedData.map(a => parseSCX(new Uint8Array(a.arrayBuffer))));
    
    const texturePaths = data
      .flatMap(({shaders}) => shaders ?? [])
      .map(shader => shader.texture)
      .filter(texture => texture != null)
      .map(texturePath => texturePath.replaceAll("\\", "/"));

    const textureData: {path: string, data: NamedArrayBufferSlice}[] = await Promise.all(texturePaths.map(path => dataFetcher.fetchData(`${basePath}/${path}`).then(data => ({path, data}))));
    
    for (const {path, data} of textureData) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const decoded = this.decodeImageData(path, data.arrayBuffer)
      if (decoded == null) {
        console.warn("Couldn't decode texture", path);
        continue;
      }
      const {data: rgba8, width, height} = decoded;
      [canvas.width, canvas.height] = [width, height];
      const imageData = ctx.createImageData(width, height);
      imageData.data.set(rgba8);
      ctx.putImageData(imageData, 0, 0);
      viewerTextures.push({
        name: path,
        surfaces: [canvas]
      })
    }
    
    return new PlusRenderer(new FakeTextureHolder(viewerTextures));
  }
}

class PlusRenderer implements Viewer.SceneGfx {
  
  constructor(public textureHolder: TextureHolder<any>) {}

  /*
  createPanels?(): Panel[] {}
  createCameraController?(): CameraController {}
  adjustCameraController?(c: CameraController): void {}
  getDefaultWorldMatrix?(dst: mat4): void {}
  serializeSaveState?(dst: ArrayBuffer, offs: number): number {}
  deserializeSaveState?(src: ArrayBuffer, offs: number, byteLength: number): number {}
  onstatechanged?: (() => void) | undefined;
  */
 
  render(device: GfxDevice, renderInput: Viewer.ViewerRenderInput): void {
    // TODO
    // update the sim, if one is running
    // update the animations
    // redraw the scene
  }
  
  destroy(device: GfxDevice): void {
    this.textureHolder.destroy(device);
  }

}

const id = "PlusForXP";
const name = "Plus! for XP";
const sceneDescs = [
    "Mercury Pool",
    new PlusForXPSceneDesc("mercury_pool", "cavern", "Cavern"),
    new PlusForXPSceneDesc("mercury_pool", "industrial", "Industrial"),
    "Robot Circus",
    new PlusForXPSceneDesc("robot_circus", "classic", "Classic"),
    new PlusForXPSceneDesc("robot_circus", "arena", "Arena"),
    "Sand Pendulum",
    new PlusForXPSceneDesc("sand_pendulum", "grotto", "Grotto"),
    new PlusForXPSceneDesc("sand_pendulum", "checkerboard", "Checkerboard"),
];

export const sceneGroup: SceneGroup = {
  id, name, sceneDescs, hidden: true,
};
