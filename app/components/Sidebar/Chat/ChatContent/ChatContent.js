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
import classNames from 'classnames';
import ReactImageFallback from 'react-image-fallback';


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


          let chatLineClasses = classNames("chat-item ", chatPosClass);

          var username = msg['user'];
          var chatAvatar;

          if (msg['avatar']) {
            chatAvatar = "//" + msg['avatar'];
          } else {
            chatAvatar = "http://api.adorable.io/avatars/50/"+ username +".png";
          }

          var avatarFallback = "http://api.adorable.io/avatars/50/"+ username +".png";








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
                  <ReactImageFallback
                    className="avatarimg"
                    src={chatAvatar}
                    fallbackImage={avatarFallback}
                    />
                  {/* <img id="avatarimg" src={chatAvatar} /> */}
                </div>
                <div className="chat-msg">
                  <span className="chat-username">{ msg.user }</span><br />
                  <span className="chat-text">{ innerMsgs }</span>
                </div>

              </li>
          )

        }.bind(this));

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
