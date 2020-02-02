import React from "react";
import {observer} from "mobx-react";

import hypetimer from "stores/hype";
import profile from "stores/profile";

const hypetime = 60;
@observer
export default class HypeProgress extends React.Component {
  getHyped = () => {
    if (hypetimer.hypePercentageCharged === 100) hypetimer.getHyped();
  };

  disableIfNecessary() {

    return profile.user !== null ? "" : " greyDisabled";
  }

  render() {
    return (
      <div
        className={"hypepb"+ this.disableIfNecessary()}
        onClick={this.getHyped}
        style={{visibility: hypetimer.lasthype > 0}}
      >
        <div className={"hypeprogress"+this.disableIfNecessary()} style={{width: hypetimer.hypePercentageCharged + "%"}}>
          <a
            className="hypedone"
            onClick={this.getHyped}
            text={
              "Hype Recharging: " + convertHoursMinutesSeconds(hypetime - hypetimer.secondsfromhype)
            }
          >
            {hypetimer.hypePercentageCharged === 100
              ? "Hype Ready!"
              : convertHoursMinutesSeconds(hypetime - hypetimer.secondsfromhype)}
          </a>
        </div>
      </div>
    );
  }
}

function convertHoursMinutesSeconds(time) {
  var d = Number(time);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);
  return `${h}:${leadingZero(m, 2)}:${leadingZero(s, 2)}`;
}

function leadingZero(num, size) {
  var s = "0000" + num;
  return s.substr(s.length - size);
}
