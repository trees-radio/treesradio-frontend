import React, {FC, Fragment, useCallback, useRef, useState} from "react";
import {observer} from "mobx-react";
import {observable, action} from "mobx";
import ReactSlider from "react-slider";
import PlaylistsPanel from "./Toolbar/PlaylistsPanel";

import waitlist from "../stores/waitlist";
import playlists from "../stores/playlists.js";
import profile from "../stores/profile.js";
import playing, {VOLUME_NUDGE_FRACTION} from "../stores/playing";
import toast from "../utils/toast.js";
import cn from "classnames";
import $ from "jquery";
import {useOnClickOutside} from "../utils/hooks.js";

const loadingIconClass = "fa-spin fa-circle-o-notch";

const Grab: FC<{ onClose: VoidFunction }> = ({onClose}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const handleClose = useCallback(onClose, [onClose]);

    useOnClickOutside(ref, handleClose);

    const grabPlaylists = playlists.playlists.map((p, i) => {
        const songInPlaylist = playlists.checkPlaylistForSong(
            p.key,
            playing.data.info.url
        );

        return (
            <div key={p.key} className="grab-playlist" onClick={() => {
                if (songInPlaylist) {
                    return;
                }
                playing.grab(p.key);
            }}>
                {p.name}
                <span className={cn(
                    "fa",
                    songInPlaylist ? "fa-check-circle-o" : "fa-circle-o"
                )}/>
            </div>
        );
    });

    return <div ref={ref} className="grab-playlists">{grabPlaylists}</div>;
}

const Toolbar: FC<{ onPlaylistToggle: (open: boolean) => void }> = ({onPlaylistToggle}) => {
    const [panelOpen, setPanelOpen] = useState(false);
    const handlePlaylistToggle = useCallback(onPlaylistToggle, [onPlaylistToggle]);
    const cstmEaseInOut = useRef<HTMLElement | null>(document.getElementById("cstmEaseIn"));

    const togglePlaylistsPanel = () => {
        if (!playlists.init) {
            return toast.error("You must be logged in to use playlists!");
        }
        setPanelOpen(!panelOpen);
        handlePlaylistToggle(panelOpen);
        if (playlists.selectedPlaylistName && cstmEaseInOut.current) {
            cstmEaseInOut.current.style.setProperty(
                "--PLlength",
                playlists.selectedPlaylistName.length.toString() + "em"
            );
        }
    }

    return (
        <div id="playlists-component">
            {playlists.init && panelOpen ? <PlaylistsPanel open={panelOpen}/> : false}
            <div id="playlists-bar">
                <div
                    id="playlists-open-button"
                    onClick={() => togglePlaylistsPanel()}
                >
                    <i id="playlists-open-icon" className={cn([
                        "fa fa-4x",
                        panelOpen && playlists.init
                            ? "fa-angle-double-down"
                            : "fa-angle-double-up"
                    ])}/>
                </div>
                <div id="playlist-metadata">
                    <a
                        id={
                            playlists.selectedPlaylistName &&
                            playlists.selectedPlaylistName.length > 32
                                ? "cstmEaseIn"
                                : ""
                        }
                        className={"current-playlist-name"}
                    >
                        {playlists.selectedPlaylistName}
                    </a>
                    <br/>

                    <a
                        id={
                            playlists.selectedSong && playlists.selectedSong.length > 19
                                ? "cstmEaseIn2"
                                : ""
                        }
                        className={"current-selected-media"}
                    >
                        {playlists.selectedSong}
                    </a>
                </div>
                <div id="currentsong-metadata">
            <span className="current-song-title">
              <a
                  className={
                      playing.data.info.title && playing.data.info.title.length > 35
                          ? "current-playing-media marquee"
                          : "current-playing-media"
                  }
              >
                {playing.data.info.title}
              </a>
            </span>
                    <span className="toolbar-playertxt">Player:</span>
                    <a
                        className={
                            playing.data.info.user && playing.data.info.user.length > 18
                                ? "current-playing-user marquee"
                                : "current-playing-user"
                        }
                        onClick={() => {
                            $("#chatinput").val(
                                $("#chatinput").val() + " @" + playing.data.info.user + " "
                            );
                        }}
                    >
                        {" "}
                        {" " + playing.data.info.user}
                    </a>
                    <span className="media-time">
              {playing.humanCurrent} / {playing.humanDuration}
            </span>
                </div>
                <div className="waitlist">
                    <div
                        className={cn(
                            "join-waitlist",
                            waitlist.inWaitlist ? "join-waitlist-pressed" : false
                        )}
                        onClick={() => waitlist.bigButton()}
                    >
                        {waitlistButtonText}
                    </div>
                </div>
                {
                    this.grabbing && <Grab onClose={() => this.toggleGrab(false)}/>
                }
                {/*<GrabPlaylists*/}
                {/*    grabbing={this.grabbing}*/}
                {/*    toggleGrab={(setting) => this.toggleGrab(setting)}*/}
                {/*/>*/}
                <div className="grab-button" onClick={() => this.toggleGrab()}>
                    <i className={cn("fa", grabIcon)}/>
                    <span className="feedback-grab">{playing.grabs}</span>
                </div>
                <div className="volume-slider" onWheel={(e) => this.volumeWheel(e)}>
                    <i className={volClass}/>
                    <ReactSlider
                        max={1}
                        step={VOLUME_NUDGE_FRACTION}
                        defaultValue={0.15}
                        value={playing.volume}
                        className="volume-slider-node"
                        handleClassName="volume-slider-handle"
                        handleActiveClassName="volume-slider-handle-active"
                        barClassName="volume-slider-bar"
                        onChange={(e) => playing.setVolume(e)}
                        withBars={true}
                    />
                </div>
                <div
                    className="like-button"
                    onClick={() => {
                        if (!waitlist.playing) playing.like();
                    }}
                >
                    <i className={cn("fa", likeIcon)}/>
                    <span className="feedback-likes">{playing.likes}</span>
                </div>
                <div
                    className="dislike-button"
                    onClick={() => {
                        if (!waitlist.playing) playing.dislike();
                    }}
                >
                    <i className={cn("fa", dislikeIcon)}/>
                    <span className="feedback-dislikes">{playing.dislikes}</span>
                </div>
            </div>
        </div>
    );
}

