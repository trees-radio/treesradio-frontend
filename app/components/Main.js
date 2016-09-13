// NEW MAIN COMPONENT

import React from 'react';
import {observer} from 'mobx-react';

import fbase from 'stores/fbase';

import Nav from './Nav';
import Sidebar from './Sidebar';

import DevTools from 'mobx-react-devtools';
var DevTool;
if (process.env.NODE_ENV !== 'production') {
  DevTool = DevTools;
}

export default @observer class Main extends React.Component {
  render() {
    if (!fbase.init) {
      return (<div>Connecting to Firebase...</div>);
    }
    return (
      <div>
        <DevTool position={{top: 10, left: 200}}/>
        <Nav/>
        {/* Start Container */}
        <div className="container-fluid">
          <div className="row">
            {/* Video Component */}
            <div className="col-lg-9 col-md-9 col-sm-9 col-xs-9 no-float" id="videotoplevel">
              <div id="vidcontainer" className="">
                {/* <Video
                  controls={this.state.controls}
                  playingMedia={this.state.playingMedia}
                  videoOnProgress={this.videoOnProgress}
                  localPlayerPos={this.state.localPlayerPos.position}
                  user={this.state.user}
                /> */}
              </div>
              <div id="playlists-container">
                {/* <Playlists
                  playlistsOpen={this.state.playlistsOpen}
                  playlistsOpenToggle={this.playlistsOpenToggle}
                  searchForVideo={this.searchForVideo}
                  playlistsPanelView={this.state.playlistsPanelView}
                  currentSearch={this.state.currentSearch}
                  addNewPlaylist={this.addNewPlaylist}
                  playlists={this.state.playlists}
                  currentPlaylist={this.state.currentPlaylist}
                  removePlaylist={this.removePlaylist}
                  selectPlaylist={this.selectPlaylist}
                  addToPlaylist={this.addToPlaylist}
                  removeFromPlaylist={this.removeFromPlaylist}
                  moveTopPlaylist={this.moveTopPlaylist}
                  updateVolume={this.updateVolume}
                  controls={this.state.controls}
                  playingMedia={this.state.playingMedia}
                  inWaitlist={this.state.user.inWaitlist}
                  toggleWaiting={this.toggleWaiting}
                  handleLikeButton={this.handleLikeButton}
                  handleDislikeButton={this.handleDislikeButton}
                  handleGrabButton={this.handleGrabButton}
                  userFeedback={this.state.userFeedback}
                  volumeNudge={this.volumeNudge}
                  shufflePlaylist={this.shufflePlaylist}
                  waitlist={this.state.waitlist}
                  user={this.state.user}
                  playlistImport={this.playlistImport}
                /> */}
              </div>
            </div>
            {/* Chat Component */}
            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 no-float" id="chattoplevel" >
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
              <Sidebar/>
            </div>
            {/* End Container */}
          </div>
        </div>
      </div>
    )
  }
}
