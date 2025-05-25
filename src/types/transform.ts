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

    /** Returns the modified Position based on addition */
    add(position: Position) {
        if(!position) return this;
        this.x += position.x;
        this.y += position.y;
        this.z += position.z;
        return this;
    }
    /** Returns the modified Position based on subtraction */
    substract(position: Position) {
        if(!position) return this;
        this.x -= position.x;
        this.y -= position.y;
        this.z -= position.z;
        return this;
    }

    /** Returns a new Position instance based on addition */
    addedPosition(position: Position): Position {
        return this.clone().add(position);
    }
    /** Returns a new Position instance based on subtraction */
    substractedPosition(position: Position): Position {
        return this.clone().substract(position);
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
                    : [0, xOrValue, 0];

            super(value);
        }
    }

    /** Returns the modified Rotation based on addition */
    add(rotation: Rotation) {
        if(!rotation) return this;
        this.x += rotation.x;
        this.y += rotation.y;
        this.z += rotation.z;
        return this;
    }

    /** Returns a new Rotation instance based on addition */
    addedRotation(rotation: Rotation): Rotation {
        return this.clone().add(rotation);
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
                    : [xOrValue, xOrValue, xOrValue];

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