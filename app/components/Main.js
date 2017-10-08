// NEW MAIN COMPONENT

import React from "react";
import {observer} from "mobx-react";

import app from "stores/app";

import Nav from "./Nav";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Player from "./Player";

import DevTools from "mobx-react-devtools";
var DevTool;
if (process.env.NODE_ENV !== "production") {
  DevTool = <DevTools position={{top: 10, left: 300}} />;
}

@observer
export default (class Main extends React.Component {
  render() {
    if (!app.init) {
      let randmsg = [
// No messages over 40 characters
        'Grab a Bong and Sing A Long!',
        'Wands at the Ready - MobBarley',
        'Pimp Squad, Holdin it Down',
        "Livin' Young 'n Wild 'n Freeee",
        'Loading... Or am I?',
        'Grinding Vigorously',
        'Poking Badgers with Spoons',
        'Eek! Exciting!',
        'Where\'s my Lighter?',
        'No officer, it\'s "Hi, how are you?"',
        'Home of the original musical inspiration'
      ];
      return (
        <div className="main-load">
          <div className="container main-loadingcard">
            <div className="main-vcenter">
                <div className="main-center">
                  <center>{randmsg[Math.floor(Math.random() * randmsg.length)]}
                  <br/>
                  <i className="fa fa-spin fa-2x fa-circle-o-notch loadingscreenwheel" />
                  </center></div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        {DevTool}
        <Nav />
        {/* Start Container */}
        <div className="container-fluid">
          <div className="row">
            {/* Video Component */}
            <div className="col-lg-9 col-md-9 col-sm-9 col-xs-9 no-float" id="videotoplevel">
              <Player />
              <div id="playlists-container">
                <Toolbar />
              </div>
            </div>
            {/* Chat Component */}
            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 no-float" id="chattoplevel">
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
      </div>
    );
  }
});
