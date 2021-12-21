import {Myrenderer} from "./renderer/Myrenderer.js";

export class GameObject {
    constructor(gl, vsSource, fsSource, shaderinfo, buffer) {
        this.gl = gl;
        this.vsSource = vsSource;
        this.fsSource = fsSource;
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

    updateFsshader(fsSource) {
        console.log("shaderinfo" + this.shaderinfo);
        console.log("program" + this.shaderinfo.program);
        this.shaderinfo.program = Myrenderer.initShaderProgram(this.gl, this.vsSource, fsSource);
    }
}