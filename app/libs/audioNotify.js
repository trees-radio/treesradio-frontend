import {Howl} from 'howler';

import mp3 from 'audio/tr-notify.mp3';
import ogg from 'audio/tr-notify.ogg';

export class AudioNotify {
  constructor(src) {
    src = [...src]; // array ftw
    this.howl = new Howl({
      src,
      preload: false
    });
    this.howl.on('load', () => this.loaded = true);
  }

  loaded = false;

  load(cb) {
    if (this.loaded) {
      return;
    }
    this.howl.load();
    if (cb) {
        this.howl.once('load', cb);
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
