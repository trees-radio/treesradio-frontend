// NEW MAIN COMPONENT

import React from "react";
import {observer} from "mobx-react";

import app from "stores/app";

import Nav from "./Nav";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Player from "./Player";

@observer
class Main extends React.Component {
  checkAprilFools() {
    const curtime = new Date(),
      curday = curtime.getDate(),
      curmonth = curtime.getMonth() + 1;
    if (curmonth == 4 && curday == 1) {
      this.aprilFoolsShenanigans();
      return "april-fools";
    }
    return "noop";
  }
  aprilFoolsShenanigans() {
    const me = this;
    setTimeout(function() {
      console.log("tee hee");
      if ($(".april-fools")) {
        $(".april-fools")
          .removeClass("april-fools")
          .addClass("noop");
      } else {
        $(".noop")
          .removeClass("noop")
          .addClass("april-fools");
      }
      me.aprilFoolsShenanigans();
    }, Math.floor(Math.random() * 5000) + 300000);
  }
  render() {
    if (!app.init) {
      let randmsg = [
        // No messages over 40 characters
        "Grab a Bong and Sing A Long!",
        "Wands at the Ready - MobBarley",
        "Pimp Squad, Holdin it Down",
        "Livin' Young 'n Wild 'n Freeee",
        "Loading... Or am I?",
        "Grinding Vigorously",
        "Poking Badgers with Spoons",
        "Eek! Exciting!",
        "Where's my Lighter?",
        'No officer, it\'s "Hi, how are you?"',
        "Home of the original musical inspiration"
      ];
      return (
        <div className="main-load">
          <div className="container main-loadingcard">
            <div className="main-vcenter">
              <div className="main-center">
                <center>
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
      <div className={this.checkAprilFools()}>
        <Nav /> {/* Start Container */}
        <div className="container-fluid">
          <div className="row">
            {" "}
            {/* Video Component */}
            <div className="col-lg-9 col-md-9 col-sm-9 col-xs-9 no-float" id="videotoplevel">
              <Player />
              <div id="playlists-container">
                <Toolbar />
              </div>
            </div>
            {/* Chat Component */}
            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 no-float" id="chattoplevel">
              {" "}
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
        </div>
        <a id="exportPlaylistDownload" />
      </div>
    );
  }
}

export default Main;
