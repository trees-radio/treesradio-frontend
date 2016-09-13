import React from 'react';
import {observer} from 'mobx-react';

export default @observer class ChatSend extends React.Component {
  render() {
    return (
      <div>
        <div id="sendbox">
          <input type="text" ref="sendbox" placeholder="enter to send" id="chatinput" className="form-control" onKeyDown={this.regReminder} onKeyUp={this.handleChat} />
        </div>
      </div>
    );
  }
}
