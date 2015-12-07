//MAIN JS

import React from 'react';
import ReactDOM from 'react-dom';
import Firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import Nav from './components/Nav/Nav.js';
import Chat from './components/Chat/Chat.js';
import Video from './components/Video/Video.js';
import Voting from './components/Voting/Voting.js';
import './Main.scss';
import sweetAlert from 'sweetalert';


var Main = React.createClass({
    mixins: [ReactFireMixin],
    getInitialState: function(){
      return {
          loginstate: false,
          user: {},
          userLevel: 0,
          chat: []
      }
    },
    componentDidMount: function(){
        this.ref = new Firebase('https://treesradio.firebaseio.com');
        this.ref.onAuth(this.authDataCallback);
        let chatRef = new Firebase('https://treesradio.firebaseio.com/chat/messages');
        this.bindAsArray(chatRef, "chat");
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
            let userRef = new Firebase("https://treesradio.firebaseio.com/users/" + authData.uid);
            this.bindAsObject(userRef, "user");
            this.setState({ loginstate: true });
            //debugger;
            if (this.state.user.admin === 1) {
              this.state.userLevel === 2;
            } else {
              if (this.state.moderator === 1) {
                this.state.userLevel === 1;
              }
            }
            //alert(this.state.user);
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
        let registeredNamesRef = new Firebase("https://treesradio.firebaseio.com/users/registeredNames");
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
            let regRef = new Firebase("https://treesradio.firebaseio.com");
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
                let userRef = new Firebase("https://treesradio.firebaseio.com/users/" + userData.uid);
                userRef.child('username').set(desiredUn);
                registeredNamesRef.child(desiredUn).set(1);
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
      this.firebaseRefs["chat"].push(newMsgData);
    },
    checkUserLevel: function(){
      if (this.state.user.admin === 1) {
        this.state.userLevel === 2;
        debugger;
      } else {
        if (this.state.moderator === 1) {
          this.state.userLevel === 1;
        }
      }
    },
    render: function(){

      // ///////////
      // MAIN RENDER
      // ///////////

      return (
          <div>
              <Nav
                loginstate={this.state.loginstate}
                loginhandler={this.authenticateUser}
                logouthandler={this.logoutUser}
                logindata={this.state.user}
                handleRegister={this.handleRegister}
              />

            {/* Start Container */}
              <div className="container-fluid">
                  <div className="row">

            {/* Voting Component */}
                      <div className="col-lg-2 no-float" id="votingtoplevel">
                        <h2 className="placeholder-txt">Voting Component</h2>
                        <Voting />
                          <div id="votingcontainer">
                            <div id="votescroll">
                              <ul id="votebox"></ul>
                                <div className="vote-buttons">
                                  <button type="button" button id="upvote-button"><span className=""></span></button><br/>
                                  <button type="button" button id ="downvote-button"><span className=""></span></button>
                                <div className="vote-item">
                                  <span className="songthumbnail"></span>
                                  <span className="song-name">Send Me on My Way - Rusted Root</span><br/>
                                  <span className="vote-user">Submitted by: GryphonEDM</span>

                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
            {/* Video Component */}
                      <div className="col-lg-7 no-float" id="videotoplevel">
                        <h2 className="placeholder-txt">Video</h2>
                          <div id="vidcontainer" className="row">
                          </div>
                          <Video />
                      </div>
            {/* Chat Component */}
                      <div className="col-lg-3 no-float" id="chattoplevel">
                        <div id="chatcontainer" className="row">
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

ReactDOM.render(<Main />, document.getElementById('app'));

//React.render(<Main />, document.getElementById('app'));
