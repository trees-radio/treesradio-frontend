import {observable, computed, toJS} from 'mobx';
import toast from 'utils/toast';
import fbase from 'libs/fbase';
import profile from 'stores/profile';

export default new class Playlists {
  constructor() {
    fbase.auth().onAuthStateChanged(user => {
      if (user !== null) {
        this.uid = user.uid;
        this.ref = fbase.database().ref('playlists').child(this.uid);
        this.stopSync = this.ref.orderByKey().on('value', snap => {
          var playlists = [];
          var index = 0;
          snap.forEach(playlist => {
            var data = playlist.val();
            data.key = playlist.key;
            if (profile.priv && profile.priv.selectedPlaylist && data.key === profile.priv.selectedPlaylist) {
              this.selectPlaylist = index;
            }
            playlists.push(data);
            index++;
          });
          console.log('playlist data', playlists);
          this.playlists = playlists;
          this.init = true;
        });
      } else {
        this.init = false;
        if (this.stopSync) {
          this.stopSync();
        }
        this.playlists = [];
      }
    });
  }

  @observable init = false;
  @observable playlists = [];
  @observable selectedPlaylist = 0;

  addPlaylist(name) {
    this.ref.push({name, entries: []});
  }

  @computed get playlistNames() {
    return this.playlists.map(playlist => playlist.name);
  }

  selectPlaylist(index) {
    this.selectedPlaylist = index;
    var key = this.playlists[index].key;
    fbase.database().ref('private').child(this.uid).child('selectedPlaylist').set(key);
  }

  @computed get selectedPlaylistName() {
    if (this.playlists[this.selectedPlaylist]) {
      return this.playlists[this.selectedPlaylist].name;
    } else {
      return "Unknown Playlist";
    }
  }
}
