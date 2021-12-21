import {Myrenderer} from "./renderer/Myrenderer.js";
import {GameObject} from "./GameObject.js";

window.addEventListener("load", main);

let gameobjectList = [];
let preFrameTime = 0;

function main() {
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
      precision highp float;
      varying vec2 texcoord1;
      uniform vec2 resolution;
      uniform float time;
      void main() {
        vec2 r=resolution;
        vec2 p =(gl_FragCoord.xy*2.-r)/min(r.x,r.y);
        float t =time;
        float c=length(sin(p.x+t*2.+0.5*fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453123))+p.y+cos(t)*2.);
        gl_FragColor = vec4(c+p.x,c+p.y,c,1.0);
        // gl_FragColor = vec4(sin(time));
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
    let inputFragment = document.getElementById("fragment");
    inputFragment.innerHTML = fsSource;
    const shaderProgram = Myrenderer.initShaderProgram(gl, vsSource, fsSource);

    const shaderInfo = {
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
    const buffers = Myrenderer.initBuffers(gl, positions, uv,);


    let gameobject1 = new GameObject(gl, vsSource, fsSource, shaderInfo, buffers);
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