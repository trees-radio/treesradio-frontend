//MAIN JS

// React
import React from 'react';

// Firebase
import Firebase from 'firebase';
// import ReactFireMixin from 'reactfire';
import Rebase from 're-base';
var base = Rebase.createClass(window.__env.firebase_origin);

// More libraries
import sweetAlert from 'sweetalert';
import _ from 'lodash';

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


// class Main extends React.Component{
//
//
// };

var Main = React.createClass({
    getInitialState: function(){
      return {
          loginstate: false,
          user: {},
          userLevel: 0,
          chat: [],
          registeredNames: {},
          playlistsOpen: true
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

        // grab registeredNames and bind in state
        // let registeredNamesRef = new Firebase(window.__env.firebase_origin + "/registeredNames");
        // this.bindAsObject(registeredNamesRef, "registeredNames");
        base.syncState(`registeredNames`, {
            context: this,
            state: 'registeredNames',
        });
    },
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
            // let userRef = new Firebase(window.__env.firebase_origin + "/users/" + authData.uid);
            // this.bindAsObject(userRef, "user");
            base.syncState(`users/` + authData.uid, {
              context: this,
              state: 'user'
            });
            this.setState({ loginstate: true });
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
    handleSendMsg: function(newMsgData) {
      this.setState({
        chat: this.state.chat.concat([newMsgData])
      });
    },
    checkUserLevel: function(user){
      return _.get(this.state.registeredNames, user + ".level");
    },
    // ///////////
    // Playlists
    // ///////////
    playlistsOpenToggle: function() {
      if (!this.state.playlistsOpen) {
        this.setState({ playlistsOpen: true });
      } else {
        this.setState({ playlistsOpen: false });
      }
    },
    // ///////////
    // MAIN RENDER
    // ///////////
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
