/**
 * Created by zachb on 2015-12-05.
 */


var React = require('react');
var _ = require('lodash');

var ChatContent = React.createClass({
    componentDidUpdate: function() {
      //forces chat to scroll to bottom after updating
      let chatScroll = this.refs.chatScroll.getDOMNode();
      chatScroll.scrollTop = chatScroll.scrollHeight;
    },
    render: function(){
      // tracking msg color
      var chatPos = 0;
      // don't render entire chat state on page
      let chatCompact = _.slice(this.props.chatData, Math.max(this.props.chatData.length - 100));
      let msgs = chatCompact.map(function(msg){
          //debugger;
          var chatPosClass = "";
          if (chatPos === 0) {
            chatPosClass = "chat-line-1";
            chatPos = 1;
          } else {
            chatPosClass = "chat-line-0";
            chatPos = 0;
          }
          // add any new classes here, keep trailing space
          let chatLineClasses = "chat-item " + chatPosClass;
          return (
              <li key={ msg['.key'] } className={chatLineClasses}>
                  <span className="chat-username">{ msg['user'] }</span><br />
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
