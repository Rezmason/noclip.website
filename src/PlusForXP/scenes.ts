import { GfxDevice } from "../gfx/platform/GfxPlatform.js";
import { SceneContext, SceneDesc, SceneGroup } from "../SceneBase.js";
import { SceneGfx } from "../viewer.js";

import { PlusSceneData, parse as parseSCX } from './scx_parser.js'
import { dataSets } from "./data_sets.js"
import { makeTextureHolder } from "./util.js";
import PlusRenderer from './PlusRenderer.js';
class PlusForXPSceneDesc implements SceneDesc {
  
  constructor(private screensaverID: string, private variety: string, public name: string) {}

  get id() {
    return `${this.screensaverID}-${this.variety}`
  }

  async createScene(device: GfxDevice, sceneContext: SceneContext): Promise<SceneGfx> {
    const {screensaverID, variety} = this;
    const basePath = `${id}/${dataSets[screensaverID].basePath}`
    const sceneData: PlusSceneData[] = await Promise.all(
      dataSets[screensaverID].variants[variety]
        .map(
          path => sceneContext.dataFetcher.fetchData(`${basePath}/${path}`)
          .then(({arrayBuffer}) => parseSCX(new Uint8Array(arrayBuffer)))
        )
    );
    const textureHolder = await makeTextureHolder(sceneContext.dataFetcher, basePath, sceneData);
    return new PlusRenderer(device, basePath, sceneData, textureHolder);
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
