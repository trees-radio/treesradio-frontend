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
import events from "stores/events";

@observer
class Main extends React.Component {
  state = {
    show420: false,
    isPlaylistOpen: false
  };

  componentDidMount() {
    console.log("Main component mounted, app.init:", app.init);
    this.check420();

    // Fallback initialization
    this.initTimeout = setTimeout(() => {
      if (!app.init) {
        console.log("Forcing initialization after timeout");
        runInAction(() => {
          app.proceed = true;
        });
      }
    }, 5000);
  }

  componentWillUnmount() {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
    }
  }

  togglePlaylist = () => {
    this.setState((state) => ({ isPlaylistOpen: !state.isPlaylistOpen }));
  };

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
    console.log("Main render, app.init:", app.init);
    
    if (!app.init) {
      events.register("force_refresh", () => {
        window.location.reload();
      });

      const randmsg = [
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
                  {randmsg[Math.floor(Math.random() * randmsg.length)]}
                  <br />
                  <i className="fa fa-spin fa-2x fa-circle-o-notch loadingscreenwheel" />
                </center>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`${this.checkAprilFools()} ${this.isPlaylistOpen()}`} id="app-grid">
        <Nav show420={this.state.show420} />
        <div id="videotoplevel">
          <Player />
        </div>
        <div id="toolbar">
          <div id="playlists-container">
            <Toolbar togglePlaylist={this.togglePlaylist} />
          </div>
          <a id="exportPlaylistDownload" />
        </div>
        <div id="chattoplevel">
          <ToastContainer 
            position="top-right" 
            draggable={false}
            autoClose={8000}
          />
          <Sidebar />
        </div>
      </div>
    );
  }
}

export default Main;