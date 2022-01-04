import {Myrenderer} from "./renderer/Myrenderer.js";

export class GameObject {
    constructor(gl, vsSource, fsSource, shaderinfo, buffer, geometorydata, transform) {
        this.gl = gl;
        this.vsSource = vsSource;
        this.fsSource = fsSource;
        this.shaderinfo = shaderinfo;
        this.buffer = buffer;
        //elapsedtimeは経過時間
        this.elapsedTime = 0.0;
        this.geometorydata = geometorydata;
        this.transform = transform;
    }

    update(deltatime) {
        this.draw(deltatime);
    }

    draw(deltatime) {
        this.elapsedTime += deltatime;
        // console.log("elapse time is " + this.elapsedTime);
        Myrenderer.drawElements(this.gl, this.shaderinfo,
            this.buffer, this.elapsedTime, this.geometorydata, this.transform);
    }

    updateFsshader(fsSource) {
        console.log("shaderinfo" + this.shaderinfo);
        console.log("program" + this.shaderinfo.program);
        let shaderProgram = Myrenderer.initShaderProgram(this.gl, this.vsSource, fsSource);

        this.shaderinfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                uv: this.gl.getAttribLocation(shaderProgram, "uv"),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                Resolution: this.gl.getUniformLocation(shaderProgram, "resolution"),
                time: this.gl.getUniformLocation(shaderProgram, "time"),
            },
        };
        console.log("更新後のshaderprogram");
        console.log(this.shaderinfo);
    }
}

export class Transfrom {
    constructor(position) {
        this.position = position;
    }
}