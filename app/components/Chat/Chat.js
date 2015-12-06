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
//var ReactFireMixin = require('reactfire');
import ReactFireMixin from 'reactfire';

var Chat = React.createClass({
    mixins: [ReactFireMixin],
    getInitialState: function(){
        return {
            messages: []
        }
    },
    componentDidMount: function(){
        //var msgRef = new Firebase('https://treesradio.firebaseio.com/chat/messages');
        //debugger;
        //this.bindAsArray(msgRef, "messages");
    },
    handleSendMsg: function(newMsg, userSending) {
      //this.state.messages.concat([newMsg, userSending]);
    },
    render: function(){
        return (
            <div>
                <div id="chatcontainer">
                    <ChatContent msgs={this.state.messages} />
                    <ChatSend msgs={this.state.messages} sendMsg={this.handleSendMsg} loginData={this.props.loginData} />
                </div>
            </div>
        )
    }
});

module.exports = Chat;
