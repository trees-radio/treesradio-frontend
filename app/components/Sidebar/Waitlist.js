import React from "react";
import {observer} from "mobx-react";
import waitlist from "stores/waitlist";
import classNames from "classnames";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";

@observer
export default (class Waitlist extends React.Component {
  render() {
    var list = waitlist.onlineOnly.map((u, i) => {
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
});
