import { useEffect, useState, useMemo } from "react";
import { observer } from "mobx-react";
// import {computed, observable, action} from "mobx";
// import classNames from "classnames";

import profile from "../../stores/profile";
import playing from "../../stores/playing";
import HelpList from "../../stores/help";

import imageWhitelist, { allowedDomains } from "../../libs/imageWhitelist";
import UserAvatar from "../utility/User/UserAvatar";
import waitlist from "../../stores/waitlist";
import $ from "cash-dom";
import Modal from "../utility/Modal";
import { toast } from "react-toastify";
import LeaderBoard from "./LeaderBoard";
import FlairColor from "./FlairColor";
import PlayHistory from "./SongHistory";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

import events from "../../stores/events";

import Nothing from "../../assets/img/nothing.png";
import { type FC } from "react";
import cn from "classnames";
import { debounce } from "lodash";

type DropdownItem = {
    name: string;
    action: () => (void | Promise<void>);
} & ({
    isCheckbox: true;
    isChecked: () => boolean;
} | {
    isCheckbox: false;
    icon: string;
});


const allUserCommands: string[] = [
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
] as const;

const MAX_USERNAME_LENGTH = 20;

const UserNameModal: FC = observer(() => {
    const [username, setUsername] = useState("");

    return (
        <Modal
            show={profile.noName}
            title="Missing Username"
            noClose={true}
            leftButton={() => profile.updateUsername(username.slice(0, MAX_USERNAME_LENGTH))}
            leftButtonText="Go!"
        >
            <p>
                We&apos;re missing a username for you! Please choose one. This will be your permanent
                username, so choose wisely!
            </p>
            <input
                className="form-control"
                type="text"
                maxLength={MAX_USERNAME_LENGTH}
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && profile.updateUsername(username.slice(0, MAX_USERNAME_LENGTH))}
                placeholder="Username"
            />
        </Modal>
    );
});

interface EventData {
    data: {
        uid: string;
    };
}

