import { computed, observable, action, runInAction } from "mobx";
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
    remove,
    ref
} from "firebase/database";
import localforage from "localforage";
import Favicon from "../assets/img/favicon.png";

interface PlaylistsEnt {
    key: string;
    name: string;
    entries: Song[];
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
    user?: string | undefined;
    added?: number;
}

export default new (
    class Playlists {
        uid: string = "";
        ref: any;
        stopSync: any;
        stopPlaylistSync: any;
        disposeEvent: any;
        authUnsubscribe: any;
        searchUnsubscribe: any;

        constructor() {

            // Single auth state listener with proper cleanup
            if (fbase && fbase.auth) {
                this.authUnsubscribe = fbase.auth().onAuthStateChanged(user => {

                    // Clean up previous listeners
                    this.cleanupListeners();

                    if (user) {
                        this.setupUserListeners(user.uid);
                    } else {
                        this.setInitState(false);
                        this.setPlaylists([]);
                    }
                });
            }
        }

        @action
        cleanupListeners() {

            // Clean up all listeners
            if (this.disposeEvent) {
                this.disposeEvent();
                this.setDisposeEvent(null);
            }

            if (this.stopSync) {
                this.stopSync();
                this.stopSync = null;
            }

            if (this.stopPlaylistSync) {
                this.stopPlaylistSync();
                this.stopPlaylistSync = null;
            }

            if (this.searchUnsubscribe) {
                this.searchUnsubscribe();
                this.searchUnsubscribe = null;
            }
        }

        @action
        setupUserListeners(uid: string) {
            this.setUid(uid);

            // Set up event handlers
            this.setupEventHandlers();

            // Set up search listener
            this.setupSearchListener(uid);

            // Set up playlists listener
            this.setupPlaylistsListener(uid);
            // Reset panel state when user authenticates
            this.setPanelOpen(false);
        }

        @action
        setupEventHandlers() {
            console.time('setupEvents');

            // Register search failed handler
            const searchFailedHandler = events.register('searchfailed', (data) => {
                const eventData = data as { data: { uid: string } };
                if (eventData.data.uid === profile.user?.uid) {
                    toast('Search failed, please try again later', { type: "error" });
                    this.setSearching(false);
                    this.setSearch([]);
                }
            });

            // Register search exceeded handler
            const searchExceededHandler = events.register('searchexceeded', (data) => {
                const eventData = data as { data: { uid: string } };
                if (eventData.data.uid === profile.user?.uid) {
                    toast('Search limit exceeded, try again in thirty minutes', { type: "error" });
                    this.setSearching(false);
                    this.setSearch([]);
                }
            });

            // Register playlist imported handler
            const playlistImportedHandler = events.register('playlistImported', (data) => {
                const eventData = data as { data: { uid: string, data: { name: string } } };
                if (eventData.data.uid === profile.user?.uid) {
                    toast(`${eventData.data.data.name} Imported`, { type: "success" });
                    this.setImporting(false);
                }
            });

            // Store disposal function
            this.setDisposeEvent(() => {
                if (searchFailedHandler) {
                    events.unregister('searchfailed', searchFailedHandler);
                }
                if (searchExceededHandler) {
                    events.unregister('searchexceeded', searchExceededHandler);
                }
                if (playlistImportedHandler) {
                    events.unregister('playlistImported', playlistImportedHandler);
                }
            });

            console.timeEnd('setupEvents');
        }

        @action
        setupSearchListener(uid: string) {
            console.time('setupSearchListener');

            const searchRef = ref(db, `searches/${uid}`);
            this.searchUnsubscribe = onValue(searchRef, snap => {
                if (!snap.val() || snap.val() == null) return;

                // Use runInAction to batch state changes
                runInAction(() => {
                    this.setSearch(snap.val());
                    this.setOpenSearch(true);
                    this.setSearching(false);
                });
            });

            console.timeEnd('setupSearchListener');
        }

        @action
        async setupPlaylistsListener(uid: string) {
            console.time('setupPlaylistsListener');

            const playlistsRef = ref(db, `playlists/${uid}`);
            this.setRef(playlistsRef);

            // Set up playlists listener using modern Firebase SDK
            const playlistsQuery = query(playlistsRef, orderByKey());

            this.stopSync = onValue(playlistsQuery, (snap) => {

                const playlists: PlaylistsEnt[] = [];
                snap.forEach(playlist => {
                    const data = playlist.val();
                    data.key = playlist.key;
                    playlists.push(data);
                });

                this.setPlaylists(playlists);

                // Only load selected playlist on first load or when playlist is removed
                if (!this.init || this.removedPlaylist) {
                    this.loadSelectedPlaylist(uid, playlists);
                }

                this.setInitState(true);
            });

            console.timeEnd('setupPlaylistsListener');
        }

        @action
        async loadSelectedPlaylist(uid: string, playlists: PlaylistsEnt[]) {
            console.time('loadSelectedPlaylist');

            try {
                const privateRef = ref(db, `private/${uid}`);
                const snap = await get(privateRef);

                if (snap.val() && snap.val().selectedPlaylist) {
                    const selectedKey = snap.val().selectedPlaylist;

                    // Find index of playlist with matching key
                    const index = playlists.findIndex(playlist => playlist.key === selectedKey);

                    if (index !== -1) {
                        this.selectPlaylist(index);
                    } else {
                        this.selectPlaylist(0);
                    }
                } else {
                    this.selectPlaylist(0);
                }
            } catch (error) {
                console.error("Error loading selected playlist:", error);
                this.selectPlaylist(0);
            }

            console.timeEnd('loadSelectedPlaylist');
        }

        @action
        setImporting(importing: boolean) {
            this.importing = importing;
        }

        @action
        setOpenSearch(openSearch: boolean) {
            this.openSearch = openSearch;
        }

        @action
        setDisposeEvent(event: any) {
            this.disposeEvent = event;
        }

        @action
        setStopSync(stopSync: any) {
            this.stopSync = stopSync;
        }

        @action
        setStopPlaylistSync(stopPlaylistSync: any) {
            this.stopPlaylistSync = stopPlaylistSync;
        }

        @action
        setRef(ref: any) {
            this.ref = ref;
        }

        @action
        setUid(uid: string) {
            this.uid = uid;
        }

        @action
        setSearching(searching: boolean) {
            this.searching = searching;
        }

        @action
        setSearch(search: SearchResult[]) {
            this.search = search;
        }

        @action
        setInitState(init: boolean) {
            this.init = init;
        }

        @action
        setPlaylists(playlists: PlaylistsEnt[]) {
            this.playlists = playlists;
        }

        @action
        setPlaylist(playlist: Song[]) {
            this.playlist = playlist;
        }

        @observable accessor init = false;
        @observable accessor playlists: PlaylistsEnt[] = [];
        @observable accessor selectedPlaylist = 0;
        @observable accessor selectedPlaylistKey = "";
        @observable accessor playlist: Song[] = [];
        @observable accessor searching = false;
        @observable accessor search: SearchResult[] = [];
        @observable accessor searchSource = "youtube";
        @observable accessor openSearch = false;
        @observable accessor importing = false;
        @observable accessor removedPlaylist = false;
        @observable accessor panelOpen = false;
        @observable accessor searchWithinPlaylist = false;
        @observable accessor playlistSearchResults: Song[] = [];
        @observable accessor playlistSearchQuery = "";

        @action
        searchInCurrentPlaylist(query: string) {
            console.time('searchInCurrentPlaylist');

            // Store the search query
            this.playlistSearchQuery = query;

            if (!query || query.trim() === "") {
                this.searchWithinPlaylist = false;
                this.playlistSearchResults = [];
                console.timeEnd('searchInCurrentPlaylist');
                return;
            }

            // Convert query to lowercase for case-insensitive search
            const lowerCaseQuery = query.toLowerCase();

            // Filter the current playlist
            const results = this.playlist.filter(song => {
                return (
                    (song.title && song.title.toLowerCase().includes(lowerCaseQuery)) ||
                    (song.channel && song.channel.toLowerCase().includes(lowerCaseQuery)) ||
                    (song.user && song.user.toLowerCase().includes(lowerCaseQuery))
                );
            });

            // Update state
            this.playlistSearchResults = results;
            this.searchWithinPlaylist = true;

            // Notify user
            if (results.length === 0) {
                toast(`No matches found for "${query}"`, { type: "info" });
            } else {
                toast(`Found ${results.length} matches for "${query}"`, { type: "success" });
            }

            console.timeEnd('searchInCurrentPlaylist');
        }

        @action
        clearPlaylistSearch() {
            this.searchWithinPlaylist = false;
            this.playlistSearchResults = [];
            this.playlistSearchQuery = "";
        }

        @action setPanelOpen(panelOpen: boolean) {
            this.panelOpen = panelOpen;
        }

        @action
        addPlaylist(name: string) {
            console.time('addPlaylist');

            const newPlaylistRef = push(this.ref);
            return set(newPlaylistRef, {
                name,
                entries: []
            }).then(() => {
                toast("Playlist added!", { type: "success" });
                console.timeEnd('addPlaylist');
            }).catch((err: Error) => {
                toast(`Failed to add Playlist! ${err.toString()}`, { type: "error" });
                console.timeEnd('addPlaylist');
            });
        }

        @computed get playlistNames() {
            return this.playlists.map(playlist => playlist.name);
        }

        @action
        exportPlaylist() {
            console.time('exportPlaylist');

            const playlistRef = ref(db, `playlists/${this.uid}/${this.selectedPlaylistKey}`);
            get(playlistRef).then(snap => {
                if (snap.val()) {
                    const dataStr = "data:text/json;charset=utf-8," +
                        encodeURIComponent(JSON.stringify(snap.val(), undefined, 3));
                    var anchorElem = document.getElementById("exportPlaylistDownload");
                    if (anchorElem) {
                        anchorElem.setAttribute("href", dataStr);
                        anchorElem.setAttribute("download", this.selectedPlaylistName + ".json");
                        anchorElem.click();
                    }
                    console.timeEnd('exportPlaylist');
                }
            }).catch(err => {
                console.error("Error exporting playlist:", err);
                console.timeEnd('exportPlaylist');
            });
        }

        @action
        setSelectedPlaylist(index: number) {
            this.selectedPlaylist = index;
        }

        @action
        setSelectedPlaylistKey(key: string) {
            this.selectedPlaylistKey = key;
        }

        @action
        clearSearch() {
            this.openSearch = false;
        }

        @action
        selectPlaylist(index: number) {
            console.time('selectPlaylist');

            this.clearSearch();

            // Clean up previous playlist listener
            if (this.stopPlaylistSync) {
                this.stopPlaylistSync();
            }

            this.setSelectedPlaylist(index);

            // Only proceed if playlist exists
            if (!this.playlists[index]) {
                console.timeEnd('selectPlaylist');
                return;
            }

            const key = this.playlists[index].key;
            this.setSelectedPlaylistKey(key);

            // Update private ref
            const privateRef = ref(db, `private/${this.uid}/selectedPlaylist`);
            set(privateRef, key);

            // Save to localforage (can be done in background)
            localforage.setItem("selectedPlaylist", key).catch(err => {
                console.error("Error saving selected playlist to localforage:", err);
            });

            // Set up new listener with modern Firebase SDK
            const entriesRef = ref(db, `playlists/${this.uid}/${key}/entries`);
            const entriesQuery = query(entriesRef, orderByKey());

            this.stopPlaylistSync = onValue(entriesQuery, snap => {

                const playlist: Song[] = [];
                if (snap) {
                    snap.forEach(entry => {
                        playlist.push(entry.val());
                    });
                }

                this.setPlaylist(playlist);
            });

            console.timeEnd('selectPlaylist');
        }

        @action
        setRemovedPlaylist(removedPlaylist: boolean) {
            this.removedPlaylist = removedPlaylist;
        }

        @action
        removePlaylist(index: number) {
            console.time('removePlaylist');

            const key = this.playlists[index].key;
            if (this.selectedPlaylist === index) {
                this.setRemovedPlaylist(true);
            }
            const playlistRef = ref(db, `playlists/${this.uid}/${key}`);
            remove(playlistRef).then(() => {
                console.timeEnd('removePlaylist');
            }).catch(err => {
                console.error("Error removing playlist:", err);
                console.timeEnd('removePlaylist');
            });
        }

        @computed get selectedPlaylistName() {
            // check length before checking index, mobx does not like out of bounds checks
            if (this.playlists[this.selectedPlaylist]) {
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
            console.time('runSearch');

            this.setSearching(true);
            if (profile.init) {
                send("search", { source: this.searchSource, query: query });
            }

            console.timeEnd('runSearch');
        }

        @action
        addFromSearch(index: number) {
            console.time('addFromSearch');

            if (!this.hasPlaylist) {
                toast("You really should select a playlist first.", { type: "error" });
                console.timeEnd('addFromSearch');
                return;
            }

            var video = this.search[index];
            var url = "";
            var title = "";
            var thumb = "";
            var channel = "";
            var duration = 0;

            this.setOpenSearch(false);

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
                console.timeEnd('addFromSearch');
                return;
            }

            this.addSong(song, this.selectedPlaylistKey, false);
            console.timeEnd('addFromSearch');
        }

        @action
        mergePlaylists(playlista: string, playlistb: string, playlistname: string) {
            console.time('mergePlaylists');

            send("playlist.merge", {
                playlista: playlista,
                playlistb: playlistb,
                playlistname: playlistname
            });

            console.timeEnd('mergePlaylists');
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
            return this.playlists.find(p => p.key === key);
        }

        @action
        addSong(song: Song, playlistKey: string, isGrab: boolean) {
            console.time('addSong');

            var playlist = this.getPlaylistByKey(playlistKey);
            var newPlaylist: Song[] = [];
            if (playlist?.entries) {
                newPlaylist = playlist.entries.slice();
            }

            if (isGrab) {
                newPlaylist.push(song);
            } else {
                newPlaylist.unshift(song);
            }

            const entriesRef = ref(db, `playlists/${this.uid}/${playlistKey}/entries`);
            set(entriesRef, newPlaylist).then(() => {
                toast(`Added song ${song.title || song.name} to playlist!`, { type: "success" });
                console.timeEnd('addSong');
            }).catch(err => {
                console.error("Error adding song:", err);
                console.timeEnd('addSong');
            });
        }

        @action
        moveTop(index: number) {
            console.time('moveTop');

            var newPlaylist = this.playlist.slice();
            var video = newPlaylist.splice(index, 1)[0];
            newPlaylist.unshift(video);

            const entriesRef = ref(db, `playlists/${this.uid}/${this.selectedPlaylistKey}/entries`);
            set(entriesRef, newPlaylist).then(() => {
                toast(`Moved song to top of playlist!`, { type: "success" });
                console.timeEnd('moveTop');
            }).catch(err => {
                console.error("Error moving song to top:", err);
                console.timeEnd('moveTop');
            });
        }

        @action
        moveBottom(index: number) {
            console.time('moveBottom');

            var newPlaylist = this.playlist.slice();
            var video = newPlaylist.splice(index, 1)[0];
            newPlaylist.push(video);

            const entriesRef = ref(db, `playlists/${this.uid}/${this.selectedPlaylistKey}/entries`);
            set(entriesRef, newPlaylist).then(() => {
                toast("Moved song to bottom of playlist!", { type: "success" });
                console.timeEnd('moveBottom');
            }).catch(err => {
                console.error("Error moving song to bottom:", err);
                console.timeEnd('moveBottom');
            });
        }

        @action
        removeVideo(index: number) {
            console.time('removeVideo');
            if (confirm("Are you sure you want to remove this video from the playlist?")) {
                var newPlaylist = this.playlist.slice();
                var video = newPlaylist.splice(index, 1)[0];

                const entriesRef = ref(db, `playlists/${this.uid}/${this.selectedPlaylistKey}/entries`);
                set(entriesRef, newPlaylist).then(() => {
                    toast(`Removed ${video.title || video.name} from playlist!`, { type: "success" });
                    console.timeEnd('removeVideo');
                }).catch(err => {
                    console.error("Error removing video:", err);
                    console.timeEnd('removeVideo');
                });
            }
        }

        @action
        shufflePlaylist() {
            console.time('shufflePlaylist');

            var newPlaylist = shuffle(this.playlist.slice());

            const entriesRef = ref(db, `playlists/${this.uid}/${this.selectedPlaylistKey}/entries`);
            set(entriesRef, newPlaylist).then(() => {
                toast("Shuffled playlist!", { type: "success" });
                console.timeEnd('shufflePlaylist');
            }).catch(err => {
                console.error("Error shuffling playlist:", err);
                console.timeEnd('shufflePlaylist');
            });
        }

        @action
        sortPlaylist(direction: string, key: string) {
            console.time('sortPlaylist');

            send("playlist.sort", {
                playlist: this.selectedPlaylistKey,
                direction: direction,
                field: key
            });

            console.timeEnd('sortPlaylist');
        }

        @action
        async importYouTubePlaylist(name: string, url: string): Promise<boolean> {
            console.time('importYouTubePlaylist');

            this.setImporting(true);
            if (profile.init) {
                send('importPlaylist', { name, url });
                console.timeEnd('importYouTubePlaylist');
                return true;
            }

            console.timeEnd('importYouTubePlaylist');
            return false;
        }

        // Cleanup method for component unmounting
        destroy() {

            // Clean up auth listener
            if (this.authUnsubscribe) {
                this.authUnsubscribe();
            }

            // Clean up all other listeners
            this.cleanupListeners();
        }
    })();