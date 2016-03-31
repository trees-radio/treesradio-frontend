/**
 * Sendbox for Trees Radio Chat
 */

import React from 'react';
import sweetAlert from 'sweetalert';
import MentionCompleter from 'mention-completer';
import $ from 'jquery';
// import emitUserError from '../../../../utils/userError.js';
import moment from 'moment';

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
    sendBox[0].setSelectionRange(range.start, range.end);
  }
});

var ChatSend = React.createClass({
  getInitialState: function() {
    return {
      match: false,
      numMatches: 0,
      quickMatch: "",
      currentMatch: {}
    }
  },
  componentWillMount: function() {
    sendBox = $(this.refs.sendbox);
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
          match: false,
          numMatches: 0,
          quickMatch: ""
        });
      });
  },
  handleMention: function(name) {
    completer.replaceMatch(completer.mostRecentMatch, '@'+name);
  },
  handleChat: function(e){
    if (e.key === 'Tab') {
      e.preventDefault();
      if (this.state.numMatches === 1 && this.state.quickMatch !== "") {
        completer.replaceMatch(completer.mostRecentMatch, '@'+this.state.quickMatch);
      }
      return false;
    }

    if (e.key === 'Enter') {
      if (this.state.numMatches === 1 && this.state.quickMatch !== "") {
        completer.replaceMatch(completer.mostRecentMatch, '@'+this.state.quickMatch);
        return;
      }
      let newMsg = this.refs.sendbox.value.trim();
      if (newMsg === '') {
        // console.log("User attempted to send an empty chat message");
      } else {
        if ( this.props.loginState ) {
          this.refs.sendbox.value = '';
          let userSending = this.props.loginData.username;
          this.props.sendMsg({msg: newMsg, user: userSending});
        } else {
          // case handled below in regReminder()
        }

      }
    } else {
      completer.checkForMatch();
    }
  },
  regReminder: function() {
    var minutesRegistered = 30 * 60 * 1000;
    var chatlockEffected = this.props.chatlock && this.props.loginData.registered && !this.props.loginData.registered < moment().valueOf() - minutesRegistered;
    if (!this.props.loginState) {
      sweetAlert({
        title: "No Login Found",
        text: "You can't chat if you're not logged in! Fill out the login form and click 'Register' to register!",
        type: "error"
      });
      return;
    }
    if (chatlockEffected) {
      sweetAlert({
        title: "Chat Locked",
        text: "The chat is currently locked for new users due to a disturbance. You may resume chatting when the lock is lifted or your account is old enough.",
        type: "error",
        timer: 1500
      });
    }
  },
  render: function(){
    var matchDiv = '';
    var matches = '';
    if (this.state.match) {
      var toMatch = this.state.currentMatch.value.substr(1).toUpperCase();
      this.state.numMatches = 0; //reset number of matches before runnning map
      matches = this.props.userPresence.map(function(item) {
        var boundClick = this.handleMention.bind(this, item.key);
        if (item.online && item.key.toUpperCase().includes(toMatch)) {
          if (this.state.numMatches === 0) {
            this.state.quickMatch = item.key;
          } else {
            this.state.quickMatch = "";
          }
          // bump number of matches for each valid match
          this.state.numMatches += 1;
          return (
            <span key={item.key} className="mention-item" onClick={boundClick}>@{item.key}<br/></span>
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
          <input type="text" ref="sendbox" placeholder="enter to send" id="chatinput" className="form-control" onKeyDown={this.regReminder} onKeyUp={this.handleChat} />
        </div>
      </div>
        )
    }

});

export default ChatSend;
