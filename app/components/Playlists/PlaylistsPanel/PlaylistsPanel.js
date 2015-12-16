
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
    if (!this.props.playlistsOpen) {
      addedClass = "playlists-panel-open";
    }
    let appliedClasses = initialClasses + " " + addedClass;

    return (
      <div id="playlists-panel" ref="playlists-panel" className={appliedClasses}>
        <p>Some text.</p>
      </div>
    );
  }

});

module.exports = PlaylistsPanel;
