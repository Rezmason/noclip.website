import { SCXToken, scxTokens, closeBrace, openBrace } from "./scx_tokens.js"

const littleEndian = (() => {
	const buffer = new ArrayBuffer(2);
	new DataView(buffer).setInt16(0, 256, true);
	return new Int16Array(buffer)[0] === 256;
})();

const parseDataType = (bytes: Uint8Array, token: SCXToken) => {
	let { name } = token;
	if (name === "NUMBERLIST") {
		name = "NUMBER";
	}
	const dataview = new DataView(
		bytes.buffer,
		bytes.byteOffset,
		bytes.byteLength,
	);
	switch (token.name) {
		case "STRING": {
			return [...bytes].map((c) => String.fromCharCode(c)).join("");
		}
		case "NUMBERLIST":
		case "NUMBER": {
			return dataview.getFloat32(0, littleEndian);
		}
		case "INTEGER": {
			return dataview.getInt32(0, littleEndian);
		}
		case "BYTE": {
			return dataview.getInt8(0);
		}
		case "UNSIGNEDBYTE": {
			return dataview.getUint8(0);
		}
		case "WORD": {
			return dataview.getInt16(0, littleEndian);
		}
		case "UNSIGNEDWORD": {
			return dataview.getUint16(0, littleEndian);
		}
		default: {
			console.warn("Unsupported data type:", token.name);
			break;
		}
	}
	return `${name}(${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")})`;
};

const pluralTypeNames: Record<string, string> = {
	"mesh": "meshes",
	"normals": "normals",
	"uvcoords": "uvcoords",
	"vertexpoints": "vertexpoints",
	"keys": "keys",
};

type PlusNode = {
	name: string
};

type Shader = PlusNode & {
	id: number,
	ambient: number[],
	diffuse: number[],
	specular: number[],
	opacity: number,
	luminance: number,
	texture: string,
	blend: number
};

type Global = {
	animinterval: number[],
	framerate: number,
	ambient: number[]
};

type Camera = PlusNode & {
	
};

