export type SCXToken = {
  name: string, 
  type?: ("data-type" | "value"), 

  size?: number, 
  vec?: boolean, 
  terminator?: number, 
};

export const openBrace = "{";
export const closeBrace = "}";

export const scxTokens: Record<number, SCXToken> = {

  [openBrace.charCodeAt(0)] : { name: openBrace },
  [closeBrace.charCodeAt(0)] : { name: closeBrace },

  [0x80]: { name: "error" },
  [0x81]: { name: "undefined" },
  [0x82]: { name: "STRING", type: "data-type", terminator: 0 },
  [0x83]: { name: "NUMBER", type: "data-type", size: 4 },
  [0x84]: { name: "INTEGER", type: "data-type", size: 4 },
  [0x85]: { name: "SCENE" },
  [0x86]: { name: "NAME" },
  [0x87]: { name: "PARENT" },
  [0x88]: { name: "ANIMINTERVAL" },
  [0x89]: { name: "FRAMERATE" },
  [0x8a]: { name: "AMBIENT" },
  [0x8b]: { name: "TEXTUREFOLDERS" },
  [0x8c]: { name: "OBJECT" },
  [0x8d]: { name: "TRANSFORM" },
  [0x8e]: { name: "TRANS" },
  [0x8f]: { name: "ROT" },
  [0x90]: { name: "SCALE" },
  [0x91]: { name: "ANIM" },
  [0x92]: { name: "TARGETANIM" },
  [0x93]: { name: "CHANNEL" },
  [0x94]: { name: "XTRANS", type: "value" },
  [0x95]: { name: "YTRANS", type: "value" },
  [0x96]: { name: "ZTRANS", type: "value" },
  [0x97]: { name: "XROT", type: "value" },
  [0x98]: { name: "YROT", type: "value" },
  [0x99]: { name: "ZROT", type: "value" },
  [0x9a]: { name: "XSCALE", type: "value" },
  [0x9b]: { name: "YSCALE", type: "value" },
  [0x9c]: { name: "ZSCALE", type: "value" },
  [0x9d]: { name: "EXTRAPPRE" },
  [0x9e]: { name: "EXTRAPPOST" },
  [0x9f]: { name: "INTERP" },
  [0xa0]: { name: "HERMITE", type: "value" },
  [0xa1]: { name: "CONSTANT", type: "value" },
  [0xa2]: { name: "CYCLE", type: "value" },
  [0xa3]: { name: "OSCILLATE" },
  [0xa4]: { name: "LINEAR", type: "value" },
  [0xa5]: { name: "KEYCOUNT" },
  [0xa6]: { name: "KEYS" },
  [0xa7]: { name: "MESH" },
  [0xa8]: { name: "VERTEXCOUNT" },
  [0xa9]: { name: "POLYCOUNT" },
  [0xaa]: { name: "VERTEXPOINTS" },
  [0xab]: { name: "NORMALS" },
  [0xac]: { name: "UVCOORDS" },
  [0xad]: { name: "UVCOORDS2" },
  [0xae]: { name: "POLYGON" },
  [0xaf]: { name: "VERTS" },
  [0xb0]: { name: "SMGROUP" },
  [0xb1]: { name: "SHADER" },
  [0xb2]: { name: "TEXTURE" },
  [0xb3]: { name: "ID" },
  [0xb4]: { name: "DIFFUSE" },
  [0xb5]: { name: "SPECULAR" },
  [0xb6]: { name: "LUMINANCE" },
  [0xb7]: { name: "BLEND" },
  [0xb8]: { name: "OPACITY" },
  [0xb9]: { name: "LIGHT" },
  [0xba]: { name: "TYPE" },
  [0xbb]: { name: "DIR" },
  [0xbc]: { name: "UMBRA" },
  [0xbd]: { name: "PENUMBRA" },
  [0xbe]: { name: "COLOR" },
  [0xbf]: { name: "INTENSITY" },
  [0xc0]: { name: "OFF", type: "value" },
  [0xc1]: { name: "POINT", type: "value" },
  [0xc2]: { name: "SPOT", type: "value" },
  [0xc3]: { name: "DIRECTIONAL", type: "value" },
  [0xc4]: { name: "ATTENSTART" },
  [0xc5]: { name: "ATTENEND" },
  [0xc6]: { name: "CAMERA" },
  [0xc7]: { name: "FOV" },
  [0xc8]: { name: "NEARCLIP" },
  [0xc9]: { name: "FARCLIP" },
  [0xca]: { name: "POS" },
  [0xcb]: { name: "TARGETPOS" },
  [0xcc]: { name: "TRUE", type: "value" },
  [0xcd]: { name: "FALSE", type: "value" },
  [0xce]: { name: "NUMBERLIST", type: "data-type", vec: true, size: 4 },
  [0xcf]: { name: "BYTE", type: "data-type" },
  [0xd0]: { name: "UNSIGNEDBYTE", type: "data-type" },
  [0xd1]: { name: "WORD", type: "data-type", size: 2 },
  [0xd2]: { name: "UNSIGNEDWORD", type: "data-type", size: 2 },
  [0xd3]: { name: "PARENTID" },
  [0xd4]: { name: "WEIGHTS" },
  [0xd5]: { name: "1BONE" },
  [0xd6]: { name: "2BONE" },
  [0xd7]: { name: "3BONE" },
  [0xd8]: { name: "4BONE" },
  [0xd9]: { name: "BONEMATRIX" },
  [0xda]: { name: "EXTRAANIMCOUNT" },
  [0xdb]: { name: "EXTRAINTERVALS" },
  [0xdc]: { name: "ANIMINDEX" },
  [0xdd]: { name: "QUATERNION" },
  [0xde]: { name: "QUATKEYS" },
  [0xdf]: { name: "EXTRAANIMNAMES" },
  [0xe0]: { name: "0BONE" },
  [0xe1]: { name: "EMISSIVE" },
};