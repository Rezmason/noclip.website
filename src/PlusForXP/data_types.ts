type PlusNamed = {
	name: string
}

export type Shader = PlusNamed & {
	id: number,
	ambient: number[],
	diffuse: number[],
	specular: number[],
	opacity: number,
	luminance: number,
	texture: string,
	blend: number
};

export type Global = {
	animinterval: number[],
	framerate: number,
	ambient: number[]
};

export type Transform = {
	trans: number[],
	rot: number[],
	scale: number[]
};

export type Interpolation = "linear" | "hermite";

export type Extrapolation = "cycle" | "constant";

export type KeyframeAnimation = {
  channel: string,
  extrappre: Extrapolation,
  extrappost: Extrapolation,
  interp: Interpolation,
	keys: Keyframe[]
};

export type Keyframe = {
	time: number,
  value: number,
  tangentIn?: number,
  tangentOut?: number
};

type PlusNode = PlusNamed & {
	parent?: string,
	transforms?: Transform[],
	anims?: KeyframeAnimation[]
};

export type Camera = PlusNode & {
	fov: number,
	nearclip: number,
	farclip: number,
	pos: number[],
	targetpos: number[]
};

export type Light = PlusNode & {
	type: "spot" | "directional" | "point",
	pos: number[],
	dir: number[],
	umbra: number,
	penumbra: number,
	attenstart: number,
	attenend: number,
	color: number[],
	intensity: number,
	off: boolean
};

export type Geometry = { 
	shader: number, 
	smoothingGroup: number, 
	indices: number[] 
}

export type Mesh = {
	geometries: Geometry[],
	vertexcount: number,
	normals: number[],
	uvcoords: number[],
	vertexpoints: number[]
};

export type Object = PlusNode & {
	meshes: Mesh[]
};

export type PlusSceneData = {
	shaders: Shader[]
	scenes: Global[]
	cameras: Camera[]
	lights: Light[]
	objects: Object[]
};