const UserBit: FC = () => {
    const [isSettingAvatar, setIsSettingAvatar] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [isShowLeaders, setIsShowLeaders] = useState(false);
    const [isShowFlairColor, setIsShowFlairColor] = useState(false);
    const [isShowHistory, setIsShowHistory] = useState(false);
    const [isShowHelp, setIsShowHelp] = useState(false);
    const [isGifsHidden, setIsGifsHidden] = useState(false);
    const [isGelato, setIsGelato] = useState(false);
    const [isMinimizedTokeDefault, setIsMinimizedTokeDefault] = useState(false);
    const [avatarField, setAvatarField] = useState("");
    const [newEmailField, setNewEmailField] = useState("");
    const [newPasswordField, setNewPasswordField] = useState("");

    useEffect(() => void events.register("show_leaderboard",
        (event: unknown) => {
            const data = event as EventData;
            if (profile.user?.uid == data.data.uid) {
                setIsShowLeaders(true);
            }
        }),
        []);

    useEffect(() => {
        setIsMinimizedTokeDefault(profile.minimizedTokeDefault);
    }, [profile.minimizedTokeDefault]);

    useEffect(() => void $("#reactplayerid").attr(
        "style",
        isGelato && playing.playerSize === "BIG" ? "display:none;" : "width:100%;height:100%;"
    ),
        [isGelato, playing.playerSize]);

    //<editor-fold desc="Dropdown Items">
    const dropdownItems: DropdownItem[] = [
        // User Account & Profile Items
        { name: "Set Avatar", action: () => setIsSettingAvatar(true), icon: "fa-pencil", isCheckbox: false },
        { name: "Change Password", action: () => setIsChangingPassword(true), icon: "fa-key", isCheckbox: false },
        { name: "Change Email", action: () => setIsChangingEmail(true), icon: "fa-envelope", isCheckbox: false },
        { name: "Waitlist Minutes Until", action: () => waitlist.setShowMinutesUntil(), isChecked: () => waitlist.showMinutesUntil, isCheckbox: true },
        {
            name: "Change flair color",
            action: () => setIsShowFlairColor(true),
            icon: "fa-paint-brush",
            isCheckbox: false
        },

        // Display & Notification Preferences
        {
            name: "Desktop Notifications",
            action: async () => {
                if (profile.desktopNotifications) {
                    profile.setDesktopNotifications(false)
                    return;
                }

                const notificationsSupported = "Notification" in window;

                if (!notificationsSupported) {
                    toast("Your browser does not accept notifications!", { type: "error" });
                    return;
                }

                const permission = await Notification.requestPermission();

                switch (permission) {
                    case 'granted':
                        profile.setDesktopNotifications(true);
                        break;
                    case 'denied':
                        toast("You denied the notifications, they will not work.", { type: "warning" });
                        break;
                    case 'default':
                        toast("How did you get here?", { type: "warning" });
                        break;
                }

            },
            isCheckbox: true,
            isChecked: () => profile.desktopNotifications
        },
        {
            name: "Mention Audio?",
            action: () => profile.notifications = !profile.notifications,
            isCheckbox: true,
            isChecked: () => profile.notifications
        },
        {
            name: "Minimize Toke Dialog by Default?",
            action: () => {
                profile.minimizedTokeDefault = !profile.minimizedTokeDefault;
                setIsMinimizedTokeDefault(!isMinimizedTokeDefault);
            },
            isCheckbox: true,
            isChecked: () => isMinimizedTokeDefault
        },
        {
            name: "Hide Gifs?",
            action: () => setIsGifsHidden(!isGifsHidden),
            isCheckbox: true,
            isChecked: () => isGifsHidden
        },
        {
            name: "Hide BlazeBot?",
            action: () => profile.hideBlazeBot = !profile.hideBlazeBot,
            isCheckbox: true,
            isChecked: () => profile.hideBlazeBot
        },
        {
            name: "Hype Animation?",
            action: () => profile.hypeBoom = !profile.hypeBoom,
            isCheckbox: true,
            isChecked: () => profile.hypeBoom
        },

        // Playback & Participation Preferences
        {
            name: "Auto Join Waitlist",
            action: () => {
                Promise.resolve(waitlist.setAutojoin())
                .catch(error => console.error("Error in auto join:", error));
            },
            isCheckbox: true,
            isChecked: () => profile.autoplay
        },

        // Information & Tools
        { name: "Leader Board", action: () => setIsShowLeaders(true), icon: "fa-trophy", isCheckbox: false },
        { name: "Play History", action: () => setIsShowHistory(true), icon: "fa-history", isCheckbox: false },
        {
            name: "Region Check",
            action: () => window.open(`https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${playing.data.info.url}`, "_blank"),
            icon: "fa-globe",
            isCheckbox: false
        },
        { name: "Help", action: () => setIsShowHelp(true), icon: "fa-question-circle", isCheckbox: false },
        { name: "Gelato?", action: () => setIsGelato(!isGelato), isCheckbox: true, isChecked: () => isGelato },

        // Always Last
        {
            name: "Logout", action: () => profile.logout()
                .then(() => {
                    if (window.matchMedia("only screen and (orientation: portrait)").matches) {
                        $("#navbar-grid").css("grid-template-columns", "15vw 85vw 0 0 0");
                    }
                    $(".disabledNoLogin").addClass("greyDisabled");
                    $("#chatscroll").css("overflow", "hidden")
                    // Reload the page
                    window.location.reload();
                }),
            icon: "fa-sign-out",
            isCheckbox: false
        }
    ];
    //</editor-fold>
    const debouncedActions = useMemo(() => {
        const createDebouncedHandler = (action: () => void) => {
            return debounce(() => {
                action();
            }, 300);
        };

        return dropdownItems.map(item => ({
            ...item,
            debouncedAction: createDebouncedHandler(item.action)
        }));
    }, []); // Empty dependency array - only created once

    console.log("Rank Permissions: ", profile.rankPermissions);
    console.log("All User Commands: ", allUserCommands);
    const helpCommandList =
        Object.entries(HelpList.helpCommands).map(
            (item, key) =>
                (profile.rankPermissions.admin ||
                    (profile.rankPermissions.commands && profile.rankPermissions.commands.includes(item[0])) ||
                    allUserCommands.indexOf(item[0]) > -1
                ) && (
                    <tr key={key}>
                        <td>
                            /{item[0]} {item[1].helpstring.split(" -- ")[0].replace(/^\/(\w+)\s/, " ")}
                        </td>
                        <td>{item[1].helpstring.split(" -- ")[1]}</td>
                    </tr>
                )
        );

    let emailVerificationResendIcon = !!(profile.resendVerificationLoading || profile.resendVerificationResult) && (
        <span>
            <i className={cn([
                "fa",
                profile.resendVerificationLoading && "fa-spin fa-circle-o-notch",
                profile.resendVerificationResult && "fa-check"
            ])} />
        </span>
    );

    let resendVerification = !!(profile.unverified && profile.user !== null) && (
        <Modal
            show={profile.unverified}
            // hideModal={!profile.unverified}
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

    if (!profile.user) {
        return (
            <div id="userbit-wrapper">
                <div className="w-max p-4 pl-12 rounded-md h-4 my-auto flex bg-[gray]">
                    <img src={Nothing} alt="User Avatar" className="w-2 my-1" />
                </div>
            </div>
        );
    }

    return (
        <div id="userbit-wrapper">
            <div id="userbitContainer" className="btn-group">
                <Menu>
                    <MenuButton>
                        <div id={'usernametop'}
                            className={"btn btn-primary"}>
                            <div className="userbit-avatar">
                                <UserAvatar uid={profile.uid ? profile.uid : ""} />
                            </div>
                            <span id="username" className="userLevel">
                                <b>{profile.safeUsername}</b>
                                <span id="userbit-expander" className="fa fa-caret-down"></span>
                            </span>
                        </div>

                    </MenuButton>

                    <MenuItems>
                        <div className="bg-black my-4 flex flex-col gap-y-1 relative z-10">
                            {debouncedActions.map((item) => (
                                <MenuItem key={item.name}>
                                    <div key={item.name} onClick={(e) => {
                                        e.preventDefault();
                                        item.debouncedAction();  // Use the pre-debounced function
                                    }}
                                        className="flex items-center hover:bg-gray-700 px-2 rounded-md">
                                        <i className={cn([
                                            "fa",
                                            item.isCheckbox && (item.isChecked() ? "fa-check-square-o" : "fa-square-o"),
                                            !item.isCheckbox && item.icon,
                                        ])} />
                                        <span className="ml-2">{item.name}</span>
                                    </div>
                                </MenuItem>
                            ))}
                        </div>
                    </MenuItems>
                </Menu>
            </div>
            {/*  */}
            {/* LOGGED-IN MODALS */}
            {/*  */}
            {/* Missing Username Modal */}
            <UserNameModal />
            <Modal
                show={isShowLeaders}
                hideModal={() => setIsShowLeaders(false)}
                title="Leader Board"
                noClose={false}>
                <LeaderBoard />
            </Modal>
            <Modal
                show={isShowFlairColor}
                hideModal={() => setIsShowFlairColor(false)}
                title="Change flair color"
                noClose={false}>
                <FlairColor close={() => setIsShowFlairColor(false)} />
            </Modal>
            <Modal
                show={isShowHistory}
                hideModal={() => setIsShowHistory(false)}
                title="Play History (24 hours)"
                noClose={false}>
                <PlayHistory />
            </Modal>
            {/*  */}
            {/* Show Help */}
            {/*  */}
            <Modal
                show={isShowHelp}
                hideModal={() => setIsShowHelp(false)}
                title="Blazebot Commands"
                noClose={false}
            >
                <p>Note that all commands may not be available.</p>
                <table>{helpCommandList}</table>
            </Modal>

            {resendVerification}
            {/*  */}
            {/* Avatar Setting Modal */}
            {/*  */}
            <Modal
                show={isSettingAvatar}
                hideModal={() => setIsSettingAvatar(false)}
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
                                <div key={i * 100}>{d}</div>
                            </MenuItem>
                        ))}
                    </MenuItems>
                </Menu>
                <hr className="my-3" />
                <div className="row">
                    <div className="col-md-8">
                        <div className="form-group">
                            <label>Avatar URL</label>
                            <div className="flex flex-row items-center">
                                <input
                                    className="form-control p-2"
                                    placeholder="e.g. http://i.imgur.com/1y3IemI.gif"
                                    value={avatarField}
                                    onChange={e => setAvatarField(e.target.value)}
                                />
                                <div className="input-group-addon">
                                    <i className={cn([
                                        "fa",
                                        imageWhitelist(avatarField) ? "fa-check" : "fa-times"
                                    ])}></i>
                                </div>
                            </div>
                            <br />
                            <div className="btn-group">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => profile.setAvatar(avatarField)}
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
                            uid={profile.uid ? profile.uid : ""}
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
                show={isChangingPassword}
                hideModal={() => setIsChangingPassword(false)}
                title="Change Your Password"
            >
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        className="form-control"
                        type="password"
                        value={newPasswordField}
                        onChange={(e) => setNewPasswordField(e.target.value)}
                    />
                </div>
                <br />
                <div>
                    <button className="btn btn-primary"
                        onClick={async () => {
                            const res = await profile.changePassword(newPasswordField);
                            if (res) {
                                setIsChangingPassword(false);
                            }
                        }}>
                        Change Password
                    </button>
                </div>
            </Modal>
            {/*  */}
            {/* Changing Email Modal */}
            {/*  */}
            <Modal
                show={isChangingEmail}
                hideModal={() => setIsChangingEmail(false)}
                title="Change Your Email"
            >
                <div className="form-group">
                    <label>New Email</label>
                    <input className="form-control" type="email" value={newEmailField}
                        onChange={(e) => setNewEmailField(e.target.value)} />
                </div>
                <br />
                <div>
                    <button className="btn btn-primary"
                        onClick={async () => {
                            const res = await profile.changeEmail(newEmailField);
                            if (res) {
                                setIsChangingEmail(false);
                            }
                        }}>
                        Change Email
                    </button>
                </div>
            </Modal>
        </div>
    );

}

