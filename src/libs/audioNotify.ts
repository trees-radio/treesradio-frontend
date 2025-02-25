import {Howl} from "howler";

import mp3 from "../assets/audio/tr-notify.mp3";
import ogg from "../assets/audio/tr-notify.ogg";

export class AudioNotify {
  howl: Howl;

  constructor(src: any) {
    src = [...src]; // array ftw
    this.howl = new Howl({
      src,
      preload: false
    });
    this.howl.on("load", () => (this.loaded = true));
  }

  loaded = false;

  load(cb: () => void) {
    if (this.loaded) {
      return;
    }
    this.howl.load();
    if (cb) {
      this.howl.once("load", cb);
    }
  }

  play() {
    if (!this.loaded) {
      this.load(() => this.play());
    }
    this.howl.play();
  }
}

export default new AudioNotify([mp3, ogg]);
