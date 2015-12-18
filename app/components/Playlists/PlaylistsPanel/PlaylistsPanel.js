
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

            <div className="btn-group" id="playlist-btn">
                <a className="btn btn-primary dropdown-toggle" id="playlist-dropdown" data-toggle="dropdown" href="#"><p id="pl-current-playlist">Current Playlist</p>
                    <span id="pl-carat" className="fa fa-caret-down"></span></a>
                    <ul className="dropdown-menu" id="pl-dd-menu">
                      <li><a href="#">Electronic</a></li>
                      <li><a href="#">Rock</a></li>
                    </ul>
            </div>

        </div>
        <div id="playlists-panel-display">
          <ul id="playlist-ul">
            <li className="playlist-item playlist-item-1"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-2"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-1"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-2"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-1"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-2"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-1"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-2"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-1"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-2"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-1"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
            <li className="playlist-item playlist-item-2"><img src="http://placehold.it/60x40" /><span className="pl-media-title">Media Title</span><span className="pl-timestamp">00:00</span></li>
          </ul>
        </div>
      </div>
    );
  }

});

module.exports = PlaylistsPanel;
