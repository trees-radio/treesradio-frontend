


import React from 'react';
import $ from 'jquery';

import PlaylistsPanel from './PlaylistsPanel/PlaylistsPanel.js'

 var Playlists = React.createClass({
   propTypes: {
     playlistsOpen: React.PropTypes.func.isRequired
   },
   toggleDropUp: function() {
     if (!this.props.playlistsOpen) {

     } else {

     }
   },
   render: function() {
     return(
      <div id="playlists-component">
        <PlaylistsPanel
          playlistsOpen={this.props.playlistsOpen}
          />
        <div id="playlists-bar" className="row">
          <div id="playlists-open-button" className="col-lg-1" onClick={this.toggleDropUp}>
            <i id="playlists-open-icon" className="fa fa-angle-double-up fa-4x"></i>
          </div>
          <div id="playlist-metadata" className="col-lg-3">
            <a>Current Playlist Name</a><br/>
            <a>Next Song in Playlist</a>
          </div>
          <div id="currentsong-metadata" className="col-lg-4">
            <a>Current Song Name</a><br/>
            <a>Current Artist Name</a>
          </div>
          <div id="grabtrack" className="col-lg-1">
            <a className="button ppurple"><div className="light"></div>Grab</a> {/* clicked className="button purple" */}
          </div>
          <div id="vote" className="col-lg-1">
            <a className="button pblue"><div className="light"></div>Like</a><br/> {/* clicked className="button blue" */}
            <a className="button pred"><div className="light"></div>Dislike</a> {/* clicked className="button red" */}
          </div>
          <div id="waitlist" className="col-lg-2">
            <a>Join Waitlist</a>
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
