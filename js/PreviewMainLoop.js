import {repositoryPath} from "../filepath.js";
import {AllCanvasRendering, firstScene, getGeometory, getGeometoryByArray, init} from "../canvasRenderer.js";

window.addEventListener("load", previewMainLoop);
document.getElementById("modelfileUpload").addEventListener("change", modelChange);
// document.getElementById("xflag").addEventListener("change", obserbeChangebox);
// document.getElementById("yflag").addEventListener("change", obserbeChangebox);
document.getElementById("modelpresetselect").addEventListener("change", modelpresetselect);

let fsSource = `precision mediump float;
uniform float time;
uniform vec2  resolution;
varying lowp vec4 vColor;
varying lowp vec3 normal;

float PI =3.14;
const vec3 lightDir = vec3(1.,1. , 0.277);


void main(void){
    float color=dot(normal,lightDir);
    gl_FragColor=vec4(vec3(color),1);
}`;

let editor;

async function presetModelSelect(filename) {
    const geometry = await getGeometory(repositoryPath + "model/" + filename);
    return geometry;
}

async function getglslFromUrl(url) {
    return fetch(url)
        .then(response => response.text())
        .then(data => {
            console.log(data);
            fsSource = data;
            console.log("b");
        });
}

async function previewMainLoop() {
    let gltfref = getParam("glslref");
    if (gltfref === "") {
        console.log("null");
        gltfref = 'https://gist.githubusercontent.com/heller77/8b9aaf61f959ed032c9d61e463245f38/raw/6873d563965cdf6f14de870eea745784c53d3327/samplecode.glsl';
    }
    console.log(getParam("glslref"));
    console.log("a");
    await getglslFromUrl(gltfref);
    console.log("a");
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/c_cpp");
    editor.setValue(fsSource);
    // document.getElementById("editor").innerText
    editor.setHighlightActiveLine(false);
    // document.getElementById("shaderInput").value = fsSource;
    document.getElementById("updateShaderButton").onclick = updateShader;

    // document.getElementById("nowselectmodel").innerText = "(現在選択中のファイル：box)";
    setNowSelectModelDisplay("プリセットの" + "sphere");
    // const geometry = await getGeometory(repositoryPath + "model/box.gltf");
    const geometry = await presetModelSelect("sphere.gltf");

    init("modelPreviewCanvas");
    AllCanvasRendering("modelPreviewCanvas", fsSource, geometry);
}

function setNowSelectModelDisplay(finename) {
    document.getElementById("nowselectmodel").innerText = "(現在選択中のファイル：" + finename + ")";
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
    setNowSelectModelDisplay(filename);
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
    // let newfsSource = document.getElementById("shaderInput").value;
    let newfsSource = editor.getValue();
    fsSource = editor.getValue();
    firstScene.getGameobjectList().forEach((item) => {
        item.updateFsshader(newfsSource);
    });
}

function obserbeChangebox(event) {
    var t = event.target.id;
    console.log(t);
    if (document.getElementById(t).checked == true) {
        document.getElementById("xflag").checked = false;
        document.getElementById("yflag").checked = false;
        document.getElementById(t).checked = true;
    }
}

async function modelpresetselect(obj) {
    var model = obj.target.value;
    if (model === "null") return;
    console.log(model);
    setNowSelectModelDisplay("プリセットの" + model);
    const geometry = await presetModelSelect(model);
    reset(fsSource, geometry);
}

function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}