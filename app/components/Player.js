import React from 'react';
import {observer} from 'mobx-react';

import ReactPlayer from 'react-player';
import Progress from 'react-progressbar';

import playing from 'stores/playing';


const rPlayerYoutubeConfig = {playerVars: {iv_load_policy: 3}};

export default @observer class Player extends React.Component {

  onProgress(p) {
    // console.log('player prog', p);
    playing.playerProgress = p.played;
    if (playing.shouldSync) {
      this._player.seekTo(playing.fraction);
    }
  }

  render() {
    var playerSizeClass;
    // if (this.props.user.playerSize) {
    //   playerSizeClass = classNames("small-player-size");
    // } else {
    //   playerSizeClass = classNames("large-player-size");
    // }

    return (
      <div>
        <div id="player-size" className="small-player-size">
          <ReactPlayer
            ref={c => this._player = c}
            className="reactplayer"
            width="100%"
            height="100%"
            id="reactplayerid"
            url={playing.data.info.url}
            playing={playing.data.playing}
            volume={playing.volume}
            onProgress={(p) => this.onProgress(p)}
            onPause={undefined}
            youtubeConfig={rPlayerYoutubeConfig}
            onDuration={d => playing.playerDuration = d}
          />
        </div>
        <Progress
          className="progress-bar"
          completed={playing.fraction * 100}
          color="#77b300"
        />
      </div>
    );
  }
}
