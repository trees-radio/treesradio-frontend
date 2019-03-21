import React from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";

import ReactPlayer from "react-player";
import Progress from "react-progressbar";

import playing from "stores/playing";

const rPlayerYoutubeConfig = {
  playerVars: {
    iv_load_policy: 3
  }
};

@observer
class Player extends React.Component {
  onProgress(p) {
    playing.playerProgress = p.played;
    if (playing.shouldSync) {
      this._player.seekTo(playing.fraction);
    }
  }

  @observable showVideo = true;

  componentDidMount() {
    this.onkeydownListener = e => {
      if (e.ctrlKey && e.shiftKey && e.keyCode === 86) {
        e.preventDefault();
        this.showVideo = !this.showVideo;
      }
    };

    window.addEventListener("keydown", this.onkeydownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onkeydownListener);
  }

  render() {
    const containerStyle = {
      backgroundImage: `url(${playing.backgroundImage})`
    };

    return (
      <div id="vidcontainer" style={containerStyle}>
        <div
          id="player-size"
          className={playing.playerSize === "BIG" ? "large-player-size" : "small-player-size"}
        >
          {this.showVideo && (
            <ReactPlayer
              ref={c => (this._player = c)}
              className="reactplayer"
              width="100%"
              height="100%"
              id="reactplayerid"
              url={playing.data.info.url}
              playing={playing.data.playing}
              volume={playing.volume}
              onProgress={p => this.onProgress(p)}
              onPause={undefined}
              config={{
                youtube: {
                  rPlayerYoutubeConfig
                }
              }}
              onDuration={d => (playing.playerDuration = d)}
            />
          )}{" "}
        </div>{" "}
        <Progress
          className="progressbar-container"
          completed={
            Math.floor(playing.fraction * 100) > 100 ? 100 : Math.floor(playing.fraction * 100)
          }
          color="#77b300"
        />
      </div>
    );
  }
}

export default Player;
