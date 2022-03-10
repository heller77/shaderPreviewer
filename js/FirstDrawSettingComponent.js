import {Component} from "./Component.js";
import {Myrenderer} from "./Myrenderer.js";

export class FirstDrawSettingComponent extends Component {
    update(deltatime) {
        Myrenderer.initDraw(this.gameobject.gl);
    }
}