const $UserBit = observer(UserBit);

export { $UserBit as UserBit };

// interface UserBitProps {
//     className?: string;
// }

// class UserBit_ extends React.Component {
//     dropdownItems = [
//         // User Account & Profile Items
//         {name: "Set Avatar", action: () => this.settingAvatar = true, icon: "fa-pencil", isCheckbox: false},
//         {name: "Change Password", action: () => this.changingPassword = true, icon: "fa-key", isCheckbox: false},
//         {name: "Change Email", action: () => this.changingEmail = true, icon: "fa-envelope", isCheckbox: false},
//         {name: "Change flair color", action: () => this.toggleFlairColor(), icon: "fa-paint-brush", isCheckbox: false},

//         // Display & Notification Preferences
//         {
//             name: "Desktop Notifications",
//             action: () => this.toggleDesktopNotifications(),
//             icon: "fa-check-square-o",
//             isCheckbox: true,
//             checkboxFunction: () => profile.desktopNotifications
//         },
//         {
//             name: "Mention Audio?",
//             action: () => this.toggleNotifications(),
//             icon: "fa-check-square-o",
//             isCheckbox: true,
//             checkboxFunction: () => profile.notifications
//         },
//         {
//             name: "Hide Gifs?",
//             action: () => this.hideGifs(),
//             icon: "fa-check-square-o",
//             isCheckbox: true,
//             checkboxFunction: () => this.gifsHidden
//         },
//         {
//             name: "Hide BlazeBot?",
//             action: () => this.hideBlazebot(),
//             icon: "fa-check-square-o",
//             isCheckbox: true,
//             checkboxFunction: () => profile.hideBlazeBot
//         },
//         {
//             name: "Hype Animation?",
//             action: () => this.hideHypeBoom(),
//             icon: "fa-check-square-o",
//             isCheckbox: true,
//             checkboxFunction: () => profile.hypeBoom
//         },

