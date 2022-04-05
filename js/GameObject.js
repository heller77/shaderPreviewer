/**
 * 描画する物体を表すクラス
 * メッシュの情報やシェーダの情報を保持する
 */
import {Myrenderer} from "./Myrenderer.js";
import {repositoryPath} from "../filepath.js";

export class GameObject {
    constructor(gl, vsSource, fsSource, shaderinfo, geometorydata, transform, scene) {
        this.gl = gl;
        this.vsSource = vsSource;
        this.fsSource = fsSource;
        this.shaderinfo = shaderinfo;
        //elapsedtimeは経過時間
        this.elapsedTime = 0.0;
        this.geometorydata = geometorydata;
        this.transform = transform;
        this.componentList = [];
        this.scene = scene;
        if (geometorydata !== undefined)
            this.buffer = Myrenderer.initBuffers(this.gl, this.geometorydata, shaderinfo);
        this.textures = Myrenderer.loadtexture(gl, repositoryPath + "/assets/apple1.png");
    }

    getComponent() {
        if (this.componentList.length == 1) {
            return this.componentList[0];
        }
    }

    addComponent(component) {
        this.componentList.push(component);
    }

    /**
     * 毎フレーム呼ばれる関数
     * @param deltatime
     */
    update(deltatime) {
        for (const component of this.componentList) {
            component.update(deltatime);
        }
        this.elapsedTime += deltatime;
    }

    /**
     * 描画する関数
     */
    draw() {
        Myrenderer.drawElements(this.gl, this.shaderinfo,
            this.buffer, this.elapsedTime, this.geometorydata, this.transform, this.scene, this.textures);
    }

    /**
     * シェーダを更新する関数
     * @param fsSource
     */
    updateFsshader(fsSource) {
        if (this.fsSource == undefined) {
            console.log("fssource is undifine");
            return;
        } else {
            console.log("fssource update");
        }
        let shaderProgram = Myrenderer.initShaderProgram(this.gl, this.vsSource, fsSource);

        this.shaderinfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                normal: this.gl.getAttribLocation(shaderProgram, "aNormal"),
                uv: this.gl.getAttribLocation(shaderProgram, "auv"),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                Resolution: this.gl.getUniformLocation(shaderProgram, "resolution"),
                time: this.gl.getUniformLocation(shaderProgram, "time"),
                texturesampler: this.gl.getUniformLocation(shaderProgram, "sampler01"),
            },
        };

    }
}