import React from 'react';
import {observable, toJS} from 'mobx';
import {observer} from 'mobx-react';
// import classNames from 'classnames';
// import fbase from 'stores/fbase';
import playlists from 'stores/playlists';
import Modal from 'components/utility/Modal';
import toast from 'utils/toast';
import moment from 'moment';

export default @observer class PlaylistsPanel extends React.Component {

  @observable addingPlaylist = false;

  onEnterKey(e, cb) {
    var key = e.keyCode || e.which;
    if (key == 13) {
      cb();
    }
  }

  addPlaylist() {
    var name = this._newPlaylist.value;
    if (!name) {
      toast.error("You must provide a playlist name!");
      return;
    }
    this._newPlaylist.value = '';
    playlists.addPlaylist(name);
    this.addingPlaylist = false;
  }

  selectPlaylist(i) {
    playlists.selectPlaylist(i);
  }

  search() {
    var query = this._search.value;
    this._search.value = '';
    playlists.runSearch(query);
  }

  render() {
    var mainClass = this.props.open ? "playlists-panel-open" : "playlists-panel-closed";

    var content;

    if (playlists.searching) {
      content = <i className="fa fa-spin fa-4x fa-circle-o-notch"></i>;
    } else if (playlists.openSearch) {
      let list = playlists.search.map((video, i) => {
        var playlistPosClass = Number.isInteger(i / 2) ? "playlist-item-1" : "playlist-item-2";
        var url = `https://www.youtube.com/watch?v=${video.id}`;
        var duration = moment.duration(video.contentDetails.duration);
        var hours = duration.hours();
        var hoursDisplay = '';
        if (hours > 0) {
          hoursDisplay = hours+'h ';
        }
        var mins = duration.minutes();
        var secs = '0'+duration.seconds();
        var humanDuration = hoursDisplay + mins +':'+ secs.substr(-2);
        return (
            <li className={playlistPosClass} key={i}>
              <a target="_blank" href={url}><img className="pl-thumbnail" src={video.snippet.thumbnails.default.url} /></a>
              <span className="pl-media-title">{video.snippet.title}</span>
              <span className="pl-time"><i className="fa fa-clock-o"></i> {humanDuration}</span>
              <span className="pl-channel">{video.snippet.channelTitle}</span>
              <i onClick={() => playlists.addFromSearch(i)} className="fa fa-2x fa-plus add-to-playlist-btn"></i>
            </li>
        )
        // console.log('video', toJS(video));
      });
      content = (<ul id="playlist-ul">{list}</ul>);
    } else if (playlists.playlist.length > 0) {
      let list = playlists.playlist.map((video, i) => {
        var playlistPosClass = Number.isInteger(i / 2) ? "playlist-item-1" : "playlist-item-2";
        var humanDuration = "Unknown";
        if (video.duration) {
          // console.log(item.duration);
          var duration = moment.duration(video.duration);
          var hours = duration.hours();
          var hoursDisplay = "";
          if (hours > 0) {
            hoursDisplay = hours + "h ";
          }
          var mins = duration.minutes();
          var secs = "0" + duration.seconds();
          humanDuration = hoursDisplay + mins +':'+ secs.substr(-2);
        }

        return (
          <li className={playlistPosClass} key={i}>
            <a target="_blank" href={video.url}><img className="pl-thumbnail" src={video.thumb} /></a>
            <span className="pl-media-title">{video.title}</span>
            <span className="pl-time"><i className="fa fa-clock-o"></i> {humanDuration}</span>
            <span className="pl-channel">{video.channel}</span>
            <i onClick={() => {}} className="fa fa-2x fa-trash remove-from-playlist-btn"></i>
            <i onClick={() => {}} className="fa fa-2x fa-arrow-up pl-move-to-top"></i>
          </li>
        );
      });
      content = (<ul id="playlist-ul">{list}</ul>);
    }

    var playlistsList = playlists.playlistNames.map((name, i) => (
      <li key={i}>
        <a onClick={() => this.selectPlaylist(i)} href="#">{name}</a>
        <div onClick={() => {}} className="fa fa-trash remove-playlist"/>
      </li>
    ));

    return (
      <div id="playlists-panel" ref="playlists-panel" className={mainClass}>
        <div id="playlists-panel-head">
          <input type="text" id="playlist-search-box" ref={c => this._search = c} placeholder="Search YouTube" className="form-control" onKeyPress={e => this.onEnterKey(e, () => this.search())} />
          <div className="btn-group" id="playlist-btn">
            <a className="btn btn-primary dropdown-toggle" id="playlist-dropdown" data-toggle="dropdown" href="#"><p id="pl-current-playlist">{playlists.selectedPlaylistName}</p></a>
            <ul className="dropdown-menu" id="pl-dd-menu">
              <li><a href="#" onClick={() => this.addingPlaylist = true}><i className="fa fa-plus"/> New Playlist</a></li>
              <li><a href="#" onClick={() => {}}><i className="fa fa-youtube-play"></i> Import Playlist</a></li>
              {playlistsList}
            </ul>
          </div>
          <span onClick={() => {}} className="playlist-shuffle-btn fa fa-random fa-3x"></span>
        </div>
        <div id="playlists-panel-display">
          {content}
        </div>
        <Modal isOpen={this.addingPlaylist} hideModal={() => this.addingPlaylist = false} title="Adding Playlist" leftButton={() => this.addPlaylist()} leftButtonText="Add Playlist">
          <p>Choose a name for your new playlist:</p>
          <input className="form-control" type="text" ref={c => this._newPlaylist = c} onKeyPress={(e) => this.onEnterKey(e, () => this.addPlaylist())} placeholder="Playlist Name"/>
        </Modal>
      </div>
    );
  }
}
