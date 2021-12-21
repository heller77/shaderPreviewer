import {Myrenderer} from "./rendere/Myrenderer.js";

export class GameObject {
    constructor(gl, shaderinfo, buffer) {
        this.gl = gl;
        this.shaderinfo = shaderinfo;
        this.buffer = buffer;
        //elapsedtimeは経過時間
        this.elapsedTime = 0.0;
    }

    update(deltatime) {
        this.draw(deltatime);
    }

    draw(deltatime) {
        this.elapsedTime += deltatime;
        // console.log("elapse time is " + this.elapsedTime);
        Myrenderer.drawScene(this.gl, this.shaderinfo, this.buffer, this.elapsedTime);
    }
}