import React from "react";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
import classNames from "classnames";

import profile from "stores/profile";
import playing from "stores/playing";
import HelpList from "stores/help";

import imageWhitelist, { allowedDomains } from "libs/imageWhitelist";
import UserAvatar from "components/utility/User/UserAvatar";
import waitlist from "stores/waitlist";
import $ from "jquery";
import Modal from "../utility/Modal";
import { toast } from "react-toastify";
import LeaderBoard from "components/Nav/LeaderBoard";
import PlayHistory from "components/Nav/SongHistory";

import events from "stores/events";
import Dropdown from "react-bootstrap/Dropdown";

@observer
export default class UserBit extends React.Component {

    onEnterKey(e, cb) {
        var key = e.keyCode || e.which;
        if (key === 13) {
            cb();
        }
    }

    addUsername() {
        profile.updateUsername(this._username.value.substr(0, 24));
    }

    @observable
    fontSize = 1.2;

    @observable
    modifierApplied = false;

    @observable
    legacyInterface = false;

    @observable
    gifsHidden = false;

    @observable
    showHelp = false;

    @observable
    settingAvatar = false;
    @observable
    avatarField = "";

    @observable
    changingPassword = false;

    @observable
    changingEmail = false;

    @computed
    get avatarFieldValid() {
        return this.avatarField && imageWhitelist(this.avatarField);
    }

    changePassword() {
        const password = this._newPassword.value;
        this._newPassword.value = "";
        profile.changePassword(password).then(res => !!res && (this.changingPassword = false));
    }

    changeEmail() {
        const email = this._newEmail.value;
        this._newEmail.value = "";
        profile.changeEmail(email).then(res => !!res && (this.changingEmail = false));
    }

    checkNotificationPromise() {
        try {
            Notification.requestPermission().then();
        } catch (e) {
            return false;
        }

        return true;
    }

    handleNotificationPermission(permission) {
        let permitted = false;
        if (!('permission' in Notification)) {
            Notification.permission = permission;
        }

        if (!(Notification.permission === 'denied' || Notification.permission === 'default')) {
            permitted = true;
        } else {
            toast.warn('Seems like you blocked notifications for this site. Please unblock and try again.')
        }

        profile.setDesktopNotifications(permitted);

    }

    toggleNotifications() {
        profile.notifications ? (profile.notifications = false) : (profile.notifications = true);
    }

    toggleShowMute() {
        profile.showmuted ? (profile.showmuted = false) : (profile.showmuted = true);
    }

    toggleInterface() {
        this.legacyInterface ? (this.legacyInterface = false) : (this.legacyInterface = true);

        playing.updateBackgroundImage(this.legacyInterface);

        document.getElementById("vidcontainer").setAttribute("style", "background-image: " + `url("${playing.backgroundImage}")`);

        if ((playing.playerSize === "BIG" && this.legacyInterface === true) || (playing.playerSize === "SMALL" && this.legacyInterface === false)) {
            this.togglePlayer();
        } else if (this.legacyInterface === false && playing.playerSize === "BIG") {
            document.getElementById("reactplayerid").setAttribute("style", "width:100%;height:100%;");
        }
    }

    togglePlayer() {
        playing.togglePlayerSize();

        document.getElementById("reactplayerid").setAttribute("style", this.legacyInterface && playing.playerSize === "BIG" ? "display:none;" : "width:100%;height:100%;");
    }

    toggleDesktopNotifications() {
        if (profile.desktopNotifications) {
            profile.setDesktopNotifications(false)
            return;
        }


        if ("Notification" in window && this.checkNotificationPromise()) {
            Notification.requestPermission()
                .then((permission) => this.handleNotificationPermission(permission));
        } else {
            toast.error("Seems like your browser doesn't support notifications :/");
        }
    }

    hideBlazebot() {
        profile.hideBlazebot ? (profile.hideBlazebot = false) : (profile.hideBlazebot = true);
    }

    hideHypeBoom() {
        profile.hypeBoom = !profile.hypeBoom;
    }

    toggleHelp() {
        this.showHelp ? (this.showHelp = false) : (this.showHelp = true);
    }

    toggleLeaderboard() {
        this.showLeaders ? (this.showLeaders = false) : (this.showLeaders = true);
    }

