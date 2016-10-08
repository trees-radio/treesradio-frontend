import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import profile from 'stores/profile';
import localforage from 'localforage';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';

const ytApiKey = 'AIzaSyDXl5mzL-3BUR8Kv5ssHxQYudFW1YaQckA';

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
          console.log('playlist data', playlists);

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

          this.init = true;
        });
      } else {
        this.init = false;
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
    this.ref.push({name, entries: []});
    toast.success(`Added playlist ${name}!`);
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
    if (this.playlists[this.selectedPlaylist]) {
      return this.playlists[this.selectedPlaylist].name;
    } else {
      return "Create or Select a Playlist";
    }
  }

  @computed get selectedSong() {
    if (this.playlist[0]) {
      return this.playlist[0].title;
    } else {
      return false;
    }
  }

  @computed get hasPlaylist() {
    if (this.playlists[this.selectedPlaylist]) {
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

  runSearch(query) {
    this.search = [];
    this.searching = true;
    axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: '25',
        type: 'video',
        videoEmbeddable: 'true',
        key: ytApiKey,
        q: query
      }
    }).then(resp => {
      var search = resp.data.items.map(data => data.id.videoId);
      var ids = search.reduce((p, c) => p + ',' + c, '');
      axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          id: ids,
          part: 'contentDetails,snippet',
          key: ytApiKey
        }
      }).then(resp => {
        this.search = resp.data.items;
        this.searching = false;
      });
    });
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

    var obj = {
      url,
      title,
      thumb,
      channel,
      duration
    }

    var newPlaylist = this.playlist.slice();
    newPlaylist.unshift(obj);
    if (!this.selectedPlaylistKey) {
      toast.error('Please select a playlist!');
      return;
    }
    this.ref.child(this.selectedPlaylistKey).child('entries').set(newPlaylist);
    toast.success(`Added ${title} to playlist ${this.selectedPlaylistName}.`);
  }

  moveTop(index) {
    var newPlaylist = this.playlist.slice();
    var video = newPlaylist.splice(index, 1)[0];
    newPlaylist.unshift(video);
    this.ref.child(this.selectedPlaylistKey).child('entries').set(newPlaylist);
    toast.success(`Moved ${video.title} to top of playlist.`);
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
}
