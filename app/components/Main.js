// NEW MAIN COMPONENT

import React from "react";
import {observer} from "mobx-react";

// import fbase from 'stores/fbase';
// import profile from 'stores/profile';
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
      return (
        <div className="main-load">
          <i className="fa fa-spin fa-4x fa-circle-o-notch main-loading" />
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
