import React from "react";
import {observer} from "mobx-react";

import toast from "../../utils/toast"

import toketimer from "../../stores/toke";
import profile from "../../stores/profile";

class TokeTimer extends React.Component {
    joinToke = () => {
        if (profile.user !== null) {
            toketimer.joinToke();
        } else {
            toast.info("Log in to start or join a toke and toke with other users!", {delay: 1300})
        }
    };

    getButtonClasses() {
        if (profile.user !== null) {
            return toketimer.tokeUnderway ? "toke-active disabledNoLogin" : "disabledNoLogin";
        } else {
            return toketimer.tokeUnderway ? "toke-active disabledNoLogin greyDisabled" : "disabledNoLogin greyDisabled"
        }
    }

    render() {
        return (
            <div className="d-flex align-items-center">
                <div className="pt-3 mx-3">
                    <a
                        id="toke-button"
                        className={this.getButtonClasses()}
                        onClick={this.joinToke}>
                        Toke
                        <span style={{display: toketimer.tokeUnderway ? "inherit" : "none"}}>
                            &nbsp;in:&nbsp; <b>{millisToMinutesAndSeconds(toketimer.remainingTime)}</b>
                        </span>
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

export default observer(TokeTimer)