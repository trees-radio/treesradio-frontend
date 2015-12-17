
import React from 'react';

var PlaylistsPanel = React.createClass({
  handleSubmit: function() {

  },
  render: function() {
    // classes for container div
    //
    // add initial classes here
    let initialClasses = "";
    //
    // added class logic
    let addedClass = "";
    if (this.props.playlistsOpen) {
      addedClass = "playlists-panel-open";
    } else {
      addedClass = "playlists-panel-closed";
    }
    var classSpacer = "";
    if (initialClasses != "") {
      classSpacer = " ";
    }
    let appliedClasses = initialClasses + classSpacer + addedClass;

    return (
      <div id="playlists-panel" ref="playlists-panel" className={appliedClasses}>
        <div id="playlists-panel-head">
          <input type="text" id="playlist-search-box" ref="searchbox" placeholder="Search YouTube" className="form-control" onKeyPress={this.handleSubmit} />
          <button id="pl-current-playlist">Current Playlist</button>
        </div>
        <div id="playlists-panel-display">
          <ul>
            <li className="playlist-item playlist-item-1"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-2"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-1"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
          </ul>
        </div>
      </div>
    );
  }

});

module.exports = PlaylistsPanel;
