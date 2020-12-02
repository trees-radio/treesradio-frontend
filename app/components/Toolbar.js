import React from "react";
import {observer} from "mobx-react";
import {action, makeObservable} from "mobx";
import ReactSlider from "react-slider";
import PlaylistsPanel from "./Toolbar/PlaylistsPanel";

import waitlist from "stores/waitlist";
import playlists from "stores/playlists";
import profile from "stores/profile";
import playing, {VOLUME_NUDGE_FRACTION} from "stores/playing";
import toast from "utils/toast";
import classNames from "classnames";
import onClickOutside from "react-onclickoutside";
import createClass from "create-react-class";
import $ from "jquery";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


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
          var grabPlaylists = playlists.playlists.map((p, i) => {
            var onClick = () => {};
            var songInPlaylist = playlists.checkPlaylistForSong(p.key, playing.data.info.url);
            if (!songInPlaylist) {
              onClick = () => {
                playing.grab(p.key);
                this.props.toggleGrab();
              };
            }
            return (
              <div key={i} className="grab-playlist" onClick={onClick}>
                {p.name}
                <FontAwesomeIcon icon={['fas', 'circle-check']} />
              </div>
            );
          });
          return <div className="grab-playlists">{grabPlaylists}</div>;
        } else {
          return <div />;
        }
      }
    })
  )
);

@observer
class Toolbar extends React.Component {
  
  super() {
    makeObservable(this, {
      cstmEaseInOut: document.getElementById("cstmEaseIn"),
      setcstmEaseInOut: action,
      panelOpen: false,
      setPanelOpen: action,
      grabbing: false,
      setGrabbing: action
    });

  }

  componentDidMount() {

  }


  @action setcstmEaseInOut = (prop) => {
    this.cstmEaseInOut = prop;
  }

  @action setPanelOpen = (prop) => {
    this.panelOpen = prop;
  }

  @action setGrabbing = (prop) => {
    this.grabbing = prop;
  }

