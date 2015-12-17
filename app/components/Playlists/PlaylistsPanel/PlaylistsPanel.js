
import React from 'react';

var PlaylistsPanel = React.createClass({

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

        </div>
        <div id="playlists-panel-display">
          <ul>
            <li className=""><img src="http://placehold.it/60x40" /><span>Media Title</span><span>00:00</span></li>
          </ul>
        </div>
      </div>
    );
  }

});

module.exports = PlaylistsPanel;
