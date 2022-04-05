import {Component} from "./Component.js";
import {Input} from "./Input.js";

export class CameraComponent extends Component {
    constructor(gameobject) {
        super(gameobject);
        this.up = [0, 1, 0];
        this.lookat = [0, 0, 0];
        this.radius = 10;
        this.angle = 0.0;
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
        let angle = this.angle + 0.4 * deltatime * Math.PI;
        this.angle = angle;
        quat.setAxisAngle(angleAxis, axis, angle);
        let positionVec = vec3.fromValues(0, 0, this.radius * -1);
        //回転の中心
        let center = vec3.fromValues(0, 0, 0);

        vec3.negate(center, center);
        vec3.add(positionVec, positionVec, center);
        vec3.transformQuat(positionVec, positionVec, angleAxis);
        vec3.negate(center, center);
        vec3.add(positionVec, positionVec, center);


        this.gameobject.transform.position = [positionVec[0], positionVec[1], positionVec[2]];
    }
}