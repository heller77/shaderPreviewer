/**
 * 座標を保持するクラス
 */
export class Transfrom {
    constructor(position, rotation = quat.create()) {
        this.position = position;
        let rotquart = quat.create();
        quat.rotateX(rotquart, rotquart, rotation[0]);
        quat.rotateY(rotquart, rotquart, rotation[1]);
        quat.rotateZ(rotquart, rotquart, rotation[2]);
        this.rotation = quat.create();
    }

    getRotationMatrix() {
        let rotationMat = mat4.create();
        mat4.fromQuat(rotationMat, this.rotation);
        return rotationMat;
    }
}