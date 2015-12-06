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
    componentDidMount: function(){
        //var msgRef = new Firebase('https://treesradio.firebaseio.com/chat/messages');
        //debugger;
        //this.bindAsArray(msgRef, "messages");
    },
    render: function(){
        return (
            <div>
                <div id="chatcontainer">
                    <ChatContent chatData={this.props.chatData} />
                    <ChatSend sendMsg={this.props.sendMsg} loginData={this.props.loginData} />
                </div>
            </div>
        )
    }
});

module.exports = Chat;
