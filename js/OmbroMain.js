import {Myrenderer} from "./renderer/Myrenderer.js";
import {GameObject, Transfrom} from "./GameObject.js";

window.addEventListener("load", main);

let gameobjectList = [];
let preFrameTime = 0;

function createCanvas(count) {
    let parent = document.getElementById("canvasParent");
    for (let i = 0; i < count; i++) {
        console.log(i + " canvas 作成");
        let tmp = document.createElement("canvas");
        tmp.id = "canvas" + i;
        parent.appendChild(tmp);
    }
}

async function createGameObject(canvasid) {
    const canvas = document.getElementById(canvasid);
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
    const fsSource = `
precision mediump float;
uniform float time;
uniform vec2  resolution;

const float sphereSize = 1.0;
float PI =3.14;
const vec3 lightDir = vec3(1.,1. , 0.277);
float sdSpere(vec3 p){
    return length(p)-sphereSize;
}
float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
float distanceFunc(vec3 p){
    // p.x=p.x+11.*cos(time*2.);
    return max(sdBox(mod(p,4.)-1.5,vec3(1.5,1.,1.)),sdSpere(mod(p,4.)-2.));
}

void main(void){
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 cPos = vec3(0.0,  0.0,  2.0);
    vec3 cDir = vec3(0.0,  0.0, -1.0);
    vec3 cUp  = vec3(0.0,  1.0,  0.0);
    vec3 cSide = cross(cDir, cUp);
    float targetDepth = 1.0;
    vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * targetDepth);
    float distance = 0.0;
    float rLen = 0.0;
    vec3  rPos = cPos;
    float depth=0.;
    for(int i = 0; i <58; i++){
        distance = distanceFunc(rPos);
        rLen += distance;
        rPos = cPos + ray * rLen;
        rPos.y+=2.*time;
    }
    gl_FragColor=vec4(vec3((rLen*0.02)*abs(ray*2.)),0);
    // gl_FragColor=vec4(vec3(0.5),0);
}
    `;
    document.getElementById("shaderInput").value = fsSource;
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
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let aspect = width / height;
    const positions = [
        -1.0 * aspect, -1.0, 0,
        1.0 * aspect, -1.0, 0,
        -1.0 * aspect, 1.0, 0,
        1.0 * aspect, 1.0, 0,
    ];
    const uv = [
        1 * width, 1 * height,
        0, 1 * height,
        1 * width, 0,
        0, 0
    ];

    const elementData = [0, 1, 3, 0, 3, 2];
    const elementCount = 6;
    const geometorydata = {
        positionData: positions,
        //頂点の個数（drawElementsならelementCount使うので不要かも？）
        vertexCount: 4,
        //indexの配列
        elementData: elementData,
        //indexの個数
        elmentCount: elementCount,
    };
    const buffers = await Myrenderer.initBuffers(gl, geometorydata);
    let gameobject
        = new GameObject(gl, vsSource,
        fsSource, shaderInfo, buffers, geometorydata,
        new Transfrom([-0, 0, -1.2]));
    return gameobject;
}

async function main() {
    //canvasの個数
    let count = 2;
    await createCanvas(count);
    document.getElementById("updateShaderButton").onclick = updateShader;

    for (let i = 0; i < count; i++) {
        console.log(i);
        let tempGameObject = await createGameObject("canvas" + i);
        gameobjectList.push(tempGameObject);
    }
    preFrameTime = Date.now();
    loop();
}

function loop() {
    const deltatime = 0.001 * (Date.now() - preFrameTime);
    // console.log(deltatime);
    gameobjectList.forEach((item, index) => {

        item.update(deltatime);

    });
    preFrameTime = Date.now();

    requestAnimationFrame(loop);
}

function updateShader() {
    let newfsSource = document.getElementById("shaderInput").value;
    console.log("update shader!");
    console.log(newfsSource);
    gameobjectList.forEach((item) => {
        item.updateFsshader(newfsSource);
    });
}

