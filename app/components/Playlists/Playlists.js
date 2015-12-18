


import React from 'react';
import $ from 'jquery';

import PlaylistsPanel from './PlaylistsPanel/PlaylistsPanel.js'

 var Playlists = React.createClass({
   propTypes: {
     playlistsOpen: React.PropTypes.bool.isRequired
   },
   render: function() {
     let openButtonIcon = "fa fa-angle-double-up fa-4x";
     if (this.props.playlistsOpen) {
       openButtonIcon = "fa fa-angle-double-down fa-4x"
     }
     return(
      <div id="playlists-component">
        <PlaylistsPanel
          playlistsOpen={this.props.playlistsOpen}
          />
        <div id="playlists-bar" className="row">
          <div id="playlists-open-button" className="col-lg-1" onClick={this.props.playlistsOpenToggle}>
            <i id="playlists-open-icon" className={openButtonIcon}></i>
          </div>
          <div id="playlist-metadata" className="col-lg-3">
            <a>Current Playlist Name</a><br/>
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
