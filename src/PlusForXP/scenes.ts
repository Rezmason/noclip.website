import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { SceneContext, SceneDesc, SceneGroup } from "../SceneBase.js";
import { SceneGfx } from "../viewer.js";

class PlusForXPSceneDesc implements SceneDesc {
  
  constructor(private screensaverID: string, private variety: string, public name: string) {}

  get id() {
    return `${this.screensaverID}-${this.variety}`
  }
  
  createScene(device: GfxDevice, sceneContext: SceneContext): PromiseLike<SceneGfx> {
    throw new Error("Method not implemented.");
  }
}

const id = "PlusForXP";
const name = "Plus! for XP";
const sceneDescs = [
    "Mercury Pool",
    new PlusForXPSceneDesc("mercury_pool", "cavern", "Cavern"),
    new PlusForXPSceneDesc("mercury_pool", "industrial", "Industrial"),
    // "Robot Circus",
    // new PlusForXPSceneDesc("robot_circus", "classic", "Classic"),
    // new PlusForXPSceneDesc("robot_circus", "arena", "Arena"),
    // "Sand Pendulum",
    // new PlusForXPSceneDesc("sand_pendulum", "grotto", "Grotto"),
    // new PlusForXPSceneDesc("sand_pendulum", "checkerboard", "Checkerboard"),
];

export const sceneGroup: SceneGroup = {
  id, name, sceneDescs, hidden: true,
};
