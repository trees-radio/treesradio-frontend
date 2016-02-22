


import React from 'react';
import ReactSlider from 'react-slider';
import classNames from 'classnames';
import moment from 'moment';



import PlaylistsPanel from './PlaylistsPanel/PlaylistsPanel.js'

var Playlists = React.createClass({
  propTypes: {
     playlistsOpen: React.PropTypes.bool.isRequired,
     searchForVideo: React.PropTypes.func.isRequired,
     playlistsPanelView: React.PropTypes.string.isRequired,
     currentSearch: React.PropTypes.object.isRequired,
     addNewPlaylist: React.PropTypes.func.isRequired,
     currentPlaylist: React.PropTypes.object.isRequired,
     playlists: React.PropTypes.array.isRequired,
     removePlaylist: React.PropTypes.func.isRequired,
     selectPlaylist: React.PropTypes.func.isRequired,
     addToPlaylist: React.PropTypes.func.isRequired,
     removeFromPlaylist: React.PropTypes.func.isRequired,
     moveTopPlaylist: React.PropTypes.func.isRequired
   },
   componentDidMount: function() {
     var volSlider = this.refs.volslider;
     volSlider.addEventListener("mousewheel", this.wheelVol, false);
   },
   wheelVol: function(e) {
     if (e.wheelDelta > 0) {
       //scroll up
       this.props.volumeNudge("up");
     } else {
       //scroll down
       this.props.volumeNudge("down");
     }
   },
   updateVolume: function(value) {
     this.props.updateVolume(value);
   },
   handleWaitlistButton: function() {
     this.props.toggleWaiting();
   },
   render: function() {
     let openButtonIcon = "fa fa-angle-double-up fa-4x";
     if (this.props.playlistsOpen) {
       openButtonIcon = "fa fa-angle-double-down fa-4x";
     }
     let currentPlaylistName = "";
     let currentPlaylistId = this.props.currentPlaylist.id;
     let currentSelectedMedia = "";
     var currentSelectedMediaClass = classNames("current-selected-media");
     if (this.props.currentPlaylist.name === "") {
       currentPlaylistName = "No Playlist Selected";
     } else {
       currentPlaylistName = this.props.currentPlaylist.name;
       if (this.props.playlists[currentPlaylistId].entries) {
         currentSelectedMedia = this.props.playlists[currentPlaylistId].entries[0].title;
         var maxLength = 35;
         if (currentSelectedMedia.length > maxLength) {
           currentSelectedMedia = currentSelectedMedia.substring(0,maxLength) + "...";
           currentSelectedMediaClass = classNames("current-selected-media");
         }
       }
     }
     let waitlistButtonText = "Join Waitlist";
     var waitlistButtonClass = classNames("join-waitlist");
     if (this.props.inWaitlist) {
       if (this.props.inWaitlist.waiting && this.props.waitlist[0] && this.props.user.inWaitlist.id === this.props.waitlist[0].key) {
         waitlistButtonText = "Skip Song";
         waitlistButtonClass = classNames("join-waitlist", "join-waitlist-pressed");
       } else if (this.props.inWaitlist.waiting) {
         waitlistButtonText = "Leave Waitlist";
         waitlistButtonClass = classNames("join-waitlist", "join-waitlist-pressed");
       }
     }

     var likeClass = classNames("fa", "fa-thumbs-o-up");
     if (this.props.userFeedback.opinion === "like") {
       likeClass = classNames("fa", "fa-thumbs-up");
     }
     var dislikeClass = classNames("fa", "fa-thumbs-o-down");
     if (this.props.userFeedback.opinion === "dislike") {
       dislikeClass = classNames("fa", "fa-thumbs-down");
     }
     var grabClass = classNames("fa", "fa-arrow-circle-o-down");
     if (this.props.userFeedback.grab) {
       grabClass = classNames("fa", "fa-arrow-circle-down");
     }

     var currentPlayingMedia = this.props.playingMedia.info.title;
     var currentPlayingMediaClass = classNames("current-playing-media");
     if (currentPlayingMedia.length > 35) {
       currentPlayingMedia = currentPlayingMedia + "  ---  " + currentPlayingMedia;
       currentPlayingMediaClass = classNames("current-playing-media", "marquee");
     }

     var volClass;
     if (this.props.controls.volume < 0.1) {
       volClass = classNames("fa", "fa-volume-off", "volume-slider-icon");
     } else if (this.props.controls.volume < 0.6) {
       volClass = classNames("fa", "fa-volume-down", "volume-slider-icon");
     } else {
       volClass = classNames("fa", "fa-volume-up", "volume-slider-icon");
     }

     var timer = "";
     if (this.props.playingMedia.playback.playing) {
       var duration = moment.duration(this.props.playingMedia.playback.duration, 'seconds');
       var durHours = duration.hours();
       var durHoursDisplay = "";
       if (durHours > 0) {
         durHoursDisplay = durHours + ":";
       }
       var durMins = "0" + duration.minutes();
       var durSecs = "0" + duration.seconds();
       var current = moment.duration(this.props.playingMedia.playback.time, 'seconds');
       var curHours = current.hours();
       var curHoursDisplay = "";
       if (durHours > 0) {
         curHoursDisplay = curHours + ":";
       }
       var curMins = "0" + current.minutes();
       var curSecs = "0" + current.seconds();
       timer = curHoursDisplay + curMins.substr(-2) + ":" + curSecs.substr(-2) + " / " + durHoursDisplay + durMins.substr(-2) + ":" + durSecs.substr(-2);
     }

     return(
      <div id="playlists-component">
        <PlaylistsPanel
          playlistsOpen={this.props.playlistsOpen}
          searchForVideo={this.props.searchForVideo}
          playlistsPanelView={this.props.playlistsPanelView}
          currentSearch={this.props.currentSearch}
          addNewPlaylist={this.props.addNewPlaylist}
          currentPlaylist={this.props.currentPlaylist}
          playlists={this.props.playlists}
          removePlaylist={this.props.removePlaylist}
          selectPlaylist={this.props.selectPlaylist}
          addToPlaylist={this.props.addToPlaylist}
          removeFromPlaylist={this.props.removeFromPlaylist}
          moveTopPlaylist={this.props.moveTopPlaylist}
          shufflePlaylist={this.props.shufflePlaylist}
          playlistImport={this.props.playlistImport}
          />
        <div id="playlists-bar" className="row">
          <div id="playlists-open-button" className="col-lg-1 col-md-1 col-sm-1 col-xs-1" onClick={this.props.playlistsOpenToggle}>
            <i id="playlists-open-icon" className={openButtonIcon}></i>
          </div>
          <div id="playlist-metadata" className="col-lg-3 col-md-3 col-sm-3 col-xs-3">
            <a className="current-playlist-name">{currentPlaylistName}</a><br/>
            <a className={currentSelectedMediaClass}>{currentSelectedMedia}</a>
          </div>
          <div id="currentsong-metadata" className="col-lg-4 col-md-4 col-sm-4 col-xs-4">
            <span><a className={currentPlayingMediaClass}>{currentPlayingMedia}</a></span>
            <span className="media-time">{timer}</span><br/>
            <a className="current-playing-user">Player: {this.props.playingMedia.playback.user}</a>
          </div>
          <div id="grabtrack" className="col-lg-1 col-md-1 col-sm-1 col-xs-1">
            <div className="grab-button" onClick={this.props.handleGrabButton}><i className={grabClass}></i><span className="feedback-grab">{this.props.playingMedia.feedback.grabs}</span></div>
            <div className="volume-slider" ref="volslider">
              <i className={volClass}></i>
              <ReactSlider
                max={1}
                step={0.01}
                defaultValue={0}
                value={this.props.controls.volume}
                className="volume-slider-node"
                handleClassName="volume-slider-handle"
                handleActiveClassName="volume-slider-handle-active"
                barClassName="volume-slider-bar"
                onChange={this.updateVolume}
                withBars={true}
                />

            </div>

          </div>
          <div id="vote" className="col-lg-1 col-md-1 col-sm-1 col-xs-1">
            <div className="like-button" onClick={this.props.handleLikeButton}><i className={likeClass}></i><span className="feedback-likes">{this.props.playingMedia.feedback.likes}</span></div>
            <div className="dislike-button" onClick={this.props.handleDislikeButton}><i className={dislikeClass}></i><span className="feedback-dislikes">{this.props.playingMedia.feedback.dislikes}</span></div>
          </div>
          <div className="waitlist col-lg-2 col-md-2 col-sm-2 col-xs-2">
            <div className={waitlistButtonClass} onClick={this.handleWaitlistButton}>{waitlistButtonText}</div>
          </div>
       </div>
     </div>
     )
   }
 });

export default Playlists;


/////////////////////////////////////
// Controls:
// stop = fa-stop-circle-o
// continue = fa-play-circle-o
// snooze = fa-ban
/////////////////////////////////////
