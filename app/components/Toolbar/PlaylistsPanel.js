import React from "react";
import {makeAutoObservable, action} from "mobx";
import {observer} from "mobx-react";
// import classNames from 'classnames';
// import fbase from 'stores/fbase';
import playlists from "stores/playlists";
import Modal from "components/utility/Modal";
import toast from "utils/toast";
import moment from "moment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

@observer
export default class PlaylistsPanel extends React.Component {
  addingPlaylist = false;
  setAddingPlaylist = action;
  removingPlaylist = false;
  setRemovingPlaylist = action;
  playlistToRemove = {};
  setPlaylistToRemove = action;
  importingPlaylist = false;
  setImportingPlaylist = action;
  mergingPlaylists = false;
  setMergingPlaylists = action;

  @action setAddingPlaylist = prop => this.addingPlaylist = prop;
  @action setRemovingPlaylist = prop => this.removingPlaylist = prop;
  @action setPlaylistToRemove = prop => this.playlistToRemove = prop;
  @action setImportingPlaylist = prop => this.importingPlaylist = prop;
  @action setMergingPlaylists = prop => this.mergingPlaylists = prop;

  super() {
    makeAutoObservable(this);
  }

  onEnterKey(e, cb) {
    var key = e.keyCode || e.which;
    if (key === 13) {
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
    this.setAddingPlaylist(false);
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
    this.playlistToRemove = {name, index};
    this.removingPlaylist = true;
  }

  removePlaylist() {
    playlists.removePlaylist(this.playlistToRemove.index);
    this.removingPlaylist = false;
  }

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
    var mainClass = this.props.open ? "playlists-panel-open" : "playlists-panel-closed";

    var content;

    if (playlists.searching) {
      content = <span className="playlist-loading"><FontAwesomeIcon icon={['fas', 'yin-yang']} spin size="8x" /></span>;
    } else if (playlists.openSearch) {
      if (playlists.search.length > 0) {
        const list = playlists.search.map((video, i) => {
          var playlistPosClass = Number.isInteger(i / 2) ? "playlist-item-1" : "playlist-item-2";
          var url;
          var humanDuration;
          var title;
          var channelTitle;
          var thumbnail;
          var skipLink = "";
          var duration;
          var hours;
          var hoursDisplay;
          var mins;
          var secs;

          if (video.snippet) {
            url = `https://www.youtube.com/watch?v=${video.id}`;
            duration = moment.duration(video.contentDetails.duration);
            hours = duration.hours();
            hoursDisplay = "";
            if (hours > 0) {
              hoursDisplay = hours + "h ";
            }
            mins = duration.minutes();
            secs = "0" + duration.seconds();
            humanDuration = hoursDisplay + mins + ":" + secs.substr(-2);
            thumbnail = video.snippet.thumbnails.default.url;
            title = video.snippet.title;
            channelTitle = video.snippet.channelTitle;
            skipLink = `https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${video.id}`;
          } else if (video.title) {
            url = video.permalink_url;
            duration = moment.duration(video.duration);
            hours = duration.hours();
            hoursDisplay = "";
            if (hours > 0) {
              hoursDisplay = hours + "h ";
            }
            mins = duration.minutes();
            secs = "0" + duration.seconds();
            humanDuration = hoursDisplay + mins + ":" + secs.substr(-2);
            thumbnail = video.artwork_url || video.user.avatar_url || "/img/favicon.png";
            title = video.title;
            channelTitle = video.user.username;
          }
          return (
            <li className={playlistPosClass} key={i}>
              <a target="_blank" href={url} rel="noopener noreferrer">
                <img className="pl-thumbnail" src={thumbnail} />
              </a>
              <span className="pl-media-title">{title}</span>
              <span className="pl-time">
                <FontAwesomeIcon icon={['far', 'clock']} /> {humanDuration}
              </span>
              <span className="pl-channel">{channelTitle}</span>
              <span className="add-to-playlist-btn" onClick={() => playlists.addFromSearch(i)}>
                <FontAwesomeIcon icon={['fas', 'plus']} size="2x" />
              </span>
              <a
                target="_blank"
                href={skipLink}
                show={(skipLink && skipLink.length > 0).toString()}
                rel="noopener noreferrer"
                
              >
                <span className="add-to-playlist-btn">
                <FontAwesomeIcon icon={['fas', 'globe']} size="2x" />
                </span>
              </a>
            </li>
          );
        });
        content = <ul id="playlist-ul">{list}</ul>;
      } else {
        content = <div className="search-empty">No results.</div>;
      }
    } else if (playlists.playlist.length > 0) {
      let list = playlists.playlist.map((video, i) => {
        var playlistPosClass = Number.isInteger(i / 2) ? "playlist-item-1" : "playlist-item-2";
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
            <a target="_blank" href={video.url} rel="noopener noreferrer">
              <img className="pl-thumbnail" src={video.thumb} />
            </a>
            <span className="pl-media-title">{video.title}</span>
            <span className="pl-time">
              <FontAwesomeIcon icon={['far', 'clock']} /> {humanDuration}
            </span>
            <span className="pl-channel">{video.channel}</span>
            <span className="pl-channel">{video.user ? "  (Grab: " + video.user + ")" : ""}</span>
            <span className="remove-from-playlist-btn"
              onClick={() => playlists.removeVideo(i)}>
                <FontAwesomeIcon icon={['fas', 'trash']} size="2x" />
              </span>
            <span className="pl-move-to-top" onClick={() => playlists.moveTop(i)}>
              <FontAwesomeIcon icon={['fas', "arrow-up"]} size="2x" />
            </span>
            <span
              onClick={() => playlists.moveBottom(i)}
              className="pl-move-to-top"
            >
              <FontAwesomeIcon icon={['fas', 'arrow-down']} size="2x" />
              </span>
            <a
              target="_blank"
              href={`https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${video.url}`}
              rel="noopener noreferrer"
              className="add-to-playlist-btn"
            >
              <FontAwesomeIcon size="2x" icon={['fas', 'globe']} />
            </a>
          </li>
        );
      });
      content = <ul id="playlist-ul">{list}</ul>;
    } else {
      content = <div className="empty-playlist">Empty playlist.</div>;
    }

