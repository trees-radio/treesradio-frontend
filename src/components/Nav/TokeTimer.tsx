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
            toast("You must be logged in to join the toke!", {type:"info"})
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


function millisToMinutesAndSeconds(millis: number) {
    var minutes = Math.floor(millis / 60000);
    var seconds = Math.round((millis % 60000) / 1000);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

export default observer(TokeTimer)