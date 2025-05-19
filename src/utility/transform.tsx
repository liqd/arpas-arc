import * as THREE from "three";

class BaseVector extends THREE.Vector3 {
    constructor(x: number, y: number, z: number);
    constructor(value: THREE.Vector3 | [number, number, number]);
    constructor(xOrValue: number | THREE.Vector3 | [number, number, number] = [0, 0, 0], y?: number, z?: number) {
        if (typeof xOrValue === "number" && y !== undefined && z !== undefined) {
            super(xOrValue, y, z);
        } else {
            const value: [number, number, number] = xOrValue instanceof THREE.Vector3
                ? [xOrValue.x, xOrValue.y, xOrValue.z]
                : Array.isArray(xOrValue)
                    ? xOrValue
                    : [0, 0, 0];

            super(...value);
        }
    }

    addX(amount: number): this {
        this.x += amount;
        return this;
    }
    addY(amount: number): this {
        this.y += amount;
        return this;
    }
    addZ(amount: number): this {
        this.z += amount;
        return this;
    }

    override clone(): this {
        return new (this.constructor as new (...args: [number, number, number]) => this)(this.x, this.y, this.z);
    }
}

class BaseEuler extends THREE.Euler {
    constructor(x: number, y: number, z: number);
    constructor(value: THREE.Euler | [number, number, number]);
    constructor(xOrValue: number | THREE.Euler | [number, number, number] = [0, 0, 0], y?: number, z?: number) {
        if (typeof xOrValue === "number" && y !== undefined && z !== undefined) {
            super(xOrValue, y, z);
        } else {
            const value: [number, number, number] = xOrValue instanceof THREE.Euler
                ? [xOrValue.x, xOrValue.y, xOrValue.z]
                : Array.isArray(xOrValue)
                    ? xOrValue
                    : [0, 0, 0];

            super(...value);
        }
    }

    addX(amount: number): this {
        this.x += amount;
        return this;
    }
    addY(amount: number): this {
        this.y += amount;
        return this;
    }
    addZ(amount: number): this {
        this.z += amount;
        return this;
    }

    setFromRotationMatrix(matrix: THREE.Matrix4): this {
        super.setFromRotationMatrix(matrix);
        return this;
    }
    setFromQuaternion(quaternion: THREE.Quaternion): this {
        super.setFromQuaternion(quaternion);
        return this;
    }

    toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    override clone(): this {
        return new (this.constructor as new (...args: [number, number, number]) => this)(this.x, this.y, this.z);
    }
}

class Position extends BaseVector {
    constructor(xOrValue: number | THREE.Vector3 | [number, number, number] = [0, 0, 0], y?: number, z?: number) {
        if (typeof xOrValue === "number" && y !== undefined && z !== undefined) {
            super(xOrValue, y, z);
        } else {
            const value: THREE.Vector3 | [number, number, number] = xOrValue instanceof THREE.Vector3
                ? xOrValue
                : Array.isArray(xOrValue)
                    ? xOrValue
                    : [xOrValue, 0, 0];

            super(value);
        }
    }

    toString(): string {
        return `Position (x: ${this.x}, y: ${this.y}, z: ${this.z})`;
    }
    toJSON() {
        return { x: this.x, y: this.y, z: this.z };
    }
}

class Rotation extends BaseEuler {
    constructor(xOrValue: number | THREE.Euler | [number, number, number] = [0, 0, 0], y?: number, z?: number) {
        if (typeof xOrValue === "number" && y !== undefined && z !== undefined) {
            super(xOrValue, y, z);
        } else {
            const value: THREE.Euler | [number, number, number] = xOrValue instanceof THREE.Euler
                ? xOrValue
                : Array.isArray(xOrValue)
                    ? xOrValue
                    : [xOrValue, 0, 0];

            super(value);
        }
    }

    toString(): string {
        return `Rotation (x: ${this.x}, y: ${this.y}, z: ${this.z})`;
    }
    toJSON() {
        return { x: this.x, y: this.y, z: this.z };
    }
}

class Scale extends BaseVector {
    constructor(xOrValue: number | THREE.Vector3 | [number, number, number] = [1, 1, 1], y?: number, z?: number) {
        if (typeof xOrValue === "number" && y !== undefined && z !== undefined) {
            super(xOrValue, y, z);
        } else {
            const value: THREE.Vector3 | [number, number, number] = xOrValue instanceof THREE.Vector3
                ? xOrValue
                : Array.isArray(xOrValue)
                    ? xOrValue
                    : [xOrValue, 0, 0];

            super(value);
        }
    }

    toString(): string {
        return `Scale (x: ${this.x}, y: ${this.y}, z: ${this.z})`;
    }
    toJSON() {
        return { x: this.x, y: this.y, z: this.z };
    }
}

export { Position, Scale, Rotation };