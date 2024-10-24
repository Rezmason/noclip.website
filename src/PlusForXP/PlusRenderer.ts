import * as Viewer from '../viewer.js';
import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { TextureHolder } from "../TextureHolder.js";
import { PlusSceneData } from "./scx_parser.js";

export default class PlusRenderer implements Viewer.SceneGfx {
  
  constructor(device: GfxDevice, basePath: string, sceneData: PlusSceneData[], public textureHolder: TextureHolder<any>) {
    
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