//         // Playback & Participation Preferences
//         {
//             name: "Auto Join Waitlist..",
//             action: () => waitlist.setAutojoin(),
//             icon: "fa-check-square-o",
//             isCheckbox: true,
//             checkboxFunction: () => profile.autoplay
//         },

//         // Information & Tools
//         {name: "Leader Board", action: () => this.toggleLeaderboard(), icon: "fa-trophy", isCheckbox: false},
//         {name: "Play History", action: () => this.toggleSongHistory(), icon: "fa-history", isCheckbox: false},
//         {
//             name: "Region Check",
//             action: () => window.open(`https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${playing.data.info.url}`),
//             icon: "fa-globe",
//             isCheckbox: false
//         },
//         {name: "Help", action: () => this.toggleHelp(), icon: "fa-question-circle", isCheckbox: false},

//         // Always Last
//         {name: "Logout", action: () => this.logoutAndDisableButtons(), icon: "fa-sign-out", isCheckbox: false}
//     ];

//     props: UserBitProps;
//     _username: HTMLInputElement | null = null;
//     _newPassword: HTMLInputElement | null = null;
//     _newEmail: HTMLInputElement | null = null;

//     constructor(props: UserBitProps) {
//         super(props);
//         this.props = props;
//     }

//     onEnterKey(e: React.KeyboardEvent, cb: () => void) {
//         var key = e.code || e.which || e.keyCode;
//         if (key === 13) {
//             cb();
//         }
//     }

