/**
 * Created by zachb on 2015-12-05.
 */

var React = require('react');

var ChatSend = React.createClass({
  handleSubmit: function(){
      //this.set(this.state.messages.concat([{msg, user}]));
      let userSending = this.props.loginData.username;
      let newMsg = this.refs.sendbox.getDOMNode().value;
      this.refs.sendbox.getDOMNode.value = '';
      this.props.sendMsg(newMsg, userSending);
  },
  render: function(){
    return (
      <div id="sendbox">
        <input type="text" ref="sendbox" placeholder="enter to send" id="chatinput" className="form-control" />
        <button id="sendchat" type="submit" className="btn" onClick={this.handleSubmit}>Send</button>
      </div>
        )

    }

});

module.exports = ChatSend;
