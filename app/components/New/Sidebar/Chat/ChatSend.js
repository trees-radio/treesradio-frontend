import React from 'react';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
// import fbase from 'stores/fbase';
import chat from 'stores/chat';
import profile from 'stores/profile';
import toast from 'utils/toast';

// const noop = () => {};

export default @observer class ChatSend extends React.Component {

  @observable msg = '';

  onKeyDown(e) {
    console.log('keyDown', e);

  }

  onKeyUp(e) {
    console.log('keyUp', e);
  }

  onEnterKey(e) {
    var key = e.keyCode || e.which;
    if (key == 13 && this.msg !== '') {
      chat.sendMsg(this.msg, () => {
        this.msg = "";
      });
    }
  }

  onChange(e) {
    // console.log('onChange', e);
    if (!profile.user) {
      toast.error('You must be logged in to chat!');
    } else {
      this.msg = e.target.value;
    }
  }

  render() {
    return (
      <div>
        <div id="sendbox">
          <input
            type="text"
            placeholder="enter to send"
            id="chatinput"
            className="form-control"
            value={this.msg}
            onKeyPress={e => this.onEnterKey(e)}
            onChange={e => this.onChange(e)}
          />
        </div>
      </div>
    );
  }
}
