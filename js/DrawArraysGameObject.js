import {GameObject} from "./GameObject.js";
import {Myrenderer} from "./renderer/Myrenderer.js";

/**
 * draw関数がdrawArraysのGameObject
 */
export class DrawArraysGameObject extends GameObject {
    draw() {
        Myrenderer.drawArrays(this.gl, this.shaderinfo,
            this.buffer, this.elapsedTime, this.geometorydata, this.transform);
    }
}