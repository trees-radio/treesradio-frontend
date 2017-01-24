import {observable, computed} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
// import profile from 'stores/profile';
import localforage from 'localforage';
// import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import events from 'stores/events';
import {searchYouTube, getYtPlaylist} from 'libs/youTube';

export default new class Playlists {
  constructor() {
    fbase.auth().onAuthStateChanged(user => {
      if (user !== null) {
        this.uid = user.uid;
        this.ref = fbase.database().ref('playlists').child(this.uid);
        this.stopSync = this.ref.orderByKey().on('value', snap => {
          var playlists = [];
          snap.forEach(playlist => {
            var data = playlist.val();
            data.key = playlist.key;
            playlists.push(data);
          });
          this.playlists = playlists;
          // console.log('playlist data', playlists);

          if (!this.init || this.removedPlaylist) {
            localforage.getItem('selectedPlaylist').then(selectedPlaylist => {
              var toSelect;
              playlists.forEach((playlist, i) => {
                if (selectedPlaylist && playlist.key === selectedPlaylist) {
                  toSelect = i;
                }
              });
              if (toSelect) {
                this.selectPlaylist(toSelect);
              } else {
                this.selectPlaylist(0);
              }
            });
          }

          if (!this.disposeEvent) {
            this.disposeEvent = events.register('new_song', (e) => {
              if (e.data === this.uid) {
                this.moveBottom(0);
              }
              this.addedTo = [];
            });
          }


          this.init = true;
        });
      } else {
        this.init = false;
        if (this.disposeEvent) {
          this.disposeEvent();
          this.disposeEvent = null;
        }
        if (this.stopSync) {
          this.stopSync();
        }
        if (this.stopPlaylistSync) {
          this.stopPlaylistSync();
        }
        this.playlists = [];
      }
    });
  }

  @observable init = false;
  @observable playlists = [];
  @observable selectedPlaylist = 0;
  @observable selectedPlaylistKey = '';
  @observable playlist = [];
  @observable searching = false;
  @observable search = [];

  addPlaylist(name) {
    return this.ref.push({name, entries: []}, err => !err && toast.success(`Added playlist ${name}!`));
  }

  @computed get playlistNames() {
    return this.playlists.map(playlist => playlist.name);
  }

  selectPlaylist(index) {
    this.search = []; //clear any searches
    if (this.stopPlaylistSync) {
      this.stopPlaylistSync();
    }
    this.selectedPlaylist = index;
    if (this.playlists[index]) {
      var key = this.playlists[index].key;
      this.selectedPlaylistKey = key;
      fbase.database().ref('private').child(this.uid).child('selectedPlaylist').set(key);
      localforage.setItem('selectedPlaylist', key);
      this.stopPlaylistSync = this.ref.child(key).child('entries').orderByKey().on('value', (snap) => {
        var playlist = [];
        // console.log(snap.forEach);
        if (snap) {
          snap.forEach(entry => {
            playlist.push(entry.val());
          });
        }
        this.playlist = playlist;
      });
    }
  }

  @observable removedPlaylist = false;

  removePlaylist(index) {
    var key = this.playlists[index].key;
    if (this.selectedPlaylist === index) {
      this.removedPlaylist = true;
    }
    this.ref.child(key).remove();
  }

  @computed get selectedPlaylistName() {
    // check length before checking index, mobx does not like out of bounds checks
    if (this.playlists.length > 0 && this.playlists[this.selectedPlaylist]) {
      return this.playlists[this.selectedPlaylist].name;
    } else {
      return "Create or Select a Playlist";
    }
  }

  @computed get selectedSong() {
    // check length before checking index, mobx does not like out of bounds checks
    if (this.playlist.length > 0 && this.playlist[0]) {
      return this.playlist[0].title;
    } else {
      return false;
    }
  }

  @computed get hasPlaylist() {
    // check length before checking index, mobx does not like out of bounds checks
    if (this.playlists.length > 0 && this.playlists[this.selectedPlaylist]) {
      return true;
    } else {
      return false;
    }
  }

  @computed get openSearch() {
    if (this.search.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async runSearch(query) {
    this.search = [];
    this.searching = true;
    let {items} = await searchYouTube(query);
    this.search = items;
    this.searching = false;
  }

  addFromSearch(index) {
    if (!this.hasPlaylist) {
      toast.error("You don't have a selected playlist!");
      return;
    }
    var video = this.search[index];
    var url = `https://www.youtube.com/watch?v=${video.id}`;
    var title = video.snippet.title;
    var thumb = video.snippet.thumbnails.default.url;
    var channel = video.snippet.channelTitle;
    var duration = moment.duration(video.contentDetails.duration).valueOf();

    var song = {
      url,
      title,
      thumb,
      channel,
      duration
    }

    if (!this.selectedPlaylistKey) {
      toast.error('Please select a playlist to add a song!');
      return;
    }

    this.addSong(song, this.selectedPlaylistKey);
  }

  checkPlaylistForSong(playlistKey, songUrl) {
    var playlist = this.getPlaylistByKey(playlistKey);
    if (playlist.entries && playlist.entries.some(s => s.url === songUrl)) {
      return true;
    } else {
      return false;
    }
  }

  getPlaylistByKey(key) {
    var playlist;
    this.playlists.some(p => {
      if (p.key === key) {
        playlist = p;
        return true;
      } else {
        return false;
      }
    });
    return playlist;
  }

  // @observable addedTo = [];

  addSong(song, playlistKey, isGrab) {
    var playlist = this.getPlaylistByKey(playlistKey);
    var newPlaylist = [];
    if (playlist.entries) {
      newPlaylist = playlist.entries.slice();
    }

    if (isGrab) {
      newPlaylist.push(song);
    } else {
      newPlaylist.unshift(song);
    }
    
    this.ref.child(playlistKey).child('entries').set(newPlaylist);
    toast.success(`Added ${song.title} to playlist ${playlist.name}.`);
    // this.addedTo.push(playlistKey);
  }

  moveTop(index) {
    var newPlaylist = this.playlist.slice();
    var video = newPlaylist.splice(index, 1)[0];
    newPlaylist.unshift(video);
    this.ref.child(this.selectedPlaylistKey).child('entries').set(newPlaylist);
    toast.success(`Moved ${video.title} to top of playlist.`);
  }

  moveBottom(index) {
    var newPlaylist = this.playlist.slice();
    var video = newPlaylist.splice(index, 1)[0];
    newPlaylist.push(video);
    this.ref.child(this.selectedPlaylistKey).child('entries').set(newPlaylist);
    // toast.success(`Moved ${video.title} to bottom of playlist.`);
  }

  removeVideo(index) {
    var newPlaylist = this.playlist.slice();
    var video = newPlaylist.splice(index, 1)[0];
    this.ref.child(this.selectedPlaylistKey).child('entries').set(newPlaylist);
    toast.success(`Removed ${video.title} from playlist.`);
  }

  shufflePlaylist() {
    var newPlaylist = _.shuffle(this.playlist.slice());
    this.ref.child(this.selectedPlaylistKey).child('entries').set(newPlaylist);
    toast.success(`Playlist shuffled.`);
  }

  @observable
  importing = false;

  async importYouTubePlaylist(name, url) {
    this.importing = true;
    const playlist = await getYtPlaylist(url);

    const playlistTransform = playlist.map(i => ({
      url: `https://www.youtube.com/watch?v=${i.id}`,
      title: i.snippet.title,
      thumb: i.snippet.thumbnails.default.url,
      channel: i.snippet.channelTitle,
      duration: moment.duration(i.contentDetails.duration).valueOf()
    }));

    // console.log(playlistTransform);
    const playlistRef = this.addPlaylist(name);

    return playlistRef.child('entries').set(playlistTransform).then(() => {
      toast.success(`Imported songs from playlist URL.`);
      this.importing = false;
      return true;
    });
  }
}