    toggleSongHistory() {
        this.showHistory ? (this.showHistory = false) : (this.showHistory = true);
    }

    hideGifs() {
        if (this.gifsHidden === false) {
            $("<div id='hidegifs' />")
                .html(
                    '&shy;<style>span.chat-text p img[src$=".gif"] { display: none; } span.chat-text p img[src$=".gifv"] {display: none;}</style>'
                )
                .appendTo("body");
            this.gifsHidden = true;
        } else {
            $("#hidegifs").remove();
            this.gifsHidden = false;
        }
    }

    logoutAndDisableButtons() {
        profile.logout()
            .then(() => {
                if (window.matchMedia("only screen and (orientation: portrait)")) {
                    document.getElementById("navbar-grid")
                        .setAttribute("grid-template-columns", "15vw 85vw 0 0 0");
                }

                let buttons = document.querySelectorAll('disabledNoLogin');

                buttons.forEach(button => button.classList.add('greyDisabled'));

                document.getElementById("chatscroll").setAttribute("style", "overflow:hidden;")
            });
    }

    disableIfNecessary() {
        return this.userLoggedIn() ? "" : " greyDisabled";
    }


    render() {
        events.register("show_leaderboard", (data) => {
            if (profile.user.uid == data.data.uid) this.toggleLeaderboard()
        });
        let emailVerificationResendIcon;
        if (profile.resendVerificationLoading) {
            emailVerificationResendIcon = (
                <span>
                    <i className="fa fa-spin fa-circle-o-notch" />
                </span>
            );
        } else if (profile.resendVerificationResult) {
            emailVerificationResendIcon = (
                <span>
                    <i className="fa fa-check" />
                </span>
            );
        }

        let resendVerification;

        if (profile.unverified && profile.user !== null) {
            resendVerification = (
                <Modal
                    show={profile.unverified}
                    hideModal={profile === null || !profile.unverified}
                    title="Please Verify Your Email"
                    noClose={true}
                >
                    <p>
                        Your email hasn&apos;t been verified yet! Please click the link in the activation
                        email that was sent to your address or use one of the buttons below to help you.
                    </p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Re-check Verification Status
                    </button>
                    <button className="btn btn-info" onClick={() => profile.resendVerification()}>
                        Re-send Verification Email {emailVerificationResendIcon}
                    </button>
                </Modal>
            );
        } else {
            resendVerification = "";
        }

        /*     window.addEventListener("DOMContentLoaded", () => { //TODO !IMP
                 let userNameLength = 0;

                 username(profile.uid)
                     .then(result => {
                         if (profile.user !== null) {
                             userNameLength = result.toString().length;

                             let usernamespan = document.getElementById("username")

                             // let fontSizeString = window.getComputedStyle(usernamespan).getPropertyValue("font-size");
                             let fontSizeString = "1.2em";
                             let fontSize = parseFloat(fontSizeString);
                             let unit = fontSizeString.replace("!important", "").trim().replace(fontSize.toString(), "");

                             fontSize = userNameLength >= 15 ? (fontSize * 0.7 * this.getQueryMultiplier()) : (fontSize * this.getQueryMultiplier());
                             // fontSize = Math.round(((fontSize * (userNameLength / 100)) + Number.EPSILON) * 100) / 100;
                             usernamespan.setAttribute("style", "font-size: " + fontSize + unit);
                         }
                     })
             });*/


        // if (userNameLength > 0){
        //
        // }

        // if (profile.user !== null) {
        //     let resendVerification = "";
        // } else {
        //     let resendVerification = (
        //
        //     );
        // }

        const helpCommands = [];
        const allUserCommands = [
            "join",
            "toke",
            "session",
            "joinsesh",
            "em",
            "me",
            "spirittoke",
            "gif",
            "gelato",
            "score",
            "leaderboard",
            "roll",
            "timelimit",
            "spooky",
            "joint",
            "duckhunt",
            "bang",
            "friend",
            "save",
            "hype",
            "t"
        ];
        if (HelpList.helpCommands !== undefined)
            HelpList.helpCommands.forEach((item, key) => {
                if (
                    profile.rankPermissions.admin === true ||
                    (profile.rankPermissions.commands && profile.rankPermissions.commands.includes(key)) ||
                    allUserCommands.indexOf(key) !== -1
                )
                    helpCommands.push(
                        <tr>
                            <td>
                                /{key} {item.helpstring.split(" -- ")[0].replace(/^\/(\w+)\s/, " ")}
                            </td>
                            <td>{item.helpstring.split(" -- ")[1]}</td>
                        </tr>
                    );
            });
        return (
            <div id="userbit-wrapper">
                <div id="userbitContainer" className="btn-group">
                    <Dropdown >

                        <Dropdown.Toggle id={'usernametop'} toRight="true" className={"btn btn-primary" + this.disableIfNecessary()}>
                            <><div className="userbit-avatar">
                                {this.showAvatar()}
                            </div>
                                <span id="username" className={"userLevel"}>
                                    <b>{profile.safeUsername}</b><span id="userbit-expander" className="fa fa-caret-down"></span>
                                </span></>

                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <div className="dropdown-inner-text">
                                {this.showSetAvatar()}

                                <Dropdown.Item key={1} onClick={() => (this.togglePlayer())}>
                                    <i
                                        className={classNames(
                                            "fa",
                                            this.legacyInterface ? playing.playerSize === "BIG" ? "fa-plus" : "fa-remove" : playing.playerSize === "BIG" ? "fa-compress" : "fa-expand"
                                        )}
                                    />
                                    {this.legacyInterface ? (playing.playerSize === "BIG" ? " Show Small Player" : " Hide Player") : (playing.playerSize === "BIG" ? " Collapse Player" : " Expand Player")}
                                </Dropdown.Item>
                                <Dropdown.Item key={101} onClick={() => waitlist.setShowMinutesUntil()}>
                                    <i className={
                                        classNames(
                                            "fa",
                                            waitlist.showMinutesUntil ? "fa-check-square-o" : "fa-square-o"
                                        )
                                    } />
                                    &nbsp;Waitlist Minutes Until
                                </Dropdown.Item>
                                {this.showChangeEmail()}
                                {this.showChangePassword()}
                                <Dropdown.Item key={2} href={`https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${playing.data.info.url}`}>
                                    <i className="fa fa-youtube-play" /> Region Check
                                </Dropdown.Item>
                                <Dropdown.Item key={3} onClick={() => this.hideGifs()}>
                                    <i
                                        className={classNames(
                                            "fa",
                                            this.gifsHidden === true ? "fa-check-square-o" : "fa-square-o"
                                        )}
                                    />{" "}
                                    Hide Gifs?
                                </Dropdown.Item>
                                <Dropdown.Item key={4} onClick={() => this.hideBlazebot()}>
                                    <i
                                        className={classNames(
                                            "fa",
                                            profile.hideBlazebot === true ? "fa-check-square-o" : "fa-square-o"
                                        )}
                                    />{" "}
                                    Hide BlazeBot?
                                </Dropdown.Item>
                                <Dropdown.Item key={5} onClick={() => this.hideHypeBoom()}>
                                    <i
                                        className={classNames(
                                            "fa",
                                            profile.hypeBoom === true ? "fa-check-square-o" : "fa-square-o"
                                        )}
                                    />{" "}
                                    Hype Animation?
                                </Dropdown.Item>
                                {this.showToggleDesktopNotifications()}
                                {this.showMentionAudio()}
                                {this.showMute()}
                                {this.showAutoplay()}
                                <Dropdown.Item key={6} onClick={() => this.toggleLeaderboard()}>
                                    <i className="fa fa-trophy"></i> Leader Board
                                </Dropdown.Item>

                                <Dropdown.Item key={66} onClick={() => this.toggleSongHistory()}>
                                    <i className="fa fa-history"></i> Play History
                                </Dropdown.Item>
                                <Dropdown.Item key={7} onClick={() => this.toggleHelp()}>
                                    <i className="fa fa-question-circle" /> Help
                                </Dropdown.Item>
                                {this.showGelato()}
                                {/* logout @ bottom */}
                                {this.showLogout()}
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>

                </div>
                {/*  */}
                {/* LOGGED-IN MODALS */}
                {/*  */}
                {/* Missing Username Modal */}
                <Modal
                    show={profile.noName}
                    hideModal={!profile.noName}
                    title="Missing Username"
                    noClose={true}
                    leftButton={() => this.addUsername()}
                    leftButtonText="Go!"
                >
                    <p>
                        We&apos;re missing a username for you! Please choose one. This will be your permanent
                        username, so choose wisely!
                    </p>
                    <input
                        className="form-control"
                        type="text"
                        maxLength={24}
                        ref={c => (this._username = c)}
                        onKeyPress={e => this.onEnterKey(e, () => this.addUsername())}
                        placeholder="Username"
                    />
                </Modal>
                <Modal
                    show={this.showLeaders}
                    hideModal={() => {
                        this.toggleLeaderboard();
                    }}
                    title="Leader Board"
                    noClose={false}>
                    <LeaderBoard />
                </Modal>
                <Modal
                    show={this.showHistory}
                    hideModal={() => {
                        this.toggleSongHistory();
                    }}
                    title="Play History (24 hours)"
                    noClose={false}>
                    <PlayHistory />
                </Modal>
                {/*  */}
                {/* Show Help */}
                {/*  */}
                <Modal
                    show={this.showHelp}
                    hideModal={() => {
                        this.toggleHelp();
                    }}
                    title="Blazebot Commands"
                    noClose={false}
                >
                    <p>Note that all commands may not be available.</p>
                    <table>{helpCommands}</table>
                </Modal>

                {resendVerification}
                {/*  */}
                {/* Avatar Setting Modal */}
                {/*  */}
                <Modal
                    show={this.settingAvatar}
                    hideModal={() => {
                        this.settingAvatar = false;
                    }}
                    title="Set Your Avatar"
                >
                    <p>Avatars must be hosted at one of the following sites:</p>
                    <ul>
                        {allowedDomains.map((d, i) => (
                            <Dropdown.Item key={i}>{d}</Dropdown.Item>
                        ))}
                    </ul>
                    <hr />
                    <div className="row">
                        <div className="col-md-8">
                            <div className="form-group">
                                <label>Avatar URL</label>
                                <div className="input-group">
                                    <input
                                        className="form-control"
                                        placeholder="e.g. http://i.imgur.com/1y3IemI.gif"
                                        onChange={e => (this.avatarField = e.target.value)}
                                    />
                                    <div className="input-group-addon">
                                        <i className={this.avatarFieldValid ? "fa fa-check" : "fa fa-times"}></i>
                                    </div>
                                </div>
                                <br />
                                <div className="btn-group">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => profile.setAvatar(this.avatarField)}
                                    >
                                        Set Avatar
                                    </button>
                                    <button className="btn" onClick={() => profile.clearAvatar()}>
                                        Clear Avatar
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <UserAvatar
                                uid={profile.uid}
                                className="user-avatar-preview"
                                imgClass="user-avatar-preview-img"
                            />
                        </div>
                    </div>
                </Modal>
                {/*  */}
                {/* Changing Password Modal */}
                {/*  */}
                <Modal
                    show={this.changingPassword}
                    hideModal={() => (this.changingPassword = false)}
                    title="Change Your Password"
                >
                    <div className="form-group">
                        <label>New Password</label>
                        <input className="form-control" type="password" ref={c => (this._newPassword = c)} />
                    </div>
                    <br />
                    <div>
                        <button className="btn btn-primary" onClick={() => this.changePassword()}>
                            Change Password
                        </button>
                    </div>
                </Modal>
                {/*  */}
                {/* Changing Email Modal */}
                {/*  */}
                <Modal
                    show={this.changingEmail}
                    hideModal={() => (this.changingEmail = false)}
                    title="Change Your Email"
                >
                    <div className="form-group">
                        <label>New Email</label>
                        <input className="form-control" type="email" ref={c => (this._newEmail = c)} />
                    </div>
                    <br />
                    <div>
                        <button className="btn btn-primary" onClick={() => this.changeEmail()}>
                            Change Email
                        </button>
                    </div>
                </Modal>
            </div>
        );
    }

    showMute() {
        return profile.rank && profile.rank.match(/Admin|Mod|Dev/) ?
            (
                <Dropdown.Item key={20} onClick={() => this.toggleShowMute()}>
                    <i
                        className={classNames(
                            "fa",
                            profile.showmuted ? "fa-check-square-o" : "fa-square-o"
                        )}
                    />{" "}
                    Show Muted Users
                </Dropdown.Item>
            ) : (
                <Dropdown.Item key={20}></Dropdown.Item>
            )
    }

    showMentionAudio() {
        return this.userLoggedIn() ? (<Dropdown.Item key={10} onClick={() => this.toggleNotifications()}>
            <i
                className={classNames(
                    "fa",
                    profile.notifications === true ? "fa-check-square-o" : "fa-square-o"
                )}
            />{" "}
            Mention Audio?
        </Dropdown.Item>
        ) : (
            <Dropdown.Item key={10}></Dropdown.Item>
        );
    }

    triggerIfLoggedIn(action, errorMessage) {
        return this.userLoggedIn() ? action : () => (toast.error(errorMessage));
    }

    userLoggedIn() {
        return profile.user !== null;
    }

    showAutoplay() {
        return profile.rank && profile.rank !== "User" ? (
            <Dropdown.Item key={11} onClick={() => waitlist.setAutojoin()}>
                <i
                    className={classNames("fa", profile.autoplay ? "fa-check-square-o" : "fa-square-o")}
                />{" "}
                Auto Join Waitlist
            </Dropdown.Item>
        ) : (
            <Dropdown.Item key={11}></Dropdown.Item>
        )
    }

    showToggleDesktopNotifications() {
        return this.userLoggedIn() ? (
            <Dropdown.Item key={100 /*TODO*/} onClick={() => this.toggleDesktopNotifications()}>
                <i
                    className={classNames(
                        "fa",
                        profile.desktopNotifications ? "fa-check-square-o" : "fa-square-o"
                    )}
                />{" "}
                Desktop Notifications<sup>BETA</sup>
            </Dropdown.Item>
        ) : (
            <Dropdown.Item key={100/*TODO*/}></Dropdown.Item>
        );
    }

    showLogout() {
        return this.userLoggedIn() ? (
            <Dropdown.Item key={12} onClick={() => this.logoutAndDisableButtons()}>
                <i className="fa fa-sign-out" /> Logout
            </Dropdown.Item>
        ) : (
            <Dropdown.Item key={12}></Dropdown.Item>
        )
    }

    showChangePassword() {
        return this.userLoggedIn() ? (
            <Dropdown.Item key={13}
                onClick={this.triggerIfLoggedIn(() => (this.changingPassword = true), "Log in to change Password")}>
                <i className="fa fa-key" /> Change Password
            </Dropdown.Item>
        ) : (
            <Dropdown.Item key={13} />
        )
    }

    showChangeEmail() {
        return this.userLoggedIn() ? (
            <Dropdown.Item key={14} onClick={this.triggerIfLoggedIn(() => (this.changingEmail = true), "log in to change Email")}>
                <i className="fa fa-envelope" /> Change Email
            </Dropdown.Item>
        ) : (
            <Dropdown.Item key={14}></Dropdown.Item>
        )
    }

    showSetAvatar() {
        return this.userLoggedIn() ? (
            <Dropdown.Item key={15} onClick={this.triggerIfLoggedIn(() => this.settingAvatar = true, "Log in to change Avatar")}>
                <i className="fa fa-pencil fa-fw" /> Set Avatar
            </Dropdown.Item>
        ) : (
            <Dropdown.Item key={15}></Dropdown.Item>
        )
    }

    showAvatar() {
        return this.userLoggedIn() ? (
            <UserAvatar uid={profile.uid} />
        ) : (
            <span>
                <img className="avatarimg" src="img/nothing.png" alt="avatar" />
            </span>
        )
    }

    showGelato() {
        return this.userLoggedIn() ? (
            <Dropdown.Item key={8} onClick={() => this.toggleInterface()}>
                <i
                    className={classNames(
                        "fa",
                        this.legacyInterface === true ? "fa-check-square-o" : "fa-square-o"
                    )}
                />{" "}
                Gelato?
            </Dropdown.Item>) : (<Dropdown.Item key={8}></Dropdown.Item>);
    }

    getQueryMultiplier() {
        if ($(window).width() > 1730) {
            return 1;
        }
        if (window.matchMedia("only screen and (max-width: 1300px)")) {
            return 0.6;
        } else if (window.matchMedia("only screen and (max-width: 1625px)")) {
            return 0.65;
        } else if (window.matchMedia("only screen and (max-width: 1730px")) {
            return 0.7;
        } else {
            return 1;
        }
    }
}
