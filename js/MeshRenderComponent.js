import {Component} from "./Component.js";

export class MeshRenderComponent extends Component {
    update(deltatime) {
        this.gameobject.draw();
    }
}