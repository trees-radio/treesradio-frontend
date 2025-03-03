import {FC, JSX, RefObject, useCallback, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import ReactSlider from "react-slider";
import waitlist from "../stores/waitlist";
import playlists from "../stores/playlists";
import profile from "../stores/profile";
import playing, {VOLUME_NUDGE_FRACTION} from "../stores/playing";
import toast from "../utils/toast";
import cn from "classnames";
import $ from "cash-dom";
import {useOnClickOutside} from "usehooks-ts";

const loadingIconClass = "fa-spin fa-circle-o-notch";

const Grab: FC<{ onClose: VoidFunction }> = ({onClose}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const handleClose = useCallback(onClose, [onClose]);

    useOnClickOutside(ref as RefObject<HTMLDivElement>, () => handleClose());

    const grabPlaylists = playlists.playlists.map((p, _i) => {
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
                handleClose();
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

const Toolbar: FC = () => {
    const [grabbing, setGrabbing] = useState(false);
    const [waitlistButtonText, setWaitlistButtonText] = useState<JSX.Element>((<>Join Waitlist</>));
    const cstmEaseInOut = useRef<HTMLElement | null>(document.getElementById("cstmEaseIn"));

    const togglePlaylistsPanel = () => {
        if (!playlists.init) {
            return toast("You must be logged in to use playlists!", {type: "error"});
        }
        
        // Set local state first
        const newPanelState = !playlists.panelOpen;
        playlists.setPanelOpen(newPanelState);
        
        if (playlists.selectedPlaylistName && cstmEaseInOut.current) {
            cstmEaseInOut.current.style.setProperty(
                "--PLlength",
                playlists.selectedPlaylistName.length.toString() + "em"
            );
        }
    }

    const toggleGrab = (value?: boolean) => {
        if (!profile.user) {
            return toast("You must be logged in to grab this song!", {type:"error"});
        }
        setGrabbing(value ?? !grabbing);
    }

    // Waitlist Button Text
    useEffect(() => {
        switch (true) {
            case waitlist.bigButtonLoading:
                setWaitlistButtonText(<i className={`fa fa-spin fa-circle-o-notch`}/>);
                break;
            case waitlist.isPlaying:
                setWaitlistButtonText(<>Skip Song</>);
                break;
            case waitlist.inWaitlist:
                setWaitlistButtonText(<>Leave Waitlist</>);
                break;
            default:
                setWaitlistButtonText(<>Join Waitlist</>);
        }
    }, [waitlist.bigButtonLoading, waitlist.isPlaying, waitlist.inWaitlist, loadingIconClass]);
    const selectedPlaylistName = playlists.selectedPlaylistName;
    return (
        <div id="playlists-component">
        <div id="playlists-bar">
                <div
                    id="playlists-open-button"
                    onClick={togglePlaylistsPanel}
                >
                    <i id="playlists-open-icon" className={cn([
                        "fa fa-4x",
                        playlists.panelOpen && playlists.init
                            ? "fa-angle-double-down"
                            : "fa-angle-double-up"
                    ])}/>
                </div>
                <div id="playlist-metadata">
                    <a
                        id={
                            selectedPlaylistName &&
                            selectedPlaylistName.length > 32
                                ? "cstmEaseIn"
                                : undefined
                        }
                        className={"current-playlist-name"}
                    >
                        {selectedPlaylistName}
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
                  className={cn([
                      "current-playing-media",
                      (playing.data.info.title?.length ?? 0) > 35 && "marquee"
                  ])}
              >
                {playing.data.info.title}
              </a>
            </span>
                    <span className="toolbar-playertxt">Player:</span>
                    <a
                        className={cn([
                            "current-playing-user",
                            playing.data.info.user && playing.data.info.user.length > 18 && "marquee"
                        ])}
                        onClick={() => {
                            const chatInput = $("#chatinput");
                            chatInput.val(`${chatInput.val()} @${playing.data.info.user} `);
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
                            waitlist.inWaitlist && "join-waitlist-pressed"
                        )}
                        onClick={() => waitlist.bigButton()}
                    >
                        {waitlistButtonText}
                    </div>
                </div>
                {
                    grabbing && <Grab onClose={() => toggleGrab(false)}/>
                }
                {/*<GrabPlaylists*/}
                {/*    grabbing={this.grabbing}*/}
                {/*    toggleGrab={(setting) => this.toggleGrab(setting)}*/}
                <div className="grab-button" onClick={() => setGrabbing(!grabbing)}>
                    <i className={cn([
                        "fa",
                        playing.grabLoading
                            ? "fa-spin fa-circle-o-notch"
                            : playing.grabbed
                                ? "fa-plus-square"
                                : "fa-plus-square-o",
                    ])}/>
                    <span className="feedback-grab">{playing.grabs}</span>
                </div>
                <div className="volume-slider" onWheel={(e) => playing.nudgeVolume(e.deltaY < 0 ? "UP" : "DOWN")}>
                    <i className={cn([
                        "fa volume-slider-icon",
                        playing.volume < 0.1 && "fa-volume-off",
                        playing.volume < 0.6 && "fa-volume-down",
                        playing.volume >= 0.6 && "fa-volume-up"
                    ])}/>
                    <ReactSlider
                        max={1}
                        step={VOLUME_NUDGE_FRACTION}
                        defaultValue={0.15}
                        value={playing.volume}
                        className="volume-slider-node"
                        onChange={(e) => playing.setVolume(e)}
                    />
                </div>
                <div
                    className="like-button"
                    onClick={() => waitlist.isPlayingAllowSelfUpvote && playing.like()}
                >
                    <i className={cn([
                        "fa",
                        playing.likeLoading
                            ? "fa-spin fa-circle-o-notch"
                            : playing.liked
                                ? "fa-thumbs-up"
                                : "fa-thumbs-o-up"
                    ])}/>
                    <span className="feedback-likes">{playing.likes}</span>
                </div>
                <div
                    className="dislike-button"
                    onClick={() => waitlist.isPlayingAllowSelfUpvote && playing.dislike()}
                >
                    <i className={cn([
                        "fa",
                        playing.dislikeLoading
                            ? "fa-spin fa-circle-o-notch"
                            : playing.disliked
                                ? "fa-thumbs-down"
                                : "fa-thumbs-o-down"
                    ])}/>
                    <span className="feedback-dislikes">{playing.dislikes}</span>
                </div>
            </div>
        </div>
    );
}

const $Toolbar = observer(Toolbar);

export {$Toolbar as Toolbar};
