import React from 'react';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
// import classNames from 'classnames';
// import fbase from 'stores/fbase';
import playlists from 'stores/playlists';
import Modal from 'components/utility/Modal';
import toast from 'utils/toast';

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

  render() {
    var mainClass = this.props.open ? "playlists-panel-open" : "playlists-panel-closed";

    var playlistsCurrentView;

    var playlistsList = playlists.playlistNames.map((name, i) => (
      <li key={i}>
        <a onClick={() => this.selectPlaylist(i)} href="#">{name}</a>
        <div onClick={() => {}} className="fa fa-trash remove-playlist"/>
      </li>
    ));

    return (
      <div id="playlists-panel" ref="playlists-panel" className={mainClass}>
        <div id="playlists-panel-head">
          <input type="text" id="playlist-search-box" ref="searchbox" placeholder="Search YouTube" className="form-control" onKeyPress={() => {}} />
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
          {playlistsCurrentView}
        </div>
        <Modal isOpen={this.addingPlaylist} hideModal={() => this.addingPlaylist = false} title="Adding Playlist" leftButton={() => this.addPlaylist()} leftButtonText="Add Playlist">
          <p>Choose a name for your new playlist:</p>
          <input className="form-control" type="text" ref={c => this._newPlaylist = c} onKeyPress={(e) => this.onEnterKey(e, () => this.addPlaylist())} placeholder="Playlist Name"/>
        </Modal>
      </div>
    );
  }
}
