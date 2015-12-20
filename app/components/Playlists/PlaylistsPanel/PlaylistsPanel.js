
import React from 'react';
import sweetAlert from 'sweetalert';

var PlaylistsPanel = React.createClass({
  propTypes: {
    searchForVideo: React.PropTypes.func.isRequired,
    playlistsPanelView: React.PropTypes.object.isRequired,
    currentSearch: React.PropTypes.object.isRequired,
    addNewPlaylist: React.PropTypes.func.isRequired,
    currentPlaylist: React.PropTypes.string.isRequired,
    playlists: React.PropTypes.array.isRequired,
    removePlaylist: React.PropTypes.func.isRequired
  },
  handleSubmit: function(e) {
    if (e.key === 'Enter') {
      let searchQuery = this.refs.searchbox.value.trim();
      if (searchQuery === '') {
        console.log("User attempted to send an empty search query");
      } else {
        this.refs.searchbox.value = '';
        this.props.searchForVideo(searchQuery);
      }
    }
  },
  handleAdd: function(index) {
    console.log("Adding search item of index", index, "to playlist");
  },
  handleSelectPlaylist: function(index) {
    console.log("Selected playlist of index", index);
  },
  handleRemovePlaylist: function(index) {
    this.props.removePlaylist(index);
  },
  emptyPlaylistView: function() {
    return (<ul id="playlist-ul" className="no-playlist-selected"/>)
  },
  render: function() {
    ///////////////////////////////////////////////////////////////////////
    // PANEL
    ///////////////////////////////////////////////////////////////////////
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

    // What we're looking at
    let playlistPos = 0;
    let playlistsCurrentView = "";
    let currentPlaylistName = "";
    if (this.props.currentPlaylist === "") {
      currentPlaylistName = "No Playlist Selected";
    }
    if (this.props.playlistsPanelView.type === "blank") {
      // currentPlaylistName = "No Playlist Selected";
      playlistsCurrentView = this.emptyPlaylistView();
    } else if (this.props.playlistsPanelView.type === "playlist") {
      // playlistsCurrentView = this.dummyData();

    } else if (this.props.playlistsPanelView.type === "search") {
      let searchItems = this.props.currentSearch.items.map(function(item, index){
        let playlistPosClass = "";
        if (playlistPos === 0) {
          playlistPosClass = "playlist-item-2";
          playlistPos = 1;
        } else {
          playlistPosClass = "playlist-item-1";
          playlistPos = 0;
        }
        let videoURL = "https://www.youtube.com/watch?v=" + item.id.videoId;
        let boundClick = this.handleAdd.bind(this, index);
        return (
            <li className={playlistPosClass} key={index}><a target="_blank" href={videoURL}><img className="pl-thumbnail" src={item.snippet.thumbnails.default.url} /></a><span className="pl-media-title">{item.snippet.title}</span><span className="pl-channel">{item.snippet.channelTitle}</span><i onClick={boundClick} className="fa fa-2x fa-plus add-to-playlist-btn"></i></li>
        )
      }, this); // use 'this' as second arg to map to preserve scope


      let computeSearchView = function(list) {
        return ( <ul id="playlist-ul">{list}</ul> )
      }
      playlistsCurrentView = computeSearchView(searchItems);
    }
    ///////////////////////////////////////////////////////////////////////
    // Playlists List (dropdown)
    ///////////////////////////////////////////////////////////////////////
    let playlistsList = this.props.playlists.map(function(playlist, index){
      let boundClickSelect = this.handleSelectPlaylist.bind(this, index);
      let boundClickRemove = this.handleRemovePlaylist.bind(this, index);
      return (
        <li key={playlist.key}><a onClick={boundClickSelect} href="#">{playlist.name}</a><div onClick={boundClickRemove} className="fa fa-trash remove-playlist"/></li>
      )
    }, this);
    ///////////////////////////////////////////////////////////////////////
    // RENDER
    ///////////////////////////////////////////////////////////////////////
    return (
      <div id="playlists-panel" ref="playlists-panel" className={appliedClasses}>
        <div id="playlists-panel-head">
          <input type="text" id="playlist-search-box" ref="searchbox" placeholder="Search YouTube" className="form-control" onKeyPress={this.handleSubmit} />
            <div className="btn-group" id="playlist-btn">
                <a className="btn btn-primary dropdown-toggle" id="playlist-dropdown" data-toggle="dropdown" href="#"><p id="pl-current-playlist">{currentPlaylistName}</p>
                    <span id="pl-carat" className="fa fa-caret-down"></span></a>
                    <ul className="dropdown-menu" id="pl-dd-menu">
                      <li><a href="#" onClick={this.props.addNewPlaylist}><i className="fa fa-plus"/> New Playlist</a></li>
                      {playlistsList}
                    </ul>
            </div>
        </div>
        <div id="playlists-panel-display">
          {playlistsCurrentView}
        </div>
      </div>
    );
  }

});

module.exports = PlaylistsPanel;
