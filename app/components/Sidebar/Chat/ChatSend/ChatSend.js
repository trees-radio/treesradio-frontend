/**
 * Sendbox for Trees Radio Chat
 */

import React from 'react';
import sweetAlert from 'sweetalert';
import MentionCompleter from 'mention-completer';
import $ from 'jquery';
import moment from 'moment';


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
    this.sendBox = $(this.refs.sendbox);
    this.completer = new MentionCompleter({
      patterns: { handle: /(@[\w]+)\b/ },
      getValue: function(callback) {
        callback(null, this.sendBox.val());
      }.bind(this),
      setValue: function(value) {
        this.sendBox.focus();
        this.sendBox.val(value);
        this.completer.checkForMatch();
      }.bind(this),
      getSelectionRange: function(callback) {
        // console.log(this.sendBox);
        callback(null, {
          start: this.sendBox[0].selectionStart,
          end: this.sendBox[0].selectionEnd
        });
      }.bind(this),
      setSelectionRange: function (range) {
        this.sendBox[0].setSelectionRange(range.start, range.end);
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.sendBox = $(this.refs.sendbox);
    this.completer
      .on('match', function(match) {
        this.setState({
          match: true,
          currentMatch: match
        });
      }.bind(this))
      .on('nomatch', function() {
        this.setState({
          match: false,
          numMatches: 0,
          quickMatch: ""
        });
      }.bind(this));
  },
  componentWillUnmount: function() {
    // this.completer = null
  },
  componentWillUpdate: function() {
    if (this.state.match && !this.matchTimer) {
      // debugger;
      var toMatch = this.state.currentMatch.value.substr(1).toUpperCase();
      var numMatches = 0;
      this.props.userPresence.forEach(function(item) {
        if (item.online && item.key.toUpperCase().includes(toMatch)) {
          if (numMatches === 0) { // if this is the first match, add it to quickMatch
            this.setState({quickMatch: item.key});
          } else { //no longer the first match, dump anything in there
            this.setState({quickMatch: ""});
          }

          // bump number of matches for each valid match
          numMatches += 1;

        }
      }, this);
      this.setState({numMatches: numMatches});
      this.matchTimer = setTimeout(function() {
        this.matchTimer = null
      }.bind(this), 300);
    }
  },
  handleMention: function(name) {
    this.completer.replaceMatch(this.completer.mostRecentMatch, '@'+name);
  },
  handleChat: function(e){
    if (e.key === 'Enter') {
      if (this.state.numMatches === 1 && this.state.quickMatch !== "") {
        this.completer.replaceMatch(this.completer.mostRecentMatch, '@'+this.state.quickMatch);
        return;
      }
      let newMsg = this.refs.sendbox.value.trim();
      if (newMsg === '') {
        // console.log("User attempted to send an empty chat message");
      } else {
        if ( this.props.loginState ) {
          this.refs.sendbox.value = '';
          this.completer.checkForMatch();
          let userSending = this.props.loginData.username;
          this.props.sendMsg({msg: newMsg, user: userSending});
        } else {
          // case handled below in regReminder()
        }

      }
    } else {
      this.completer.checkForMatch();
    }
  },
  regReminder: function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (this.state.numMatches === 1 && this.state.quickMatch !== "") {
        this.completer.replaceMatch(this.completer.mostRecentMatch, '@'+this.state.quickMatch);
      }
      return false;
    }
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
        timer: 2000
      });
    }
  },
  render: function(){
    var matchDiv = '';
    var matches = '';
    if (this.state.match) {
      var toMatch = this.state.currentMatch.value.substr(1).toUpperCase();
      matches = this.props.userPresence.map(function(item) {
        var boundClick = this.handleMention.bind(this, item.key);
        if (item.online && item.key.toUpperCase().includes(toMatch)) {
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
