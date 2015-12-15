


import React from 'react';
import $ from 'jquery';

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
        <div id="playlists-panel" ref="playlists-panel">
          <p>Some text.</p>
        </div>
        <div id="playlists-bar" className="row">
          <div id="playlists-open-button" className="col-lg-1" onClick={this.toggleDropUp}>
            <i id="playlists-open-icon" className="fa fa-angle-double-up fa-4x"></i>
          </div>
          <div id="playlist-metadata" className="col-lg-4">
            <a>Current Playlist Name</a><br/>
            <a>Next Song in Playlist</a>
          </div>
          <div id="currentsong-metadata" className="col-lg-4">
            <a>Current Song Name</a><br/>
            <a>Current Artist Name</a>
          </div>
          <div id="grabtrack" className="col-lg-2">
            <a>Grab Track</a>
          </div>
          <div id="vote" className="col-lg-1">
            <a>Like</a><br/>
            <a>Dislike</a>
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
