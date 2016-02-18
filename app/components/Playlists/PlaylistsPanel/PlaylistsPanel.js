
import React from 'react';
// import parseIsoDuration from 'parse-iso-duration';
import moment from 'moment';
// import sweetAlert from 'sweetalert';
// import cookie from 'react-cookie';

var PlaylistsPanel = React.createClass({
  propTypes: {
    searchForVideo: React.PropTypes.func.isRequired,
    playlistsPanelView: React.PropTypes.string.isRequired,
    currentSearch: React.PropTypes.object.isRequired,
    addNewPlaylist: React.PropTypes.func.isRequired,
    currentPlaylist: React.PropTypes.object.isRequired,
    playlists: React.PropTypes.array.isRequired,
    removePlaylist: React.PropTypes.func.isRequired,
    selectPlaylist: React.PropTypes.func.isRequired,
    addToPlaylist: React.PropTypes.func.isRequired,
    removeFromPlaylist: React.PropTypes.func.isRequired,
    moveTopPlaylist: React.PropTypes.func.isRequired
  },
  componentDidMount: function() {


  },
  handleSubmit: function(e) {
    if (e.key === 'Enter') {
      let searchQuery = this.refs.searchbox.value.trim();
      if (searchQuery === '') {
        // console.log("User attempted to send an empty search query");
      } else {
        this.refs.searchbox.value = '';
        this.props.searchForVideo(searchQuery);
      }
    }
  },
  handleAdd: function(index) {
    this.props.addToPlaylist(false, index);
  },
  handleRemove: function(index) {
    this.props.removeFromPlaylist(index);
  },
  handleMoveTop: function(index) {
    // console.log("Moving top");
    this.props.moveTopPlaylist(index);
  },
  handleSelectPlaylist: function(index) {
    // console.log("Selected playlist of index", index);
    this.props.selectPlaylist(index);
  },
  handleRemovePlaylist: function(index) {
    this.props.removePlaylist(index);
  },
  emptyPlaylistView: function() {
    return (<ul id="playlist-ul" className="no-playlist-selected">You don't have a playlist selected.</ul>)
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
    let currentPlaylistName = this.props.currentPlaylist.name;
    let currentPlaylistIndex = this.props.currentPlaylist.id;
    if (currentPlaylistName === "") {
      currentPlaylistName = "Click to Select a Playlist";
    }
    if (this.props.playlistsPanelView === "blank") {

      playlistsCurrentView = this.emptyPlaylistView();

    } else if (this.props.playlistsPanelView === "playlist") {

      if (!this.props.playlists[currentPlaylistIndex].entries) {
        playlistsCurrentView = this.emptyPlaylistView();
      } else {
        // console.log(this.props.playlists[currentPlaylistIndex].entries);
        let playlistItems = this.props.playlists[currentPlaylistIndex].entries.map(function(item, index){
          let playlistPosClass = "";
          if (playlistPos === 0) {
            playlistPosClass = "playlist-item-2";
            playlistPos = 1;
          } else {
            playlistPosClass = "playlist-item-1";
            playlistPos = 0;
          }
          let boundClickRemove = this.handleRemove.bind(this, index);
          let boundClickTop = this.handleMoveTop.bind(this, index);
          var humanDuration = "Unknown";
          if (item.duration) {
            // console.log(item.duration);
            var videoDuration = moment.duration(item.duration);
            var vidHours = videoDuration.hours();
            var vidHoursDisplay = "";
            if (vidHours > 0) {
              vidHoursDisplay = vidHours + "h ";
            }
            var vidMins = videoDuration.minutes();
            var vidSecs = "0" + videoDuration.seconds();
            humanDuration = vidHoursDisplay + vidMins +':'+ vidSecs.substr(-2);
          }

          return (
            <li className={playlistPosClass} key={index}>
              <a target="_blank" href={item.url}><img className="pl-thumbnail" src={item.thumb} /></a>
              <span className="pl-media-title">{item.title}</span>
              <span className="pl-time"><i className="fa fa-clock-o"></i> {humanDuration}</span>
              <span className="pl-channel">{item.channel}</span>
              <i onClick={boundClickRemove} className="fa fa-2x fa-trash remove-from-playlist-btn"></i>
              <i onClick={boundClickTop} className="fa fa-2x fa-arrow-up pl-move-to-top"></i>
            </li>
          )
        }, this);
        let computePlaylistView = function(list) {
          return ( <ul id="playlist-ul">{list}</ul> )
        }
        playlistsCurrentView = computePlaylistView(playlistItems);
      }



    } else if (this.props.playlistsPanelView === "search") {
      let searchItems = this.props.currentSearch.items.map(function(item, index){
        let playlistPosClass = "";
        if (playlistPos === 0) {
          playlistPosClass = "playlist-item-2";
          playlistPos = 1;
        } else {
          playlistPosClass = "playlist-item-1";
          playlistPos = 0;
        }
        let videoURL = "https://www.youtube.com/watch?v=" + item.id;
        let boundClick = this.handleAdd.bind(this, index);
        var videoDuration = moment.duration(item.contentDetails.duration);
        var vidHours = videoDuration.hours();
        var vidHoursDisplay = "";
        if (vidHours > 0) {
          vidHoursDisplay = vidHours + "h ";
        }
        var vidMins = videoDuration.minutes();
        var vidSecs = "0" + videoDuration.seconds();
        var humanDuration = vidHoursDisplay + vidMins +':'+ vidSecs.substr(-2);
        return (
            <li className={playlistPosClass} key={index}>
              <a target="_blank" href={videoURL}><img className="pl-thumbnail" src={item.snippet.thumbnails.default.url} /></a>
              <span className="pl-media-title">{item.snippet.title}</span>
              <span className="pl-time"><i className="fa fa-clock-o"></i> {humanDuration}</span>
              <span className="pl-channel">{item.snippet.channelTitle}</span>
              <i onClick={boundClick} className="fa fa-2x fa-plus add-to-playlist-btn"></i>
            </li>
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
      let playlistName = playlist.name;
      if (playlistName.length > 23) {
        let maxLength = 23;
        playlistName = playlistName.substring(0,maxLength) + "...";
      }
      return (
        <li key={playlist.key}><a onClick={boundClickSelect} href="#">{playlistName}</a><div onClick={boundClickRemove} className="fa fa-trash remove-playlist"/></li>
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
                <a className="btn btn-primary dropdown-toggle" id="playlist-dropdown" data-toggle="dropdown" href="#"><p id="pl-current-playlist">{currentPlaylistName}</p></a>
                    <ul className="dropdown-menu" id="pl-dd-menu">
                      <li><a href="#" onClick={this.props.addNewPlaylist}><i className="fa fa-plus"/> New Playlist</a></li>
                      <li><a href="#" onClick={this.props.playlistImport}><i className="fa fa-youtube-play"></i> Import Playlist</a></li>
                      {playlistsList}
                    </ul>
            </div>
            <span onClick={this.props.shufflePlaylist} className="playlist-shuffle-btn fa fa-random fa-3x"></span>
        </div>
        <div id="playlists-panel-display">
          {playlistsCurrentView}
        </div>
      </div>
    );
  }

});

// module.exports = PlaylistsPanel;
export default PlaylistsPanel;
