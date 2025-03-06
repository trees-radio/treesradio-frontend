import React from "react";
import { observable, action, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { debounce } from 'lodash';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
} from '@headlessui/react';
import playlists from "../../stores/playlists";
import Modal from "../utility/Modal";
import toast from "../../utils/toast";
import $ from "jquery";
import PlaylistSearch from "./PlaylistSearch";
import PlaylistContent from "./PlaylistContent";
import PlaylistSelector from "./PlaylistSelector";
import PlaylistControls from "./PlaylistControls";

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

    render() {
        const { open, onClose } = this.props;
        const { isMobile } = this.state;

        const playlistsList = playlists.playlistNames.map((name, i) => ({
            name,
            index: i,
            onSelect: () => this.selectPlaylist(i),
            onRemove: () => this.startRemovingPlaylist(name, i)
        }));

        const onclickHandler = () => {
            // Restore body styles before closing
            this.restoreBodyStyles();

            // Small delay to ensure DOM is ready
            setTimeout(() => {
                onClose(false);
            }, 10);
        };

        return (
            <>
                <Dialog
                    open={open || false}
                    onClose={onclickHandler}
                    className="fixed inset-0 z-50 playlist-dialog"
                >
                    <div className="flex min-h-screen">
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
                                    <PlaylistSearch />
                                    
                                    <div className="playlist-controls">
                                        <PlaylistSelector 
                                            playlists={playlistsList}
                                            onAddPlaylist={() => this.addingPlaylist = true}
                                            onImportPlaylist={() => this.importingPlaylist = true}
                                        />
                                        
                                        <PlaylistControls 
                                            onMergePlaylists={() => this.mergingPlaylists = true}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Panel content with playlist or search results */}
                            <div id="playlists-panel-display" className="playlist-content">
                                <PlaylistContent />
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