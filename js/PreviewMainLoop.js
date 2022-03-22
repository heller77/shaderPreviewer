import {repositoryPath} from "../filepath.js";
import {AllCanvasRendering, firstScene, getGeometory, getGeometoryByArray, init} from "../canvasRenderer.js";

window.addEventListener("load", previewMainLoop);
document.getElementById("modelfileUpload").addEventListener("change", modelChange);
// document.getElementById("xflag").addEventListener("change", obserbeChangebox);
// document.getElementById("yflag").addEventListener("change", obserbeChangebox);
document.getElementById("modelpresetselect").addEventListener("change", modelpresetselect);
document.getElementById("generateUrl").addEventListener("click", generateUrl);

let fsSource = `#version 300 es
precision mediump float;
uniform float time;
uniform vec2  resolution;
in vec4 vColor;
in vec3 normal;
out vec4 fragColor;

float PI =3.14;
const vec3 lightDir = vec3(1.,1. , 0.277);


void main(void){
    fragColor=vec4(normal,1);
}`;

let editor;

async function presetModelSelect(filename) {
    const geometry = await getGeometory(repositoryPath + "model/" + filename);
    return geometry;
}

async function getglslFromUrl(url) {
    return fetch(url)
        .then(response => {
                if (!response.ok) {
                    console.log("not ok");
                    alert("glslコードのurlが不正です");
                    throw new Error("glslurl not found");
                }
                return response.text();
            }
        ).then(data => {
            console.log(data);
            fsSource = data;
        }).catch(error => {
            console.log(error);
        });
}

async function previewMainLoop() {
    let glslref = getParam("glslref");
    if (glslref === null || glslref === "") {
        // glslref = 'https://gist.githubusercontent.com/heller77/8b9aaf61f959ed032c9d61e463245f38/raw/990cfc982dc8228aa30c4b1677c40ab198aa9d46/samplecode.glsl';
    } else {
        await getglslFromUrl(glslref);
    }

    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/c_cpp");
    editor.$blockScroling = Infinity;
    //補完
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });

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
    const urlparse = new URLSearchParams(location.search);
    return urlparse.get(name);

}

function generateUrl() {
    let glslurl = document.getElementById("glslfileurl").value;
    if (glslurl === "") {
        alert("urlを入力してください");
        return;
    }
    console.log(glslurl);
    const urlparse = new URLSearchParams(location.search);
    urlparse.set("glslref", glslurl);
    let nowurl = window.location.href;
    let newurl = "";
    let addtext = urlparse.toString();
    let originurl = nowurl;
    if (nowurl.includes("?")) {
        originurl = nowurl.substr(0, nowurl.indexOf("?"));
    }
    console.log(originurl);

    newurl = originurl + "?" + addtext;
    console.log(newurl);

    sendtoclipboard(newurl);
    document.execCommand(newurl);
    alert("url copied!");

}

function sendtoclipboard(string) {
    const tmparea = document.createElement("textarea");
    tmparea.value = string;
    document.body.appendChild(tmparea);
    tmparea.select();
    document.execCommand("copy");
    document.body.removeChild(tmparea);
}

