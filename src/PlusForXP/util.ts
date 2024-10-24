import {decode as tifDecode} from 'tiff'
import {decode as jpgDecode} from 'jpeg-js'
import { FakeTextureHolder } from '../TextureHolder.js';
import { DataFetcher } from '../DataFetcher.js';
import { PlusSceneData } from './scx_parser.js';

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

export const makeTextureHolder = async (dataFetcher: DataFetcher, basePath: string, sceneData: PlusSceneData[]) => {
    const texturePaths = sceneData
        .flatMap(({shaders}) => shaders ?? [])
        .map(shader => shader.texture)
        .filter(texture => texture != null)
        .map(texturePath => texturePath.replaceAll("\\", "/"));

    const textureData = await Promise.all(
      texturePaths.map(path => dataFetcher.fetchData(`${basePath}/${path}`).then(data => ({path, data}))));
    
    const viewerTextures = textureData.map(({path, data}) => {
      const {data: rgba8, width, height} = decodeImageData(path, data.arrayBuffer)!;
      const canvas = document.createElement("canvas");
      [canvas.width, canvas.height] = [width, height];
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.createImageData(width, height);
      imageData.data.set(rgba8);
      ctx.putImageData(imageData, 0, 0);
      return {
        name: path,
        surfaces: [canvas]
      }
    });
    
    return new FakeTextureHolder(viewerTextures);
};