    var playlistsList = playlists.playlistNames.map((name, i) => (
      <li key={i}>
        <a onClick={() => this.selectPlaylist(i)} href="#">
          {name}
        </a>
        <div
          onClick={() => this.startRemovingPlaylist(name, i)}
          className="remove-playlist"
        ><FontAwesomeIcon icon={['fas', 'trash']} />
        </div>
      </li>
    ));

    var shuffle = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.shufflePlaylist()}
        className="playlist-shuffle-btn"
        title="Shuffle this Playlist"
      ><FontAwesomeIcon icon={['fas', 'random']} size="2x" />
      </span>
    ) : (
      false
    );

    var sortnameasc = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.sortPlaylist("asc", "title")}
        className="playlist-shuffle-btn"
        title="Sort this Playlist Alphabetically"
      ><FontAwesomeIcon size="2x" icon={['fas', 'sort-alpha-up']} /></span>
    ) : (
      false
    );

    var sortnamedesc = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.sortPlaylist("desc", "title")}
        className="playlist-shuffle-btn"
        title="Sort this Playlist Reverse Alphabetically"
      ><FontAwesomeIcon size="2x" icon={['fas', 'sort-alpha-down']} />
      </span>
    ) : (
      false
    );
    var sorttimeasc = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.sortPlaylist("asc", "duration")}
        className="playlist-shuffle-btn"
        title="Sort this Playlist by shortest song first"
      ><FontAwesomeIcon size="2x" icon={['fas', 'sort-numeric-up']} />
      </span>
    ) : (
      false
    );
    var sorttimedesc = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.sortPlaylist("desc", "duration")}
        className="playlist-shuffle-btn"
        title="Sort this Playlist by longest song first"
      ><FontAwesomeIcon size="2x" icon={['fas', 'sort-numeric-down']} />
      </span>
    ) : (
      false
    );

    return (
      <div id="playlists-panel" className={mainClass}>
        <div id="playlists-panel-head">
          <div className="row">
            <div className="col-md-7">
              <input
                type="text"
                id="playlist-search-box"
                ref={c => (this._search = c)}
                placeholder="Search"
                className="form-control"
                onKeyPress={e => this.onEnterKey(e, () => this.search())}
              />{" "}
              &nbsp;
              <input
                type="radio"
                defaultChecked={playlists.searchSource == "youtube" ? "checked" : ""}
                id="search-youtube"
                name="search-source"
                onClick={() => {
                  playlists.search = [];
                  playlists.searchSource = "youtube";
                }}
              />{" "}
              YouTube <br />
              &nbsp;
              <input
                type="radio"
                defaultChecked={playlists.searchSource == "soundcloud" ? "checked" : ""}
                id="search-soundcloud"
                name="search-source"
                onClick={() => {
                  playlists.search = [];
                  playlists.searchSource = "soundcloud";
                }}
              />{" "}
              Soundcloud
            </div>
            <div className="col-md-5">
              <div className="btn-group" id="playlist-btn">
                <a
                  className="btn btn-primary dropdown-toggle"
                  id="playlist-dropdown"
                  data-toggle="dropdown"
                  href="#"
                >
                  {playlists.selectedPlaylistName || "Create or Select a Playlist"}{" "}
                  <FontAwesomeIcon icon={['fas', 'chevron-down']} />
                </a>
                <ul className="dropdown-menu" id="pl-dd-menu">
                  <li>
                    <a href="#" onClick={() => (this.setAddingPlaylist(true))}>
                      <FontAwesomeIcon icon={['fas', 'plus']} /> New Playlist
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={() => (this.setImportingPlaylist(true))}>
                      <FontAwesomeIcon icon={['fab', 'youtube']} /> Import Playlist
                    </a>
                  </li>
                  {playlistsList}
                </ul>
              </div>
              {shuffle}
              {sortnameasc}
              {sortnamedesc}
              {sorttimeasc}
              {sorttimedesc}
              <span
                onClick={() => playlists.exportPlaylist()}
                className="playlist-shuffle-btn"
                title="Download Playlist (json)"
              ><FontAwesomeIcon size="2x" icon={['fas', 'download']} />
              </span>
              <a href="#" onClick={() => (this.setMergingPlaylists(true))} className="playlist-shuffle-btn">
                <FontAwesomeIcon size="2x" icon={['fas', 'code-branch']} />
              </a>
            </div>
          </div>
        </div>
        <div id="playlists-panel-display">{content}</div>
        <Modal
          show={this.addingPlaylist}
          hideModal={() => (this.setAddingPlaylist(false))}
          title="Adding Playlist"
          leftButton={() => this.addPlaylist()}
          leftButtonText="Add Playlist"
        >
          <p>Choose a name for your new playlist:</p>
          <input
            className="form-control"
            type="text"
            ref={c => (this._newPlaylist = c)}
            onKeyPress={e => this.onEnterKey(e, () => this.addPlaylist())}
            placeholder="Playlist Name"
          />
        </Modal>
        <Modal
          show={this.removingPlaylist}
          hideModal={() => (this.setRemovingPlaylist(false))}
          title="Removing Playlist"
          leftButton={() => this.removePlaylist()}
          leftButtonText="Confirm"
        >
          <p>
            Are you sure you want to remove the playlist &apos;{this.playlistToRemove.name}
            @apos;?
          </p>
        </Modal>
        <Modal
          show={this.mergingPlaylists}
          hideModal={() => (this.setMergingPlaylists(false))}
          title="Merge Playlists"
          leftButton={() => {
            playlists.mergePlaylists(
              $("#playlista").val(),
              $("#playlistb").val(),
              $("#newplaylistname").val()
            );
            this.mergingPlaylists = false;
          }}
          leftButtonText="Merge"
        >
          <div className="form-group">
            <label htmlFor="playlista">Select First Playlist:</label>
            <select id="playlista" className="form-control">
              <option value="-1">Select First Playlist</option>
              {playlists.playlistNames.map((name, i) => (
                <option value={i} key={i}>{name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="playlistb">Select Second Playlist:</label>
            <select id="playlistb" className="form-control">
              <option value="-1">Select Second Playlist</option>
              {playlists.playlistNames.map((name, i) => (
                <option value={i} key={i}>{name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="newplaylistname">Enter a new playlist name:</label>
            <input type="text" className="form-control" id="newplaylistname" />
          </div>
        </Modal>

        <Modal
          show={this.importingPlaylist}
          hideModal={() => (this.setImportingPlaylist(false))}
          title="Importing Playlist"
          leftButton={() => this.importPlaylist()}
          leftButtonText={
            <span>
              Import {playlists.importing && <FontAwesomeIcon icon={['fas', 'circle-notch']} spin />}
            </span>
          }
        >
          <div className="form-group">
            <label>Playlist Name</label>
            <input className="form-control" ref={c => (this._importName = c)} />
          </div>
          <div className="form-group">
            <label>Playlist URL</label>
            <input className="form-control" ref={c => (this._importUrl = c)} />
          </div>
        </Modal>
      </div>
    );
  }
}
