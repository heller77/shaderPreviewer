class Component {
    constructor(gameobject) {
        this.gameobject = gameobject;
    }

    update() {
        // console.log(this.gameobject.transform.position);
    }
}

class FirstDrawSettingComponent extends Component {
    update() {
        Myrenderer.initDraw(this.gameobject.gl);
    }
}

class MeshRenderComponent extends Component {
    update() {
        this.gameobject.draw();
    }
}

/**
 * このjavascriptをインポートしてAllCanvawsRendering関数を呼べば、html上のcanvasに指定のshaderで描画できます
 * ただし、このスクリプトを使用するには、glmatrix.jsが必要です。
 * 以下のコードを、使いたいhtmlに追加してください
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.6.1/gl-matrix-min.js"></script>
 */
class Scene {
    constructor() {
        console.log("scene 生成");
        this.gameobjectList = [];
    }

    setCamera(cameraGameobject) {
        this.cameraGameobject = cameraGameobject;
    }

    getCamera() {
        return this.cameraGameobject;
    }

    addGameObject(gameobject) {
        this.gameobjectList.push(gameobject);
    }

    removeAllGameObject() {
        console.log("削除前のgameobjectlist size : " + this.gameobjectList.length);
        this.gameobjectList.splice(0);
        console.log("削除後のgameobjectlist size : " + this.gameobjectList.length);
    }

    getGameobjectList() {
        return this.gameobjectList;
    }

    getGameobjectCount() {
        return this.gameobjectList.length;
    }
}
let firstScene = new Scene();

let preFrameTime = 0.0;

function init(canvasClassName) {
    let canvaslist = document.getElementsByClassName(canvasClassName);
    for (const canvas of canvaslist) {
        //描画の初期化を行うためのオブジェクト
        let firstDrawSettingGamebject = new GameObject(canvas.getContext("webgl"), undefined, undefined, undefined, undefined, undefined, undefined);
        const firstdrassettingComponent = new FirstDrawSettingComponent(firstDrawSettingGamebject);
        firstDrawSettingGamebject.addComponent(firstdrassettingComponent);
        firstScene.addGameObject(firstDrawSettingGamebject);

        //カメラオブジェクト
        let cameraGameobject = new GameObject(canvas.getContext("webgl"),
            undefined, undefined, undefined, undefined, undefined, new Transfrom());
    }
}

/**
 *この関数を呼ぶと、html上にあるcanvasClassNameのcanvasが
 * shaderで描画されます
 * この関数はglmatrix.jsが必要です
 * @param canvasClassName canvasのclass名を文字列で指定
 * @param shader シェーダコードを文字列で指定
 * @param geometoryData メッシュのデータ
 */
function AllCanvasRendering(canvasClassName, shader, geometoryData) {
    //canvasをすべて取得
    let canvaslist = document.getElementsByClassName(canvasClassName);

    for (const canvas of canvaslist) {
        let tempGameObject = createGameObject(canvas, shader, geometoryData,);
        let component = new Component(tempGameObject);
        tempGameObject.addComponent(component);
        let meshrenderComponent = new MeshRenderComponent(tempGameObject);
        tempGameObject.addComponent(meshrenderComponent);

        firstScene.addGameObject(tempGameObject);
    }
    preFrameTime = Date.now();
    loop();
}

/**
 * 毎フレーム描画する
 */
function loop() {
    const deltatime = 0.001 * (Date.now() - preFrameTime);
    console.log("gameobject size : " + firstScene.getGameobjectCount());

    firstScene.getGameobjectList().forEach((item) => {
        item.update(deltatime);
    });
    preFrameTime = Date.now();

    requestAnimationFrame(loop);
}

/**
 * 描画するオブジェクトを作成
 * @param canvas　
 * @param inputShader
 * @returns {GameObject}
 * @param geometoryData
 */
