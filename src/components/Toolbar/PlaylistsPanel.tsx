import React from "react";
import { observable, action, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { debounce } from 'lodash';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
} from '@headlessui/react';
import playlists from "../../stores/playlists";
import Modal from "../utility/Modal";
import toast from "../../utils/toast";
import moment from "moment";
import $ from "jquery";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Favicon from "../../assets/img/favicon.png";

const PLAYLIST_OPACITY = 'playlistOpacity';

interface PlaylistsPanelProps {
    open: boolean;
    onClose: (arg0: boolean) => void;
}

interface PlaylistRemove {
    name: string;
    index: number;
}

class PlaylistsPanel extends React.Component<PlaylistsPanelProps> {
    @observable accessor addingPlaylist = false;
    @observable accessor removingPlaylist = false;
    @observable accessor playlistToRemove: PlaylistRemove | null = null;
    @observable accessor importingPlaylist = false;
    @observable accessor mergingPlaylists = false;
    @observable accessor originalBodyStyle = {
        overflow: "",
        position: "",
        width: "",
        top: ""
    };

    state = {
        sliderOpacity: '90',
        opacity: '90',
        isMobile: false
    };

    _newPlaylist: HTMLInputElement | null = null;
    _search: HTMLInputElement | null = null;
    _importName: HTMLInputElement | null = null;
    _importUrl: HTMLInputElement | null = null;
    debounceOpacitySlider: ReturnType<typeof debounce> | null = null;

    constructor(props: PlaylistsPanelProps) {
        super(props);
        makeObservable(this);

        const opacity = this.getOpacityFromLocalStorage();
        this.state = {
            sliderOpacity: opacity,
            opacity,
            isMobile: window.innerWidth <= 768
        };

        this.checkMobile = this.checkMobile.bind(this);
        this.changeOpacityDebounced = this.changeOpacityDebounced.bind(this);
        this.onEnterKey = this.onEnterKey.bind(this);
        this.addPlaylist = this.addPlaylist.bind(this);
        this.search = this.search.bind(this);
        this.importPlaylist = this.importPlaylist.bind(this);
    }

    // Store original body style when dialog opens
    @action
    storeBodyStyles() {
        if (document.body) {
            this.originalBodyStyle = {
                overflow: document.body.style.overflow,
                position: document.body.style.position,
                width: document.body.style.width,
                top: document.body.style.top
            };
        }
    }

    // Restore body styles when dialog closes
    restoreBodyStyles() {
        if (document.body) {
            // Only restore if we've stored something
            if (this.originalBodyStyle.overflow !== undefined) {
                document.body.style.overflow = this.originalBodyStyle.overflow;
            }
            if (this.originalBodyStyle.position !== undefined) {
                document.body.style.position = this.originalBodyStyle.position;
            }
            if (this.originalBodyStyle.width !== undefined) {
                document.body.style.width = this.originalBodyStyle.width;
            }
            if (this.originalBodyStyle.top !== undefined) {
                document.body.style.top = this.originalBodyStyle.top;
            }
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.checkMobile);
        this.checkMobile();
        
        // If dialog is initially open, lock scrolling
        if (this.props.open) {
            this.lockBodyScrolling();
        }
    }

    componentDidUpdate(prevProps: PlaylistsPanelProps) {
        if (!prevProps.open && this.props.open) {
            // Dialog is opening
            this.lockBodyScrolling();
        } else if (prevProps.open && !this.props.open) {
            // Dialog is closing
            this.unlockBodyScrolling();
        }
    }