//     addUsername() {
//         profile.updateUsername(this._username?.value?.substring(0, 24) || "");
//     }

//     @observable accessor fontSize = 1.2;
//     @observable accessor modifierApplied = false;
//     @observable accessor legacyInterface = false;
//     @observable accessor gifsHidden = false;
//     @observable accessor showHelp = false;
//     @observable accessor settingAvatar = false;
//     @observable accessor avatarField = "";
//     @observable accessor changingPassword = false;
//     @observable accessor changingEmail = false;
//     @observable accessor showLeaders = false;
//     @observable accessor showFlairColor = false;
//     @observable accessor showHistory = false;


//     @computed
//     get avatarFieldValid() {
//         return this.avatarField && imageWhitelist(this.avatarField);
//     }

//     @action
//     changePassword() {
//         const password = this._newPassword?.value;
//         if (this._newPassword) {
//             this._newPassword.value = "";
//         }
//         if (password) {
//             Promise.resolve(profile.changePassword(password)).then(res => !!res && (this.changingPassword = false));
//         }
//     }

//     @action
//     changeEmail() {
//         const email = this._newEmail?.value;
//         if (this._newEmail) {
//             this._newEmail.value = "";
//         }
//         if (email) {
//             Promise.resolve(profile.changeEmail(email)).then(res => !!res && (this.changingEmail = false));
//         }
//     }

//     @action
//     checkNotificationPromise() {
//         try {
//             Notification.requestPermission().then();
//         } catch (e) {
//             return false;
//         }

//         return true;
//     }

//     @action
//     handleNotificationPermission() {
//         let permitted = false;

//         if (!(Notification.permission === 'denied' || Notification.permission === 'default')) {
//             permitted = true;
//         } else {
//             toast("Notifications failed to register?", {type:"warning"})
//         }

//         profile.setDesktopNotifications(permitted);

//     }

//     @action
//     toggleNotifications() {
//         profile.notifications ? (profile.notifications = false) : (profile.notifications = true);
//     }

//     @action
//     toggleShowMute() {
//         profile.showmuted ? (profile.showmuted = false) : (profile.showmuted = true);
//     }

//     @action
//     toggleInterface() {
//         this.legacyInterface ? (this.legacyInterface = false) : (this.legacyInterface = true);

//         playing.updateBackgroundImage(this.legacyInterface);

//         document.getElementById("vidcontainer")?.setAttribute("style", "background-image: " + `url("${playing.backgroundImage}")`);

//         if ((playing.playerSize === "BIG" && this.legacyInterface === true) || (playing.playerSize === "SMALL" && this.legacyInterface === false)) {
//             this.togglePlayer();
//         } else if (this.legacyInterface === false && playing.playerSize === "BIG") {
//             document.getElementById("reactplayerid")?.setAttribute("style", "width:100%;height:100%;");
//         }
//     }

//     @action
//     togglePlayer() {
//         playing.togglePlayerSize();

//         document.getElementById("reactplayerid")?.setAttribute("style", this.legacyInterface && playing.playerSize === "BIG" ? "display:none;" : "width:100%;height:100%;");
//     }

//     @action
//     toggleDesktopNotifications() {
//         if (profile.desktopNotifications) {
//             profile.setDesktopNotifications(false)
//             return;
//         }


//         if ("Notification" in window && this.checkNotificationPromise()) {
//             Notification.requestPermission()
//                 .then(() => this.handleNotificationPermission());
//         }
//     }

