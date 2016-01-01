//MAIN JS

// Sentry Error Reporting
// Raven.config('https://870758af6d504cf08cda52138702ccd9@app.getsentry.com/61873').install()

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
// import TRreg from './utils/registration.js';
// TRreg.example();

// Components
import Nav from './components/Nav/Nav.js';
import Sidebar from './components/Sidebar/Sidebar'
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
          userPresence: [],
          playlistsOpen: false,
          currentPlaylist: {
            name: "",
            id: -1,
            key: ""
          },
          playlistsPanelView: "blank",
          playlists: [],
          currentSearch: {
            data: {},
            items: []
          },
          currentSidebar: 3, // 0 - 3 Chat -> About
          controls: {
            volume: 0.5
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

        base.bindToState('presence', {
          context: this,
          state: 'userPresence',
          asArray: true
        })

        base.syncState(`registeredNames`, {
            context: this,
            state: 'registeredNames'
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
            // console.log("Auth", error);
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
            // console.log(authData.uid + " logged in");
            this.userBindRef = base.syncState(`users/` + authData.uid, {
              context: this,
              state: 'user',
              then(){
                // let presenceRef;
                this.presenceRef = new Firebase(window.__env.firebase_origin + '/presence/' + this.state.user.username);
                this.presenceRef.onDisconnect().remove();
                this.presenceRef.child('online').set(true);
                window.setInterval(this.presencePing, 30000);
              }
            });
            this.setState({ loginstate: true });
            this.playlistsBindRef = base.syncState(`playlists/` + authData.uid, {
              context: this,
              state: 'playlists',
              asArray: true
            });
            // get last playlist from cookie and select it
            let selectPlaylist = this.selectPlaylist;
            let lastSelectedPlaylist = cookie.load('lastSelectedPlaylist');
            if (lastSelectedPlaylist === 0) {
              window.setTimeout(function() {
                selectPlaylist(lastSelectedPlaylist);
              }, 1000);
            } else if (lastSelectedPlaylist) {
              window.setTimeout(function() {
                selectPlaylist(lastSelectedPlaylist);
              }, 1000);
            } else {
              // no last playlist to set
            }
        } else {
              // console.log("Logged out");
            this.setState({ loginstate: false });
        }
    },
    presencePing: function() {
      console.log("Sending presence ping...");
      this.presenceRef.child('online').set(true);
    },
    logoutUser: function(){
        this.ref.unauth();
        location.reload();
    },
    handleRegister: function(desiredEml, desiredPw){
      sweetAlert({
        title: "Register",
        text: "Choose your username!\nYou must be 18 years of age or older to register!",
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
                }, function() {
                  location.reload();
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
      let chatRef = new Firebase(window.__env.firebase_origin + "/chat/messages");
      // chatRef.push({
      //   user: newMsgData.user,
      //   msgs: {
      //     0: newMsgData.msg
      //   }
      // });
      let lastMsg = this.state.chat[this.state.chat.length - 1];
      if (!lastMsg) {
        chatRef.push({
          user: newMsgData.user,
          msgs: {
            0: newMsgData.msg
          }
        });
        return;
      }
      // console.log("lastmsg:", lastMsg);
      if (lastMsg.user === this.state.user.username) {
        // let innerMsgRef = new Firebase(window.__env.firebase_origin + "/chat/messages/" + lastMsg.key + "/msgs");
        // console.log("newmsg", newMsgData);
        // let lastInnerMsg = lastMsg.msgs[lastMsg.msgs.length - 1];
        lastMsg.msgs.push(newMsgData.msg);
        // console.log("newmsg", lastMsg);

        // let newText = newMsgData.msg;
        // console.log("newtext", newText);
        // innerMsgRef.push({
        //
        // });
        base.post('chat/messages/' + lastMsg.key + '/msgs', {
          data: lastMsg.msgs
        });
      } else {
        chatRef.push({
          user: newMsgData.user,
          msgs: {
            0: newMsgData.msg
          }
        });
      }
      // base.post('chat/messages', {
      //   data: this.state.chat.concat([newMsgData])
      // })
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
    addNewPlaylist: function() {
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
        text: "Choose a name for your playlist!\n Note: Playlists will be limited to 23 characters.",
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
          // base.post('playlists/' + currentAuth.uid + "/" + newPlaylistName, {
          //   data: { name: newPlaylistName },
          //   then(){
          //     newPlaylistCallback();
          //   }
          // });
          base.push('playlists/' + currentAuth.uid, {
            data: { name: newPlaylistName },
            then(){
              newPlaylistCallback();
            }
          });
        } else {
          return;
        }
      });
    },
    removePlaylist: function(index) {
      // debugger;
      let currentAuth = base.getAuth();
      // let playlistsBindRef = this.playlistsBindRef;
      let copyofPlaylists = this.state.playlists.slice(); //get copy of array
      sweetAlert({
        title: "Are you sure?",
        text: "You are about to remove a playlist, are you sure?",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false
      }, function(inputValue){
        if (inputValue) {
          // console.log("Removing playlist of index", index);
          copyofPlaylists.splice(index, 1); //remove item from copy of array
          base.post('playlists/' + currentAuth.uid, { data: copyofPlaylists }); //update Firebase
          sweetAlert({
            "title": "Playlist Removed",
            "text": "Playlist has been removed!",
            "type": "success",
            timer: 3000
          });
        } else {
          return;
        }
      });
      this.setState({
        currentPlaylist: {
          name: "",
          id: -1
        },
        playlistsPanelView: "blank"
      });
    },
    selectPlaylist: function(index) {
      // debugger;
      // let currentAuth = base.getAuth();
      // console.log(this.state.playlists[index].name);
      let nameToSelect = this.state.playlists[index].name;
      let keyToSelect = this.state.playlists[index].key;
      if (nameToSelect.length > 23) {
        let maxLength = 23;
        nameToSelect = nameToSelect.substring(0,maxLength) + "...";
      }
      // let indexToSelect = index;
      this.setState({ currentPlaylist: {
        name: nameToSelect,
        id: index,
        key: keyToSelect
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

      if (this.state.playlists[this.state.currentPlaylist.id].entries instanceof Array) { // check if there's already an array there
        let copyofPlaylist = this.state.playlists[this.state.currentPlaylist.id].entries.slice(); // get copy of array
        copyofPlaylist.unshift(objectToAdd); // push new item onto front of array
        base.post('playlists/' + currentAuth.uid + "/" + this.state.currentPlaylist.key + "/entries", {data: copyofPlaylist}); // push new array to Firebase
      } else {
        base.post('playlists/' + currentAuth.uid + "/" + this.state.currentPlaylist.key + "/entries", {data: [objectToAdd]});
      }
      this.setState({ playlistsPanelView: "playlist" });
    },
    removeFromPlaylist: function(index){
      // console.log("Removing playlist item of index", index);
      let currentAuth = base.getAuth();
      let copyofPlaylist = this.state.playlists[this.state.currentPlaylist.id].entries.slice();
      copyofPlaylist.splice(index, 1); //remove item from copy of array
      base.post('playlists/' + currentAuth.uid + "/" + this.state.currentPlaylist.key + "/entries", { data: copyofPlaylist }); //update Firebase
    },
    moveTopPlaylist: function(index){
      // console.log("Moving top", index);
      let currentAuth = base.getAuth();
      let copyofPlaylist = this.state.playlists[this.state.currentPlaylist.id].entries.slice(); // get copy of array
      let movingItem = copyofPlaylist.splice(index, 1); // remove item from array
      // console.log(copyofPlaylist);
      // console.log("Moving item", movingItem);
      copyofPlaylist.unshift(movingItem[0]); // put item at front of array
      // console.log(copyofPlaylist);
      base.post('playlists/' + currentAuth.uid + "/" + this.state.currentPlaylist.key + "/entries", {data: copyofPlaylist}); // push update to Firebase
    },

    ///////////////////////////////////////////////////////////////////////
    // SIDEBAR CHANGER
    ///////////////////////////////////////////////////////////////////////
    changeSidebar: function(n) {
      this.setState({ currentSidebar: n });
    },



    ///////////////////////////////////////////////////////////////////////
    // VIDEO CONTROLS
    ///////////////////////////////////////////////////////////////////////
    updateVolume: function(event, value) {
      this.setState({
        controls: {
          volume: value
        }
      })
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
                            <Video
                              controls={this.state.controls}
                              />
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
                              moveTopPlaylist={this.moveTopPlaylist}
                              updateVolume={this.updateVolume}
                               />
                          </div>
                      </div>
            {/* Chat Component */}
                      <div className="col-lg-3 no-float" id="chattoplevel" >
                        <Sidebar
                          loginData={this.state.user}
                          chatData={this.state.chat}
                          sendMsg={this.handleSendMsg}
                          loginState={this.state.loginstate}
                          currentSidebar={this.state.currentSidebar}
                          changeSidebar={this.changeSidebar}
                          userPresence={this.state.userPresence}
                          />
                      </div>
            {/* End Container */}
                  </div>
                </div>
      </div>
    )
  }
});

export default Main;
