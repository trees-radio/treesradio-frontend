/**
 * Created by zachb on 2015-12-05.
 */


var React = require('react');
//var _ = require('lodash');

var ChatContent = React.createClass({
    render: function(){
      let msgs = this.props.chatData.map(function(msg){
          return (
              <li key={ msg['.key'] } className="chat-item">
                  <span className="chat-username">{ msg['user'] }</span><br />
                  <span className="chat-text">{ msg['msg'] }</span>
              </li>
          )
        });

        return (
            <div id="chatscroll">
                <ul id="chatbox">
                    {msgs}
                </ul>
            </div>
        )
    }

});

module.exports = ChatContent;
