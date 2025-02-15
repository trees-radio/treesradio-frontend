import React from "react";
import rank from "../../../libs/rank";
import getUsername from "../../../libs/username";
import { getFlair, getFlairColors } from "../../../libs/flair";
import getPatreon from "../../../libs/patreon";
import classNames from "classnames";

const noop = () => { };

export default class UserName extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {};
    this.getRank();
    this.getUsername();
    this.getFlair();
    this.getFlairColors();
    this.getPatreon();
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getRank = async () => {
    const title = await rank(this.props.uid);
    this.setState({ title });
  };

  getUsername = async () => {
    const username = await getUsername(this.props.uid);
    this.setState({ username });
  };

  getFlair = async () => {
    const userflair = await getFlair(this.props.uid);
    this.setState({ userflair });
  };

  getFlairColors = async () => {
    const userflairColors = await getFlairColors(this.props.uid);

    this.setState({ userflairColors });
  };

  getPatreon = async () => {
    const userpatreon = await getPatreon(this.props.uid);
    this.setState({ userpatreon });
  };

  getFlairStyle = () => {

    if (!this.state.userflairColors || !this.state.userflairColors.colors || this.state.userflairColors.colors.length === 0) {
      return { color: '#808080' };
    }

    if (this.state.userflairColors.colors.length === 1) {
      return { color: this.state.userflairColors.colors[0] };
    }

    return {
      'background': `-webkit-linear-gradient(${this.state.userflairColors.angle ?? 0}deg, ${this.state.userflairColors.colors.join(',')})`
    };
  };

  getFlairBackgroundColor() {
    if (!this.state.userflairColors || !this.state.userflairColors.backgroundColor || this.state.userflairColors.backgroundColor.length === 0) {
      return {};
    }

    let opacity = Math.floor(this.state.userflairColors.backgroundOpacity * 255 / 100);
    return {
      'background': this.state.userflairColors.backgroundColor[0] + opacity.toString(16).padStart(2, '0')
    };
  }

  render() {
    let userClass = "username-user";
    if (this.state.username == "BlazeBot") userClass = "username-bot";

    if (this.state.title) {
      userClass = `username-${this.state.title
        .split(" ")
        .join("")
        .toLowerCase()}`;
    }

    let userflair = "";

    if (this.state.userflair) {
      userflair = this.state.userflair;
    }
    let isPatreon = "nopatreon";
    if (this.state.userpatreon) {
      isPatreon = "patreon";
    }

    const usernameClasses = classNames(this.props.className, userClass);

    return (
      <span>
        <span onClick={this.props.onClick || noop} className={usernameClasses}>
          {this.state.username}
        </span>
        <span>
          &nbsp;
          <img className={isPatreon} src="img/marijuana.png" />
        </span>
        <span style={this.getFlairBackgroundColor()}>
          <span className={classNames({ 'userflair': true, 'gradient-text': this.state.userflairColors && this.state.userflairColors.colors && this.state.userflairColors.colors.length > 1 })} style={this.getFlairStyle()}>&nbsp;{userflair}</span>
        </span>
      </span>
    );
  }
}