    handleClose() {
        // Restore body styles before closing
        this.unlockBodyScrolling();

        // Small delay to ensure DOM is ready
        setTimeout(() => {
            this.props.onClose(true);
        }, 10);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.checkMobile);
        this.unlockBodyScrolling();
    }

    checkMobile() {
        this.setState({
            isMobile: window.innerWidth <= 768
        });
    }

    getOpacityFromLocalStorage() {
        const opacity = window.localStorage.getItem(PLAYLIST_OPACITY);
        return opacity ? opacity : '90';
    }

    changeOpacityDebounced(event: React.ChangeEvent<HTMLInputElement>) {
        const opacity = event.target.value;
        this.setState({ sliderOpacity: opacity });

        if (!this.debounceOpacitySlider) {
            this.debounceOpacitySlider = debounce(() => this.changeOpacity(), 100);
        }

        this.debounceOpacitySlider();
    }

    changeOpacity() {
        const opacity = this.state.sliderOpacity;
        window.localStorage.setItem(PLAYLIST_OPACITY, opacity.toString());
        this.setState({ opacity });
    }

    getOpacityStyle() {
        return {
            backgroundColor: `rgba(11,11,11,${parseFloat(this.state.opacity) / 100})`
        };
    }

    onEnterKey(e: React.KeyboardEvent, cb: () => void) {
        const key = e.keyCode || e.which;
        if (key === 13) {
            cb();
        }
    }

    @action
    addPlaylist() {
        if (!this._newPlaylist) return;

        const name = this._newPlaylist.value;
        if (!name) {
            toast("You didn't give your playlist a name?", { type: "error" });
            return;
        }
        this._newPlaylist.value = "";
        playlists.addPlaylist(name);
        this.addingPlaylist = false;
    }

    selectPlaylist(i: number) {
        playlists.selectPlaylist(i);
    }

    @action closeDialog() {

    }

    @action
    search() {
        if (!this._search) return;

        const query = this._search.value;
        this._search.value = "";
        playlists.runSearch(query);
    }

    @action
    startRemovingPlaylist(name: string, index: number) {
        this.playlistToRemove = { name, index };
        this.removingPlaylist = true;
    }

    @action
    removePlaylist() {
        if (!this.playlistToRemove) {
            return;
        }
        playlists.removePlaylist(this.playlistToRemove.index);
        this.removingPlaylist = false;
    }

    @action
    toggleMergePlaylists() {
        this.mergingPlaylists = !this.mergingPlaylists;
    }

    lockBodyScrolling() {
        // Save the original style first
        this.storeBodyStyles();
        
        // Get scrollbar width to prevent layout shift when scrollbar disappears
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        // Apply styles without causing reflow
        document.body.style.overflow = 'hidden';
        
        // Prevent layout shift by adding padding equal to scrollbar width
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
    }

    unlockBodyScrolling() {
        // Remove body locking styles
        if (document.body) {
            document.body.style.overflow = this.originalBodyStyle.overflow || '';
            document.body.style.paddingRight = '';
        }
    }

    @action
    async importPlaylist() {
        if (!this._importName || !this._importUrl) return;

        const name = this._importName.value;
        const url = this._importUrl.value;
        this._importName.value = "";
        this._importUrl.value = "";

        try {
            const result = await playlists.importYouTubePlaylist(name, url);
            if (result) {
                this.importingPlaylist = false;
            }
        } catch (e) {
            toast("Import playlist failed, better let someone know.", { type: "error" });
        }
    }

    renderPlaylistContent() {
        if (playlists.searching) {
            return <i className="fa fa-spin fa-4x fa-circle-o-notch playlist-loading" />;
        }

        if (playlists.openSearch) {
            if (playlists.search.length > 0) {
                const list = playlists.search.map((video, i) => {
                    const playlistPosClass = i % 2 === 0 ? "playlist-item-1" : "playlist-item-2";
                    let url = "";
                    let humanDuration = "";
                    let title = "";
                    let channelTitle = "";
                    let thumbnail = "";
                    let skipLink = "";

                    if (video.snippet) {
                        url = `https://www.youtube.com/watch?v=${video.id}`;
                        const duration = moment.duration(video.contentDetails.duration);
                        const hours = duration.hours();
                        const hoursDisplay = hours > 0 ? `${hours}h ` : "";
                        const mins = duration.minutes();
                        const secs = `0${duration.seconds()}`.slice(-2);
                        humanDuration = `${hoursDisplay}${mins}:${secs}`;
                        thumbnail = video.snippet.thumbnails.default.url;
                        title = video.snippet.title;
                        channelTitle = video.snippet.channelTitle;
                        skipLink = `https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${video.id}`;
                    } else if (video.title) {
                        url = video.permalink_url;
                        const duration = moment.duration(video.duration);
                        const hours = duration.hours();
                        const hoursDisplay = hours > 0 ? `${hours}h ` : "";
                        const mins = duration.minutes();
                        const secs = `0${duration.seconds()}`.slice(-2);
                        humanDuration = `${hoursDisplay}${mins}:${secs}`;
                        thumbnail = video.artwork_url || video.user.avatar_url || Favicon;
                        title = video.title;
                        channelTitle = video.user?.username || "";
                    }

                    return (
                        <li className={playlistPosClass} key={i}>
                            <a target="_blank" href={url} rel="noopener noreferrer">
                                <img className="pl-thumbnail" src={thumbnail} alt={title} />
                            </a>
                            <span className="pl-media-title">{title}</span>
                            <span className="pl-time">
                                <i className="fa fa-clock-o" /> {humanDuration}
                            </span>
                            <span className="pl-channel">{channelTitle?.trim()}</span>
                            <i
                                onClick={() => playlists.addFromSearch(i)}
                                className="fa fa-2x fa-plus add-to-playlist-btn"
                            />
                            {skipLink && (
                                <a
                                    target="_blank"
                                    href={skipLink}
                                    rel="noopener noreferrer"
                                >
                                    <i className="fa fa-2x fa-globe add-to-playlist-btn" />
                                </a>
                            )}
                        </li>
                    );
                });
                return <ul id="playlist-ul">{list}</ul>;
            }
            return <div className="search-empty">No results.</div>;
        }

        if (playlists.playlist.length > 0) {
            const list = playlists.playlist.map((video, i) => {
                const playlistPosClass = i % 2 === 0 ? "playlist-item-1" : "playlist-item-2";
                let humanDuration = "Unknown";

                if (video.duration) {
                    const duration = moment.duration(video.duration);
                    const hours = duration.hours();
                    const hoursDisplay = hours > 0 ? `${hours}h ` : "";
                    const mins = duration.minutes();
                    const secs = `0${duration.seconds()}`.slice(-2);
                    humanDuration = `${hoursDisplay}${mins}:${secs}`;
                }

                return (
                    <li className={playlistPosClass} key={i}>
                        <a target="_blank" href={video.url} rel="noopener noreferrer">
                            <img className="pl-thumbnail self-center" src={video.thumb} alt={video.title} />
                        </a>
                        <span className="pl-media-title">{video.title}</span>
                        <span className="pl-time">
                            <i className="fa fa-clock-o" /> {humanDuration}
                        </span>
                        <span className={`pl-channel ${video.user ? "self-center" : ""}`}>
                            {video.channel.trim()}
                            {video.user && <br />}
                            {video.user && `  (Grab: ${video.user})`}
                        </span>
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
            return <ol id="playlist-ol">{list}</ol>;
        }

        return <div className="empty-playlist">Empty playlist.</div>;
    }

    render() {
        const { open, onClose } = this.props;
        const { isMobile } = this.state;

        const playlistsList = playlists.playlistNames.map((name, i) => (
            <MenuItem key={i}>
                <div
                    onClick={() => this.selectPlaylist(i)}
                    className="cursor-pointer hover:bg-gray-800"
                >
                    <a>{name}</a>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            this.startRemovingPlaylist(name, i);
                        }}
                        className="fa fa-trash remove-playlist"
                    />
                </div>
            </MenuItem>
        ));

        const shuffle = playlists.hasPlaylist ? (
            <span
                onClick={() => playlists.shufflePlaylist()}
                className="playlist-shuffle-btn fa fa-random fa-2x"
                title="Shuffle this Playlist"
            />
        ) : null;

        const sortnameasc = playlists.hasPlaylist ? (
            <span
                onClick={() => playlists.sortPlaylist("asc", "title")}
                className="playlist-shuffle-btn fa fa-sort-alpha-asc fa-2x"
                title="Sort this Playlist Alphabetically"
            />
        ) : null;

        const sortnamedesc = playlists.hasPlaylist ? (
            <span
                onClick={() => playlists.sortPlaylist("desc", "title")}
                className="playlist-shuffle-btn fa fa-sort-alpha-desc fa-2x"
                title="Sort this Playlist Reverse Alphabetically"
            />
        ) : null;

        const sorttimeasc = playlists.hasPlaylist ? (
            <span
                onClick={() => playlists.sortPlaylist("asc", "duration")}
                className="playlist-shuffle-btn fa fa-sort-numeric-asc fa-2x"
                title="Sort this Playlist by shortest song first"
            />
        ) : null;

        const sorttimedesc = playlists.hasPlaylist ? (
            <span
                onClick={() => playlists.sortPlaylist("desc", "duration")}
                className="playlist-shuffle-btn fa fa-sort-numeric-desc fa-2x"
                title="Sort this Playlist by longest song first"
            />
        ) : null;

        const onclickHandler = () => {
            // Restore body styles before closing
            this.restoreBodyStyles();

            // Small delay to ensure DOM is ready
            setTimeout(() => {
                onClose(true);
            }, 10);
        };
        return (
            <>
                <Dialog
                    open={open}
                    onClose={this.handleClose}
                    className="fixed inset-0 z-50 playlist-dialog"
                    static
                >
                    <div className="flex min-h-screen">
                        <DialogBackdrop className="fixed inset-0 bg-black opacity-70" />

                        <DialogPanel
                            className={`relative bg-black w-full h-screen flex flex-col ${isMobile ? '' : 'playlist-desktop'}`}
                            style={this.getOpacityStyle()}
                        >
                            {/* Header with title and close button */}
                            <div className="playlist-header">
                                <DialogTitle as="h3" className="playlist-title">
                                    Playlist
                                </DialogTitle>
                                <button
                                    type="button"
                                    onClick={onclickHandler}
                                    className="playlist-close-btn"
                                >
                                    <i className="fa fa-times fa-lg"></i>
                                </button>
                            </div>

                            {/* Panel header with search and controls */}
                            <div id="playlists-panel-head" className="playlist-panel-head">
                                <div className="playlist-search-container">
                                    <div className="playlist-search-box-container">
                                        <input
                                            type="text"
                                            id="playlist-search-box"
                                            ref={el => { this._search = el; }}
                                            placeholder="Search"
                                            className="form-control md:w-8"
                                            onKeyPress={e => this.onEnterKey(e, this.search)}
                                        />
                                        <button
                                            onClick={this.search}
                                            className="playlist-search-btn"
                                        >
                                            <i className="fa fa-search"></i>
                                        </button>
                                        <div className="playlist-search-source hidden">
                                            <input
                                                type="radio"
                                                defaultChecked={playlists.searchSource === "youtube"}
                                                id="search-youtube"
                                                name="search-source"
                                                onClick={() => {
                                                    playlists.search = [];
                                                    playlists.searchSource = "youtube";
                                                }}
                                            />
                                            <label htmlFor="search-youtube">YouTube</label>
                                            <input
                                                type="radio"
                                                defaultChecked={playlists.searchSource === "soundcloud"}
                                                id="search-soundcloud"
                                                name="search-source"
                                                onClick={() => {
                                                    playlists.search = [];
                                                    playlists.searchSource = "soundcloud";
                                                }}
                                                className="ml-4"
                                            />
                                            <label htmlFor="search-soundcloud">Soundcloud</label>
                                        </div>
                                    </div>

                                    <div className="playlist-controls">
                                        <Menu as="div" className="playlist-selector">
                                            <MenuButton className="playlist-selector-btn">
                                                <div className="playlist-selector-content">
                                                    <div className="button-nooverflow">
                                                        {playlists.selectedPlaylistName || "Select Playlist"}
                                                    </div>
                                                    <span className="fa fa-chevron-down"></span>
                                                </div>
                                            </MenuButton>
                                            <MenuItems className="playlist-menu">
                                                <div className="dropdown-inner-text">
                                                    <MenuItem>
                                                        <a onClick={() => (this.addingPlaylist = true)} className="playlist-menu-item">
                                                            <i className="fa fa-plus"></i> New Playlist
                                                        </a>
                                                    </MenuItem>
                                                    <MenuItem>
                                                        <a onClick={() => (this.importingPlaylist = true)} className="playlist-menu-item">
                                                            <i className="fa fa-youtube-play"></i> Import Playlist
                                                        </a>
                                                    </MenuItem>
                                                    {playlistsList}
                                                </div>
                                            </MenuItems>
                                        </Menu>

                                        <div className="playlist-actions">
                                            <button onClick={() => (this.mergingPlaylists = true)} className="playlist-action-btn">
                                                <i className="fa fa-code-fork fa-lg" title="Merge Two Playlists"></i>
                                            </button>
                                            <button onClick={() => playlists.exportPlaylist()} className="playlist-action-btn">
                                                <i className="fa fa-download fa-lg" title="Download Playlist (json)"></i>
                                            </button>
                                            {sorttimedesc && sorttimedesc}
                                            {sorttimeasc && sorttimeasc}
                                            {sortnamedesc && sortnamedesc}
                                            {sortnameasc && sortnameasc}
                                            {shuffle && shuffle}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel content with playlist or search results */}
                            <div id="playlists-panel-display" className="playlist-content">
                                {this.renderPlaylistContent()}
                            </div>

                            {/* Panel footer with opacity slider */}
                            <div id="playlists-footer" className="playlist-footer">
                                <span>Playlist opacity:</span>
                                <span className="slidecontainer">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        className="slider"
                                        id="opacityRange"
                                        value={this.state.sliderOpacity}
                                        onChange={this.changeOpacityDebounced}
                                    />
                                </span>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Keep secondary modals outside the Dialog */}
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
                        ref={el => { this._newPlaylist = el; }}
                        onKeyPress={e => this.onEnterKey(e, this.addPlaylist)}
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
                        Are you sure you want to remove the playlist &apos;{this.playlistToRemove?.name}&apos;?
                    </p>
                </Modal>

                <Modal
                    show={this.mergingPlaylists}
                    hideModal={() => this.toggleMergePlaylists()}
                    title="Merge Playlists"
                    leftButton={() => {
                        playlists.mergePlaylists(
                            $("#playlista").val() as string || "",
                            $("#playlistb").val() as string || "",
                            $("#newplaylistname").val() as string || ""
                        );
                        this.toggleMergePlaylists();
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
                    leftButtonText="Import"
                >
                    <div className="form-group">
                        <label>Playlist Name</label>
                        <input className="form-control" ref={el => { this._importName = el; }} />
                    </div>
                    <div className="form-group">
                        <label>Playlist URL</label>
                        <input className="form-control" ref={el => { this._importUrl = el; }} />
                    </div>
                </Modal>
            </>
        );
    }
}

export default observer(PlaylistsPanel);