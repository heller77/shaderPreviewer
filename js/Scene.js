export class Scene {
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
