import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import profile from 'stores/profile';
import localforage from 'localforage';

export default new class Playlists {
  constructor() {
    fbase.auth().onAuthStateChanged(user => {
      if (user !== null) {
        this.uid = user.uid;
        this.ref = fbase.database().ref('playlists').child(this.uid);
          this.stopSync = this.ref.orderByKey().on('value', snap => {
            var playlists = [];
            var index = 0;
            var toSelect;
            localforage.getItem('selectedPlaylist').then(selectedPlaylist => {
              snap.forEach(playlist => {
                var data = playlist.val();
                data.key = playlist.key;
                if (selectedPlaylist && data.key === selectedPlaylist) {
                  toSelect = index;
                }
                playlists.push(data);
                index++;
              });
              console.log('playlist data', playlists);
              this.playlists = playlists;
              if (toSelect) {
                this.selectPlaylist(toSelect);
              }
              this.init = true;
            });
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
  @observable playlist = [];

  addPlaylist(name) {
    this.ref.push({name, entries: []});
    toast.success(`Added playlist ${name}!`);
  }

  @computed get playlistNames() {
    return this.playlists.map(playlist => playlist.name);
  }

  selectPlaylist(index) {
    if (this.stopPlaylistSync) {
      this.stopPlaylistSync();
    }
    this.selectedPlaylist = index;
    var key = this.playlists[index].key;
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

  @computed get selectedPlaylistName() {
    if (this.playlists[this.selectedPlaylist]) {
      return this.playlists[this.selectedPlaylist].name;
    } else {
      return "Select a Playlist";
    }
  }
}
