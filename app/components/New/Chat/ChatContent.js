import React from 'react';
import {observer} from 'mobx-react';

export default @observer class ChatContent extends React.Component {
  render() {
    return (
      <div id="chatscroll" ref="chatScroll">
        <ul id="chatbox">
          {undefined}
        </ul>
      </div>
    );
  }
}
