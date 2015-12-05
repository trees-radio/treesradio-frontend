//MAIN JS

var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
import './Main.scss';
import Nav from './components/Nav/Nav.js';
import Chat from './components/Chat/Chat.js';

var Main = React.createClass({
    mixins: [ReactFireMixin],
    getInitialState: function(){
      return {
          loginstate: false,
          user: {}
      }
    },
    componentDidMount: function(){
        this.ref = new Firebase('https://treesradio.firebaseio.com');
        this.ref.onAuth(this.authDataCallback);
    },
    authenticateUser: function(eml, pw){
        this.ref.authWithPassword({
            email: eml,
            password: pw
        }, this.authHandler)
    },
    authHandler: function(error, authData){
        if (error) {
            console.log("Auth error", error);
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
    render: function(){
      return (
          <div>
              <Nav
                loginstate={this.state.loginstate}
                loginhandler={this.authenticateUser}
                logouthandler={this.logoutUser}
                logindata={this.state.user}
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
                        <Chat logindata={this.state.user} />
                      </div>
                  </div>
              </div>
          </div>
    )
  }
});

React.render(<Main />, document.getElementById('app'));
