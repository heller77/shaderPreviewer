class GlMatrixRapper {
    static rotatex(out, a, radian) {
        let rotatematrix = mat3.create();
        mat3.identity(rotatematrix);
        let c = Math.cos(radian);
        let s = Math.sin(radian);
        rotatematrix[4] = c;
        rotatematrix[5] = -1 * s;
        rotatematrix[7] = s;
        rotatematrix[8] = c;
        mat3.multiply(out, a, rotatematrix);
        return out;
    }
}

class Component {
    constructor(gameobject) {
        this.gameobject = gameobject;
    }

    update(deltatime) {
        // console.log(this.gameobject.transform.position);
    }
}

class FirstDrawSettingComponent extends Component {
    update(deltatime) {
        Myrenderer.initDraw(this.gameobject.gl);
    }
}

class MeshRenderComponent extends Component {
    update(deltatime) {
        this.gameobject.draw();
    }
}

class CameraComponent extends Component {
    constructor(gameobject) {
        super(gameobject);
        this.up = [0, 1, 0];
        this.lookat = [0, 0, 0];
        this.radius = 2;
    }

    getUp() {
        return this.up;
    }

    getLookat() {
        return this.lookat;
    }

    getTransform() {
        return this.gameobject.transform;
    }

    getRotation() {
        return this.gameobject.transform.rotation;
    }

    setUpVector(up) {
        this.up = up;
    }

    setLookat(lookat) {
        this.lookat = lookat;
    }

    update(deltatime) {

        //up
        // this.up = Input.cameraUp();
        //位置計算
        // let position = this.gameobject.transform.position;
        //
        // let x = position[0];
        // let y = position[1];
        // let z = position[2];
        // let cameraTotarget = [this.lookat[0] - x, this.lookat[1] - y, this.lookat[2] - z];
        //
        // const xyRad = Input.cameraRotate()[0];
        // const fai = Input.cameraRotate()[1];
        //
        // let angleAxis = quat.create();
        // let axis = [0, 1, 0];
        // axis = Input.getaxis();
        // quat.setAxisAngle(angleAxis, axis, 360.0 / 100 * deltatime);
        // let positionVec = vec3.fromValues(x, y, z);
        // let center = vec3.fromValues(0, 0, 0);
        //
        // vec3.negate(center, center);
        // vec3.add(positionVec, positionVec, center);
        // vec3.transformQuat(positionVec, positionVec, angleAxis);
        // vec3.negate(center, center);
        // vec3.add(positionVec, positionVec, center);
        //位置計算
        let position = this.gameobject.transform.position;

        let x = position[0];
        let y = position[1];
        let z = position[2];


        let angleAxis = quat.create();
        let axis = [0, 1, 0];
        axis = Input.getaxis();
        quat.setAxisAngle(angleAxis, axis, 360.0 / 100 * deltatime);
        let positionVec = vec3.fromValues(x, y, z);
        let center = vec3.fromValues(0, 0, 0);

        vec3.negate(center, center);
        vec3.add(positionVec, positionVec, center);
        vec3.transformQuat(positionVec, positionVec, angleAxis);
        vec3.negate(center, center);
        vec3.add(positionVec, positionVec, center);


        this.gameobject.transform.position = [positionVec[0], positionVec[1], positionVec[2]];

        document.getElementById("camerainfo").innerText =
            "camera position : " + this.gameobject.transform.position + "\n cameraup : " + this.up +
            "\n position vec : " + vec3.str(positionVec);

    }
}

