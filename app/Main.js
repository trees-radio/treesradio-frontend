//MAIN JS

var React = require('react');
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');
import './Main.scss';
import Nav from './components/Nav/Nav.js';


var Main = React.createClass({
    mixins: [ReactFireMixin],
    getInitialState: function(){
      return {
          loginstate: false
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
            console.log("Auth error");
        } else {
            console.log("Auth success");
        }
    },
    authDataCallback: function(authData){
        if (authData) {
            console.log(authData.uid + "logged in");
        } else {
            console.log("Logged out");
        }
    },
    render: function(){
      return (
        <Nav
            loginstate={this.state.loginstate}
            loginhandle={this.authenticateUser}
        />
    )
  }
});

React.render(<Main />, document.getElementById('app'));
