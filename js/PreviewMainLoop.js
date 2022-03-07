window.addEventListener("load", previewMainLoop);
document.getElementById("modelfileUpload").addEventListener("change", modelChange);

let fsSource = `
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
    gl_FragColor=vec4(vec3(0.5),0);
}
    `;
const repositoryPath = "/webglPractice/";

async function previewMainLoop() {
    document.getElementById("shaderInput").value = fsSource;
    document.getElementById("updateShaderButton").onclick = updateShader;
    const geometry = await getGeometory(repositoryPath + "model/onlyGlb.glb");

    init("modelPreviewCanvas");
    AllCanvasRendering("modelPreviewCanvas", fsSource, geometry);
}

function reset(fsSource, geometry) {
    firstScene.removeAllGameObject();
    init("modelPreviewCanvas");
    AllCanvasRendering("modelPreviewCanvas", fsSource, geometry);
}

async function modelChange(evt) {
    console.log("\n file change");
    let input = evt.target;
    const reader = new FileReader();
    const file = input.files[0];
    const filename = file.name;
    const position = filename.lastIndexOf(".");
    const extension = filename.slice(position + 1);
    console.log("拡張し；　" + extension);
    // if (extension === "gltf") {
    //     reader.readAsText(file);
    // } else if (extension === "glb") {
    //     reader.readAsBinaryString(file);
    // }
    reader.readAsArrayBuffer(file);
    const fileString = await fileRead(reader);
    const geometry = await getGeometoryByArray(fileString);
    reset(fsSource, geometry);
}

async function fileRead(reader) {
    return new Promise((resolve => {
        reader.onload = function () {
            console.log("reader result :" + reader.result);
            resolve(reader.result);
        };
    }));
}

function updateShader() {
    let newfsSource = document.getElementById("shaderInput").value;
    fsSource = document.getElementById("shaderInput").value;
    firstScene.getGameobjectList().forEach((item) => {
        item.updateFsshader(newfsSource);
    });
}