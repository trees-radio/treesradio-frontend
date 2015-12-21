


import React from 'react';
import $ from 'jquery';

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
   render: function() {
     let openButtonIcon = "fa fa-angle-double-up fa-4x";
     if (this.props.playlistsOpen) {
       openButtonIcon = "fa fa-angle-double-down fa-4x";
     }
     let currentPlaylistName = "";
     if (this.props.currentPlaylist.name === "") {
       currentPlaylistName = "No Playlist Selected";
     } else {
       currentPlaylistName = this.props.currentPlaylist.name;
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
            <a>Next Media in Playlist</a>
          </div>
          <div id="currentsong-metadata" className="col-lg-4">
            <a>Current Media Title</a><br/>
            <a>Player: Gryphon</a>
          </div>
          <div id="grabtrack" className="col-lg-1">
            <div className="grab-button"><i className="fa fa-arrow-circle-o-down"></i></div>
          </div>
          <div id="vote" className="col-lg-1">
            {/* <a className="button pblue"><div className="light"></div>Like</a><br/> */}
            <div className="like-button"><i className="fa fa-thumbs-o-up"></i></div><br/>
            {/* <a className="button pred"><div className="light"></div>Dislike</a> */}
            <div className="dislike-button"><i className="fa fa-thumbs-o-down"></i></div>
          </div>
          <div id="waitlist" className="col-lg-2">
            <div className="join-waitlist">Join Waitlist</div>
          </div>
       </div>
     </div>
     )
   }
 });

module.exports = Playlists

/////////////////////////////////////
// Font Awesomes for Playlist Boards
// open = fa-angle-double-up
// upvote = fa-thumbs-up
// downvote = fa-thumbs-down
/////////////////////////////////////
// Controls:
// stop = fa-stop-circle-o
// continue = fa-play-circle-o
// snooze = fa-ban
/////////////////////////////////////