const $Toolbar = observer(Toolbar);

export {$Toolbar as Toolbar};

/*
const GrabPlaylists = onClickOutside(
    observer(
        createClass({
            handleClickOutside() {
                if (this.props.grabbing) {
                    this.props.toggleGrab(false);
                }
            },

            render() {
                if (this.props.grabbing) {
                    const grabPlaylists = playlists.playlists.map((p, i) => {
                        let onClick = () => {
                        };
                        const songInPlaylist = playlists.checkPlaylistForSong(
                            p.key,
                            playing.data.info.url
                        );
                        if (!songInPlaylist) {
                            onClick = () => {
                                playing.grab(p.key);
                                this.props.toggleGrab();
                            };
                        }
                        const classes = cn(
                            "fa",
                            songInPlaylist ? "fa-check-circle-o" : "fa-circle-o"
                        );
                        return (
                            <div key={i} className="grab-playlist" onClick={onClick}>
                                {p.name}
                                <span className={classes}/>
                            </div>
                        );
                    });
                    return <div className="grab-playlists">{grabPlaylists}</div>;
                } else {
                    return <div/>;
                }
            },
        })
    )
);

*/

class Toolbar_ extends React.Component {
    @observable accessor cstmEaseInOut;

    componentDidMount() {
        this.cstmEaseInOut = document.getElementById("cstmEaseIn");
    }

    @observable accessor panelOpen = false;

    @action
    togglePlaylistsPanel() {
        if (playlists.init) {
            this.props.togglePlaylist();
            this.panelOpen = !this.panelOpen;
            if (playlists.selectedPlaylistName && this.cstmEaseInOut) {
                this.cstmEaseInOut.style.setProperty(
                    "--PLlength",
                    playlists.selectedPlaylistName.length.toString() + "em"
                );
            }
        } else {
            toast.error("You must be logged in to use playlists!");
        }
    }

    volumeWheel(e) {
        if (e.deltaY < 0) {
            //scroll up
            playing.nudgeVolume("UP");
        } else {
            //scroll down
            playing.nudgeVolume("DOWN");
        }
    }

    @observable accessor grabbing = false;

    @action
    toggleGrab(setting) {
        if (!profile.user) {
            toast.error("You must be logged in to grab songs!");
            return;
        }
        this.grabbing = typeof setting === "boolean" ? setting : !this.grabbing;
    }

