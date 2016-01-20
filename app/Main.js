//MAIN JS

// Sentry Error Reporting
// Raven is defined globally in index.html
Raven.config('https://870758af6d504cf08cda52138702ccd9@app.getsentry.com/61873', {
  release: '0.1.0'
}).install();

// React
import React from 'react';
// import update from 'react-addons-update';

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
import emitUserError from './utils/userError';

// Components
import Nav from './components/Nav/Nav';
import Sidebar from './components/Sidebar/Sidebar';
import Video from './components/Video/Video';
import Playlists from './components/Playlists/Playlists';

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
          user: {
            inWaitlist: {
              waiting: false,
              id: ""
            }
          },
          userLevel: 0,
          chat: [],
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
          currentSidebar: 0, // 0 - 3 Chat -> About
          controls: {
            volume: 0.25,
            playing: true
          },
          playingMedia: {
            info: {
              title: "Loading...",
              url: ""
            },
            playback: {
              time: 0,
              user: "Nobody"
            },
            feedback: {
              dislikes: 0,
              likes: 0,
              grabs: 0
            }
          },
          userFeedback: {
            opinion: "none",
            grab: false
          },
          waitlist: [],
          localPlayerPos: 0
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

        base.bindToState('playing_media', {
          context: this,
          state: 'playingMedia'
        });

        base.bindToState('waitlist/tasks', {
          context: this,
          state: 'waitlist',
          asArray: true
        });

        base.listenTo('playing_media/playback/url', {
          context: this,
          then() {
            this.setState({userFeedback: {
              opinion: "none",
              grab: false
            }});
          }
        });

        base.listenTo('playing_media/playback/playing', {
          context: this,
          then(playing){
            if (playing) {
              var setControlsOff = {
                controls: {
                  volume: this.state.controls.volume,
                  playing: false
                }
              }
              this.setState(setControlsOff);
              var setControlsOn = {
                controls: {
                  volume: this.state.controls.volume,
                  playing: true
                }
              }
              this.setState(setControlsOn);
            }
          }
        })
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
            emitUserError("Login Error", error);
        } else {
            // console.log("Auth success", authData);
        }

    },
    authDataCallback: function(authData){
        if (authData) {
          //
          // START UPON LOGIN
          //
          Raven.setUserContext({ // Raven is defined globally in index.html
            id: authData.uid
          });
          this.userBindRef = base.syncState(`users/` + authData.uid, {
            context: this,
            state: 'user',
            then(){
              // let presenceRef;
              this.presenceRef = new Firebase(window.__env.firebase_origin + '/presence/' + this.state.user.username);
              this.presenceRef.child('online').set(true);
              this.presenceRef.child('online').onDisconnect().remove();
              this.presencePing();
              window.setInterval(this.presencePing, 30000);

              // check for missing user items
              if (!this.state.user.inWaitlist) {
                base.post('users/' + authData.uid + '/inWaitlist', {
                  data: {
                    waiting: false,
                    id: ""
                  }
                });
              }
              if (!this.state.user.uid) {
                base.post('users/' + authData.uid + '/uid', {
                  data: authData.uid
                });
              }
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

          //
          // END UPON LOGIN
          //
      } else {
          // console.log("Logged out");
          this.setState({ loginstate: false });
      }
    },
    presencePing: function() {
      // console.log("Sending presence ping...");
      // this.presenceRef.child('online').set(true);
      let timestamp = _.now();
      this.presenceRef.child('lastseen').set(timestamp);
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
        var desiredUn = inputValue;
        var presenceRef = new Firebase(window.__env.firebase_origin + "/presence");
        presenceRef.once("value", function(snapshot){
          let unExists = snapshot.child(desiredUn).exists();
          if (unExists) {
            emitUserError("Registration Error", "Desired username '" + desiredUn + "' already exists!");
          } else {
            let regRef = new Firebase(window.__env.firebase_origin);
            regRef.createUser({
              email: desiredEml,
              password: desiredPw
            },function(error, userData){
              if (error) {
                switch (error.code) {
                  case "EMAIL_TAKEN":
                    emitUserError("Registration Error", "That email address is already registered: " + desiredEml);
                  break;
                  case "INVALID_EMAIL":
                    emitUserError("Registration Error", "That is not a valid email address: " + desiredEml);
                  break;
                  default:
                    emitUserError("Registration Error", "An unknown registration error occurred: " + error);
                }
              } else {
                let userRef = new Firebase(window.__env.firebase_origin + "/users/" + userData.uid);
                // create user entry
                userRef.set({
                  username: desiredUn,
                  inWaitlist: {
                    waiting: false
                  }
                });
                // create presence entry
                presenceRef.child(desiredUn).child("uid").set(userData.uid);
                presenceRef.child(desiredUn).child("email").set(desiredEml);
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

      let chatRef = new Firebase(window.__env.firebase_origin + "/chat/messages");

      // var avatar = "http://api.adorable.io/avatars/50/"+ this.state.user.username +".png";
      var userAvatar;
      if (this.state.user.avatar) {
        userAvatar = this.state.user.avatar;
      } else {
        userAvatar = false;
      }
      console.log(userAvatar);

      let lastMsg = this.state.chat[this.state.chat.length - 1];
      if (!lastMsg) {
        chatRef.push({
          user: newMsgData.user,
          avatar: userAvatar,
          msgs: {
            0: newMsgData.msg
          }
        });
        return;
      }

      if (lastMsg.user === this.state.user.username) {

        lastMsg.msgs.push(newMsgData.msg);

        base.post('chat/messages/' + lastMsg.key + '/msgs', {
          data: lastMsg.msgs
        });
      } else {
        chatRef.push({
          user: newMsgData.user,
          avatar: userAvatar,
          msgs: {
            0: newMsgData.msg
          }
        });
      }
    },
    chatCommands: function(command) {
      switch (command) {
        case 'skip':
          if (this.state.user.uid === "1ec8bd39-ef00-478f-aa42-e01e8112cafa" || this.state.user.uid === "88fbeeb3-fbd3-4147-96af-8c605af6d87c") {
            base.post('playing_media/admin/skip', {
              data: true,
              then() {
                console.log('Skip sent');
              }
            });
          }
        break;
        default:
          console.log('Unrecognized chat command');
        break;
      }
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
        emitUserError("Unable to Create Playlist", "You are not logged in!");
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
        emitUserError("No Playlist Selected", "You don't have a playlist selected to add to!");
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
    updateVolume: function(value) {
      this.setState({
        controls: {
          volume: value,
          playing: this.state.controls.playing
        }
      });
    },

    ///////////////////////////////////////////////////////////////////////
    // WAITLIST CONTROLS
    ///////////////////////////////////////////////////////////////////////
    toggleWaiting: function() {
      if (this.state.user.inWaitlist.waiting) {
        if (this.state.user.inWaitlist.id != "") {
          var waitlistPlaceRef = new Firebase(window.__env.firebase_origin + "/waitlist/tasks/" + this.state.user.inWaitlist.id);
          waitlistPlaceRef.remove();
        }
        base.post('users/' + this.state.user.uid + '/inWaitlist',{
          data: {
            waiting: false,
            id: ""
          }
        });
      } else {
        var waitlistRef = new Firebase(window.__env.firebase_origin + "/waitlist/tasks");
        var currentPlaylistId;
        if (this.state.currentPlaylist.id === -1) {
          emitUserError("Join Waitlist Error", "You don't have a playlist selected!");
          return;
        } else {
          currentPlaylistId = this.state.currentPlaylist.id;
        }
        if (!this.state.playlists[currentPlaylistId].entries) {
          emitUserError("Join Waitlist Error", "Your playlist is empty!");
          return;
        }

        var authCheckRef = new Firebase(window.__env.firebase_origin);
        var authCheckData = authCheckRef.getAuth();


        var waitlistId = waitlistRef.push({
          user: this.state.user.username,
          uid: authCheckData.uid,
          url: this.state.playlists[currentPlaylistId].entries[0].url,
          title: this.state.playlists[currentPlaylistId].entries[0].title,
          thumb: this.state.playlists[currentPlaylistId].entries[0].thumb,
          channel: this.state.playlists[currentPlaylistId].entries[0].channel
          }
        );

        // console.log(waitlistId.toString());

        var waitlistIdUrl = waitlistId.toString();

        var waitlistDiscRef = new Firebase(waitlistIdUrl);
        waitlistDiscRef.onDisconnect().remove();

        var waitlistIdExplode = waitlistIdUrl.split("/");

        var waitlistIdKey = waitlistIdExplode[waitlistIdExplode.length - 1];

        // console.log(waitlistIdExplode[waitlistIdExplode.length - 1]);

        base.post('users/' + this.state.user.uid + '/inWaitlist', {
          data: {
            waiting: true,
            id: waitlistIdKey
          }
        });
      }
    },

    ///////////////////////////////////////////////////////////////////////
    // VIDEO DATA HANDLING
    ///////////////////////////////////////////////////////////////////////
    videoOnProgress: function(progress) {
      this.setState({localPlayerPos: progress.played});
    },

    ///////////////////////////////////////////////////////////////////////
    // FEEDBACK BUTTONS
    ///////////////////////////////////////////////////////////////////////
    handleGrabButton: function() {
      if (this.state.user.uid) {
        if (!this.state.userFeedback.grab) {
          base.push('queues/feedback/tasks', {
            data: {type: 'grab', user: this.state.user.uid}
          });
          this.setState({userFeedback: {
            opinion: this.state.userFeedback.opinion,
            grab: true
          }});
        }
      }
    },
    handleLikeButton: function() {

      if (this.state.user.uid) {
        base.push('queues/feedback/tasks', {
          data: {type: 'like', user: this.state.user.uid}
        });
        this.setState({userFeedback: {
          opinion: "like",
          grab: this.state.userFeedback.grab
        }});
      }
    },
    handleDislikeButton: function() {
      if (this.state.user.uid) {
        base.push('queues/feedback/tasks', {
          data: {type: 'dislike', user: this.state.user.uid}
        });
        this.setState({userFeedback: {
          opinion: "dislike",
          grab: this.state.userFeedback.grab
        }});
      }
    },
    ///////////////////////////////////////////////////////////////////////
    // USER PROFILE
    ///////////////////////////////////////////////////////////////////////
    setAvatar: function() {
      var uid = this.state.user.uid;
      sweetAlert({
        title: "Set Your Avatar",
        text: "Give us the link (URL) to your custom avatar here:",
        type: "input",
        inputPlaceholder: "https://i.imgur.com/iTanI13.gif",
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true
      }, function(inputValue) {
        var cleanInput = inputValue.replace(/.*?:\/\//g, "");
        base.post("users/" + uid + "/avatar", {
          data: cleanInput,
          then() {
            setTimeout(function() {
              sweetAlert("Avatar set!");
            }, 1000);
          }
        });

      });
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
                devCheck={this.state.devCheck}
                setAvatar={this.setAvatar}
              />
            {/* Start Container */}
              <div className="container-fluid">
                  <div className="row">
            {/* Video Component */}
                      <div className="col-lg-9 col-md-9 col-sm-9 col-xs-9 no-float" id="videotoplevel">
                        {/* <h2 className="placeholder-txt">Video</h2> */}
                          <div id="vidcontainer" className="">
                            <Video
                              controls={this.state.controls}
                              playingMedia={this.state.playingMedia}
                              videoOnProgress={this.videoOnProgress}
                              localPlayerPos={this.state.localPlayerPos}
                              user={this.state.user}
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
                              controls={this.state.controls}
                              playingMedia={this.state.playingMedia}
                              inWaitlist={this.state.user.inWaitlist}
                              toggleWaiting={this.toggleWaiting}
                              handleLikeButton={this.handleLikeButton}
                              handleDislikeButton={this.handleDislikeButton}
                              handleGrabButton={this.handleGrabButton}
                              userFeedback={this.state.userFeedback}
                               />
                          </div>
                      </div>
            {/* Chat Component */}
                      <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 no-float" id="chattoplevel" >
                        <Sidebar
                          loginData={this.state.user}
                          chatData={this.state.chat}
                          sendMsg={this.handleSendMsg}
                          loginState={this.state.loginstate}
                          currentSidebar={this.state.currentSidebar}
                          changeSidebar={this.changeSidebar}
                          userPresence={this.state.userPresence}
                          waitlist={this.state.waitlist}
                          chatCommands={this.chatCommands}
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
