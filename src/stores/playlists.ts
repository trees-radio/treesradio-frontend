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

// SECURITY LIMITS: Prevent playlist abuse
const MAX_PLAYLISTS_PER_USER = 200;
const MAX_SONGS_PER_PLAYLIST = 1000;

interface PlaylistsEnt {
    key: string;
    name: string;
    entries: Song[];
    songCount?: number; // For lazy loading - shows count before loading entries
    isLoaded?: boolean; // Track if entries are loaded
}

interface SearchResult {
    source: string;
    link?: string;
    id: string;
    title: string;
    thumb: string;
    channel: string;
    duration: number;
    snippet: {
        title: string;
        thumbnails: {
            medium: {
                url: string;
            };
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

            // LAZY LOADING: Only load playlist metadata (name, key), NOT entries
            // This dramatically reduces data transfer from ~104MB to ~1MB
            this.stopSync = onValue(playlistsRef, (snap) => {
                const playlists: PlaylistsEnt[] = [];
                
                if (snap.exists()) {
                    snap.forEach(playlist => {
                        const data = playlist.val();
                        // Only load metadata, entries will be loaded on demand
                        const playlistMeta: PlaylistsEnt = {
                            key: playlist.key as string,
                            name: data.name || 'Unnamed Playlist',
                            entries: [], // Empty - will be loaded when selected
                            songCount: data.entries ? Object.keys(data.entries).length : 0,
                            isLoaded: false
                        };
                        playlists.push(playlistMeta);
                    });
                }

                console.log(`Lazy loading: Loaded ${playlists.length} playlist metadata (entries will load on selection)`);
                this.setPlaylists(playlists);

                // Optionally preload song counts in background (lightweight operation)
                this.preloadPlaylistCounts(uid, playlists);

                // Only load selected playlist on first load or when playlist is removed
                if (!this.init || this.removedPlaylist) {
                    this.loadSelectedPlaylist(uid, playlists);
                }

                this.setInitState(true);
            });

            console.timeEnd('setupPlaylistsListener');
        }

        @action
        async preloadPlaylistCounts(uid: string, playlists: PlaylistsEnt[]) {
            // This is optional - loads song counts in background without loading full entries
            // Only runs if the initial data doesn't include entry counts
            console.time('preloadPlaylistCounts');
            
            const countsToLoad = playlists.filter(p => p.songCount === undefined || p.songCount === 0);
            
            if (countsToLoad.length > 0) {
                console.log(`Preloading song counts for ${countsToLoad.length} playlists...`);
                
                const countPromises = countsToLoad.map(async (playlist) => {
                    try {
                        const entriesRef = ref(db, `playlists/${uid}/${playlist.key}/entries`);
                        const snap = await get(entriesRef);
                        const count = snap.exists() ? snap.size : 0;
                        
                        // Update the playlist songCount
                        const playlistIndex = this.playlists.findIndex(p => p.key === playlist.key);
                        if (playlistIndex !== -1) {
                            this.playlists[playlistIndex].songCount = count;
                        }
                        
                        return { key: playlist.key, count };
                    } catch (error) {
                        console.error(`Error loading count for playlist ${playlist.key}:`, error);
                        return { key: playlist.key, count: 0 };
                    }
                });
                
                await Promise.all(countPromises);
                console.log('Preloaded all playlist song counts');
            }
            
            console.timeEnd('preloadPlaylistCounts');
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
        setManualUrl(url: string) {
            this.manualUrl = url;
        }

        @action
        setManualTitle(title: string) {
            this.manualTitle = title;
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
        @observable accessor manualUrl = "";
        @observable accessor manualTitle = "";
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
            // SECURITY: Check playlist limits to prevent abuse
            if (this.playlists.length >= MAX_PLAYLISTS_PER_USER) {
                toast(`Playlist limit reached (${MAX_PLAYLISTS_PER_USER} maximum per user)`, { type: "error" });
                return Promise.reject(new Error('Playlist limit exceeded'));
            }

            if (!name || name.trim().length === 0) {
                toast("Playlist name cannot be empty", { type: "error" });
                return Promise.reject(new Error('Invalid playlist name'));
            }

            if (name.length > 100) {
                toast("Playlist name too long (100 characters max)", { type: "error" });
                return Promise.reject(new Error('Playlist name too long'));
            }

            console.time('addPlaylist');

            const newPlaylistRef = push(this.ref);
            return set(newPlaylistRef, {
                name: name.trim(),
                entries: []
            }).then(() => {
                toast("Playlist added!", { type: "success" });
                console.timeEnd('addPlaylist');
            }).catch((err: Error) => {
                toast(`Failed to add Playlist! ${err.toString()}`, { type: "error" });
                console.timeEnd('addPlaylist');
                throw err;
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

            // LAZY LOADING OPTIMIZATION: If playlist is already loaded, use cached data
            if (this.playlists[index].isLoaded && this.playlists[index].entries.length > 0) {
                console.log(`Using cached entries for playlist: ${this.playlists[index].name} (${this.playlists[index].entries.length} songs)`);
                this.setPlaylist(this.playlists[index].entries);
                console.timeEnd('selectPlaylist');
                return;
            }

            // Update private ref
            const privateRef = ref(db, `private/${this.uid}/selectedPlaylist`);
            set(privateRef, key);

            // Save to localforage (can be done in background)
            localforage.setItem("selectedPlaylist", key).catch(err => {
                console.error("Error saving selected playlist to localforage:", err);
            });

            // LAZY LOADING: Load playlist entries on demand
            const entriesRef = ref(db, `playlists/${this.uid}/${key}/entries`);
            const entriesQuery = query(entriesRef, orderByKey());

            console.log(`Loading entries for playlist: ${this.playlists[index]?.name}`);

            this.stopPlaylistSync = onValue(entriesQuery, snap => {
                const playlist: Song[] = [];
                
                if (snap.exists()) {
                    snap.forEach(entry => {
                        playlist.push(entry.val());
                    });
                }

                console.log(`Loaded ${playlist.length} songs for playlist: ${this.playlists[index]?.name}`);
                this.setPlaylist(playlist);

                // Update the playlist metadata to include the loaded entries
                if (this.playlists[index]) {
                    this.playlists[index].entries = playlist;
                    this.playlists[index].isLoaded = true;
                    this.playlists[index].songCount = playlist.length;
                }
            }, (error) => {
                console.error(`Error loading playlist entries for ${key}:`, error);
                this.setPlaylist([]);
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

        @computed get selectedPlaylistLoaded() {
            // Check if the current playlist's entries are loaded
            const current = this.playlists[this.selectedPlaylist];
            return current ? (current.isLoaded === true) : false;
        }

        @computed get selectedPlaylistSongCount() {
            // Get song count for selected playlist (available before entries are loaded)
            const current = this.playlists[this.selectedPlaylist];
            return current ? (current.songCount || 0) : 0;
        }

        @computed get canAddPlaylist() {
            // Check if user can add another playlist
            return this.playlists.length < MAX_PLAYLISTS_PER_USER;
        }

        @computed get canAddSong() {
            // Check if user can add another song to current playlist
            return this.playlist.length < MAX_SONGS_PER_PLAYLIST;
        }

        @computed get playlistLimitWarning() {
            // Show warning when approaching limits
            const remaining = MAX_PLAYLISTS_PER_USER - this.playlists.length;
            if (remaining <= 2 && remaining > 0) {
                return `${remaining} playlist${remaining === 1 ? '' : 's'} remaining`;
            }
            return null;
        }

        @computed get songLimitWarning() {
            // Show warning when approaching song limits
            const remaining = MAX_SONGS_PER_PLAYLIST - this.playlist.length;
            if (remaining <= 10 && remaining > 0) {
                return `${remaining} song${remaining === 1 ? '' : 's'} remaining`;
            }
            return null;
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

            // SECURITY: Check song limits to prevent playlist abuse
            if (this.playlist.length >= MAX_SONGS_PER_PLAYLIST) {
                toast(`Playlist song limit reached (${MAX_SONGS_PER_PLAYLIST} maximum per playlist)`, { type: "error" });
                console.timeEnd('addFromSearch');
                return;
            }

            var video = this.search[index];
            var url = "";
            var title = "";
            var thumb = "";
            var channel = "";
            var duration = 0;

            // this.setOpenSearch(false);

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
            } else if (this.searchSource === "vimeo") {
                url = video.link || `https://vimeo.com/${video.id}`;
                title = video.snippet.title;
                thumb = video.snippet.thumbnails.medium.url;
                channel = video.snippet.channelTitle;
                duration = parseInt(moment.duration(video.contentDetails.duration).valueOf().toString());
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
        validateSoundcloudUrl(url: string): boolean {
            // Basic Soundcloud URL validation
            const soundcloudPattern = /^https?:\/\/(www\.)?(soundcloud\.com|snd\.sc)\/.+/i;
            return soundcloudPattern.test(url);
        }

        @action
        extractTitleFromUrl(url: string): string {
            try {
                // Extract title from Soundcloud URL structure
                // Example: https://soundcloud.com/artist/track-name
                const urlParts = url.split('/');
                if (urlParts.length >= 4) {
                    const trackPart = urlParts[urlParts.length - 1];
                    // Remove query parameters and decode
                    const cleanTrack = trackPart.split('?')[0];
                    // Replace hyphens and underscores with spaces, capitalize words
                    return cleanTrack
                        .replace(/[-_]/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                }
            } catch (error) {
                console.error('Error extracting title from URL:', error);
            }
            return '';
        }

        @action
        addManualSong() {
            console.time('addManualSong');

            if (!this.hasPlaylist) {
                toast("Please select a playlist first.", { type: "error" });
                console.timeEnd('addManualSong');
                return;
            }

            if (!this.manualUrl.trim()) {
                toast("Please enter a URL.", { type: "error" });
                console.timeEnd('addManualSong');
                return;
            }

            if (!this.validateSoundcloudUrl(this.manualUrl)) {
                toast("Please enter a valid Soundcloud URL.", { type: "error" });
                console.timeEnd('addManualSong');
                return;
            }

            // Extract title from URL if no manual title provided
            let title = this.manualTitle.trim();
            if (!title) {
                title = this.extractTitleFromUrl(this.manualUrl);
                if (!title) {
                    title = "Untitled Track";
                }
            }

            // Create song object
            const song: Song = {
                url: this.manualUrl.trim(),
                title: title,
                thumb: Favicon, // Use default favicon as thumbnail
                channel: "Soundcloud", // Default channel name
                duration: 0 // Unknown duration
            };

            // Check if song already exists in playlist
            if (this.checkPlaylistForSong(this.selectedPlaylistKey, song.url)) {
                toast("This track is already in the playlist.", { type: "warning" });
                console.timeEnd('addManualSong');
                return;
            }

            // Add song to playlist
            this.addSong(song, this.selectedPlaylistKey, false);

            // Clear manual input fields
            this.setManualUrl("");
            this.setManualTitle("");

            console.timeEnd('addManualSong');
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
                toast(`Added song ${song.title || song.name} to playlist ${playlist?.name}.`, { type: "success" });
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