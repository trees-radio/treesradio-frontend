/**
 *
 * Chat!
 *
 * Created by zachb on 2015-12-05.
 *
 */

var React = require('react');
import ChatContent from './ChatContent/ChatContent.js';
import ChatSend from './ChatSend/ChatSend.js';
var Firebase = require('firebase');
var ReactFireMixin = require('reactfire');

var Chat = React.createClass({
    mixins: [ReactFireMixin],
    getInitialState: function(){
        return {
            messages: []
        }
    },
    componentDidMount: function(){
        let msgRef = new Firebase('https://treesradio.firebaseio.com/chat/messages');
        this.bindAsArray(msgRef, "messages");
    },
    sendMsg: function(msg, user){
        this.msgRef.set(this.state.messages.concat([{msg, user}]));
    },
    render: function(){
        return (
            <div>
                <div id="chatcontainer">
                    <ChatContent msgs={this.state.messages} />
                    <ChatSend send={this.sendMsg} />
                </div>
            </div>
        )
    }
});

module.exports = Chat;