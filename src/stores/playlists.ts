import { computed, observable, action } from "mobx";
import { DataSnapshot } from "firebase/database";
import toast from "../utils/toast";
import fbase, { db } from "../libs/fbase";
import profile from "./profile";
import moment from "moment";
import { shuffle } from "lodash";
import { send } from "../libs/events";
import events from "./events";
import {
    set,
    get,
    onValue,
    push,
    orderByKey,
    query,
    remove
} from "firebase/database";
import localforage from "localforage";
import Favicon from "../assets/img/favicon.png";

interface PlaylistsEnt {
    key: string;
    name: string;
    entries: any[];
    title: string;
    duration: number;
    url: string;
    thumb: string;
    channel: string;
    user: string;
    added: number;
}

interface SearchResult {
    id: string;
    title: string;
    thumb: string;
    channel: string;
    duration: number;
    snippet: {
        title: string;
        thumbnails: {
            default: {
                url: string;
            };
        };
        channelTitle: string;
    };
    contentDetails: {
        duration: string;
    };
    permalink_url: string;
    artwork_url: string;
    user: {
        avatar_url: string;
        username: string;
    };
}

interface Song {
    url: string;
    title: string;
    thumb: string;
    channel: string;
    duration: number;
    name?: string;
}

export default new (class Playlists {
    uid: string = "";
    ref: any;
    stopSync: any;
    stopPlaylistSync: any;
    disposeEvent: any;
    constructor() {

        if (fbase && fbase.auth)
            fbase.auth().onAuthStateChanged(user => {
                const me = this;
                if (user !== null) {
                    events.register('searchfailed', (data) => {
                        const eventData = data as { data: { uid: string } };
                        if (eventData.data.uid === profile.user?.uid) {
                            toast('Search failed, please try again later', { type: "error" });
                            me.searching = false;
                            me.search = [];
                        }
                    });
                    events.register('searchexceeded', (data) => {
                        const eventData = data as { data: { uid: string } };
                        if (eventData.data.uid === profile.user?.uid) {
                            toast('Search limit exceeded, try again in thirty minutes', { type: "error" });
                            me.searching = false;
                            me.search = [];
                        }
                    });
                    events.register('playlistImported', (data) => {
                        const eventData = data as { data: { uid: string, data: { name: string } } };
                        if (eventData.data.uid === profile.user?.uid) {
                            toast(`${eventData.data.data.name} Imported`, { type: "success" });
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
                    this.stopSync = this.ref.orderByKey().on("value", (snap: DataSnapshot) => {
                        var playlists: PlaylistsEnt[] = [];
                        snap.forEach(playlist => {
                            var data = playlist.val();
                            data.key = playlist.key;
                            playlists.push(data);
                        });
                        this.setPlaylists(playlists);

                        if (!this.init || this.removedPlaylist) {
                            db.ref(`private/${user.uid}`).once("value").then(snap => {
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

                        this.setInitState(true);
                    });
                } else {
                    this.setInitState(false);
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
                    this.setPlaylists([]);
                }
            });
    }

    @action
    setInitState(init: boolean) {
        this.init = init;
    }

    @action
    setPlaylists(playlists: PlaylistsEnt[]) {
        this.playlists = playlists;
    }

    @observable accessor init = false;
    @observable accessor playlists: PlaylistsEnt[] = [];
    @observable accessor selectedPlaylist = 0;
    @observable accessor selectedPlaylistKey = "";
    @observable accessor playlist: PlaylistsEnt[] = [];
    @observable accessor searching = false;
    @observable accessor search: SearchResult[] = [];
    @observable accessor searchSource = "youtube";
    @observable accessor openSearch = false;

    @action
    addPlaylist(name: string) {
        const newPlaylistRef = push(this.ref);
        return set(newPlaylistRef, {
            name,
            entries: []
        }).then(() => {
            toast("Playlist added!", { type: "success" });
        }).catch((err: Error) => {
            toast(`Failed to add Playlist! ${err.toString()}`, { type: "error" });
        });
    }

    @computed get playlistNames() {
        return this.playlists.map(playlist => playlist.name);
    }

    @action
    exportPlaylist() {
        const playlistRef = db.ref(`playlists/${this.uid}/${this.selectedPlaylistKey}`);
        get(playlistRef).then(snap => {
            if (snap.val()) {
                const dataStr =


                    "data:text/json;charset=utf-8," +
                    encodeURIComponent(JSON.stringify(snap.val(), undefined, 3));
                var anchorElem = document.getElementById("exportPlaylistDownload");
                if (anchorElem) {
                    anchorElem.setAttribute("href", dataStr);
                    anchorElem.setAttribute("download", this.selectedPlaylistName + ".json");
                    anchorElem.click();
                }
            }
        });
    }

    @action
    clearSearch() {
        this.openSearch = false;
    }

    @action
    selectPlaylist(index: number) {
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
                const playlist: PlaylistsEnt[] = [];
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

    @action
    removePlaylist(index: number) {
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

    @action
    async runSearch(query: string) {
        this.searching = true;
        if (profile.init) send("search", { source: this.searchSource, query: query });
    }

    @action
    addFromSearch(index: number) {
        if (!this.hasPlaylist) {
            toast("You really should select a playlist first.", { type: "error" });
            return;
        }
        var video = this.search[index];
        var url = "";
        var title = "";
        var thumb = "";
        var channel = "";
        var duration = 0;
        this.openSearch = false;
        if (this.searchSource == "youtube") {
            url = `https://www.youtube.com/watch?v=${video.id}`;
            title = video.snippet.title;
            thumb = video.snippet.thumbnails.default.url;
            channel = video.snippet.channelTitle;
            duration = parseInt(moment.duration(video.contentDetails.duration).valueOf().toString());
        } else if (this.searchSource == "soundcloud") {
            url = video.permalink_url;
            thumb = video.artwork_url || video.user.avatar_url || Favicon;
            channel = video.user.username;
            duration = parseInt(moment.duration(video.duration).valueOf().toString());
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
            toast("You really should select a playlist.", { type: "error" });
            return;
        }

        this.addSong(song, this.selectedPlaylistKey, false);
    }

    @action
    mergePlaylists(playlista: string, playlistb: string, playlistname: string) {
        send("playlist.merge", {
            playlista: playlista,
            playlistb: playlistb,
            playlistname: playlistname
        });
    }

    @action
    checkPlaylistForSong(playlistKey: string, songUrl: string) {
        var playlist = this.getPlaylistByKey(playlistKey);
        if (playlist?.entries && playlist.entries.some(s => s.url === songUrl)) {
            return true;
        } else {
            return false;
        }
    }

    @action
    getPlaylistByKey(key: string): PlaylistsEnt | undefined {
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
    @action
    addSong(song: Song, playlistKey: string, isGrab: boolean) {
        var playlist = this.getPlaylistByKey(playlistKey);
        var newPlaylist = [];
        if (playlist?.entries) {
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
        toast(`Added song ${song.name} to playlist!`, { type: "success" });
        // this.addedTo.push(playlistKey);
    }

    @action
    moveTop(index: number) {
        var newPlaylist = this.playlist.slice();
        var video = newPlaylist.splice(index, 1)[0];
        newPlaylist.unshift(video);
        this.ref
            .child(this.selectedPlaylistKey)
            .child("entries")
            .set(newPlaylist);
        toast(`Moved song to top of playlist!`, { type: "success" });
    }

    @action
    moveBottom(index: number) {
        var newPlaylist = this.playlist.slice();
        var video = newPlaylist.splice(index, 1)[0];
        newPlaylist.push(video);
        this.ref
            .child(this.selectedPlaylistKey)
            .child("entries")
            .set(newPlaylist);
        toast("Moved song to bottom of playlist!", { type: "success" });
    }

    @action
    removeVideo(index: number) {
        var newPlaylist = this.playlist.slice();
        var video = newPlaylist.splice(index, 1)[0];
        this.ref
            .child(this.selectedPlaylistKey)
            .child("entries")
            .set(newPlaylist);
        toast(`Removed ${video.name} from playlist!`, { type: "success" });
    }

    @action
    shufflePlaylist() {
        var newPlaylist = shuffle(this.playlist.slice());
        this.ref
            .child(this.selectedPlaylistKey)
            .child("entries")
            .set(newPlaylist);
        toast("Shuffled playlist!", { type: "success" });
    }

    @action
    sortPlaylist(direction: string, key: string) {
        send("playlist.sort", { playlist: this.selectedPlaylistKey, direction: direction, field: key });
    }

    @observable accessor importing = false;

    @action
    async importYouTubePlaylist(name: string, url: string): Promise<boolean> {
        this.importing = true;
        if (profile.init) {
            send('importPlaylist', { name, url });
            return true;
        }
        return false;
    }
})();
