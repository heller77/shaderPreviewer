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

    static async initBuffers(gl, geometorydata) {
        //バッファの作成
        const positionBuffer = gl.createBuffer();
        //このバッファはgl.ARRAY_BUFFERとしている。
        // gl.ARRAY_BUFFERは頂点座標とかのバッファ
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // const loader = new THREE.GLTFLoader();
        // console.log("start");
        // loader.load("./../../model/box.gltf", (data) => {
        //     console.log("box");
        //     console.log(data.scene.children[0].geometry.attributes.position.array);
        //     Input_positionArray = data.scene.children[0].geometry.attributes.position.array;
        //     resolve();
        // // });
        // const geometorydata = await getGeometory();
        // Input_positionArray = geometorydata.positionData;
        // console.log(geometorydata.elementData);
        // console.log("end");
        // const WaitLoadGLTF = new Promise((resolve) => {
        //     loader.load("./../../model/box.gltf", (data) => {
        //         console.log("box");
        //         console.log(data.scene.children[0].geometry.attributes.position.array);
        //         Input_positionArray = data.scene.children[0].geometry.attributes.position.array;
        //         resolve();
        //     });
        // });

        //頂点位置
        // const positions = [
        //    1.0 , 1.0,
        //     -1.0, 1.0,
        //     1.0, -1.0,
        //     -1.0, -1.0,
        // ];
        // const positionTest = [
        //     -1, 0, 1,//左下？
        //     1, 0, 1,//右下
        //     -1, 0, -1,//左上
        //     1, 0, -1//右上
        // ];
        const positionTest = [
            -0.0, 1, 0,//左下？
            1, 0, 0,//右下
            -1, 0, 0,//左上
            0, -1, 0//右上
        ];
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(geometorydata.positionData), gl.STATIC_DRAW);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionTest), gl.STATIC_DRAW);

        // const uvBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometorydata.uvData), gl.STATIC_DRAW);

        //エレメントを定義
        let verticesIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticesIndexBuffer);
        console.log("index");
        console.log(geometorydata.elementData);
        const indexTest = [
            0, 1, 2,
            1, 2, 3,
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometorydata.elementData), gl.STATIC_DRAW);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indexTest), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        // const resolution = [gl.width, gl.height];
        // const resolutionBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, resolutionBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(resolution), gl.STATIC_DRAW);
        return {
            position: positionBuffer,
            index: verticesIndexBuffer,
        };
    }

    /**
     * indexを用いた描画
     * @param gl
     * @param programInfo
     * @param buffers
     * @param elapsedtime
     * @param geometoryData
     * @param tramsform
     */
    static drawElements(gl, programInfo, buffers, elapsedtime, geometoryData, tramsform) {

        gl.clearColor(0., 0., 0., 1);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix,
            fieldOfView, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();
        // mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -2.414]);
        mat4.translate(modelViewMatrix, modelViewMatrix, tramsform.position);
        // let rad = elapsedtime * Math.PI / 180;
        // mat4.rotate(modelViewMatrix, modelViewMatrix, rad, [1, 1, 1]);
        //vertexshaderの頂点情報（aVertexPosition）
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            //現在の頂点バッファーオブジェクトの一般的な頂点属性に結合して、そのレイアウトを指定します
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents, type, normalize, stride, offset
            );
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }
        // {
        //     const numComponent = 2;
        //     const type = gl.FLOAT;
        //     const noramlize = false;
        //     const stride = 0;
        //     const offset = 0;
        //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
        //     gl.vertexAttribPointer(programInfo.attribLocations.uv,
        //         numComponent, type, noramlize, stride, offset);
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
        // console.log("受け取った　elapsetime" + elapsedtime);
        //timeを送信
        gl.uniform1f(programInfo.uniformLocations.time, elapsedtime);

        gl.uniform2f(programInfo.uniformLocations.Resolution, gl.canvas.clientWidth, gl.canvas.clientHeight);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        {
            const offset = 0;
            const vertexCount = geometoryData.elmentCount;
            // gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
            gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
        }
    }

    static drawArrays(gl, programInfo, buffers, elapsedtime, geometoryData, tramsform) {

        gl.clearColor(0., 0., 0., 1);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix,
            fieldOfView, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();
        // mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -2.414]);
        mat4.translate(modelViewMatrix, modelViewMatrix, tramsform.position);
        let rad = elapsedtime * 30 * Math.PI / 180;
        mat4.rotate(modelViewMatrix, modelViewMatrix, rad, [1, 1, 1]);
        //vertexshaderの頂点情報（aVertexPosition）
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            //現在の頂点バッファーオブジェクトの一般的な頂点属性に結合して、そのレイアウトを指定します
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents, type, normalize, stride, offset
            );
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
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
            const vertexCount = geometoryData.vertexCount;
            // gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
            gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
        }
    }

}
