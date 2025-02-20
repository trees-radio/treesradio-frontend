import React from "react";
import { observer } from "mobx-react";
import { computed, observable, action } from "mobx";
import classNames from "classnames";

import profile from "../../stores/profile";
import playing from "../../stores/playing";
import HelpList from "../../stores/help";

import imageWhitelist, { allowedDomains } from "../../libs/imageWhitelist";
import UserAvatar from "../utility/User/UserAvatar";
import waitlist from "../../stores/waitlist";
import $ from "jquery";
import Modal from "../utility/Modal";
import { toast } from "react-toastify";
import LeaderBoard from "./LeaderBoard";
import FlairColor from "./FlairColor";
import PlayHistory from "./SongHistory";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

import events from "../../stores/events";

import Nothing from "../../assets/img/nothing.png";

class UserBit extends React.Component {
    dropdownItems = [
        // User Account & Profile Items
        { name: "Set Avatar", action: () => this.settingAvatar = true, icon: "fa-pencil", isCheckbox: false },
        { name: "Change Password", action: () => this.changingPassword = true, icon: "fa-key", isCheckbox: false },
        { name: "Change Email", action: () => this.changingEmail = true, icon: "fa-envelope", isCheckbox: false },
        { name: "Change flair color", action: () => this.toggleFlairColor(), icon: "fa-paint-brush", isCheckbox: false },
        
        // Display & Notification Preferences
        { name: "Desktop Notifications", action: () => this.toggleDesktopNotifications(), icon: "fa-check-square-o", isCheckbox: true, checkboxFunction: () => profile.desktopNotifications },
        { name: "Mention Audio?", action: () => this.toggleNotifications(), icon: "fa-check-square-o", isCheckbox: true, checkboxFunction: () => profile.notifications },
        { name: "Hide Gifs?", action: () => this.hideGifs(), icon: "fa-check-square-o", isCheckbox: true, checkboxFunction: () => this.gifsHidden },
        { name: "Hide BlazeBot?", action: () => this.hideBlazebot(), icon: "fa-check-square-o", isCheckbox: true, checkboxFunction: () => profile.hideBlazeBot },
        { name: "Hype Animation?", action: () => this.hideHypeBoom(), icon: "fa-check-square-o", isCheckbox: true, checkboxFunction: () => profile.hypeBoom },
        
        // Playback & Participation Preferences
        { name: "Auto Play?", action: () => waitlist.setAutoPlay(), icon: "fa-check-square-o", isCheckbox: true, checkboxFunction: () => profile.autoplay },
        { name: "Auto Join Waitlist", action: () => waitlist.setAutojoin(), icon: "fa-check-square-o", isCheckbox: true, checkboxFunction: () => profile.autoplay },
        
        // Information & Tools
        { name: "Leader Board", action: () => this.toggleLeaderboard(), icon: "fa-trophy", isCheckbox: false },
        { name: "Play History", action: () => this.toggleSongHistory(), icon: "fa-history", isCheckbox: false },
        { name: "Region Check", action: () => window.open(`https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${playing.data.info.url}`), icon: "fa-globe", isCheckbox: false },
        { name: "Help", action: () => this.toggleHelp(), icon: "fa-question-circle", isCheckbox: false },
        
        // Always Last
        { name: "Logout", action: () => this.logoutAndDisableButtons(), icon: "fa-sign-out", isCheckbox: false }
    ];

    constructor(props) {
        super(props);
    }

    onEnterKey(e, cb) {
        var key = e.keyCode || e.which;
        if (key === 13) {
            cb();
        }
    }

    addUsername() {
        profile.updateUsername(this._username.value.substr(0, 24));
    }

    @observable accessor     fontSize = 1.2;
    @observable accessor     modifierApplied = false;
    @observable accessor     legacyInterface = false;
    @observable accessor     gifsHidden = false;
    @observable accessor     showHelp = false;
    @observable accessor     settingAvatar = false;
    @observable accessor     avatarField = "";
    @observable accessor     changingPassword = false;
    @observable accessor     changingEmail = false;
    @observable accessor     showLeaders = false;
    @observable accessor     showFlairColor = false;
    @observable accessor     showHistory = false;
    

    @computed
    get avatarFieldValid() {
        return this.avatarField && imageWhitelist(this.avatarField);
    }

    @action
    changePassword() {
        const password = this._newPassword.value;
        this._newPassword.value = "";
        profile.changePassword(password).then(res => !!res && (this.changingPassword = false));
    }

    @action
    changeEmail() {
        const email = this._newEmail.value;
        this._newEmail.value = "";
        profile.changeEmail(email).then(res => !!res && (this.changingEmail = false));
    }

