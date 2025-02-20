import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { debounce } from 'lodash';
// import classNames from 'classnames';
// import fbase from 'stores/fbase';
import playlists from "../../stores/playlists";
import Modal from "../utility/Modal";
import toast from "../../utils/toast";
import moment from "moment";
import $ from "jquery";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Favicon from "../../assets/img/favicon.png";

const PLAYLIST_OPACITY = 'playlistOpacity';

class PlaylistsPanel extends React.Component {
  @observable accessor   addingPlaylist = false;
  @observable accessor   removingPlaylist = false;
  @observable accessor   playlistToRemove = {};

  constructor(props) {
    super(props);
    let opacity = this.getOpacityFromLocalStorage();
    this.state = { sliderOpacity: opacity, opacity };
    this.changeOpacityDebounced = this.changeOpacityDebounced.bind(this);
  }

  getOpacityFromLocalStorage() {
    const opacity = window.localStorage.getItem(PLAYLIST_OPACITY);
    return opacity ? opacity : 90;
  }

  changeOpacityDebounced(event) {
    let opacity = event.target.value;

    this.setState({ sliderOpacity: opacity });

    if (!this.debounceOpacitySlider) {
      this.debounceOpacitySlider = debounce(() => this.changeOpacity(), 100);
    }

    this.debounceOpacitySlider();
  }

  changeOpacity() {
    let opacity = this.state.sliderOpacity;
    window.localStorage.setItem(PLAYLIST_OPACITY, opacity);
    this.setState({ opacity: opacity });
  }

