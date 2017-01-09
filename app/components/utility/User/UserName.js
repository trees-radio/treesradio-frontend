import React from 'react';
import rank from 'libs/rank';
import getUsername from 'libs/username';
import classNames from 'classnames';

const noop = () => {};

export default class UserName extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.getRank();
    this.getUsername();
  }

  getRank = async () => {
    const title = await rank(this.props.uid);
    this.setState({title});
  }

  getUsername = async () => {
    const username = await getUsername(this.props.uid);
    this.setState({username});
  }

  render() {
    let userClass = 'username-user';
    if (this.state.title) {
      userClass = `username-${this.state.title.split(' ').join('').toLowerCase()}`;
    }

    const usernameClasses = classNames(this.props.className, userClass);

    return <span onClick={this.props.onClick || noop} className={usernameClasses}>{this.state.username}</span>;
  }
}