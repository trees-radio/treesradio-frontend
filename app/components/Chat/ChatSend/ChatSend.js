/**
 * Sendbox for Trees Radio Chat
 */

import React from 'react';
//var $ = require('jQuery');
import sweetAlert from 'sweetalert';

var ChatSend = React.createClass({

  handleSubmit: function(e){
      if (e.key === 'Enter') {
        let newMsg = this.refs.sendbox.getDOMNode().value.trim();
        if (newMsg === '') {
          console.log("User attempted to send an empty chat message");
        } else {
          if ( this.props.loginState ) {
            let userSending = this.props.loginData.username;
            this.refs.sendbox.getDOMNode().value = '';
            this.props.sendMsg({msg: newMsg, user: userSending});
          } else {
            this.refs.sendbox.getDOMNode().value = '';
            sweetAlert({
              "title": "No Login Found",
              "text": "You can't chat if you're not logged in! Fill out the login form and click 'Register' to register!",
              "type": "error",
              "timer": 3000
            });
          }

        }
    }
  },
  render: function(){
    return (
      <div id="sendbox">
        <input type="text" ref="sendbox" placeholder="enter to send" id="chatinput" className="form-control" onKeyPress={this.handleSubmit} />
        { /* <button id="sendchat" type="submit" className="btn" onClick={this.handleSubmit}>Send</button> */ }
      </div>
        )
    }

});

module.exports = ChatSend;
