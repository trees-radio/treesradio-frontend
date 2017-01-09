import React from 'react';
import {listenAvatar, defaultAvatar} from 'libs/avatar';

export default class UserAvatar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.getAvatar();
  }

  getAvatar = async () => {
    const fallback = await defaultAvatar(this.props.uid);

    this.setState({avatar: fallback}, () => {
      listenAvatar(this.props.uid, snap => {
        this.setState({avatar: snap.val() || fallback});
      });
    });
  }

  render() {
    return <img src={this.state.avatar} className="avatarimg"/>;
  }
}