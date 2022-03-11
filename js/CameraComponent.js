import {Component} from "./Component.js";
import {Input} from "./Input.js";

export class CameraComponent extends Component {
    constructor(gameobject) {
        super(gameobject);
        this.up = [0, 1, 0];
        this.lookat = [0, 0, 0];
        this.radius = 2;
    }

    getUp() {
        return this.up;
    }

    getLookat() {
        return this.lookat;
    }

    getTransform() {
        return this.gameobject.transform;
    }

    getRotation() {
        return this.gameobject.transform.rotation;
    }

    setUpVector(up) {
        this.up = up;
    }

    setLookat(lookat) {
        this.lookat = lookat;
    }

    update(deltatime) {
        //位置計算
        let position = this.gameobject.transform.position;
        let x = position[0];
        let y = position[1];
        let z = position[2];

        let angleAxis = quat.create();
        let axis = [0, 1, 0];
        axis = Input.getaxis();
        quat.setAxisAngle(angleAxis, axis, 360.0 / 400 * deltatime);
        let positionVec = vec3.fromValues(x, y, z);
        //回転の中心
        let center = vec3.fromValues(0, 0, 0);

        vec3.negate(center, center);
        vec3.add(positionVec, positionVec, center);
        vec3.transformQuat(positionVec, positionVec, angleAxis);
        vec3.negate(center, center);
        vec3.add(positionVec, positionVec, center);


        this.gameobject.transform.position = [positionVec[0], positionVec[1], positionVec[2]];

        //回転計算
        let nowRotattion = this.gameobject.transform.rotation;
        let rotationquart = quat.create();
        quat.rotateX(rotationquart, rotationquart, nowRotattion[0]);
        quat.rotateY(rotationquart, rotationquart, nowRotattion[1]);
        quat.rotateZ(rotationquart, rotationquart, nowRotattion[2]);
        quat.multiply(rotationquart, rotationquart, angleAxis);
        this.gameobject.transform.rotation = rotationquart;
        let cameraup = this.up;
        quat.rotateX(rotationquart, rotationquart, nowRotattion[0]);
        quat.rotateY(rotationquart, rotationquart, nowRotattion[1]);
        quat.rotateZ(rotationquart, rotationquart, nowRotattion[2]);
        // document.getElementById("camerainfo").innerText = "camera position : " + vec3fixed(this.gameobject.transform.position) + "\n cameraup : " + this.up;

    }
}