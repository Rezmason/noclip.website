import * as Viewer from '../viewer.js';
import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { TextureHolder } from "../TextureHolder.js";
import { PlusSceneData } from './data_types.js';
import { PlusTexture } from './util.js';

type PlusContext = {
  basePath: string,
  sceneData: PlusSceneData[],
  textures: PlusTexture[]
};

export default class PlusRenderer implements Viewer.SceneGfx {

  texturesByPath:Record<string, PlusTexture>;
  
  constructor(device: GfxDevice, context: PlusContext, public textureHolder: TextureHolder<any>) {
    this.texturesByPath = Object.fromEntries(
      context.textures.map(texture => ([texture.path, texture]))
    );
    for (const data of context.sceneData) {
      this.buildScene(data);
    }
  }

  private buildScene(data: PlusSceneData) {
    
    for (const shader of data.shaders) {}
    for (const global of data.scenes) {}
    for (const camera of data.cameras) {}
    for (const light of data.lights) {}
    for (const object of data.objects) {}

    // TODO: parent the nodes
  }

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