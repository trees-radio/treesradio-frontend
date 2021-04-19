class tokeEvent extends EventTarget {
    tokeNow() {
        this.dispatchEvent(new Event('toke'));
    }
}

const tokeEvt = new tokeEvent();

export default tokeEvt;