class ObjectMoveComponent extends Component {
    update(deltatime) {
        // this.gameobject.transform.position = [positionVec[0], positionVec[1], positionVec[2]];
        document.getElementById("objectinfo").innerText
            = "objectposition :" + this.gameobject.transform.position + " position vec : " + positionVec;

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

class Input {
    static cameraRotate() {
        let rotatex = document.getElementById("rotateX").value;
        let rotatey = document.getElementById("rotateY").value;
        document.getElementById("inputlog").innerText = "x :" + rotatex + " y :" + rotatey;
        return [rotatex, rotatey, 0];
    }

    static cameraUp() {
        let x = document.getElementById("cameraupX").value;
        let y = document.getElementById("cameraupY").value;
        let z = document.getElementById("cameraupZ").value;
        return [x, y, z];
    }

    static getaxis() {
        let x = document.getElementById("axisX").value;
        let y = document.getElementById("axisY").value;
        let z = document.getElementById("axisZ").value;
        return [x, y, z];
    }
}

class Debug {
    static log(string) {

    }
}

let firstScene = new Scene();

let preFrameTime = 0.0;

function init(canvasClassName) {
    let canvaslist = document.getElementsByClassName(canvasClassName);
    for (const canvas of canvaslist) {
        //描画の初期化を行うためのオブジェクト
        let firstDrawSettingGamebject = new GameObject(canvas.getContext("webgl"), undefined,
            undefined, undefined, undefined,
            undefined, undefined, firstScene);
        const firstdrassettingComponent = new FirstDrawSettingComponent(firstDrawSettingGamebject);
        firstDrawSettingGamebject.addComponent(firstdrassettingComponent);
        firstScene.addGameObject(firstDrawSettingGamebject);

        //カメラオブジェクト
        let cameraGameobject = new GameObject(canvas.getContext("webgl"),
            undefined, undefined, undefined, undefined,
            undefined, new Transfrom([0, 3, 20], [0.1, 0, 0]), firstScene);
        let cameraComponent = new CameraComponent(cameraGameobject);
        cameraGameobject.addComponent(cameraComponent);
        firstScene.addGameObject(cameraGameobject);
        firstScene.setCamera(cameraGameobject);
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
        let tempGameObject = createGameObject(canvas, shader, geometoryData,
            new Transfrom([0, 0, 0], [0, 0, 0]), firstScene);
        let meshrenderComponent = new MeshRenderComponent(tempGameObject);
        tempGameObject.addComponent(meshrenderComponent);

        let rotateComponent = new ObjectMoveComponent(tempGameObject);
        tempGameObject.addComponent(rotateComponent);

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
    // console.log("gameobject size : " + firstScene.getGameobjectCount());

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
function createGameObject(canvas, inputShader, geometoryData, gameobjectTrannsfrom, scene) {

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
    varying lowp vec4 vColor;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor=aVertexPosition;
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
        gameobjectTrannsfrom, scene);
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
    static drawElements(gl, programInfo, buffers, elapsedtime, geometoryData, gameObjectTramsform, scene) {
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix,
            fieldOfView, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, gameObjectTramsform.position);
        mat4.rotateX(modelMatrix, modelMatrix, gameObjectTramsform.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, gameObjectTramsform.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, gameObjectTramsform.rotation[2]);

        const camera = scene.getCamera();
        const cameraComponet = camera.getComponent();
        const cameraUp = cameraComponet.getUp();
        const cameraPosition = cameraComponet.getTransform().position;
        const cameraRotatation = cameraComponet.getTransform().rotation;
        const cameraLookAt = cameraComponet.getLookat();
        const viewMatrix = mat4.create();

        // mat4.translate(viewMatrix, viewMatrix, cameraPosition);
        // mat4.rotateX(viewMatrix, viewMatrix, cameraRotatation[0]);
        // mat4.rotateY(viewMatrix, viewMatrix, cameraRotatation[1]);
        // mat4.rotateZ(viewMatrix, viewMatrix, cameraRotatation[2]);
        mat4.lookAt(viewMatrix, cameraPosition, cameraLookAt, cameraUp);
        // mat4.invert(viewMatrix, viewMatrix);

        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

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
    constructor(gl, vsSource, fsSource, shaderinfo, buffer, geometorydata, transform, scene) {
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
        this.scene = scene;
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
            this.buffer, this.elapsedTime, this.geometorydata, this.transform, this.scene);
    }

    /**
     * シェーダを更新する関数
     * @param fsSource
     */
    updateFsshader(fsSource) {
        if (this.fsSource == undefined) {
            console.log("fssource is undifine");
            return;
        }
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
    constructor(position, rotation = [0, 0, 0]) {
        this.position = position;
        this.rotation = rotation;
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

