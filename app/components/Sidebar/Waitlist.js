import React from "react";
import {observer} from "mobx-react";
import waitlist from "stores/waitlist";
import classNames from "classnames";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";
import playing from "stores/playing";

@observer
export default class Waitlist extends React.Component {
  render() {
    var accumulator = 0;
    var list = waitlist.onlineOnly.map((u, i) => {
      var nextsong = playing.timeStarted + playing.playerDuration + accumulator;
      accumulator += u.songlength/1000;

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
            <UserName className="waitlist-name" uid={u.uid} />
            {startTime(nextsong*1000)}
          </div>
        </li>
      );
    });

    return (
      <div className="waitlist-scroll" style={this.props.show ? {} : {display: "none"}}>
        <ul className="waitlist-list">{list}</ul>
      </div>
    );
  }
}


function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function startTime(dateObj) {
  var today = new Date(dateObj);
  var h = today.getHours();
  var m = today.getMinutes();
  // add a zero in front of numbers<10
  m = checkTime(m);
  return  `${h}:${m}`;
}
