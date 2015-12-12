


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
        <div id="playlists-bar">
          <div id="playlists-open-button" onClick={this.toggleDropUp}>
            <i id="playlists-open-icon" className="fa fa-angle-double-up fa-4x"></i>
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
