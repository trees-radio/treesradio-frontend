import React from 'react';
import {observer} from 'mobx-react';
import {observable} from 'mobx';
import ReactSlider from 'react-slider';
import PlaylistsPanel from './New/Toolbar/PlaylistsPanel';
// import fbase from 'stores/fbase';
import playlists from 'stores/playlists';
import toast from 'utils/toast';
// import classNames from 'classnames';

export default @observer class Toolbar extends React.Component {

  @observable panelOpen = false;

  togglePlaylistsPanel() {
    if (playlists.init) {
      this.panelOpen = !this.panelOpen;
    } else {
      toast.error("You must be logged in to use playlists!");
    }
  }

  render() {
    var currentPlaylistName, currentSelectedMediaClass, currentSelectedMedia, currentPlayingMedia, currentPlayingMediaClass, timer, grabPlaylistsDiv, grabClass, volClass, likeClass, dislikeClass, waitlistButtonClass, waitlistButtonText;

    var openButtonIcon = this.panelOpen && playlists.init ? "fa fa-angle-double-down fa-4x" : "fa fa-angle-double-up fa-4x";

    return (
      <div id="playlists-component">
        {playlists.init ? <PlaylistsPanel open={this.panelOpen}/> : false}
        <div id="playlists-bar" className="row">
          <div id="playlists-open-button" className="col-lg-1 col-md-1 col-sm-1 col-xs-1" onClick={() => this.togglePlaylistsPanel()}>
            <i id="playlists-open-icon" className={openButtonIcon}></i>
          </div>
          <div id="playlist-metadata" className="col-lg-3 col-md-3 col-sm-3 col-xs-3">
            <a className="current-playlist-name">{playlists.selectedPlaylistName}</a><br/>
            <a className={currentSelectedMediaClass}>{currentSelectedMedia}</a>
          </div>
          <div id="currentsong-metadata" className="col-lg-4 col-md-4 col-sm-4 col-xs-4">
            <span>
              <a className={currentPlayingMediaClass}>{currentPlayingMedia}</a>
            </span><br/>
            <a className="current-playing-user">Player: {undefined}</a>
            <span className="media-time">{timer}</span>
          </div>
          <div id="grabtrack" className="col-lg-1 col-md-1 col-sm-1 col-xs-1">
            {grabPlaylistsDiv}
            <div className="grab-button" onClick={() => {}}>
              <i className={grabClass}></i>
              <span className="feedback-grab">{undefined}</span>
            </div>
            <div className="volume-slider" ref="volslider">
              <i className={volClass}></i>
              <ReactSlider
                max={1}
                step={0.01}
                defaultValue={0}
                value={undefined}
                className="volume-slider-node"
                handleClassName="volume-slider-handle"
                handleActiveClassName="volume-slider-handle-active"
                barClassName="volume-slider-bar"
                onChange={() => {}}
                withBars={true}
              />
            </div>
          </div>
          <div id="vote" className="col-lg-1 col-md-1 col-sm-1 col-xs-1">
            <div className="like-button" onClick={() => {}}>
              <i className={likeClass}></i>
              <span className="feedback-likes">{undefined}</span>
            </div>
            <div className="dislike-button" onClick={() => {}}>
              <i className={dislikeClass}></i>
              <span className="feedback-dislikes">{undefined}</span>
            </div>
          </div>
          <div className="waitlist col-lg-2 col-md-2 col-sm-2 col-xs-2">
            <div className={waitlistButtonClass} onClick={() => {}}>{waitlistButtonText}</div>
          </div>
        </div>
      </div>
    );
  }
}
