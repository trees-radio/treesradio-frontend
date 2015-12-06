//MAIN JS

var React = require('react');
var Firebase = require('firebase');
//var ReactFireMixin = require('reactfire');
import ReactFireMixin from 'reactfire';
import Nav from './components/Nav/Nav.js';
import Chat from './components/Chat/Chat.js';
import './Main.scss';
import sweetAlert from 'sweetalert';

var Main = React.createClass({
    mixins: [ReactFireMixin],
    getInitialState: function(){
      return {
          loginstate: false,
          user: {},
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
                  "type": "success",
                  "timer": 3000
                });
              }
            });

          }

        })

      });
    },
    handleSendMsg: function(newMsgData) {
      //debugger;
      //this.state.chat.push([[newMsg]]);
      //console.log(this.state.chat);
      //this.state.chat.push([newMsgData]);
      this.firebaseRefs["chat"].push(newMsgData);
      //debugger;
    },
    render: function(){
      return (
          <div>
              <Nav
                loginstate={this.state.loginstate}
                loginhandler={this.authenticateUser}
                logouthandler={this.logoutUser}
                logindata={this.state.user}
                handleRegister={this.handleRegister}
              />
              <div className="container-fluid">
                  <div className="row">
                      <div className="col-lg-2 col-md-2 hidden-sm hidden-xs" id="votingtoplevel">
                          <h2 className="placeholder-txt">Voting</h2>
                      </div>
                      <div className="col-lg-7 col-md-7 col-sm-7 col-xs-7" id="videotoplevel">
                          <h2 className="placeholder-txt">Video</h2>
                          {/*
                           <div class="row maxitbro">

                           <div id="vidcontainer" class="row">
                           <div class="bg-fill-l col-md-2 maxitbro"></div>

                           <video id="player" class="video-js vjs-default-skin col-md-8" height="500">
                           <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>
                           </video>

                           <div class="bg-fill-r col-md-2 maxitbro"></div>
                           </div>


                           <div class="row maxitbro">
                           <div id="progress" class="section-divider"></div>
                           <br>
                           <div id="volslider"></div><br>
                           <button id="syncbtn" onclick="SyncUp()">Sync</button>

                           <div>
                           </div>
                           </div>

                           </div>
                          */}
                      </div>
                      <div className="col-lg-3 col-md-3 col-sm-5 col-xs-5" id="chattoplevel">
                        <Chat loginData={this.state.user} chatData={this.state.chat} sendMsg={this.handleSendMsg} />
                      </div>
                  </div>
              </div>
          </div>
    )
  }
});

React.render(<Main />, document.getElementById('app'));
