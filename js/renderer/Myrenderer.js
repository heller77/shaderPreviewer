export class Myrenderer {
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

    static loadShader(gl, type, source) {
        const shaderObj = gl.createShader(type);
        gl.shaderSource(shaderObj, source);
        gl.compileShader(shaderObj);

        if (!gl.getShaderParameter(shaderObj, gl.COMPILE_STATUS)) {
            alert(shaderObj.type + "shader error:" + gl.getShaderInfoLog(shaderObj));
            // alert("シェーダのコンパイルに失敗しました");
            gl.deleteShader(shaderObj);
            return null;
        }
        return shaderObj;
    }

    static initBuffers(gl, Input_positionArray, Input_uvArray) {
        //バッファの作成
        const positionBuffer = gl.createBuffer();
        //このバッファはgl.ARRAY_BUFFERとしている。
        // gl.ARRAY_BUFFERは頂点座標とかのバッファ
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const loader = new THREE.GLTFLoader();
        loader.load("./../../model/box.glb", (data) => {
            console.log(data);

        });
        //頂点位置
        // const positions = [
        //    1.0 , 1.0,
        //     -1.0, 1.0,
        //     1.0, -1.0,
        //     -1.0, -1.0,
        // ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Input_positionArray), gl.STATIC_DRAW);
        const uvBuffer = gl.createBuffer();
        console.log(Input_uvArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Input_uvArray), gl.STATIC_DRAW);

        // const resolution = [gl.width, gl.height];
        // const resolutionBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, resolutionBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(resolution), gl.STATIC_DRAW);
        return {
            position: positionBuffer,
            uv: uvBuffer,
        };
    }

    static drawScene(gl, programInfo, buffers, elapsedtime) {
        gl.clearColor(0., 0., 0., 1);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE,gl.ONE);
        // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix,
            fieldOfView, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -2.414]);
        //vertexshaderの頂点情報（aVertexPosition）
        {
            const numComponet = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            //現在の頂点バッファーオブジェクトの一般的な頂点属性に結合して、そのレイアウトを指定します
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponet, type, normalize, stride, offset
            );
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }
        {
            const numComponent = 2;
            const type = gl.FLOAT;
            const noramlize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
            gl.vertexAttribPointer(programInfo.attribLocations.uv,
                numComponent, type, noramlize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.uv);
        }

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
        // console.log("受け取った　elapsetime" + elapsedtime);
        //timeを送信
        gl.uniform1f(programInfo.uniformLocations.time, elapsedtime);

        gl.uniform2f(programInfo.uniformLocations.Resolution, gl.canvas.clientWidth, gl.canvas.clientHeight);

        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }
}
