import {Myrenderer} from "./rendere/Myrenderer.js";

window.onload = main;

// window.addEventListener("load", main);

function main() {
    //対象のキャンバス
    const canvas = document.getElementById("targetCanvas");
    const gl = canvas.getContext("webgl");
    if (gl == null) {
        alert("webglが初期化できない！！");
        return;
    }
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 uv;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform vec2 inputResolution;
    
    varying vec2 resolution;
    varying vec2 texcoord1;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      texcoord1=uv; 
      resolution=inputResolution;
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
    varying vec2 resolution;
    void main() {
      vec2 r=resolution;
      vec2 p =(gl_FragCoord.xy*2.-r)/min(r.x,r.y);
      float c = length(p.y+cos(p.x)+0.5*fract(cos(dot(p.xy,vec2(12.9898,78.233)))*43758.5453123));
      gl_FragColor = vec4(c+p.x,c+p.y,c,1.0);
    }
  `;
    let inputFragment = document.getElementById("fragment");
    inputFragment.innerHTML = fsSource;
    const shaderProgram = Myrenderer.initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            uv: gl.getAttribLocation(shaderProgram, "uv"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            Resolution: gl.getUniformLocation(shaderProgram, "inputResolution"),
        },
    };
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let aspect = width / height;
    const positions = [
        1.0 * aspect, 1.0,
        -1.0 * aspect, 1.0,
        1.0 * aspect, -1.0,
        -1.0 * aspect, -1.0,
    ];
    const uv = [
        1 * width, 1 * height,
        0, 1 * height,
        1 * width, 0,
        0, 0
    ];
    const buffers = Myrenderer.initBuffers(gl, positions, uv,);
    Myrenderer.drawScene(gl, programInfo, buffers);

}

function loop() {

}