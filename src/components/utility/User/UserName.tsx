import React from "react";
import rank from "../../../libs/rank";
import getUsername from "../../../libs/username";
import { getFlair, getFlairColors } from "../../../libs/flair";
import getPatreon from "../../../libs/patreon";
import classNames from "classnames";
import Marijuana from "../../../assets/img/marijuana.png";

const noop = () => { };

interface UserNameProps {
  uid: string;
  className?: string;
  onClick?: () => void;
  showFlair?: boolean;
}

export default class UserName extends React.Component {
  _isMounted = false;
  props: UserNameProps;
  state: { title?: string; username?: string; userflair?: string; userflairColors?: { colors: string[], angle: number, backgroundColor: string[], backgroundOpacity: number }; userpatreon?: boolean };

  constructor(props: UserNameProps) {
    super(props);
    this.props = props;
    this.state = {};
  }

  componentDidMount() {
    this._isMounted = true;
    this.getRank();
    this.getUsername();
    this.getFlair();
    this.getFlairColors();
    this.getPatreon();
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
    let flair = (<> </>);
    if (this.props.showFlair != false && userflair) {
      flair = (
        <span style={this.getFlairBackgroundColor()}>
          <span className={classNames({ 'userflair': true, 'gradient-text': this.state.userflairColors && this.state.userflairColors.colors && this.state.userflairColors.colors.length > 1 })} style={this.getFlairStyle()}>&nbsp;{userflair}</span>
        </span>
      )
    }
    return (
      <>
        {this.props.showFlair !== true && (
          <span onClick={this.props.onClick || noop} className={usernameClasses}>
            {this.state.username}
            <img className={isPatreon} src={Marijuana} />
          </span>
        )}
        {this.props.showFlair !== false && flair}
      </>
    );
  }
}
