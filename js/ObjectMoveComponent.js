import {Component} from "./Component.js";
import {Input} from "./Input.js";
import {vec3fixed} from "../canvasRenderer.js";

let elapsedRasianx = 0;

export class ObjectMoveComponent extends Component {
    update(deltatime) {
        // //位置計算
        let position = this.gameobject.transform.position;

        let x = position[0];
        let y = position[1];
        let z = position[2];


        let angleAxis = quat.create();
        let axis = [0, 1, 0];
        axis = Input.getaxis();
        quat.setAxisAngle(angleAxis, axis, 360.0 / 100 * deltatime);
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
        let rotationquart = this.gameobject.transform.rotation;

        let cameraup = [0, 1, 0];
        elapsedRasianx += 0.0001 * deltatime;
        // quat.setAxisAngle(rotationquart, [0, 1, 0], elapsedRasianx);
        // if (Input.xRotateflag()) {
        //     quat.rotateX(rotationquart, rotationquart, elapsedRasianx);
        //     // quat.setAxisAngle(rotationquart, [0, 1, 0], elapsedRasianx);
        // } else {
        //     // quat.setAxisAngle(rotationquart, [1, 0, 0], elapsedRasianx);
        //     quat.rotateY(rotationquart, rotationquart, elapsedRasianx);
        // }
        this.gameobject.transform.rotation = rotationquart;
        // quat.rotateZ(rotationquart, rotationquart, nowRotattion[2]);
        quat.multiply(rotationquart, rotationquart, angleAxis);
        this.gameobject.transform.rotation = rotationquart;
        document.getElementById("objectinfo").innerText = "objectposition :" + vec3fixed(this.gameobject.transform.position);
    }
}