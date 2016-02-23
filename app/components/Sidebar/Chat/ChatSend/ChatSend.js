/**
 * Sendbox for Trees Radio Chat
 */

import React from 'react';
import sweetAlert from 'sweetalert';
import MentionCompleter from 'mention-completer';
import $ from 'jquery';

var sendBox;
var completer = new MentionCompleter({
  patterns: { handle: /(@[\w]+)\b/ },
  getValue: function(callback) {
    callback(null, sendBox.val());
  },
  setValue: function(value) {
    sendBox.focus();
    sendBox.val(value);
    completer.checkForMatch();
  },
  getSelectionRange: function(callback) {
    callback(null, {
      start: sendBox[0].selectionStart,
      end: sendBox[0].selectionEnd
    });
  },
  setSelectionRange: function (range) {
    sendBox.setSelectionRange(range.start, range.end);
  }
});

var ChatSend = React.createClass({
  getInitialState: function() {
    return {
      match: false,
      currentMatch: {}
    }
  },
  componentDidMount: function() {
    var that = this;
    sendBox = $(this.refs.sendbox);
    completer
      .on('match', function(match) {
        that.setState({
          match: true,
          currentMatch: match
        });
      })
      .on('nomatch', function() {
        that.setState({
          match: false
        });
      });
  },
  handleMention: function(name) {
    completer.replaceMatch(completer.mostRecentMatch, '@'+name);
  },
  handleChat: function(e){

    if (e.key === 'Enter') {
      let newMsg = this.refs.sendbox.value.trim();
      if (newMsg === '') {
        // console.log("User attempted to send an empty chat message");
      } else {
        if ( this.props.loginState ) {
          this.refs.sendbox.value = '';
          let userSending = this.props.loginData.username;
          this.props.sendMsg({msg: newMsg, user: userSending});
        } else {
          this.refs.sendbox.value = '';
          sweetAlert({
            "title": "No Login Found",
            "text": "You can't chat if you're not logged in! Fill out the login form and click 'Register' to register!",
            "type": "error",
            "timer": 3000
          });
        }

      }
    } else {
      completer.checkForMatch();
    }
  },
  render: function(){
    var matchDiv = '';
    var matches = '';
    if (this.state.match) {
      var toMatch = this.state.currentMatch.value.substr(1);
      // console.log(this.state.currentMatch);
      matches = this.props.userPresence.map(function(item, index) {
        var boundClick = this.handleMention.bind(this, item.key);
        if (item.online && item.key.includes(toMatch)) {
          // console.log(item, toMatch);
          return (
            <span key={item.key} className="mention-item" onClick={boundClick}>@{item.key}</span>
          )
        }
      }, this);
      matchDiv = (
        <div className="mentions-container">
          {matches}
        </div>
      )
    }
    return (
      <div>
        {matchDiv}
        <div id="sendbox">
          <input type="text" ref="sendbox" placeholder="enter to send" id="chatinput" className="form-control" onKeyUp={this.handleChat} />
        </div>
      </div>
        )
    }

});

export default ChatSend;