//     @action
//     hideBlazebot() {
//         profile.hideBlazeBot ? (profile.hideBlazeBot = false) : (profile.hideBlazeBot = true);
//     }

//     @action
//     hideHypeBoom() {
//         profile.hypeBoom = !profile.hypeBoom;
//     }

//     @action
//     toggleHelp() {
//         this.showHelp ? (this.showHelp = false) : (this.showHelp = true);
//     }

//     @action
//     toggleLeaderboard() {
//         this.showLeaders ? (this.showLeaders = false) : (this.showLeaders = true);
//     }

//     @action
//     toggleFlairColor() {
//         this.showFlairColor ? (this.showFlairColor = false) : (this.showFlairColor = true);
//     }

//     @action
//     toggleSongHistory() {
//         this.showHistory ? (this.showHistory = false) : (this.showHistory = true);
//     }

//     @action
//     hideGifs() {
//         if (this.gifsHidden === false) {
//             $("<div id='hidegifs' />")
//                 .html(
//                     '&shy;<style>span.chat-text p img[src$=".gif"] { display: none; } span.chat-text p img[src$=".gifv"] {display: none;}</style>'
//                 )
//                 .appendTo("body");
//             this.gifsHidden = true;
//         } else {
//             $("#hidegifs").remove();
//             this.gifsHidden = false;
//         }
//     }

//     @action
//     logoutAndDisableButtons() {
//         profile.logout()
//             .then(() => {
//                 if (window.matchMedia("only screen and (orientation: portrait)")) {
//                     document.getElementById("navbar-grid")?.setAttribute("grid-template-columns", "15vw 85vw 0 0 0");
//                 }

//                 let buttons = document.querySelectorAll('disabledNoLogin');

//                 buttons.forEach(button => button.classList.add('greyDisabled'));

//                 document.getElementById("chatscroll")?.setAttribute("style", "overflow:hidden;")
//             });
//     }

//     @action
//     disableIfNecessary() {
//         return this.userLoggedIn() ? "" : " greyDisabled";
//     }

//     buildMenuItems() {
//         return this.dropdownItems.map((item, _index) => {
//             if (item.isCheckbox) {
//                 return (
//                     <MenuItem>
//                         <div key={item.name} onClick={item.action} className="flex items-center hover:bg-gray-700 mx-2">
//                             <i className={classNames("fa", item.checkboxFunction && item.checkboxFunction() ? "fa-check-square-o" : "fa-square-o", "")}/>
//                             <span className="ml-2">{item.name}</span>
//                         </div>
//                     </MenuItem>
//                 );
//             }
//             return (
//                 <MenuItem>
//                     <div key={item.name} onClick={item.action} className="flex items-center hover:bg-gray-700 mx-2">
//                         <i className={classNames("fa", item.icon)}/>
//                         <span className="ml-2">{item.name}</span>
//                     </div>
//                 </MenuItem>
//             );
//         });
//     }


//     render() {
//         events.register("show_leaderboard", (data) => {
//             const eventData = data as EventData;
//             if (profile.user?.uid == eventData.data.uid) this.toggleLeaderboard()
//         });
//         let emailVerificationResendIcon;
//         if (profile.resendVerificationLoading) {
//             emailVerificationResendIcon = (
//                 <span>
//                     <i className="fa fa-spin fa-circle-o-notch"/>
//                 </span>
//             );
//         } else if (profile.resendVerificationResult) {
//             emailVerificationResendIcon = (
//                 <span>
//                     <i className="fa fa-check"/>
//                 </span>
//             );
//         }

//         let resendVerification;

//         if (profile.unverified && profile.user !== null) {
//             resendVerification = (
//                 <Modal
//                     show={profile.unverified}
//                     // hideModal={profile === null || !profile.unverified}
//                     title="Please Verify Your Email"
//                     noClose={true}
//                 >
//                     <p>
//                         Your email hasn&apos;t been verified yet! Please click the link in the activation
//                         email that was sent to your address or use one of the buttons below to help you.
//                     </p>
//                     <button className="btn btn-primary" onClick={() => window.location.reload()}>
//                         Re-check Verification Status
//                     </button>
//                     <button className="btn btn-info" onClick={() => profile.resendVerification()}>
//                         Re-send Verification Email {emailVerificationResendIcon}
//                     </button>
//                 </Modal>
//             );
//         } else {
//             resendVerification = "";
//         }

