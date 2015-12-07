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
      // don't render entire chat state on page
      let chatCompact = _.slice(this.props.chatData, Math.max(this.props.chatData.length - 100));
      let msgs = chatCompact.map(function(msg){
          return (
              <li key={ msg['.key'] } className="chat-item">
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