function createGameObject(canvas, inputShader, geometoryData) {

    const gl = canvas.getContext("webgl");
    if (gl == null) {
        alert("webglが初期が出来ない!\n" +
            "ブラウザが対応してない可能性があります");
    }
    const vsSource = `
    attribute vec4 aVertexPosition;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying vec2 texcoord1;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
    const fsSource = inputShader;

    const shaderProgram = Myrenderer.initShaderProgram(gl, vsSource, fsSource);

    let shaderInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            // uv: gl.getAttribLocation(shaderProgram, "uv"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            Resolution: gl.getUniformLocation(shaderProgram, "resolution"),
            time: gl.getUniformLocation(shaderProgram, "time"),
        },
    };

    console.log(geometoryData);
    const buffers = Myrenderer.initBuffers(gl, geometoryData);
    return new GameObject(gl, vsSource,
        fsSource, shaderInfo, buffers, geometoryData,
        new Transfrom([-0, 0, -3.2]));
}

/**
 * レンダリングUtilityクラス。webglのapiを叩くクラス
 */
class Myrenderer {
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
            alert(shaderObj.type + "shader error:" + gl.getShaderInfoLog(shaderObj));
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
    static initBuffers(gl, geometorydata) {
        //バッファの作成
        const positionBuffer = gl.createBuffer();
        //このバッファはgl.ARRAY_BUFFERとしている。
        // gl.ARRAY_BUFFERは頂点座標とかのバッファ
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(geometorydata.positionData), gl.STATIC_DRAW);

        //エレメントを定義
        let verticesIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticesIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometorydata.elementData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return {
            position: positionBuffer,
            index: verticesIndexBuffer,
        };
    }

    static initDraw(gl) {
        gl.clearColor(0., 0., 0., 1);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.enable(gl.BLEND);
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
    static drawElements(gl, programInfo, buffers, elapsedtime, geometoryData, gameObjectTramsform) {
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix,
            fieldOfView, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, gameObjectTramsform.position);
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

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
        {
            const offset = 0;
            const vertexCount = geometoryData.elmentCount;

            gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
        }
    }
}

/**
 * 描画する物体を表すクラス
 * メッシュの情報やシェーダの情報を保持する
 */
class GameObject {
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
        this.componentList = [];
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
            component.update();
        }
        this.elapsedTime += deltatime;
    }

    /**
     * 描画する関数
     */
    draw() {
        Myrenderer.drawElements(this.gl, this.shaderinfo,
            this.buffer, this.elapsedTime, this.geometorydata, this.transform);
    }

    /**
     * シェーダを更新する関数
     * @param fsSource
     */
    updateFsshader(fsSource) {
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

    }
}

/**
 * 座標を保持するクラス
 */
class Transfrom {
    constructor(position) {
        this.position = position;
    }
}

/**
 *
 * @param path
 * @returns {Promise<unknown>} .positionData
 */
async function getGeometory(path) {
    return new Promise((resolve => {
        const loader = new THREE.GLTFLoader();
        loader.load(path, (data) => {
                console.log(data);
                // console.log("box");
                // console.log(data.scene.children[0].geometry.attributes.position.array);
                const returnData = {
                    //頂点の配列
                    positionData: data.scene.children[0].geometry.attributes.position.array,
                    //頂点の個数（drawElementsならelementCount使うので不要かも？）
                    vertexCount: data.scene.children[0].geometry.attributes.position.count,
                    //indexの配列
                    elementData: data.scene.children[0].geometry.index.array,
                    //indexの個数
                    elmentCount: data.scene.children[0].geometry.index.count,
                    // uvData: data.scene.children[0].geometry.attributes.uv.array,
                };
                console.log(returnData);
                resolve(returnData);
            }
        );
    }));
}

async function getGeometoryByArray(array) {
    return new Promise((resolve => {
        const loader = new THREE.GLTFLoader();
        loader.parse(array, "./", (data) => {
                console.log(data);
                // console.log("box");
                // console.log(data.scene.children[0].geometry.attributes.position.array);
                const returnData = {
                    //頂点の配列
                    positionData: data.scene.children[0].geometry.attributes.position.array,
                    //頂点の個数（drawElementsならelementCount使うので不要かも？）
                    vertexCount: data.scene.children[0].geometry.attributes.position.count,
                    //indexの配列
                    elementData: data.scene.children[0].geometry.index.array,
                    //indexの個数
                    elmentCount: data.scene.children[0].geometry.index.count,
                    // uvData: data.scene.children[0].geometry.attributes.uv.array,
                };

                console.log("data by file : " + returnData);
                resolve(returnData);
            }
        );
    }));
}