//         const helpCommands: JSX.Element[] = [];
//         const allUserCommands = [
//             "join",
//             "toke",
//             "session",
//             "joinsesh",
//             "em",
//             "me",
//             "spirittoke",
//             "gif",
//             "gelato",
//             "score",
//             "leaderboard",
//             "roll",
//             "timelimit",
//             "spooky",
//             "joint",
//             "duckhunt",
//             "bang",
//             "friend",
//             "save",
//             "hype",
//             "t"
//         ];
//         if (HelpList.helpCommands !== undefined)
//             HelpList.helpCommands.forEach((item: { helpstring: string }, key: string) => {
//                 if (
//                     profile.rankPermissions.admin === true ||
//                     (profile.rankPermissions.commands && profile.rankPermissions.commands.includes(key)) ||
//                     allUserCommands.indexOf(key) !== -1
//                 )
//                     helpCommands.push(
//                         <tr>
//                             <td>
//                                 /{key} {item.helpstring.split(" -- ")[0].replace(/^\/(\w+)\s/, " ")}
//                             </td>
//                             <td>{item.helpstring.split(" -- ")[1]}</td>
//                         </tr>
//                     );
//             });
//         return (
//             <div id="userbit-wrapper">
//                 <div id="userbitContainer" className="btn-group">
//                     <Menu>

//                         <MenuButton>
//                             <div id={'usernametop'}
//                                  className={"btn btn-primary" + this.disableIfNecessary()}>
//                                 <div className="userbit-avatar">
//                                     {this.showAvatar()}
//                                 </div>
//                                 <span id="username" className={"userLevel"}>
//                                     <b>{profile.safeUsername}</b><span id="userbit-expander"
//                                                                        className="fa fa-caret-down"></span>
//                                 </span>
//                             </div>

//                         </MenuButton>

//                         <MenuItems>
//                             <div className="bg-black p-1 my-4">
//                                 {this.buildMenuItems()}
//                             </div>
//                         </MenuItems>
//                     </Menu>
//                 </div>
//                 {/*  */}
//                 {/* LOGGED-IN MODALS */}
//                 {/*  */}
//                 {/* Missing Username Modal */}
//                 <Modal
//                     show={profile.noName}
//                     // hideModal={!profile.noName}
//                     title="Missing Username"
//                     noClose={true}
//                     leftButton={() => this.addUsername()}
//                     leftButtonText="Go!"
//                 >
//                     <p>
//                         We&apos;re missing a username for you! Please choose one. This will be your permanent
//                         username, so choose wisely!
//                     </p>
//                     <input
//                         className="form-control"
//                         type="text"
//                         maxLength={20}
//                         ref={c => { this._username = c; }}
//                         onKeyPress={e => this.onEnterKey(e, () => this.addUsername())}
//                         placeholder="Username"
//                     />
//                 </Modal>
//                 <Modal
//                     show={this.showLeaders}
//                     hideModal={() => {
//                         this.toggleLeaderboard();
//                     }}
//                     title="Leader Board"
//                     noClose={false}>
//                     <LeaderBoard/>
//                 </Modal>
//                 <Modal
//                     show={this.showFlairColor}
//                     hideModal={() => {
//                         this.toggleFlairColor();
//                     }}
//                     title="Change flair color"
//                     noClose={false}>
//                     <FlairColor close={this.toggleFlairColor}/>
//                 </Modal>
//                 <Modal
//                     show={this.showHistory}
//                     hideModal={() => {
//                         this.toggleSongHistory();
//                     }}
//                     title="Play History (24 hours)"
//                     noClose={false}>
//                     <PlayHistory/>
//                 </Modal>
//                 {/*  */}
//                 {/* Show Help */}
//                 {/*  */}
//                 <Modal
//                     show={this.showHelp}
//                     hideModal={() => {
//                         this.toggleHelp();
//                     }}
//                     title="Blazebot Commands"
//                     noClose={false}
//                 >
//                     <p>Note that all commands may not be available.</p>
//                     <table>{helpCommands}</table>
//                 </Modal>

