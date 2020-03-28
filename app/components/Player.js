import React from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";

import ReactPlayer from "react-player";
import {Line} from "rc-progress";

import playing from "stores/playing";
import userbit from "./Nav/UserBit";

const rPlayerYoutubeConfig = {
  playerVars: {
    iv_load_policy: 1,
    controls: true,
    playsinline: true,
    color: "white",
    autoplay: true
  },
  preload: true,
  controls: true
};

const rPlayerSoundcloudConfig = {
  options: {
    auto_play: true,
    buying: false,
    sharing: false,
    download: false,
    show_playcount: false,
    single_active: false,
    color: "#77b300",
    show_user: false
  },
  preload: true
};

@observer
class Player extends React.Component {
  onProgress(p) {
    playing.playerProgress = p.played;
    if (playing.shouldSync) {
      this._player.seekTo(playing.fraction);
    }
  }
  playerError(e) {
    playing.userReportsError(e);
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
    let controls = true;
    let progress = {};

    if (userbit.legacyInterface) {
      controls = "false";
      progress = {display: "none"};
    }
    
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
              onError={e => this.playerError(e)}
              onPause={undefined}
              controls={controls}
              config={{
                youtube: {
                  rPlayerYoutubeConfig
                },
                soundcloud: {
                  rPlayerSoundcloudConfig
                }
              }}
              onDuration={d => (playing.playerDuration = d)}
            />
          )}{" "}
        </div>{" "}
        <Line
          className="progressbar-container"
          style={progress}
          strokeWidth="4"
          strikeLinecap="butt"
          percent={playing.fraction * 100 > 100 ? 100 : playing.fraction * 100}
          strokeColor="#000000"
        />
      </div>
    );
  }
}

export default Player;
