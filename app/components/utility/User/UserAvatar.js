import React from "react";
import { defaultAvatar, listenAvatar } from "../../../libs/avatar";
import imageWhitelist from "../../../libs/imageWhitelist";
import VisibilitySensor from "react-visibility-sensor";
import EMPTY_IMG from "../../../img/nothing.png";
import { observable, action, makeObservable } from "mobx";

export default class UserAvatar extends React.Component {
  @observable avatar;
  @action setAvatar = (prop) => (this.avatar = prop);

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.setState({ visible: true });

    listenAvatar(this.props.uid, (snap) =>
      this.setAvatar(snap.val() || this.avatar)
    );
    if (!this.avatar)
      defaultAvatar(this.props.uid).then((avatar) => this.setAvatar(avatar));
  }

  onVisibility = (isVisible) => this.setState({ visible: isVisible });

  render() {
    return (
      <span className={this.props.className}>
        <img
          src={
            imageWhitelist(this.avatar)
              ? this.avatar.replace("http:", "https:")
              : EMPTY_IMG
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
