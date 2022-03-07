import {Myrenderer} from "./renderer/Myrenderer.js";
import {GameObject, Transfrom} from "./GameObject.js";

window.addEventListener("load", main);

let gameobjectList = [];
let preFrameTime = 0;

async function main() {
    document.getElementById("updateShaderButton").onclick = updateShader;

    //対象のキャンバス
    const canvas = document.getElementById("targetCanvas");
    const gl = canvas.getContext("webgl");
    if (gl == null) {
        alert("webglが初期化できない！！");
        return;
    }
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 uv;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying vec2 texcoord1;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      texcoord1=uv;
    }
  `;
    //   const fsSource = `
    //   precision highp float;
    //   varying vec2 texcoord1;
    //   varying vec2 resolution;
    //   void main() {
    //     vec2 r=resolution;
    //     vec2 p =(gl_FragCoord.xy*2.-r)/min(r.x,r.y);
    //     float l=0.1/length(p);
    //     gl_FragColor = vec4(1,0,0,1.0);
    //   }
    // `;
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
    // gl_FragColor=vec4(vec3((rLen*0.02)*abs(ray*2.)),0);
    gl_FragColor=vec4(vec3(0.5),0);
}
    `;
    // const fsSource = "precision mediump float;\n" +
    //     "varying float time;\n" +
    //     "varying vec2  resolution;\n" +
    //     "\n" +
    //     "const float sphereSize = 1.0;\n" +
    //     "float PI =3.14;\n" +
    //     "const vec3 lightDir = vec3(1.,1. , 0.277);\n" +
    //     "float sdSpere(vec3 p){\n" +
    //     "    return length(p)-sphereSize;\n" +
    //     "}\n" +
    //     "float sdBox( vec3 p, vec3 b )\n" +
    //     "{\n" +
    //     "  vec3 q = abs(p) - b;\n" +
    //     "  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);\n" +
    //     "}\n" +
    //     "float distanceFunc(vec3 p){\n" +
    //     "    // p.x=p.x+11.*cos(time*2.);\n" +
    //     "    return max(sdBox(mod(p,4.)-1.5,vec3(1.5,1.,1.)),sdSpere(mod(p,4.)-2.));\n" +
    //     "}\n" +
    //     "\n" +
    //     "void main(void){\n" +
    //     "    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);\n" +
    //     "    vec3 cPos = vec3(0.0,  0.0,  2.0);\n" +
    //     "    vec3 cDir = vec3(0.0,  0.0, -1.0);\n" +
    //     "    vec3 cUp  = vec3(0.0,  1.0,  0.0);\n" +
    //     "    vec3 cSide = cross(cDir, cUp);\n" +
    //     "    float targetDepth = 1.0;\n" +
    //     "    vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * targetDepth);\n" +
    //     "    float distance = 0.0;\n" +
    //     "    float rLen = 0.0;\n" +
    //     "    vec3  rPos = cPos;\n" +
    //     "    float depth=0.;\n" +
    //     "    for(int i = 0; i <58; i++){\n" +
    //     "        distance = distanceFunc(rPos);\n" +
    //     "        rLen += distance;\n" +
    //     "        rPos = cPos + ray * rLen;\n" +
    //     "        rPos.y+=2.*time;\n" +
    //     "    }\n" +
    //     "    gl_FragColor=vec4(vec3((rLen*0.02)*abs(ray*2.)),0);\n" +
    //     "}";
    // let fsSource = document.getElementById("shaderInput").value;
    // let inputFragment = document.getElementById("fragment");
    // inputFragment.innerHTML = fsSource;

    document.getElementById("shaderInput").value = fsSource;
    const shaderProgram = Myrenderer.initShaderProgram(gl, vsSource, fsSource);

    let shaderInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            uv: gl.getAttribLocation(shaderProgram, "uv"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            Resolution: gl.getUniformLocation(shaderProgram, "resolution"),
            time: gl.getUniformLocation(shaderProgram, "time"),
        },
    };
    console.log(shaderInfo);
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let aspect = width / height;
    const positions = [
        1.0 * aspect, 1.0, 0,
        -1.0 * aspect, 1.0, 0,
        1.0 * aspect, -1.0, 0,
        -1.0 * aspect, -1.0, 0,
    ];
    const uv = [
        1 * width, 1 * height,
        0, 1 * height,
        1 * width, 0,
        0, 0
    ];
    const repositoryPath = "/webglPractice/model/";
    const geometorydata = await getGeometory(repositoryPath + "monkey.glb");
    // const geometorydata = {
    //     positionData: positions,
    //     //頂点の個数（drawElementsならelementCount使うので不要かも？）
    //     vertexCount: 4,
    // };
    console.log(geometorydata.positionData);
    console.log(geometorydata.elementData);

    const buffers = await Myrenderer.initBuffers(gl, geometorydata);

    let gameobject1
        = new GameObject(gl, vsSource,
        fsSource, shaderInfo, buffers, geometorydata,
        new Transfrom([-0, 0, -3.2]));
    gameobjectList.push(gameobject1);
    // Myrenderer.drawScene(gl, shaderInfo, buffers);
    preFrameTime = Date.now();
    loop();
}

function loop() {
    const deltatime = 0.001 * (Date.now() - preFrameTime);
    // console.log(deltatime);
    gameobjectList.forEach((item) => {
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