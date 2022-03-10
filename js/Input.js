export class Input {
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

    static getloopflag() {
        return document.getElementById("loopflag").checked;
    }

    static xRotateflag() {
        return document.getElementById("xflag").checked;
    }
}