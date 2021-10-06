// NEW MAIN COMPONENT

import React from "react";
import { observer } from "mobx-react";

import app from "stores/app";

import Nav from "./Nav";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Player from "./Player";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import profile from "stores/profile";
import { observable } from "mobx";
import events from "stores/events";

toast.configure({ autoClose: 8000, position: toast.POSITION.TOP_CENTER });

@observer
class Main extends React.Component {
  //#region test shit

  @observable
  legacyInterface = false;

  @observable
  gifsHidden = false;

  @observable
  resettingPassword = false;

  @observable
  showHelp = false;

  @observable
  settingAvatar = false;
  @observable
  avatarField = "";

  @observable
  changingPassword = false;

  @observable
  changingEmail = false;

  constructor(props) {
    super(props);
    this.state = { show420: false, isPlaylistOpen: false };
    this.togglePlaylist = this.togglePlaylist.bind(this);
  }

  componentDidMount() {
    this.check420();
  }

  togglePlaylist() {
    this.setState((state) => ({ isPlaylistOpen: !state.isPlaylistOpen }));
  }

  onEnterKey(e, cb) {
    var key = e.keyCode || e.which;
    if (key === 13) {
      cb();
    }
  }

  addUsername() {
    profile.updateUsername(this._username.value.substr(0, 24));
  }

  async sendPassReset() {
    const result = await profile.sendPassReset(this._resetEmail.value);
    if (result) this.resettingPassword = false;
  }

  //#endregion

  checkAprilFools() {
    const curtime = new Date(),
      curday = curtime.getDate(),
      curmonth = curtime.getMonth() + 1;
    if (curmonth === 4 && curday === 1) {
      this.aprilFoolsShenanigans();
      return "april-fools";
    }
    return "noop";
  }

  check420() {
    const curtime = new Date(),
      curday = curtime.getDate(),
      curmonth = curtime.getMonth() + 1;
    if (curmonth === 4 && curday === 20) {
      this.effects420();
    }
  }

  aprilFoolsShenanigans() {
    const me = this;
    setTimeout(function () {
      if ($(".april-fools")) {
        $(".april-fools").removeClass("april-fools").addClass("noop");
      } else {
        $(".noop").removeClass("noop").addClass("april-fools");
      }
      me.aprilFoolsShenanigans();
    }, Math.floor(Math.random() * 5000) + 300000);
  }

  effects420() {
    this.setState({ show420: true });
  }

  isPlaylistOpen() {
    return this.state.isPlaylistOpen ? "playlist-open" : "";
  }

  render() {
    if (!app.init) {
      events.register("force_refresh", () => {
        location.reload();
      });
      let randmsg = [
        // No messages over 40 characters
        "Grab a Bong and Sing A Long!",
        "Pimp Squad, Holdin it Down",
        "Livin' Young 'n Wild 'n Freeee",
        "Loaded... Or am I?",
        "Grinding Vigorously",
        "More uptime than Facebook",
        "Poking Badgers with Spoons",
        "Where's my Lighter?",
        'No officer, it\'s "Hi, how are you?"',
        "Home of the original musical inspiration",
      ];
      return (
        <div className="main-load">
          <div className="container main-loadingcard">
            <div className="main-vcenter">
              <div className="main-center">
                <center className="loading-txt">
                  {" "}
                  {randmsg[Math.floor(Math.random() * randmsg.length)]} <br />
                  <i className="fa fa-spin fa-2x fa-circle-o-notch loadingscreenwheel" />
                </center>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div
        className={this.checkAprilFools() + " " + this.isPlaylistOpen()}
        id="app-grid"
      >
        <link
          href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
          rel="stylesheet"
          integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"
          crossOrigin="anonymous"
        />
        <Nav show420={this.state.show420} /> {/* Start Container */}{" "}
        {/* Video Component */}
        <div id="videotoplevel">
          <Player />
        </div>
        <div id="toolbar">
          <div id="playlists-container">
            <Toolbar togglePlaylist={this.togglePlaylist} />
          </div>
          <a id="exportPlaylistDownload" />
        </div>
        {/* Chat Component */}
        <div id="chattoplevel">
          <ToastContainer />{" "}
          {/* <Sidebar
                                loginData={this.state.user}
                                chatData={this.state.chat}
                                sendMsg={this.handleSendMsg}
                                loginState={this.state.loginstate}
                                currentSidebar={this.state.currentSidebar}
                                changeSidebar={this.changeSidebar}
                                userPresence={this.state.userPresence}
                                waitlist={this.state.waitlist}
                                staff={this.state.staff}
                                chatlock={this.state.chatlock}
                              /> */}
          <Sidebar />
        </div>
        {/* End Container */}
      </div>
    );
  }
}

export default Main;