  getOpacityStyle() {
    return {
      backgroundColor: "rgba(11,11,11," + this.state.opacity / 100 + ")"
    };
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

  @observable accessor   importingPlaylist = false;

  @observable accessor   mergingPlaylists = false;

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
      content = <i className="fa fa-spin fa-4x fa-circle-o-notch playlist-loading" />;
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
            thumbnail = video.artwork_url || video.user.avatar_url || Favicon;
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
                <i className="fa fa-clock-o" /> {humanDuration}
              </span>
              <span className="pl-channel">{channelTitle.trim()}</span>
              <i
                onClick={() => playlists.addFromSearch(i)}
                className="fa fa-2x fa-plus add-to-playlist-btn"
              />
              <a
                target="_blank"
                href={skipLink}
                show={skipLink && skipLink.length > 0}
                rel="noopener noreferrer"
              >
                <i className="fa fa-2x fa-globe add-to-playlist-btn" />
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
              <img className="pl-thumbnail self-center" src={video.thumb} />
            </a>
            <span className="pl-media-title">{video.title}</span>
            <span className="pl-time">
              <i className="fa fa-clock-o" /> {humanDuration}
            </span>
            <span className={`pl-channel ${video.user ? "self-center" : ""}`}>{video.channel.trim()}<br/>{video.user ? "  (Grab: " + video.user + ")" : ""}</span>
            <i
              onClick={() => playlists.removeVideo(i)}
              className="fa fa-2x fa-trash remove-from-playlist-btn"
            />
            <i
              onClick={() => playlists.moveTop(i)}
              className="fa fa-2x fa-arrow-up pl-move-to-top"
            />
            <i
              onClick={() => playlists.moveBottom(i)}
              className="fa fa-2x fa-arrow-down pl-move-to-top"
            />
            <a
              target="_blank"
              href={`https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${video.url}`}
              rel="noopener noreferrer"
            >
              <i className="fa fa-2x fa-globe add-to-playlist-btn" />
            </a>
          </li>
        );
      });
      content = <ol id="playlist-ol">{list}</ol>;
    } else {
      content = <div className="empty-playlist">Empty playlist.</div>;
    }

    var playlistsList = playlists.playlistNames.map((name, i) => (
      <MenuItem>
        <div onClick={() => this.selectPlaylist(i)} className="cursor-pointer hover:bg-gray-800">
          <a>{name}</a>
          <div
            onClick={() => this.startRemovingPlaylist(name, i)}
            className="fa fa-trash remove-playlist"
          />
        </div>
      </MenuItem>
    ));

    var shuffle = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.shufflePlaylist()}
        className="playlist-shuffle-btn fa fa-random fa-2x"
        title="Shuffle this Playlist"
      />
    ) : (
      false
    );

    var sortnameasc = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.sortPlaylist("asc", "title")}
        className="playlist-shuffle-btn fa fa-sort-alpha-asc fa-2x"
        title="Sort this Playlist Alphabetically"
      />
    ) : (
      false
    );

    var sortnamedesc = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.sortPlaylist("desc", "title")}
        className="playlist-shuffle-btn fa fa-sort-alpha-desc fa-2x"
        title="Sort this Playlist Reverse Alphabetically"
      />
    ) : (
      false
    );
    var sorttimeasc = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.sortPlaylist("asc", "duration")}
        className="playlist-shuffle-btn fa fa-sort-numeric-asc fa-2x"
        title="Sort this Playlist by shortest song first"
      />
    ) : (
      false
    );
    var sorttimedesc = playlists.hasPlaylist ? (
      <span
        onClick={() => playlists.sortPlaylist("desc", "duration")}
        className="playlist-shuffle-btn fa fa-sort-numeric-desc fa-2x"
        title="Sort this Playlist by longest song first"
      />
    ) : (
      false
    );

    return (
      <div id="playlists-panel" className={mainClass} style={this.getOpacityStyle()}>
        <div id="playlists-panel-head">
          <div className="row">
            <input
              type="text"
              id="playlist-search-box"
              ref={c => (this._search = c)}
              placeholder="Search"
              className="form-control"
              onKeyPress={e => this.onEnterKey(e, () => this.search())}
            />
            <div>
              <div>
                <input
                  type="radio"
                  defaultChecked={playlists.searchSource == "youtube" ? "checked" : ""}
                  id="search-youtube"
                  name="search-youtube"
                  onClick={() => {
                    playlists.search = [];
                    playlists.searchSource = "youtube";
                  }}
                />
                <label htmlFor="search-youtube">YouTube</label>
              </div>
              <div className="inline-flex">
                <input
                  type="radio"
                  defaultChecked={playlists.searchSource == "soundcloud" ? "checked" : ""}
                  id="search-soundcloud"
                  name="search-soundcloud"
                  onClick={() => {
                    playlists.search = [];
                    playlists.searchSource = "soundcloud";
                  }}
                />
                <label htmlFor="search-soundcloud">Soundcloud</label>

              </div>
            </div>
            <div className="btn-group" id="playlist-btn">
              <Menu >
                <MenuButton>
                  <>{playlists.selectedPlaylistName || "Create or Select a Playlist"}
                    <span className="fa fa-chevron-down"></span></>
                </MenuButton>
                <MenuItems>
                  <div className="dropdown-inner-text">

                    <MenuItem>
                      <a onClick={() => (this.addingPlaylist = true)}>
                        <i className="fa fa-plus" /> New Playlist
                      </a>
                    </MenuItem>
                    <MenuItem>
                      <a onClick={() => (this.importingPlaylist = true)}>
                      <i className="fa fa-youtube-play" /> Import Playlist
                      </a>
                    </MenuItem>
                    {playlistsList}
                  </div>
                </MenuItems>
              </Menu>
            </div>
            <a href="#" onClick={() => (this.mergingPlaylists = true)}>
              <i
                className="playlist-shuffle-btn fa fa-code-fork fa-2x"
                title="Merge Two Playlists"
              ></i>
            </a>
            <span
              onClick={() => playlists.exportPlaylist()}
              className="playlist-shuffle-btn fa fa-download fa-2x"
              title="Download Playlist (json)"
            />
            {sorttimedesc}
            {sorttimeasc}
            {sortnamedesc}
            {sortnameasc}
            {shuffle}
          </div>
        </div>
        <div id="playlists-panel-display">{content}</div>
        <div id="playlists-footer">
          <span>Playlist opacity:</span>
          <span className="slidecontainer">
            <input type="range" min="0" max="100" className="slider" id="opacityRange" value={this.state.sliderOpacity}
              onChange={this.changeOpacityDebounced} />
          </span>
        </div>
        <Modal
          show={this.addingPlaylist}
          hideModal={() => (this.addingPlaylist = false)}
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
          hideModal={() => (this.removingPlaylist = false)}
          title="Removing Playlist"
          leftButton={() => this.removePlaylist()}
          leftButtonText="Confirm"
        >
          <p>
            Are you sure you want to remove the playlist &apos;{this.playlistToRemove.name}&apos;?
          </p>
        </Modal>
        <Modal
          show={this.mergingPlaylists}
          hideModal={() => (this.mergingPlaylists = false)}
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
          hideModal={() => (this.importingPlaylist = false)}
          title="Importing Playlist"
          leftButton={() => this.importPlaylist()}
          leftButtonText={
            <span>
              Import {playlists.importing && <i className="fa fa-spin fa-circle-o-notch" />}
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
      </div >
    );
  }
}

export default observer(PlaylistsPanel)