//                 {resendVerification}
//                 {/*  */}
//                 {/* Avatar Setting Modal */}
//                 {/*  */}
//                 <Modal
//                     show={this.settingAvatar}
//                     hideModal={() => this.settingAvatar = false}
//                     title="Set Your Avatar"
//                 >
//                     <p>Avatars must be hosted at one of the following sites:</p>
//                     <Menu>
//                         <MenuButton>
//                             <div className="btn btn-primary my-4">
//                                 Allowed Domains <i className="fa fa-caret-down"></i>
//                             </div>
//                         </MenuButton>
//                         <MenuItems>
//                             {allowedDomains.map((d, i) => (
//                                 <MenuItem>
//                                     <div key={i * 100}>{d}</div>
//                                 </MenuItem>
//                             ))}
//                         </MenuItems>
//                     </Menu>
//                     <hr className="my-3"/>
//                     <div className="row">
//                         <div className="col-md-8">
//                             <div className="form-group">
//                                 <label>Avatar URL</label>
//                                 <div className="flex flex-row items-center">
//                                     <input
//                                         className="form-control p-2"
//                                         placeholder="e.g. http://i.imgur.com/1y3IemI.gif"
//                                         onChange={e => (this.avatarField = e.target.value)}
//                                     />
//                                     <div className="input-group-addon">
//                                         <i className={this.avatarFieldValid ? "fa fa-check" : "fa fa-times"}></i>
//                                     </div>
//                                 </div>
//                                 <br/>
//                                 <div className="btn-group">
//                                     <button
//                                         className="btn btn-primary"
//                                         onClick={() => profile.setAvatar(this.avatarField)}
//                                     >
//                                         Set Avatar
//                                     </button>
//                                     <button className="btn" onClick={() => profile.clearAvatar()}>
//                                         Clear Avatar
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="col-md-4">
//                             <UserAvatar
//                                 uid={profile.uid ? profile.uid : ""}
//                                 className="user-avatar-preview"
//                                 imgClass="user-avatar-preview-img"
//                             />
//                         </div>
//                     </div>
//                 </Modal>
//                 {/*  */}
//                 {/* Changing Password Modal */}
//                 {/*  */}
//                 <Modal
//                     show={this.changingPassword}
//                     hideModal={() => (this.changingPassword = false)}
//                     title="Change Your Password"
//                 >
//                     <div className="form-group">
//                         <label>New Password</label>
//                         <input className="form-control" type="password" ref={c => { this._newPassword = c; }}/>
//                     </div>
//                     <br/>
//                     <div>
//                         <button className="btn btn-primary" onClick={() => this.changePassword()}>
//                             Change Password
//                         </button>
//                     </div>
//                 </Modal>
//                 {/*  */}
//                 {/* Changing Email Modal */}
//                 {/*  */}
//                 <Modal
//                     show={this.changingEmail}
//                     hideModal={() => (this.changingEmail = false)}
//                     title="Change Your Email"
//                 >
//                     <div className="form-group">
//                         <label>New Email</label>
//                         <input className="form-control" type="email" ref={c => { this._newEmail = c; }}/>
//                     </div>
//                     <br/>
//                     <div>
//                         <button className="btn btn-primary" onClick={() => this.changeEmail()}>
//                             Change Email
//                         </button>
//                     </div>
//                 </Modal>
//             </div>
//         );
//     }
//     triggerIfLoggedIn(action: string, errorMessage: string) {
//         return this.userLoggedIn() ? action : () => (toast(errorMessage, {type:"error"}));
//     }

//     userLoggedIn() {
//         return profile.user !== null;
//     }

//     showAvatar() {
//         return this.userLoggedIn() ? (
//             <UserAvatar uid={profile.uid ? profile.uid : ""}/>
//         ) : (
//             <span>
//                 <img className="avatarimg" src={Nothing} alt="avatar"/>
//             </span>
//         )
//     }

//     getQueryMultiplier() {
//         if ($(window).width() > 1730) {
//             return 1;
//         }
//         if (window.matchMedia("only screen and (max-width: 1300px)")) {
//             return 0.6;
//         } else if (window.matchMedia("only screen and (max-width: 1625px)")) {
//             return 0.65;
//         } else if (window.matchMedia("only screen and (max-width: 1730px")) {
//             return 0.7;
//         } else {
//             return 1;
//         }
//     }
// }

// export default observer(UserBit_);