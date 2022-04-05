/**
 * レンダリングUtilityクラス。webglのapiを叩くクラス
 */
export class Myrenderer {
    static backgroundColor = [0.1, 0.0, 0.0, 1.0];

    /**
     * vertexshaderとfragmentshaderを
     * @param gl
     * @param vsSource
     * @param fsSource
     * @returns {null|WebGLProgram}
     */
    static initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("シェーダープログラムのリンクに失敗しました");
            return null;
        }
        return shaderProgram;
    }

    /**
     * シェーダを初期化
     * @param gl
     * @param type
     * @param source
     * @returns {WebGLShader|null}
     */
    static loadShader(gl, type, source) {
        const shaderObj = gl.createShader(type);
        gl.shaderSource(shaderObj, source);
        gl.compileShader(shaderObj);

        if (!gl.getShaderParameter(shaderObj, gl.COMPILE_STATUS)) {
            alert(shaderObj.type + " shader error:" + gl.getShaderInfoLog(shaderObj));
            // alert("シェーダのコンパイルに失敗しました");
            gl.deleteShader(shaderObj);
            return null;
        }
        return shaderObj;
    }

    /**
     * geometorydataからバッファを作成
     * @param gl
     * @param geometorydata
     * @returns {{index: AudioBuffer | WebGLBuffer, position: AudioBuffer | WebGLBuffer}}
     */
    static initBuffers(gl, geometorydata, shaderinfo) {

        //vao
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);


        //バッファの作成
        const positionBuffer = gl.createBuffer();
        //このバッファはgl.ARRAY_BUFFERとしている。
        // gl.ARRAY_BUFFERは頂点座標とかのバッファ
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometorydata.positionData), gl.STATIC_DRAW);
        //
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.vertexAttribPointer(
                shaderinfo.attribLocations.vertexPosition,
                numComponents, type, normalize, stride, offset
            );
            gl.enableVertexAttribArray(
                shaderinfo.attribLocations.vertexPosition);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        //エレメントを定義
        let verticesIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticesIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometorydata.elementData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        //法線を定義
        let normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometorydata.normalData), gl.STATIC_DRAW);
        {
            const normalNumComponent = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.vertexAttribPointer(
                shaderinfo.attribLocations.normal,
                normalNumComponent, type, normalize, stride, offset
            );
            gl.enableVertexAttribArray(
                shaderinfo.attribLocations.normal);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        //uvを定義
        let uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometorydata.uvData), gl.STATIC_DRAW);
        {
            const uvnumComponent = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.vertexAttribPointer(
                shaderinfo.attribLocations.uv,
                uvnumComponent, type, normalize, stride, offset
            );
            gl.enableVertexAttribArray(shaderinfo.attribLocations.uv);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);

        return {
            position: positionBuffer,
            index: verticesIndexBuffer,
            normal: normalBuffer,
            uv: uvBuffer,
            vao: vao,
        };
    }

    static loadtexture(gl, texturePath) {
        //texture読み込み
        //空のテクスチャオブジェクトを生成
        let texture = gl.createTexture();
        //画像読み取り用のオブジェクトを生成
        let image = new Image();
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            //画像データをバッファに紐付ける
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            // ミップマップを生成
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        };
        //画像読み込み（srcに値を入れると読み込みが始まる）
        image.src = texturePath;
        return texture;
    }

    static initDraw(gl) {
        let red = this.backgroundColor[0];
        let green = this.backgroundColor[1];
        let blue = this.backgroundColor[2];
        let alpha = this.backgroundColor[3];
        gl.clearColor(red, green, blue, alpha);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        // gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
    }

    /**
     * indexを用いた描画
     * @param gl
     * @param programInfo
     * @param buffers
     * @param elapsedtime
     * @param geometoryData
     * @param gameObjectTramsform
     */
    static drawElements(gl, programInfo, buffers, elapsedtime, geometoryData, gameObjectTramsform, scene, textures) {
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix,
            fieldOfView, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();
        const modelMatrix = mat4.create();
        let objectCenter = vec3.fromValues(0, 0, 0);
        let objectUp = vec3.fromValues(0, 1, 0);
        // let vec3a = vec3.create();
        // let objectrotation = gameObjectTramsform.rotation;
        // vec3.transformQuat(vec3a, vec3a, objectrotation);
        // mat4.lookAt(modelMatrix, gameObjectTramsform.position, objectCenter, objectUp);
        mat4.translate(modelMatrix, modelMatrix, gameObjectTramsform.position);
        // let objectRotateMatrix = gameObjectTramsform.getRotationMatrix();
        // mat4.multiply(modelMatrix, modelMatrix, objectRotateMatrix);
        // mat4.rotateX(modelMatrix, modelMatrix, gameObjectTramsform.rotation[0]);
        // mat4.rotateY(modelMatrix, modelMatrix, gameObjectTramsform.rotation[1]);
        // mat4.rotateZ(modelMatrix, modelMatrix, gameObjectTramsform.rotation[2]);

        const camera = scene.getCamera();
        const cameraComponet = camera.getComponent();
        const cameraUp = cameraComponet.getUp();
        const cameraPosition = cameraComponet.getTransform().position;
        const cameraRotatation = cameraComponet.getTransform().rotation;
        const cameraRotationMatrix = cameraComponet.getTransform().getRotationMatrix();
        const cameraLookAt = cameraComponet.getLookat();
        const viewMatrix = mat4.create();

        // mat4.translate(viewMatrix, viewMatrix, cameraPosition);
        // mat4.multiply(viewMatrix, viewMatrix, cameraRotationMatrix);
        // mat4.rotateX(viewMatrix, viewMatrix, cameraRotatation[0]);
        // mat4.rotateY(viewMatrix, viewMatrix, cameraRotatation[1]);
        // mat4.rotateZ(viewMatrix, viewMatrix, cameraRotatation[2]);
        mat4.lookAt(viewMatrix, cameraPosition, cameraLookAt, cameraUp);
        // mat4.invert(viewMatrix, viewMatrixz);

        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

        // let rad = elapsedtime * Math.PI / 180;
        // mat4.rotate(modelViewMatrix, modelViewMatrix, rad, [1, 1, 1]);
        //vertexshaderの頂点情報（aVertexPosition）
        // {
        //     const numComponents = 3;
        //     const type = gl.FLOAT;
        //     const normalize = false;
        //     const stride = 0;
        //     const offset = 0;
        //
        //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        //     //現在の頂点バッファーオブジェクトの一般的な頂点属性に結合して、そのレイアウトを指定します
        //     gl.vertexAttribPointer(
        //         programInfo.attribLocations.vertexPosition,
        //         numComponents, type, normalize, stride, offset
        //     );
        //     gl.enableVertexAttribArray(
        //         programInfo.attribLocations.vertexPosition);
        // }
        // {
        //     const normalNumComponent = 3;
        //     const type = gl.FLOAT;
        //     const normalize = false;
        //     const stride = 0;
        //     const offset = 0;
        //
        //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        //     //現在の頂点バッファーオブジェクトの一般的な頂点属性に結合して、そのレイアウトを指定します
        //     gl.vertexAttribPointer(
        //         programInfo.attribLocations.normal,
        //         normalNumComponent, type, normalize, stride, offset
        //     );
        //     gl.enableVertexAttribArray(
        //         programInfo.attribLocations.normal);
        // }
        // {
        //     const uvnumComponent = 2;
        //     const type = gl.FLOAT;
        //     const normalize = false;
        //     const stride = 0;
        //     const offset = 0;
        //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
        //     gl.vertexAttribPointer(
        //         programInfo.attribLocations.uv,
        //         uvnumComponent, type, normalize, stride, offset
        //     );
        //     gl.enableVertexAttribArray(programInfo.attribLocations.uv);
        // }

        //どのシェーダ使うかの指定
        gl.useProgram(programInfo.program);
        //uniformの値を設定
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);
        //timeを送信
        gl.uniform1f(programInfo.uniformLocations.time, elapsedtime);

        gl.uniform2f(programInfo.uniformLocations.Resolution, gl.canvas.clientWidth, gl.canvas.clientHeight);

        gl.bindVertexArray(buffers.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        {
            const offset = 0;
            const vertexCount = geometoryData.elmentCount;

            gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
}