    render() {
        let waitlistButtonText = "Join Waitlist";
        if (waitlist.bigButtonLoading) {
            waitlistButtonText = <i className={`fa ${loadingIconClass}`}/>;
        } else if (waitlist.isPlaying) {
            waitlistButtonText = "Skip Song";
        } else if (waitlist.inWaitlist) {
            waitlistButtonText = "Leave Waitlist";
        }

        let volClass;
        if (playing.volume < 0.1) {
            volClass = cn("fa", "fa-volume-off", "volume-slider-icon");
        } else if (playing.volume < 0.6) {
            volClass = cn("fa", "fa-volume-down", "volume-slider-icon");
        } else {
            volClass = cn("fa", "fa-volume-up", "volume-slider-icon");
        }

        let openButtonIcon =
            this.panelOpen && playlists.init
                ? "fa fa-angle-double-down fa-4x"
                : "fa fa-angle-double-up fa-4x";

        let grabIcon, likeIcon, dislikeIcon;

        if (playing.grabLoading) {
            grabIcon = loadingIconClass;
        } else {
            grabIcon = playing.grabbed ? "fa-plus-square" : "fa-plus-square-o";
        }

        if (playing.likeLoading) {
            likeIcon = loadingIconClass;
        } else {
            likeIcon = playing.liked ? "fa-thumbs-up" : "fa-thumbs-o-up";
        }

        if (playing.dislikeLoading) {
            dislikeIcon = loadingIconClass;
        } else {
            dislikeIcon = playing.disliked ? "fa-thumbs-down" : "fa-thumbs-o-down";
        }

        return (
            <div id="playlists-component">
                {playlists.init ? <PlaylistsPanel open={this.panelOpen}/> : false}
                <div id="playlists-bar">
                    <div
                        id="playlists-open-button"
                        onClick={() => this.togglePlaylistsPanel()}
                    >
                        <i id="playlists-open-icon" className={openButtonIcon}/>
                    </div>
                    <div id="playlist-metadata">
                        <a
                            id={
                                playlists.selectedPlaylistName &&
                                playlists.selectedPlaylistName.length > 32
                                    ? "cstmEaseIn"
                                    : ""
                            }
                            className={"current-playlist-name"}
                        >
                            {playlists.selectedPlaylistName}
                        </a>
                        <br/>

                        <a
                            id={
                                playlists.selectedSong && playlists.selectedSong.length > 19
                                    ? "cstmEaseIn2"
                                    : ""
                            }
                            className={"current-selected-media"}
                        >
                            {playlists.selectedSong}
                        </a>
                    </div>
                    <div id="currentsong-metadata">
            <span className="current-song-title">
              <a
                  className={
                      playing.data.info.title && playing.data.info.title.length > 35
                          ? "current-playing-media marquee"
                          : "current-playing-media"
                  }
              >
                {playing.data.info.title}
              </a>
            </span>
                        <span className="toolbar-playertxt">Player:</span>
                        <a
                            className={
                                playing.data.info.user && playing.data.info.user.length > 18
                                    ? "current-playing-user marquee"
                                    : "current-playing-user"
                            }
                            onClick={() => {
                                $("#chatinput").val(
                                    $("#chatinput").val() + " @" + playing.data.info.user + " "
                                );
                            }}
                        >
                            {" "}
                            {" " + playing.data.info.user}
                        </a>
                        <span className="media-time">
              {playing.humanCurrent} / {playing.humanDuration}
            </span>
                    </div>
                    <div className="waitlist">
                        <div
                            className={cn(
                                "join-waitlist",
                                waitlist.inWaitlist ? "join-waitlist-pressed" : false
                            )}
                            onClick={() => waitlist.bigButton()}
                        >
                            {waitlistButtonText}
                        </div>
                    </div>
                    {
                        this.grabbing && <Grab onClose={() => this.toggleGrab(false)}/>
                    }
                    {/*<GrabPlaylists*/}
                    {/*    grabbing={this.grabbing}*/}
                    {/*    toggleGrab={(setting) => this.toggleGrab(setting)}*/}
                    {/*/>*/}
                    <div className="grab-button" onClick={() => this.toggleGrab()}>
                        <i className={cn("fa", grabIcon)}/>
                        <span className="feedback-grab">{playing.grabs}</span>
                    </div>
                    <div className="volume-slider" onWheel={(e) => this.volumeWheel(e)}>
                        <i className={volClass}/>
                        <ReactSlider
                            max={1}
                            step={VOLUME_NUDGE_FRACTION}
                            defaultValue={0.15}
                            value={playing.volume}
                            className="volume-slider-node"
                            handleClassName="volume-slider-handle"
                            handleActiveClassName="volume-slider-handle-active"
                            barClassName="volume-slider-bar"
                            onChange={(e) => playing.setVolume(e)}
                            withBars={true}
                        />
                    </div>
                    <div
                        className="like-button"
                        onClick={() => {
                            if (!waitlist.playing) playing.like();
                        }}
                    >
                        <i className={cn("fa", likeIcon)}/>
                        <span className="feedback-likes">{playing.likes}</span>
                    </div>
                    <div
                        className="dislike-button"
                        onClick={() => {
                            if (!waitlist.playing) playing.dislike();
                        }}
                    >
                        <i className={cn("fa", dislikeIcon)}/>
                        <span className="feedback-dislikes">{playing.dislikes}</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default observer(Toolbar_);
