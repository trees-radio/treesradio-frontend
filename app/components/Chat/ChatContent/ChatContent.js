/**
 * Created by zachb on 2015-12-05.
 *
 * Displays chat entries inside the Chat component
 *
 */


import React from 'react';
//var _ = require('lodash');
import _ from 'lodash';

var ChatContent = React.createClass({
    componentDidUpdate: function() {
      //forces chat to scroll to bottom after updating
      let chatScroll = this.refs.chatScroll;
      chatScroll.scrollTop = chatScroll.scrollHeight;
    },
    render: function(){
      // tracking msg color
      var chatPos = 0;
      // don't render entire chat state on page
      let chatCompact = _.slice(this.props.chatData, Math.max(this.props.chatData.length - 100));
      let msgs = chatCompact.map(function(msg){
          var chatPosClass = "";
          if (chatPos === 0) {
            chatPosClass = "chat-line-1";
            chatPos = 1;
          } else {
            chatPosClass = "chat-line-0";
            chatPos = 0;
          }
          // add any new classes in string below, keep trailing space
          let chatLineClasses = "chat-item " + chatPosClass;
          // individual
          return (
              <li key={ msg['.key'] } className={chatLineClasses}>
                  <span className="chat-username">{ msg['user'] }:</span><br />
                  <span className="chat-text">{ msg['msg'] }</span>
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
