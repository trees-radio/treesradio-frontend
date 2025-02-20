import {computed, observable, action} from "mobx";
import toast from "../utils/toast";
import fbase, {auth, db} from "../libs/fbase";
import profile from "./profile";
import moment from "moment";
import {shuffle} from "lodash";
import {send} from "../libs/events";
import events from "./events";
import {
    ref,
    set,
    get,
    onValue,
    push,
    child,
    orderByKey,
    query,
    remove
} from "firebase/database";
import localforage from "localforage";
import Favicon from "../assets/img/favicon.png";

export default new (class Playlists {
    constructor() {
        fbase.auth().onAuthStateChanged(user => {
            const me = this;
            if (user !== null) {
                events.register('searchfailed', (data) => {
                    if (data.data.uid === profile.user.uid) {
                        toast('Search failed, please try again later');
                        me.searching = false;
                        me.search = [];
                    }
                });
                events.register('searchexceeded', (data) => {
                    if (data.data.uid === profile.user.uid) {
                        toast('Search limit exceeded, try again in thirty minutes');
                        me.searching = false;
                        me.search = [];
                    }
                });
                events.register('playlistImported', (data) => {
                    if (data.data.uid === profile.user.uid) {
                        toast(`${data.data.data.name} Imported`);
                        me.importing = false;
                    }
                });
                db.ref(`searches/${user.uid}`).on("value", snap => {
                    if (!snap.val() || snap.val() == null) return false;
                    action(() => {
                        this.search = snap.val();
                        this.openSearch = true;
                        this.searching = false;
                    })
                });

                this.uid = user.uid;
                this.ref = db.ref(`playlists/${user.uid}`);

                // Fix the playlist sync
                this.stopSync = this.ref.orderByKey().on("value", snap => {
                    var playlists = [];
                    snap.forEach(playlist => {
                        var data = playlist.val();
                        data.key = playlist.key;
                        playlists.push(data);
                    });
                    this.playlists = playlists;

                    if (!this.init || this.removedPlaylist) {
                        const privateRef = db.ref(`private/${user.uid}`).once("value").then(snap => {
                            if (snap.val() && snap.val().selectedPlaylist) {
                                var toSelect;
                                playlists.forEach((playlist, i) => {
                                    if (playlist.key === snap.val().selectedPlaylist) {
                                        toSelect = i;
                                    }
                                });
                                if (toSelect !== undefined) {
                                    this.selectPlaylist(toSelect);
                                } else {
                                    this.selectPlaylist(0);
                                }
                            } else {
                                this.selectPlaylist(0);
                            }
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

    @observable accessor init = false;
    @observable accessor playlists = [];
    @observable accessor selectedPlaylist = 0;
    @observable accessor selectedPlaylistKey = "";
    @observable accessor playlist = [];
    @observable accessor searching = false;
    @observable accessor search = [];
    @observable accessor searchSource = "youtube";
    @observable accessor openSearch = false;

    addPlaylist(name) {
        const newPlaylistRef = push(this.ref);
        return set(newPlaylistRef, {
            name,
            entries: []
        }).then(() => {
            toast.success(`Added playlist ${name}!`);
        }).catch(err => {
            toast.error(`Error adding playlist: ${err.message}`);
        });
    }

    @computed get playlistNames() {
        return this.playlists.map(playlist => playlist.name);
    }

    exportPlaylist() {
        const playlistRef = db.ref(`playlists/${this.uid}/${this.selectedPlaylistKey}`);
        get(playlistRef).then(snap => {
            if (snap.val()) {
                const dataStr =


                    "data:text/json;charset=utf-8," +
                    encodeURIComponent(JSON.stringify(snap.val(), false, 3));
                var anchorElem = document.getElementById("exportPlaylistDownload");
                anchorElem.setAttribute("href", dataStr);
                anchorElem.setAttribute("download", this.selectedPlaylistName + ".json");
                anchorElem.click();
            }
        });
    }

    clearSearch() {
        this.openSearch = false;
    }

    selectPlaylist(index) {
        this.clearSearch();
        if (this.stopPlaylistSync) {
            // Remove old listener
            this.stopPlaylistSync();
        }

        this.selectedPlaylist = index;
        if (this.playlists[index]) {
            const key = this.playlists[index].key;
            this.selectedPlaylistKey = key;

            // Update private ref
            const privateRef = db.ref(`private/${this.uid}/selectedPlaylist`);
            set(privateRef, key);

            // Save to localforage
            localforage.setItem("selectedPlaylist", key);

            // Set up new listener
            const entriesRef = db.ref(`playlists/${this.uid}/${key}/entries`);
            const entriesQuery = query(entriesRef, orderByKey());

            this.stopPlaylistSync = onValue(entriesQuery, snap => {
                const playlist = [];
                if (snap) {
                    snap.forEach(entry => {
                        playlist.push(entry.val());
                    });
                }
                this.playlist = playlist;
            });
        }
    }

    @observable accessor removedPlaylist = false;

    removePlaylist(index) {
        const key = this.playlists[index].key;
        if (this.selectedPlaylist === index) {
            this.removedPlaylist = true;
        }
        const playlistRef = db.ref(`playlists/${this.uid}/${key}`);
        remove(playlistRef);
    }

    @computed get selectedPlaylistName() {
        // check length before checking index, mobx does not like out of bounds checks
        if (this.playlists.length > 0 && this.playlists[this.selectedPlaylist]) {
            return this.playlists[this.selectedPlaylist].name;
        } else {
            return false;
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

    async runSearch(query) {
        this.searching = true;
        if (profile.init) send("search", {source: this.searchSource, query: query});
    }

    addFromSearch(index) {
        if (!this.hasPlaylist) {
            toast.error("You don't have a selected playlist!");
            return;
        }
        var video = this.search[index];
        var url;
        var title;
        var thumb;
        var channel;
        var duration;
        this.openSearch = false;
        if (this.searchSource == "youtube") {
            url = `https://www.youtube.com/watch?v=${video.id}`;
            title = video.snippet.title;
            thumb = video.snippet.thumbnails.default.url;
            channel = video.snippet.channelTitle;
            duration = moment.duration(video.contentDetails.duration).valueOf();
        } else if (this.searchSource == "soundcloud") {
            url = video.permalink_url;
            thumb = video.artwork_url || video.user.avatar_url || Favicon;
            channel = video.user.username;
            duration = moment.duration(video.duration).valueOf();
            title = video.title;
        }

        var song = {
            url,
            title,
            thumb,
            channel,
            duration
        };

        if (!this.selectedPlaylistKey) {
            toast.error("Please select a playlist to add a song!");
            return;
        }

        this.addSong(song, this.selectedPlaylistKey);
    }

    mergePlaylists(playlista, playlistb, playlistname) {
        send("playlist.merge", {
            playlista: playlista,
            playlistb: playlistb,
            playlistname: playlistname
        });
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

    // @observable accessor addedTo = [];

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

        this.ref
            .child(playlistKey)
            .child("entries")
            .set(newPlaylist);
        toast.success(`Added ${song.title} to playlist ${playlist.name}.`);
        // this.addedTo.push(playlistKey);
    }

    moveTop(index) {
        var newPlaylist = this.playlist.slice();
        var video = newPlaylist.splice(index, 1)[0];
        newPlaylist.unshift(video);
        this.ref
            .child(this.selectedPlaylistKey)
            .child("entries")
            .set(newPlaylist);
        toast.success(`Moved ${video.title} to top of playlist.`);
    }

    moveBottom(index) {
        var newPlaylist = this.playlist.slice();
        var video = newPlaylist.splice(index, 1)[0];
        newPlaylist.push(video);
        this.ref
            .child(this.selectedPlaylistKey)
            .child("entries")
            .set(newPlaylist);
        toast.success(`Moved ${video.title} to bottom of playlist.`);
    }

    removeVideo(index) {
        var newPlaylist = this.playlist.slice();
        var video = newPlaylist.splice(index, 1)[0];
        this.ref
            .child(this.selectedPlaylistKey)
            .child("entries")
            .set(newPlaylist);
        toast.success(`Removed ${video.title} from playlist.`);
    }

    shufflePlaylist() {
        var newPlaylist = shuffle(this.playlist.slice());
        this.ref
            .child(this.selectedPlaylistKey)
            .child("entries")
            .set(newPlaylist);
        toast.success(`Playlist shuffled.`);
    }

    sortPlaylist(direction, key) {
        send("playlist.sort", {playlist: this.selectedPlaylistKey, direction: direction, field: key});
    }

    @observable accessor importing = false;

    async importYouTubePlaylist(name, url) {
        this.importing = true;
        if (profile.init) send('importPlaylist', {name, url});
    }
})();
