
import React from 'react';

var PlaylistsPanel = React.createClass({
  propTypes: {
    searchForVideo: React.PropTypes.func.isRequired,
    playlistsPanelView: React.PropTypes.object.isRequired,
    currentSearch: React.PropTypes.object.isRequired
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
  emptyPlaylistView: function() {
    return (<ul id="playlist-ul"></ul>)
  },
  dummyData: function() {
    return (
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
    )
  },
  getCurrentSearchItems: function() {

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

    // processing search data
    // console.log(this.props.currentSearch.items);

    // What we're looking at
    // console.log(this.props.currentSearch.items);

    let playlistPos = 0;
    let playlistsCurrentView = "";
    let currentPlaylistName = "Current Playlist";
    if (this.props.playlistsPanelView.type === "blank") {
      playlistsCurrentView = this.emptyPlaylistView();
    } else if (this.props.playlistsPanelView.type === "playlist") {
      playlistsCurrentView = this.dummyData();
    } else if (this.props.playlistsPanelView.type === "search") {
      // currentPlaylistName = "Search";
      let searchItems = this.props.currentSearch.items.map(function(item){
        let playlistPosClass = "";
        if (playlistPos === 0) {
          playlistPosClass = "playlist-item-2";
          playlistPos = 1;
        } else {
          playlistPosClass = "playlist-item-1"
          playlistPos = 0;
        }
        let videoURL = "https://www.youtube.com/watch?v=" + item.id.videoId;
        return (
            <li className={playlistPosClass} key={item.id.videoId}><a target="_blank" href={videoURL}><img className="pl-thumbnail" src={item.snippet.thumbnails.default.url} /></a><span className="pl-media-title">{item.snippet.title}</span><span className="pl-channel">{item.snippet.channelTitle}</span>{/*<span className="pl-timestamp">00:00</span>*/}</li>
        )
      });


      let computeSearchView = function(list) {
        return ( <ul id="playlist-ul">{list}</ul> )
      }
      playlistsCurrentView = computeSearchView(searchItems);
    }
    return (
      <div id="playlists-panel" ref="playlists-panel" className={appliedClasses}>
        <div id="playlists-panel-head">
          <input type="text" id="playlist-search-box" ref="searchbox" placeholder="Search YouTube" className="form-control" onKeyPress={this.handleSubmit} />
            <div className="btn-group" id="playlist-btn">
                <a className="btn btn-primary dropdown-toggle" id="playlist-dropdown" data-toggle="dropdown" href="#"><p id="pl-current-playlist">{currentPlaylistName}</p>
                    <span id="pl-carat" className="fa fa-caret-down"></span></a>
                    <ul className="dropdown-menu" id="pl-dd-menu">
                      <li><a href="#">Electronic</a></li>
                      <li><a href="#">Rock</a></li>
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