  togglePlaylistsPanel() {
    if (playlists.init) {
      this.setPanelOpen(!this.panelOpen);
      if (playlists.selectedPlaylistName) {
        this.cstmEaseInOut.style.setProperty('--PLlength', playlists.selectedPlaylistName.length.toString() + 'em');
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


  toggleGrab(setting) {
    if (!profile.user) {
      toast.error("You must be logged in to grab songs!");
      return;
    }
    var set = typeof setting === "boolean" ? setting : !this.grabbing;
    this.setGrabbing(set);
  }

  render() {
    let waitlistButtonText = "Join Waitlist";
    if (waitlist.bigButtonLoading) {
      waitlistButtonText = <FontAwesomeIcon icon={['fas', 'yin-yang']} size="2x" spin/>;
    } else if (waitlist.isPlaying) {
      waitlistButtonText = "Skip Song";
    } else if (waitlist.inWaitlist) {
      waitlistButtonText = "Leave Waitlist";
    }

    let volClass;
    if (playing.volume < 0.1) {
      volClass = <FontAwesomeIcon icon={['fas', 'volume-off']} />;
    } else if (playing.volume < 0.6) {
      volClass = <FontAwesomeIcon icon={['fas', 'volume-down']} />; 
    } else {
      volClass = <FontAwesomeIcon icon={['fas', 'volume-up']} />;
    }

    let openButtonIcon =
      this.panelOpen && playlists.init
        ? <FontAwesomeIcon icon={['fas', 'angle-double-down']} size="4x"/>
        : <FontAwesomeIcon icon={['fas', 'angle-double-up']} size="4x"/>;

    let grabIcon, likeIcon, dislikeIcon;

    if (playing.grabLoading) {
      grabIcon = <FontAwesomeIcon icon={['fas', 'yin-yang']} spin/>;
    } else {
      grabIcon = playing.grabbed ? <FontAwesomeIcon icon={['fas', 'plus-square']} /> : <FontAwesomeIcon icon={['far', 'plus-square']} />;
    }

    if (playing.likeLoading) {
      likeIcon = <FontAwesomeIcon icon={['fas', 'yin-yang']} spin/>;
    } else {
      likeIcon = playing.liked ? <FontAwesomeIcon icon={['fas', 'thumbs-up']} />: <FontAwesomeIcon icon={['far', 'thumbs-up']} />;
    }

    if (playing.dislikeLoading) {
      dislikeIcon = <FontAwesomeIcon icon={['fas', 'yin-yang']} spin/>;
    } else {
      dislikeIcon = playing.disliked ? <FontAwesomeIcon icon={['fas', 'thumbs-down']} /> : <FontAwesomeIcon icon={['far', 'thumbs-down']} />;
    }

    return (
      <div id="playlists-component">
        {playlists.init ? <PlaylistsPanel open={this.panelOpen} /> : false}
        <div id="playlists-bar" className="row">
          <div
              id="playlists-open-button"
              className="col-lg-1 col-md-1 col-sm-1 col-xs-1"
              onClick={() => this.togglePlaylistsPanel()}
          >
            <br/>
            <i id="playlists-open-icon">{openButtonIcon}</i>
          </div>
          <div id="playlist-metadata" className="col-lg-3 col-md-3 col-sm-3 col-xs-3">
            <a id={
              playlists.selectedPlaylistName && playlists.selectedPlaylistName.length > 32
                  ? "cstmEaseIn"
                  : ""
            } className={"current-playlist-name"}
            >
              {playlists.selectedPlaylistName}
            </a>
            <br/>

            <a id={
              playlists.selectedSong && playlists.selectedSong.length > 19
                  ? "cstmEaseIn2"
                  : ""
            } className={"current-selected-media"}
            >
              {playlists.selectedSong}
            </a>
          </div>
          <div id="currentsong-metadata" className="col-lg-4 col-md-4 col-sm-4 col-xs-4">
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
            <br/>
            <span className="toolbar-playertxt">
                Player:
              </span>
            <a
                className={
                  playing.data.info.user && playing.data.info.user.length > 18
                      ? "current-playing-user marquee"
                      : "current-playing-user"
                }
                onClick={() => {
                  $("#chatinput").val($("#chatinput").val() + " @" + playing.data.info.user + " ");
                }}
            >
              {" "}{" " + playing.data.info.user}
            </a>
            <span className="media-time">
              {playing.humanCurrent} / {playing.humanDuration}
            </span>
          </div>
          <div className="waitlist col-lg-2 col-md-2 col-sm-2 col-xs-2">
            <div
                className={classNames(
                    "join-waitlist",
                    waitlist.inWaitlist ? "join-waitlist-pressed" : false
                )}
                onClick={() => waitlist.bigButton()}
            >
              {waitlistButtonText}
            </div>
          </div>
          <div id="grabtrack" className="col-lg-1 col-md-1 col-sm-1 col-xs-1">
            <GrabPlaylists
              grabbing={this.grabbing}
              toggleGrab={setting => this.toggleGrab(setting)}
            />
            <div className="grab-button" onClick={() => this.toggleGrab()}>
              {grabIcon}
              <span className="feedback-grab">{playing.grabs}</span>
            </div>
            <div className="volume-slider" onWheel={e => this.volumeWheel(e)}>
              <i className="volume-slider-icon">{volClass}</i>
              <ReactSlider
                max={1}
                step={VOLUME_NUDGE_FRACTION}
                defaultValue={0.15}
                value={playing.volume}
                className="volume-slider-node"
                handleClassName="volume-slider-handle"
                handleActiveClassName="volume-slider-handle-active"
                barClassName="volume-slider-bar"
                onChange={e => playing.setVolume(e)}
                withBars={true}
              />
            </div>
          </div>
          <div id="vote" className="col-lg-1 col-md-1 col-sm-1 col-xs-1">
            <div
              className="like-button"
              onClick={() => {
                if (!waitlist.playing) playing.like();
              }}
            >
              {likeIcon}
              <span className="feedback-likes">{playing.likes}</span>
            </div>
            <div
              className="dislike-button"
              onClick={() => {
                if (!waitlist.playing) playing.dislike();
              }}
            >
              { dislikeIcon }
              <span className="feedback-dislikes">{playing.dislikes}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Toolbar;