    @action
    checkNotificationPromise() {
        try {
            Notification.requestPermission().then();
        } catch (e) {
            return false;
        }

        return true;
    }

    @action
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

    @action
    toggleNotifications() {
        profile.notifications ? (profile.notifications = false) : (profile.notifications = true);
    }

    @action
    toggleShowMute() {
        profile.showmuted ? (profile.showmuted = false) : (profile.showmuted = true);
    }

    @action
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

    @action
    togglePlayer() {
        playing.togglePlayerSize();

        document.getElementById("reactplayerid").setAttribute("style", this.legacyInterface && playing.playerSize === "BIG" ? "display:none;" : "width:100%;height:100%;");
    }

    @action
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

    @action
    hideBlazebot() {
        profile.hideBlazeBot ? (profile.hideBlazeBot = false) : (profile.hideBlazeBot = true);
    }

    @action
    hideHypeBoom() {
        profile.hypeBoom = !profile.hypeBoom;
    }

    @action
    toggleHelp() {
        this.showHelp ? (this.showHelp = false) : (this.showHelp = true);
    }

    @action
    toggleLeaderboard() {
        this.showLeaders ? (this.showLeaders = false) : (this.showLeaders = true);
    }

    @action
    toggleFlairColor() {
        console.log("toggleFlairColor");
        this.showFlairColor ? (this.showFlairColor = false) : (this.showFlairColor = true);
    }

    @action
    toggleSongHistory() {
        this.showHistory ? (this.showHistory = false) : (this.showHistory = true);
    }

    @action
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

    @action
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

    @action
    disableIfNecessary() {
        return this.userLoggedIn() ? "" : " greyDisabled";
    }

    buildMenuItems() {
        return this.dropdownItems.map((item, index) => {
            if (item.isCheckbox) {
                return (
                    <MenuItem>
                        <div key={index} onClick={item.action} className="flex items-center hover:bg-gray-700 mx-2">
                        <i className={classNames("fa", item.checkboxFunction() ? "fa-check-square-o" : "fa-square-o", "")} />
                            <span className="ml-2">{item.name}</span>
                        </div>
                    </MenuItem>
                );
            }
            return (
                <MenuItem>
                    <div key={index} onClick={item.action} className="flex items-center hover:bg-gray-700 mx-2">
                        <i className={classNames("fa", item.icon)} />
                        <span className="ml-2">{item.name}</span>
                    </div>
                </MenuItem>
            );
        });
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
                    <Menu>

                        <MenuButton>
                            <div id={'usernametop'} toright="true" className={"btn btn-primary" + this.disableIfNecessary()}>
                                <div className="userbit-avatar">
                                    {this.showAvatar()}
                                </div>
                                <span id="username" className={"userLevel"}>
                                    <b>{profile.safeUsername}</b><span id="userbit-expander" className="fa fa-caret-down"></span>
                                </span>
                            </div>

                        </MenuButton>

                        <MenuItems anchor="top-right">
                            <div className="bg-black p-1 my-4">
                                {this.buildMenuItems()}
                            </div>
                        </MenuItems>
                    </Menu>
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
                        maxLength={20}
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
                    show={this.showFlairColor}
                    hideModal={() => {
                        this.toggleFlairColor();
                    }}
                    title="Change flair color"
                    noClose={false}>
                    <FlairColor close={this.toggleFlairColor} />
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
                    <Menu>
                        <MenuButton>
                            <div className="btn btn-primary my-4">
                            Allowed Domains <i className="fa fa-caret-down"></i>
                            </div>
                        </MenuButton>
                        <MenuItems>
                        {allowedDomains.map((d, i) => (
                            <MenuItem>
                                <div  key={i*100}>{d}</div>
                            </MenuItem>
                        ))}
                        </MenuItems>
                    </Menu>
                    <hr className="my-3"/>
                    <div className="row">
                        <div className="col-md-8">
                            <div className="form-group">
                                <label>Avatar URL</label>
                                <div className="flex flex-row items-center">
                                    <input
                                        className="form-control p-2"
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

    showSetFlairColor() {
        if (this.userLoggedIn()) {
            return (
                <Dropdown.Item key={25} onClick={() => this.toggleFlairColor()}>
                    <i className="fa fa-paint-brush" /> Change flair color
                </Dropdown.Item>
            );
        }
        return (<></>);

    }

    showAvatar() {
        return this.userLoggedIn() ? (
            <UserAvatar uid={profile.uid} />
        ) : (
            <span>
                <img className="avatarimg" src={Nothing} alt="avatar" />
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

export default observer(UserBit);