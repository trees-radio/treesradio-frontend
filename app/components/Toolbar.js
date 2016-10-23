import React from 'react';
import {observer} from 'mobx-react';
import {observable, toJS} from 'mobx';
import ReactSlider from 'react-slider';
import PlaylistsPanel from './New/Toolbar/PlaylistsPanel';

import waitlist from 'stores/waitlist';
import playlists from 'stores/playlists';
import profile from 'stores/profile';
import playing from 'stores/playing';
import toast from 'utils/toast';
import classNames from 'classnames';
import onClickOutside from 'react-onclickoutside';

const GrabPlaylists = onClickOutside(observer(React.createClass({
  handleClickOutside() {
    this.props.toggleGrab(false);
  },

  render() {
    if (this.props.grabbing) {
      var grabPlaylists = playlists.playlists.map((p, i) => {
        var onClick = () => {};
        var songInPlaylist = playlists.checkPlaylistForSong(p.key, playing.data.info.url);
        if (!songInPlaylist) {
          onClick = () => {
            playing.grab(p.key);
            this.toggleGrab();
          };
        }
        var classes = classNames('fa', songInPlaylist ? 'fa-check-circle-o' : 'fa-circle-o');
        return (
          <div key={i} className="grab-playlist" onClick={onClick}>{p.name}<span className={classes}></span></div>
        );
      })
      return <div className="grab-playlists">{grabPlaylists}</div>;
    } else {
      return <div/>;
    }
  }
})));

export default @observer class Toolbar extends React.Component {

  @observable panelOpen = false;

  togglePlaylistsPanel() {
    if (playlists.init) {
      this.panelOpen = !this.panelOpen;
    } else {
      toast.error("You must be logged in to use playlists!");
    }
  }

  volumeWheel(e) {
    if (e.deltaY < 0) {
      //scroll up
      playing.nudgeVolume('UP');
    } else {
      //scroll down
      playing.nudgeVolume('DOWN');
    }
  }

  @observable grabbing = false;

  toggleGrab(setting) {
    if (!profile.user) {
      toast.error('You must be logged in to grab songs!');
      return;
    }
    var set = typeof setting === 'boolean' ? setting : !this.grabbing;
    this.grabbing = set;
  }

  render() {
    var waitlistButtonText = 'Join Waitlist';
    if (waitlist.bigButtonLoading) {
      waitlistButtonText = <i className='fa fa-spin fa-circle-o-notch'></i>
    } else if (waitlist.isPlaying) {
      waitlistButtonText = 'Skip Song';
    } else if (waitlist.inWaitlist) {
      waitlistButtonText = 'Leave Waitlist';
    }

    var volClass;
    if (playing.volume < 0.1) {
      volClass = classNames("fa", "fa-volume-off", "volume-slider-icon");
    } else if (playing.volume < 0.6) {
      volClass = classNames("fa", "fa-volume-down", "volume-slider-icon");
    } else {
      volClass = classNames("fa", "fa-volume-up", "volume-slider-icon");
    }

    var openButtonIcon = this.panelOpen && playlists.init ? "fa fa-angle-double-down fa-4x" : "fa fa-angle-double-up fa-4x";

    var grabIcon, likeIcon, dislikeIcon;
    if (playing.feedbackSending) {
      grabIcon = likeIcon = dislikeIcon = classNames('fa-spin', 'fa-circle-o-notch');
    } else {
      grabIcon = playing.grabbed ? 'fa-plus-square' : 'fa-plus-square-o';
      likeIcon = playing.liked ? 'fa-thumbs-up' : 'fa-thumbs-o-up';
      dislikeIcon = playing.disliked ? 'fa-thumbs-down' : 'fa-thumbs-o-down';
    }

    return (
      <div id="playlists-component">
        {playlists.init ? <PlaylistsPanel open={this.panelOpen}/> : false}
        <div id="playlists-bar" className="row">
          <div id="playlists-open-button" className="col-lg-1 col-md-1 col-sm-1 col-xs-1" onClick={() => this.togglePlaylistsPanel()}>
            <i id="playlists-open-icon" className={openButtonIcon}></i>
          </div>
          <div id="playlist-metadata" className="col-lg-3 col-md-3 col-sm-3 col-xs-3">
            <a className="current-playlist-name">{playlists.selectedPlaylistName}</a><br/>
            <a className="current-selected-media">{playlists.selectedSong}</a>
          </div>
          <div id="currentsong-metadata" className="col-lg-4 col-md-4 col-sm-4 col-xs-4">
            <span className="current-song-title">
              <a className="current-playing-media marquee">{playing.data.info.title}</a>
            </span><br/>
            <a className="current-playing-user">Player: {playing.data.info.user}</a>
            <span className="media-time">{playing.humanCurrent} / {playing.humanDuration}</span>
          </div>
          <div id="grabtrack" className="col-lg-1 col-md-1 col-sm-1 col-xs-1">
            <GrabPlaylists grabbing={this.grabbing} toggleGrab={(setting) => this.toggleGrab(setting)}/>
            <div className="grab-button" onClick={() => this.toggleGrab()}>
              <i className={classNames('fa', grabIcon)}></i>
              <span className="feedback-grab">{playing.data.feedback.grabs}</span>
            </div>
            <div className="volume-slider" onWheel={(e) => this.volumeWheel(e)}>
              <i className={volClass}></i>
              <ReactSlider
                max={1}
                step={0.01}
                defaultValue={0.15}
                value={playing.volume}
                className="volume-slider-node"
                handleClassName="volume-slider-handle"
                handleActiveClassName="volume-slider-handle-active"
                barClassName="volume-slider-bar"
                onChange={e => playing.setVolume(e)}
                withBars={true}
              />
            </div>
          </div>
          <div id="vote" className="col-lg-1 col-md-1 col-sm-1 col-xs-1">
            <div className="like-button" onClick={() => playing.like()}>
              <i className={classNames('fa', likeIcon)}></i>
              <span className="feedback-likes">{playing.data.feedback.likes}</span>
            </div>
            <div className="dislike-button" onClick={() => playing.dislike()}>
              <i className={classNames('fa', dislikeIcon)}></i>
              <span className="feedback-dislikes">{playing.data.feedback.dislikes}</span>
            </div>
          </div>
          <div className="waitlist col-lg-2 col-md-2 col-sm-2 col-xs-2">
            <div className={classNames("join-waitlist", waitlist.inWaitlist ? "join-waitlist-pressed" : false)} onClick={() => waitlist.bigButton()}>{waitlistButtonText}</div>
          </div>
        </div>
      </div>
    );
  }
}