type Light = PlusNode & {
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

type Object = PlusNode & {
	transforms: Transform[],
	meshes: Mesh[]
};

type Transform = {
	trans: number[],
	rot: number[],
	scale: number[]
};

type Mesh = {
	geometries: Geometry[],
	vertexcount: number,
	normals: number[],
	uvcoords: number[],
	vertexpoints: number[]
}

type Geometry = { 
	shader: number, 
	smoothingGroup: number, 
	indices: number[] 
}

export type PlusSceneData = {
	shaders: Shader[]
	scenes: Global[]
	cameras: Camera[]
	lights: Light[]
	objects: Object[]
};

export const parse = async (scxData: Uint8Array) : Promise<PlusSceneData> => {
	const writer = new Writer();
	const len = scxData.length;
	for (let i = 0; i < len; i++) {
		const byte = scxData[i];
		const token = scxTokens[byte];
		const lastToken = scxTokens[i > 0 ? scxData[i - 1] : -1];

		if (token?.type === "data-type") {
			const values = [];
			const { terminator, vec, size } = token;
			if (terminator != null) {
				const end = scxData.indexOf(terminator, i);
				const bytes = scxData.subarray(i + 1, end);
				i = end;
				values.push(parseDataType(bytes, token));
			} else {
				let isAtEndOfList = false;
				while (!isAtEndOfList) {
					let count = 1;
					if (vec) {
						i++;
						count = scxData[i];
					}
					for (let j = 0; j < count; j++) {
						const numBytes = size ?? 1;
						const bytes = scxData.subarray(i + 1, i + 1 + numBytes);
						i += numBytes;
						values.push(parseDataType(bytes, token));
					}

					isAtEndOfList = true;
					if (count >= 0xff) {
						const nextToken = scxTokens[scxData[i + 1]];
						if (nextToken === token) {
							i++;
							isAtEndOfList = false;
						}
					}
				}
			}
			writer.writeValues(values);
			continue;
		}

		if (token == null) {
			console.warn("No token:", byte);
			continue;
		}

		if (token?.name === openBrace) {
			writer.incrementIndent();
			continue;
		}

		if (token?.name === closeBrace) {
			writer.decrementIndent();
			continue;
		}

		const isValue = token.type === "value" && lastToken != null; // probably should be more rigorous
		const isFieldName =
			!isValue && scxTokens[scxData[i + 1]]?.name !== openBrace;
		if (isValue) {
			writer.writeValue(token.name);
		} else if (isFieldName) {
			writer.writeFieldName(token.name);
		} else {
			writer.writeObjectType(token.name);
		}
	}

	return writer.print();
};

class Writer {
	scopeStack: Record<string, any> = [{}];
	fieldName: string | null = null;

	stackTop = () => this.scopeStack[Math.max(0, this.scopeStack.length - 1)]

	writeValues(values: any[]) {
		if (this.fieldName == null) {
			if (!Array.isArray(this.stackTop())) {
				const o = this.scopeStack.pop();
				this.stackTop().pop();
			}
			this.stackTop().push(...values);
			return;
		}
		const oldValue = this.stackTop()[this.fieldName];
		if (oldValue != null) {
			const array = Array.isArray(oldValue) ? oldValue : [oldValue];
			array.push(...values);
			this.stackTop()[this.fieldName] = array;
		} else if (values.length === 1) {
			this.stackTop()[this.fieldName] = values[0];
		} else {
			this.stackTop()[this.fieldName] = values.slice();
		}
	};

	incrementIndent() {};

	decrementIndent() {
		const o = this.scopeStack.pop();
		if (!Array.isArray(o)) {
			this.scopeStack.pop();
		}
		this.fieldName = null;
	};

	writeValue(value: any) {
		if (this.fieldName == null) {
			console.warn("Dropped value:", value)
			return
		}
		if (typeof value === "string") {
			value = value.toLowerCase();
			if (value === "true") {
				value = true;
			} else if (value === "false") {
				value = false;
			}
		}
		this.stackTop()[this.fieldName] = value;
		this.fieldName = null;
	};

	writeFieldName(name: string) {
		this.fieldName = name.toLowerCase();
	};

	writeObjectType(type: string) {
		type = type.toLowerCase();
		const pluralTypeName = pluralTypeNames[type] ?? `${type}s`;
		this.fieldName = null;
		if (this.stackTop()[pluralTypeName] == null) {
			this.stackTop()[pluralTypeName] = [];
		}
		this.scopeStack.push(this.stackTop()[pluralTypeName]);
		const o = {};
		this.stackTop().push(o);
		this.scopeStack.push(o);
	};

	crawlObject = (o: Record<string, any>, func: (o: Record<string, any>) => void) => {
		for (const key in o) {
			if (typeof o[key] === "object") {
				this.crawlObject(o[key], func);
			}
		}
		func(o);
	};

	print () : PlusSceneData {
		const o = this.scopeStack[0];
		this.crawlObject(o, (o: Record<string, any>) => {
			if (o.polycount != null) {
				const polygonList = o.polygons;
				const geometries: Record<string, Geometry> = {};
				for (const polygon of polygonList) {
					const { shader, verts, smgroup: smoothingGroup } = polygon;
					const geometryID = `${shader}_${smoothingGroup}`;
					geometries[geometryID] ??= { shader, smoothingGroup, indices: [] };
					geometries[geometryID].indices.push(...verts);
				}
				delete o.polycount;
				delete o.polygons;
				o.geometries = Object.values(geometries);
			}
			if (o.keycount != null) {
				const keysList = o.keys;
				const keys = Array(o.keycount)
					.fill(null)
					.map((_, i) => {
						const [time, value, tangentIn, tangentOut] = keysList.slice(
							i * 4,
							(i + 1) * 4,
						);
						return { time, value, tangentIn, tangentOut };
					});
				delete o.keycount;
				o.keys = keys;
			}
		});
		return o;
	};
}