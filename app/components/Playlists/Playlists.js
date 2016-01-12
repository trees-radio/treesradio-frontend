


import React from 'react';
import ReactSlider from 'react-slider';
import classNames from 'classnames';
// import $ from 'jquery';

// // Material-UI imports
// import Slider from 'material-ui/lib/slider';
// import ThemeManager from 'material-ui/lib/styles/theme-manager';
// import treesradioMuiTheme from '../../utils/muiTheme.js'




import PlaylistsPanel from './PlaylistsPanel/PlaylistsPanel.js'

var Playlists = React.createClass({
  // // MUI stuff
  // childContextTypes: {
  //   muiTheme: React.PropTypes.object
  // },
  // getChildContext: function() {
  //   return {
  //     muiTheme: ThemeManager.getMuiTheme(treesradioMuiTheme)
  //   };
  // },
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
   updateVolume: function(value) {
     this.props.updateVolume(value);
   },
   handleWaitlistButton: function(e) {
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
     if (this.props.currentPlaylist.name === "") {
       currentPlaylistName = "No Playlist Selected";
     } else {
       currentPlaylistName = this.props.currentPlaylist.name;
       if (this.props.playlists[currentPlaylistId].entries) {
         currentSelectedMedia = this.props.playlists[currentPlaylistId].entries[0].title;
         if (currentSelectedMedia.length > 35) {
           let maxLength = 35;
           currentSelectedMedia = currentSelectedMedia.substring(0,maxLength) + "...";
         }
       }
     }
     let waitlistButtonText = "Join Waitlist";
     var waitlistButtonClass = classNames("join-waitlist");
     if (this.props.inWaitlist.waiting) {
       waitlistButtonText = "Leave Waitlist";
       waitlistButtonClass = classNames("join-waitlist", "join-waitlist-pressed");
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
          />
        <div id="playlists-bar" className="row">
          <div id="playlists-open-button" className="col-lg-1" onClick={this.props.playlistsOpenToggle}>
            <i id="playlists-open-icon" className={openButtonIcon}></i>
          </div>
          <div id="playlist-metadata" className="col-lg-3">
            <a>{currentPlaylistName}</a><br/>
            <a>{currentSelectedMedia}</a>
          </div>
          <div id="currentsong-metadata" className="col-lg-4">
            <a>{this.props.playingMedia.info.title}</a><br/>
            <a>Player: {this.props.playingMedia.playback.user}</a>
          </div>
          <div id="grabtrack" className="col-lg-1">
            <div className="grab-button"><i className="fa fa-arrow-circle-o-down"></i><span className="feedback-grab">{this.props.playingMedia.feedback.grabs}</span></div>
            <div className="volume-slider">
              <i className="fa fa-volume-down volume-slider-icon"></i>
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
          <div id="vote" className="col-lg-1">
            {/* <a className="button pblue"><div className="light"></div>Like</a><br/> */}
            <div className="like-button"><i className="fa fa-thumbs-o-up"></i><span className="feedback-likes">{this.props.playingMedia.feedback.likes}</span></div>
            {/* <a className="button pred"><div className="light"></div>Dislike</a> */}
            <div className="dislike-button"><i className="fa fa-thumbs-o-down"></i><span className="feedback-dislikes">{this.props.playingMedia.feedback.dislikes}</span></div>
          </div>
          <div id="waitlist" className="col-lg-2">
            <div className="join-waitlist" onClick={this.handleWaitlistButton}>{waitlistButtonText}</div>
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
