import React from "react";
import { observer } from "mobx-react";
import waitlist from "../../stores/waitlist";
import classNames from "classnames";
import UserName from "../utility/User/UserName";
import UserAvatar from "../utility/User/UserAvatar";
import playing from "../../stores/playing";
import getUsername from "../../libs/username";

class Waitlist extends React.Component {
  render() {
    var accumulator = 0;
    var list = waitlist.onlineOnly.map((u, i) => {
      var nextsong = playing.timeStarted + playing.playerDuration + accumulator;
      var until = playing.playerDuration - playing.elapsed + accumulator;

      accumulator += u.songlength / 1000;
      return (
        <li
          key={i}
          className={classNames(
            "waitlist-item",
            Number.isInteger(i / 2) ? "waitlist-line-1" : "waitlist-line-0"
          )}
        >
          <div className="waitlist-position">
            <span>#{i + 1}</span>
          </div>
          <div className="waitlist-avatar">
            <UserAvatar uid={u.uid} />
          </div>
          <div className="waitlist-name-top">
            <UserName className="waitlist-name" uid={u.uid} onClick={async () => {
              const username = await getUsername(u.uid);
              $("#chatinput").val($("#chatinput").val() + " @" + username + " ");
              this.props.goToChat();
              // TODO: implement focus with forward ref, jquery not working: $("#chatinput").focus();
            }} />
            <span className="waitlist-play-time">{waitlist.showMinutesUntil ? minutesSeconds(until) : startTime(nextsong * 1000)}</span>
          </div>
        </li>
      );
    });

    return (
      <div className="waitlist-scroll" style={this.props.show ? {} : { display: "none" }}>
        <ul className="waitlist-list">{list}</ul>
      </div>
    );
  }
}
function minutesSeconds(time) {
  var minutes = Math.floor(time / 60);
  var seconds = time - minutes * 60;
  return `${minutes < 10 ? '0' : ''}${Math.floor(minutes)}:${seconds < 10 ? '0' : ''}${Math.floor(seconds)}`;
}
function startTime(dateObj) {
  var today = new Date(dateObj);
  return today.toLocaleTimeString();
}

export default observer(Waitlist);