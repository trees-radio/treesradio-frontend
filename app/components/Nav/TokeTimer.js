import React from "react";
import {observer} from "mobx-react";

import toketimer from "stores/toke";

@observer
export default class TokeTimer extends React.Component {
  joinToke = () => {
    toketimer.joinToke();
  };
  render() {
    return (
      <div
        style={{
          display: toketimer.tokeUnderway ? "inline-block" : "none",
          "margin-right": "15px",
          "margin-top": "7px"
        }}
      >
        <div>
          <a className="btn btn-warning" onClick={this.joinToke}>
            Toke in: <b>{millisToMinutesAndSeconds(toketimer.remainingTime)}</b>
          </a>
        </div>
      </div>
    );
  }
}
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
