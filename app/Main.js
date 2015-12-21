//MAIN JS

// Sentry Error Reporting
Raven.config('https://870758af6d504cf08cda52138702ccd9@app.getsentry.com/61873').install()

// React
import React from 'react';

// Firebase
import Firebase from 'firebase';
import Rebase from 're-base';
var base = Rebase.createClass(window.__env.firebase_origin);

// More libraries
import sweetAlert from 'sweetalert';
import _ from 'lodash';
import axios from 'axios';
import cookie from 'react-cookie';

// TreesRadio utility functions
import TRreg from './utils/registration.js';
// TRreg.example();

// Components
import Nav from './components/Nav/Nav.js';
import Chat from './components/Chat/Chat.js';
import Video from './components/Video/Video.js';
import Playlists from './components/Playlists/Playlists.js';

// (S)CSS
import './Main.scss';

// YouTube API Key
var ytAPIkey = 'AIzaSyDXl5mzL-3BUR8Kv5ssHxQYudFW1YaQckA';


var Main = React.createClass({
    ///////////////////////////////////////////////////////////////////////
    // REACT-SPECIFIC & CONSTRUCTION
    ///////////////////////////////////////////////////////////////////////
    getInitialState: function(){
      let devCheckResult = false;
      if (window.__env.firebase_origin === "https://treesradio-dev.firebaseio.com") {
        devCheckResult = true;
      }
      return {
          devCheck: devCheckResult,
          loginstate: false,
          user: {},
          userLevel: 0,
          chat: [],
          registeredNames: {},
          playlistsOpen: false,
          currentPlaylist: {
            name: "",
            id: -1
          },
          playlistsPanelView: "blank",
          playlists: [],
          currentSearch: {
            data: {},
            items: []
          }
      }
    },
    componentWillMount: function(){

    },
    componentDidMount: function(){
        // grab base ref and listen for auth
        this.ref = new Firebase(window.__env.firebase_origin);
        this.ref.onAuth(this.authDataCallback);

        // grab chat messages and bind to chat array in state
        base.syncState(`chat/messages`, {
            context: this,
            state: 'chat',
            asArray: true,
            queries: {
              limitToLast: 100
            }
        });

        base.syncState(`registeredNames`, {
            context: this,
            state: 'registeredNames',
        });



        /////////////
        // TEST CODE
        /////////////
        // axios.get('https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&key=' + )
    },
    ///////////////////////////////////////////////////////////////////////
    // LOGIN & REGISTRATION
    ///////////////////////////////////////////////////////////////////////
    authenticateUser: function(eml, pw){
        this.ref.authWithPassword({
            email: eml,
            password: pw
        }, this.authHandler)
    },
    authHandler: function(error, authData){
        if (error) {
            console.log("Auth", error);
            sweetAlert({
              "title": "Login Error",
              "text": error,
              "type": "error",
              timer: 3000
            });
        } else {
            console.log("Auth success", authData);
        }

    },
    authDataCallback: function(authData){
        if (authData) {
            console.log(authData.uid + " logged in");
            base.syncState(`users/` + authData.uid, {
              context: this,
              state: 'user'
            });
            this.setState({ loginstate: true });
            base.syncState(`playlists/` + authData.uid, {
              context: this,
              state: 'playlists',
              asArray: true
            });
            // get last playlist from cookie and select it
            let selectPlaylist = this.selectPlaylist;
            let lastSelectedPlaylist = cookie.load('lastSelectedPlaylist');
            if (lastSelectedPlaylist === 0) {
              window.setTimeout(function() { selectPlaylist(lastSelectedPlaylist); }, 3000);
            } else if (lastSelectedPlaylist) {
              window.setTimeout(function() { selectPlaylist(lastSelectedPlaylist); }, 3000);
            } else {
              // no last playlist to set
            }
        } else {
            console.log("Logged out");
            this.setState({ loginstate: false });
        }
    },
    logoutUser: function(){
        this.ref.unauth();
        location.reload();
    },
    handleRegister: function(desiredEml, desiredPw){
      sweetAlert({
        title: "Register",
        text: "Choose your username!",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "Username"
      }, function(inputValue){
        let desiredUn = inputValue;
        let registeredNamesRef = new Firebase(window.__env.firebase_origin + "/registeredNames");
        registeredNamesRef.once("value", function(snapshot){
          let unExists = snapshot.child(desiredUn).exists();
          if (unExists) {
            sweetAlert({
              "title": "Registration Error",
              "text": "Desired username '" + desiredUn + "' already exists!",
              "type": "error",
              "timer": 3000
            });
          } else {
            let regRef = new Firebase(window.__env.firebase_origin);
            regRef.createUser({
              email: desiredEml,
              password: desiredPw
            },function(error, userData){
              if (error) {
                switch (error.code) {
                  case "EMAIL_TAKEN":
                      sweetAlert({
                        "title": "Registration Error",
                        "text": "That email address is already registered: " + desiredEml,
                        "type": "error",
                        "timer": 3000
                      });
                    break;
                  case "INVALID_EMAIL":
                      sweetAlert({
                        "title": "Registration Error",
                        "text": "That is not a valid email address: " + desiredEml,
                        "type": "error",
                        "timer": 3000
                      });
                    break;
                  default:
                    sweetAlert({
                      "title": "Registration Error",
                      "text": "An unknown registration error occurred: " + error,
                      "type": "error",
                      "timer": 3000
                    });
                }
              } else {
                let userRef = new Firebase(window.__env.firebase_origin + "/users/" + userData.uid);
                // create user entry
                userRef.child('username').set(desiredUn);
                // create registeredNames entry
                registeredNamesRef.child(desiredUn).child("uid").set(userData.uid);
                registeredNamesRef.child(desiredUn).child("email").set(desiredEml);
                sweetAlert({
                  "title": "Registration Successful",
                  "text": "You have succesfully registered! Welcome " + desiredUn + "! You may now log in.",
                  "type": "success"
                });
              }
            });

          }

        })

      });
    },
    ///////////////////////////////////////////////////////////////////////
    // CHAT
    ///////////////////////////////////////////////////////////////////////
    handleSendMsg: function(newMsgData) {
      // debugger;
      base.post('chat/messages', {
        data: this.state.chat.concat([newMsgData])
      })
      // this.setState({
      //   chat: this.state.chat.concat([newMsgData])
      // });
    },
    checkUserLevel: function(user){
      return _.get(this.state.registeredNames, user + ".level");
    },
    ///////////////////////////////////////////////////////////////////////
    // PLAYLISTS
    ///////////////////////////////////////////////////////////////////////
    playlistsOpenToggle: function() {
      if (!this.state.playlistsOpen) {
        this.setState({ playlistsOpen: true });
      } else {
        this.setState({ playlistsOpen: false });
      }
    },
    searchForVideo: function(searchQuery) {
      axios.get('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&type=video&videoEmbeddable=true&key=' + ytAPIkey + "&q=" + searchQuery)
        .then(function (response) {
          this.setState({ currentSearch: {
            data: response.data,
            items: response.data.items
          } });
        }.bind(this));
      this.setState({ playlistsPanelView: "search" });
    },
    addNewPlaylist: function(newName) {
      let currentAuth = base.getAuth();
      // debugger;
      if (currentAuth === null) {
        sweetAlert({
          "title": "Unable to Create Playlist",
          "text": "You are not logged in!",
          "type": "error",
          "timer": 3000
        });
        return;
      }
      sweetAlert({
        title: "New Playlist",
        text: "Choose a name for your playlist!",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "Playlist Name"
      }, function(inputValue){
        if (inputValue) {
          let newPlaylistName = inputValue;
          let newPlaylistCallback = function() {
            sweetAlert({
              "title": "Playlist Created",
              "text": "Playlist " + newPlaylistName + " is now created!",
              "type": "success",
              timer: 3000
            });
          }
          base.post('playlists/' + currentAuth.uid + "/" + newPlaylistName, {
            data: { name: newPlaylistName },
            then(){
              newPlaylistCallback();
            }
          });
        } else {

        }
      });
    },
    removePlaylist: function(index) {
      // debugger;
      let currentAuth = base.getAuth();
      let copyofPlaylists = this.state.playlists.slice(); //get copy of array
      sweetAlert({
        title: "Are you sure?",
        text: "You are about to remove a playlist, are you sure?",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false
      }, function(inputValue){
        if (inputValue) {
          console.log("Removing playlist of index", index);
          copyofPlaylists.splice(index, 1); //remove item from copy of array
          base.post('playlists/' + currentAuth.uid, { data: copyofPlaylists }); //update Firebase
          sweetAlert({
            "title": "Playlist Removed",
            "text": "Playlist has been removed!",
            "type": "success",
            timer: 3000
          });
        } else {

        }
      });
    },
    selectPlaylist: function(index) {
      // debugger;
      let currentAuth = base.getAuth();
      // console.log(this.state.playlists[index].name);
      let nameToSelect = this.state.playlists[index].name;
      let indexToSelect = index;
      this.setState({ currentPlaylist: {
        name: nameToSelect,
        id: index
      } });
      cookie.save('lastSelectedPlaylist', index);
      this.setState({ playlistsPanelView: "playlist" });
    },
    addToPlaylist: function(index) {
      // debugger;
      let currentAuth = base.getAuth();
      if (!this.state.playlists[this.state.currentPlaylist.id]) {
        sweetAlert({
          "title": "No Playlist Selected",
          "text": "You don't have a playlist selected to add to!",
          "type": "error",
          "timer": 3000
        });
        return;
      }

      let itemToAdd = this.state.currentSearch.items[index];
      let videoUrl = "https://www.youtube.com/watch?v=" + itemToAdd.id.videoId;
      let videoTitle = itemToAdd.snippet.title;
      let videoThumb = itemToAdd.snippet.thumbnails.default.url;
      let videoChannel = itemToAdd.snippet.channelTitle;
      let objectToAdd = {
        url: videoUrl,
        title: videoTitle,
        thumb: videoThumb,
        channel: videoChannel
      }

      if (this.state.playlists[this.state.currentPlaylist.id].entries instanceof Array) {
        let copyofPlaylist = this.state.playlists[this.state.currentPlaylist.id].entries.slice();
        copyofPlaylist.unshift(objectToAdd);
        base.post('playlists/' + currentAuth.uid + "/" + this.state.currentPlaylist.name + "/entries", {data: copyofPlaylist});
      } else {
        base.post('playlists/' + currentAuth.uid + "/" + this.state.currentPlaylist.name + "/entries", {data: [objectToAdd]});
      }
      this.setState({ playlistsPanelView: "playlist" });
    },
    removeFromPlaylist: function(index){
      console.log("Removing playlist item of index", index);
      let currentAuth = base.getAuth();
      let copyofPlaylist = this.state.playlists[this.state.currentPlaylist.id].entries.slice();
      copyofPlaylist.splice(index, 1); //remove item from copy of array
      base.post('playlists/' + currentAuth.uid + "/" + this.state.currentPlaylist.name + "/entries", { data: copyofPlaylist }); //update Firebase
    },
    ///////////////////////////////////////////////////////////////////////
    // RENDER
    ///////////////////////////////////////////////////////////////////////
    render: function(){
      return (
          <div>
              <Nav
                loginstate={this.state.loginstate}
                loginhandler={this.authenticateUser}
                logouthandler={this.logoutUser}
                logindata={this.state.user}
                handleRegister={this.handleRegister}
                checkUserLevel={this.checkUserLevel}
                devCheck={this.state.devCheck}
              />
            {/* Start Container */}
              <div className="container-fluid">
                  <div className="row">
            {/* Video Component */}
                      <div className="col-lg-9 no-float" id="videotoplevel">
                        {/* <h2 className="placeholder-txt">Video</h2> */}
                          <div id="vidcontainer" className="">
                            <Video />
                          </div>
                          <div id="playlists-container">
                            <Playlists
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
                               />
                          </div>
                      </div>
            {/* Chat Component */}
                      <div className="col-lg-3 no-float" id="chattoplevel" >
                        <div id="chatcontainertop" className="row">
                          <Chat
                            loginData={this.state.user}
                            chatData={this.state.chat}
                            sendMsg={this.handleSendMsg}
                            loginState={this.state.loginstate}
                            />
                      </div>
                    </div>
            {/* End Container */}
                  </div>
                </div>
      </div>
    )
  }
});

export default Main;
