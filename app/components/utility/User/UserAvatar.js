import React from "react";
import { defaultAvatar, listenAvatar } from "../../../libs/avatar";
import imageWhitelist from "../../../libs/imageWhitelist";
import VisibilitySensor from "react-visibility-sensor";
import { observable, action, makeObservable } from "mobx";

export default class UserAvatar extends React.Component {
  @observable realAvatar;
  @action setRealAvatar = (prop) => (this.realAvatar = prop.replace('http:', 'https:'));
  @observable defaultAvatar;
  @action setDefaultAvatar = (prop) => (this.realAvatar = prop);

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.setState({ visible: true });

    listenAvatar(this.props.uid, (snap) =>
      this.setRealAvatar(snap.val() || this.defaultAvatar)
    );
      defaultAvatar(this.props.uid).then((avatar) => this.setDefaultAvatar(avatar));
  }

  onVisibility = (isVisible) => this.setState({ visible: isVisible });

  render() {
    return (
      <span className={this.props.className}>
        <img
          src={
            ( this.realAvatar ? imageWhitelist(this.realAvatar) : this.defaultAvatar )
          }
          className={this.props.imgClass || "avatarimg"}
          id="user-avatar"
        />
        <VisibilitySensor onChange={this.onVisibility} />
        <span className="hide">{this.props.tick}</span>
      </span>
    );
  }
}
