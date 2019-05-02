import React from "react";
import { observable, toJS } from "mobx";
import { observer } from "mobx-react";
// import classNames from 'classnames';
// import fbase from 'stores/fbase';
import playlists from "stores/playlists";
import Modal from "components/utility/Modal";
import toast from "utils/toast";
import moment from "moment";

@observer
export default (class PlaylistsPanel extends React.Component {
  @observable
  addingPlaylist = false;
  @observable
  removingPlaylist = false;
  @observable
  playlistToRemove = {};

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
    this._newPlaylist.value = "";
    playlists.addPlaylist(name);
    this.addingPlaylist = false;
  }

  selectPlaylist(i) {
    playlists.selectPlaylist(i);
  }

  search() {
    var query = this._search.value;
    this._search.value = "";
    playlists.runSearch(query);
  }

  startRemovingPlaylist(name, index) {
    this.playlistToRemove = { name, index };
    this.removingPlaylist = true;
  }

  removePlaylist() {
    playlists.removePlaylist(this.playlistToRemove.index);
    this.removingPlaylist = false;
  }

  @observable
  importingPlaylist = false;

  async importPlaylist() {
    const name = this._importName.value;
    const url = this._importUrl.value;
    this._importName.value = "";
    this._importUrl.value = "";

    let result;
    try {
      result = await playlists.importYouTubePlaylist(name, url);
      if (result) {
        this.importingPlaylist = false;
      }
    } catch (e) {
      toast.error(`Error importing playlist!`);
    }
  }

  render() {
    var mainClass = this.props.open
      ? "playlists-panel-open"
      : "playlists-panel-closed";

    var content;

    if (playlists.searching) {
      content = (
        <i className="fa fa-spin fa-4x fa-circle-o-notch playlist-loading" />
      );
    } else if (playlists.openSearch) {
      if (playlists.search.length > 0) {
        const list = playlists.search.map((video, i) => {
          var playlistPosClass = Number.isInteger(i / 2)
            ? "playlist-item-1"
            : "playlist-item-2";
	    var url;
	    var humanDuration;
	    var title;
	    var channelTitle;
	    var thumbnail;

	    if ( playlists.searchSource == 'youtube' ) {
                url = `https://www.youtube.com/watch?v=${video.id}`;
                var duration = moment.duration(video.contentDetails.duration);
                var hours = duration.hours();
                var hoursDisplay = "";
                if (hours > 0) {
                  hoursDisplay = hours + "h ";
                }
                var mins = duration.minutes();
                var secs = "0" + duration.seconds();
                humanDuration = hoursDisplay + mins + ":" + secs.substr(-2);
		thumbnail = video.snippet.thumbnails.default.url;
		title = video.snippet.title;
	    } else if ( playlists.searchSource == 'soundcloud' ) {
		    url = video.permalink_url;
		    var duration = moment.duration(video.duration);
		    var hours = duration.hours();
		    var hoursDisplay = "";
		    if ( hours > 0 ) {
			    hoursDisplay = hours + "h ";
		    }
		    var mins = duration.minutes();
		    var secs = "0" + duration.seconds();
		    humanDuration = hoursDisplay + mins + ":" + secs.substr(-2);
		    thumbnail = video.artwork_url;
		    title = video.title;
		    channelTitle = video.user.username;
	    }
          return (
            <li className={playlistPosClass} key={i}>
              <a target="_blank" href={url}>
                <img
                  className="pl-thumbnail"
                  src={thumbnail}
                />
              </a>
              <span className="pl-media-title">{title}</span>
              <span className="pl-time">
                <i className="fa fa-clock-o" /> {humanDuration}
              </span>
              <span className="pl-channel">{channelTitle}</span>
              <i
                onClick={() => playlists.addFromSearch(i)}
                className="fa fa-2x fa-plus add-to-playlist-btn"
              />
            </li>
          );
        });
        content = <ul id="playlist-ul">{list}</ul>;
      } else {
        content = <div className="search-empty">No results.</div>;
      }

      
    } else if (playlists.playlist.length > 0) {
      let list = playlists.playlist.map((video, i) => {
        var playlistPosClass = Number.isInteger(i / 2)
          ? "playlist-item-1"
          : "playlist-item-2";
        var humanDuration = "Unknown";
        if (video.duration) {
          var duration = moment.duration(video.duration);
          var hours = duration.hours();
          var hoursDisplay = "";
          if (hours > 0) {
            hoursDisplay = hours + "h ";
          }
          var mins = duration.minutes();
          var secs = "0" + duration.seconds();
          humanDuration = hoursDisplay + mins + ":" + secs.substr(-2);
        }

        return (
          <li className={playlistPosClass} key={i}>
            <a target="_blank" href={video.url}>
              <img className="pl-thumbnail" src={video.thumb} />
            </a>
            <span className="pl-media-title">{video.title}</span>
            <span className="pl-time">
              <i className="fa fa-clock-o" /> {humanDuration}
            </span>
            <span className="pl-channel">{video.channel}</span>
            <i
              onClick={() => playlists.removeVideo(i)}
              className="fa fa-2x fa-trash remove-from-playlist-btn"
            />
            <i
              onClick={() => playlists.moveTop(i)}
              className="fa fa-2x fa-arrow-up pl-move-to-top"
            />
          </li>
        );
      });
      content = <ul id="playlist-ul">{list}</ul>;
    } else {
      content = <div className="empty-playlist">Empty playlist.</div>;
    }

    var playlistsList = playlists.playlistNames.map((name, i) => (
      <li key={i}>
        <a onClick={() => this.selectPlaylist(i)} href="#">{name}</a>
        <div
          onClick={() => this.startRemovingPlaylist(name, i)}
          className="fa fa-trash remove-playlist"
        />
      </li>
    ));

    var shuffle = playlists.hasPlaylist
      ? <span
        onClick={() => playlists.shufflePlaylist()}
        className="playlist-shuffle-btn fa fa-random fa-3x"
      />
      : false;

    return (
      <div id="playlists-panel" ref="playlists-panel" className={mainClass}>
        <div id="playlists-panel-head">
	<div class="row">
	  <div class="col-md-7">
          <input
            type="text"
            id="playlist-search-box"
            ref={c => this._search = c}
            placeholder="Search"
            className="form-control"
            onKeyPress={e => this.onEnterKey(e, () => this.search())}
          /> &nbsp;
	  <input 
	  	type="radio" 
		checked={ playlists.searchSource == "youtube" ? 'checked' : '' }
		id="search-youtube"
		name="search-source"
		onClick={ c => playlists.searchSource = "youtube" }
		/> YouTube <br/>&nbsp;
	  <input
	        type="radio"
		checked={ playlists.searchSource == "soundcloud" ? 'checked' : '' }
		id="search-soundcloud"
		name="search-source"
		onClick={ c => playlists.searchSource = "soundcloud" }
		/> Soundcloud
	  </div>
	  <div class="col-md-5">
          <div className="btn-group" id="playlist-btn">
            <a
              className="btn btn-primary dropdown-toggle"
              id="playlist-dropdown"
              data-toggle="dropdown"
              href="#"
            >
              {playlists.selectedPlaylistName || "Create or Select a Playlist"} <span class="fa fa-chevron-down"></span>
            </a>
            <ul className="dropdown-menu" id="pl-dd-menu">
              <li>
                <a href="#" onClick={() => this.addingPlaylist = true}>
                  <i className="fa fa-plus" /> New Playlist
                </a>
              </li>
              <li>
                <a href="#" onClick={() => this.importingPlaylist = true}>
                  <i className="fa fa-youtube-play" /> Import Playlist
                </a>
              </li>
              {playlistsList}
            </ul>
          </div>
          {shuffle}
	  <span onClick={() => playlists.exportPlaylist()} className="playlist-shuffle-btn fa fa-download fa-3x"/>
        </div>
	</div>
	</div>
        <div id="playlists-panel-display">
          {content}
        </div>
        <Modal
          show={this.addingPlaylist}
          hideModal={() => this.addingPlaylist = false}
          title="Adding Playlist"
          leftButton={() => this.addPlaylist()}
          leftButtonText="Add Playlist"
        >
          <p>Choose a name for your new playlist:</p>
          <input
            className="form-control"
            type="text"
            ref={c => this._newPlaylist = c}
            onKeyPress={e => this.onEnterKey(e, () => this.addPlaylist())}
            placeholder="Playlist Name"
          />
        </Modal>
        <Modal
          show={this.removingPlaylist}
          hideModal={() => this.removingPlaylist = false}
          title="Removing Playlist"
          leftButton={() => this.removePlaylist()}
          leftButtonText="Confirm"
        >
          <p>
            Are you sure you want to remove the playlist '
            {this.playlistToRemove.name}
            '?
          </p>
        </Modal>
        <Modal
          show={this.importingPlaylist}
          hideModal={() => this.importingPlaylist = false}
          title="Importing Playlist"
          leftButton={() => this.importPlaylist()}
          leftButtonText={
            (
              <span>
                Import{" "}
                {
                  playlists.importing &&
                    <i className="fa fa-spin fa-circle-o-notch" />
                }
              </span>
            )
          }
        >
          <div className="form-group">
            <label>Playlist Name</label>
            <input className="form-control" ref={c => this._importName = c} />
          </div>
          <div className="form-group">
            <label>Playlist URL</label>
            <input className="form-control" ref={c => this._importUrl = c} />
          </div>
        </Modal>
      </div>
    );
  }
});
