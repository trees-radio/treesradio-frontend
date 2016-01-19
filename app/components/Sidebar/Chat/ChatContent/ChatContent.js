/**
 * Created by zachb on 2015-12-05.
 *
 * Displays chat entries inside the Chat component
 *
 */


import React from 'react';
// import _ from 'lodash';
// import linkify from 'linkify';
import Linkify from 'react-linkify';


var ChatContent = React.createClass({
    componentDidMount: function() {
      // var chatScroll = this.refs.chatScroll;
      window.setTimeout(function () {
        var chatScroll = this.refs.chatScroll;
        chatScroll.scrollTop = chatScroll.scrollHeight;
      }.bind(this), 1000);

    },
    componentWillUpdate: function() {
      var chatScroll = this.refs.chatScroll;
      this.shouldScrollBottom = chatScroll.scrollTop + chatScroll.offsetHeight === chatScroll.scrollHeight;
    },
    componentDidUpdate: function() {
      if (this.shouldScrollBottom) {
        var chatScroll = this.refs.chatScroll;
        chatScroll.scrollTop = chatScroll.scrollHeight;
      }
    },
    render: function(){
      // tracking msg color
      var chatPos = 0;

      // don't render entire chat state on page
      // let chatCompact = _.slice(this.props.chatData, Math.max(this.props.chatData.length - 50));
      let msgs = this.props.chatData.map(function(msg, index){

          // handling msg color alternation
          var chatPosClass = "";
          if (chatPos === 0) {
            chatPosClass = "chat-line-1";
            chatPos = 1;
          } else {
            chatPosClass = "chat-line-0";
            chatPos = 0;
          }
          // add any new whole-line classes in string below, keep trailing space
          let chatLineClasses = "chat-item " + chatPosClass;
          let chatAvatar = "http://api.adorable.io/avatars/50/"+ msg['user'] +".png";

          // console.log(msg.msgs);


          var linkifyProperties = {target: '_blank'};

          let innerMsgs = msg.msgs.map(function(msg, index){
            return (
              <Linkify key={index} properties={linkifyProperties}><span>{msg}<br/></span></Linkify>
            )
          });

          // individual
          return (
              <li key={index} className={chatLineClasses}>
                <div className="chat-avatar">
                  <img id="avatarimg" src={chatAvatar} />
                </div>
                <div className="chat-msg">
                  <span className="chat-username">{ msg.user }</span><br />
                  <span className="chat-text">{ innerMsgs }</span>
                </div>

              </li>
          )

        });

        return (
            <div id="chatscroll" ref="chatScroll">
                <ul id="chatbox">
                    {msgs}
                </ul>
            </div>
        )
    }

});

module.exports = ChatContent;
