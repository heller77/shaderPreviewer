import {Scene} from "./js/Scene.js";
import {GameObject} from "./js/GameObject.js";
import {FirstDrawSettingComponent} from "./js/FirstDrawSettingComponent.js";
import {Transfrom} from "./js/Transfrom.js";
import {CameraComponent} from "./js/CameraComponent.js";
import {Myrenderer} from "./js/Myrenderer.js";
import {MeshRenderComponent} from "./js/MeshRenderComponent.js";
import {ObjectMoveComponent} from "./js/ObjectMoveComponent.js";

export function vec3fixed(vec3) {
    let fractionDigits = 0;
    return vec3[0].toFixed(fractionDigits) + " : " + vec3[1].toFixed(fractionDigits) + " : " + vec3[2].toFixed(fractionDigits);
}

let elapsedRasianx = 0.0;

/**
 * このjavascriptをインポートしてAllCanvawsRendering関数を呼べば、html上のcanvasに指定のshaderで描画できます
 * ただし、このスクリプトを使用するには、glmatrix.jsが必要です。
 * 以下のコードを、使いたいhtmlに追加してください
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.6.1/gl-matrix-min.js"></script>
 */
export let firstScene = new Scene();

let preFrameTime = 0.0;
let clist = [];

export function init(canvasClassName) {
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
            undefined, new Transfrom([0, 0, -10], [0, 0, 0]), firstScene);
        let cameraComponent = new CameraComponent(cameraGameobject);
        cameraGameobject.addComponent(cameraComponent);
        firstScene.addGameObject(cameraGameobject);
        firstScene.setCamera(cameraGameobject);
    }
}

// マウスムーブイベントに登録する処理
function mouseMove(e) {
    let c = clist[0];
    var cw = c.width;
    var ch = c.height;
    var wh = 1 / Math.sqrt(cw * cw + ch * ch);
    var x = e.clientX - c.offsetLeft - cw * 0.5;
    var y = e.clientY - c.offsetTop - ch * 0.5;
    // var sq = Math.sqrt(x * x + y * y);
    // var r = sq * 2.0 * Math.PI * wh;
    // if(sq != 1){
    //     sq = 1 / sq;
    //     x *= sq;
    //     y *= sq;
    // }
    // q.rotate(r, [y, x, 0.0], qt);
}


/**
 *この関数を呼ぶと、html上にあるcanvasClassNameのcanvasが
 * shaderで描画されます
 * この関数はglmatrix.jsが必要です
 * @param canvasClassName canvasのclass名を文字列で指定
 * @param shader シェーダコードを文字列で指定
 * @param geometoryData メッシュのデータ
 */
export function AllCanvasRendering(canvasClassName, shader, geometoryData) {
    //canvasをすべて取得
    let canvaslist = document.getElementsByClassName(canvasClassName);
    clist = canvaslist;
    let i = 0;
    for (const canvas of canvaslist) {
        canvas.addEventListener("mousemove", mouseMove);
        let tempGameObject = createGameObject(canvas, shader, geometoryData,
            new Transfrom([0, 0, 0], [0, 0, 0]), firstScene);
        let meshrenderComponent = new MeshRenderComponent(tempGameObject);
        tempGameObject.addComponent(meshrenderComponent);

        let rotateComponent = new ObjectMoveComponent(tempGameObject);
        tempGameObject.addComponent(rotateComponent);

        firstScene.addGameObject(tempGameObject);
        i += 1;
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
 *
 * @param path
 * @returns {Promise<unknown>} .positionData
 */
export async function getGeometory(path) {
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

export async function getGeometoryByArray(array) {
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

