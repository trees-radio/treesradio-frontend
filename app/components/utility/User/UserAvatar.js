import React from 'react';
import {listenAvatar, defaultAvatar} from 'libs/avatar';
import imageWhitelist from 'libs/imageWhitelist';
import VisibilitySensor from 'react-visibility-sensor';
import EMPTY_IMG from 'img/nothing.png';
import {autorun} from 'mobx';

export default class UserAvatar extends React.Component {
  componentWillUnmount() {
	  this.setState = (state,callback)=>{
		            return;
			          };
  }
  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };
    this.getAvatar();
  }

  getAvatar = async() => {
    const fallback = await defaultAvatar(this.props.uid);

    this.setState({
      avatar: fallback
    }, () => {
      listenAvatar(this.props.uid, snap => {
        this.setState({
          avatar: snap.val() || fallback
        });
      });
    });
  }

  onVisibility = isVisible => this.setState({visible: isVisible});

  render() {
    let avatar;
    if (imageWhitelist(this.state.avatar)) {
      avatar = this.state.avatar;
    } else {
      avatar = EMPTY_IMG;
    }

    avatar = avatar.replace(/http:/, 'https:');

    let style = {};

    return (
      <span className={this.props.className}>
        <img src={avatar} className={this.props.imgClass || "avatarimg"} style={style}/>
        <VisibilitySensor onChange={this.onVisibility}/>
      </span>
    );
  }
}
