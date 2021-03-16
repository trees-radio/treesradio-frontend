import React from "react";
import rank from "libs/rank";
import getUsername from "libs/username";
import getFlair from "libs/flair";
import getPatreon from "libs/patreon";
import classNames from "classnames";
import { observable, action, makeObservable, autorun } from "mobx";

const noop = () => {};

export default class UserName extends React.Component {
  @observable rank;
  @action setRank = (rank) => (this.rank = rank);
  @observable username;
  @action setUsername = (username) => (this.username = username);
  @observable flair;
  @action setFlair = (flair) => (this.flair = flair);
  @observable patreon;
  @action setPatreon = (patreon) => (this.patreon = patreon);

  constructor(props) {
    super(props);
    makeObservable(this);
    autorun(() => {
      rank(this.props.uid).then((rank) => this.setRank(rank));
      getUsername(this.props.uid).then((username) =>
        this.setUsername(username)
      );
      getFlair(this.props.uid).then((flair) => this.setFlair(flair));
      getPatreon(this.props.uid).then((patreon) => this.setPatreon(patreon));
    });
  }

  render() {
    return (
      <span>
        <span
          onClick={this.props.onClick || noop}
          className={classNames(
            this.props.className,
            this.username == "BlazeBot"
              ? "username-bot"
              : `username-${
                  this.rank
                    ? this.rank.split(" ").join("").toLowerCase()
                    : "username-user"
                }`
          )}
        >
          {this.username}
        </span>
        <span>
          &nbsp;
          <img
            className={this.patreon ? "patreon" : "nopatreon"}
            src="img/marijuana.png"
          />
        </span>
        <span className="userflair">&nbsp;{this.flair || ""}</span>
        <span className="hide">{this.props.tick}</span>
      </span>
    );
  }
}
