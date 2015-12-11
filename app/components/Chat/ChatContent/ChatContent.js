/**
 * Created by zachb on 2015-12-05.
 *
 * Displays chat entries inside the Chat component
 *
 */


import React from 'react';
import _ from 'lodash';

// Import SCSS
// import './ChatContent.scss';

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
      let chatCompact = _.slice(this.props.chatData, Math.max(this.props.chatData.length - 50));
      let msgs = chatCompact.map(function(msg){

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

          let chatAvatar = "//api.adorable.io/avatars/25/"+ msg['user'] +".png";


          // individual
          return (
              <li key={ msg['.key'] } className={chatLineClasses}>



                  <div className="chat-msg">
                    <span className="chat-username"><img className="chat-avatar" src={chatAvatar} />{ msg['user'] }</span><br />
                    <span className="chat-text">{ msg['msg'] }</span>
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
