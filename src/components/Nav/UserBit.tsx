import { useEffect, useState, useMemo } from "react";
import { observer } from "mobx-react";
// import {computed, observable, action} from "mobx";
// import classNames from "classnames";

import profile from "../../stores/profile";
import playing from "../../stores/playing";
import HelpList from "../../stores/help";
import chat from "../../stores/chat";

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

import {send} from "../../libs/events";
import events from "../../stores/events";

import Nothing from "../../assets/img/nothing.png";
import { type FC } from "react";
import cn from "classnames";
import { debounce } from "lodash";

type DropdownItem = {
    name: string;
    action: () => (void | Promise<void>);
    isAdminOnly?: boolean;
    isModeratorOnly?: boolean;
} & ({
    isCheckbox: true;
    isChecked: () => boolean;
} | {
    isCheckbox: false;
    icon: string;
});

// Store the original console.error function
const originalConsoleError = console.error;

// Replace console.error with a custom function
console.error = function(...args) {
  // Call the original function to maintain normal logging behavior
  originalConsoleError.apply(console, args);
  
  // Create an error event with the error message
  const errorEvent = {
    user: profile.username,
    type: 'console:error',
    timestamp: Math.floor(Date.now() / 1000),
    message: args.map(arg => {
      // Handle different types of error arguments
      if (arg instanceof Error) {
        return {
          name: arg.name,
          message: arg.message,
          stack: arg.stack
        };
      } else {
        return String(arg);
      }
    })
  };
  
  // Send the error event to the backend using the Events class
  // This will trigger the firebase database event
  send('console:error', errorEvent);
};

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
    ), [isGelato, playing.playerSize]);

    // are gifs hidden? Apply global css that hides gifs for any element with alt="tenorgif"
    useEffect(() => {
        if (profile.isGifsHidden) {
            $("img[alt='tenorgif']").css("display", "none");
        } else {
            $("img[alt='tenorgif']").css("display", "block");
        }
    }, [profile.isGifsHidden]);

    //<editor-fold desc="Dropdown Items">
    const dropdownItems: DropdownItem[] = [
        // User Account & Profile Items
        { name: "Set Avatar", action: () => setIsSettingAvatar(true), icon: "fa-pencil", isCheckbox: false },
        { name: "Change Password", action: () => setIsChangingPassword(true), icon: "fa-key", isCheckbox: false },
        { name: "Change Email", action: () => setIsChangingEmail(true), icon: "fa-envelope", isCheckbox: false },
        { name: "Small Player?", action: () => {
            console.log(playing.playerSize);
            playing.playerSize == "SMALL" ? playing.setPlayerSize("BIG") : playing.setPlayerSize("SMALL")
            console.log(playing.playerSize);
         } , isChecked: () => playing.playerSize == "SMALL", isCheckbox: true },
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
            action: () => { profile.mentionAudio = !profile.mentionAudio; },
            isCheckbox: true,
            isChecked: () => profile.mentionAudio
        },
        {
            name: "Show Admin Debug?",
            action: () => chat.showDebug = !chat.showDebug,
            isCheckbox: true,
            isChecked: () => chat.showDebug
        },
        {
            name: "Minimize Toke Dialog by Default?",
            action: () => {
                profile.minimizedTokeDefault = !profile.minimizedTokeDefault;
                setIsMinimizedTokeDefault(!isMinimizedTokeDefault);
            },
            isCheckbox: true,
            isChecked: () => profile.minimizedTokeDefault
        },
        {
            name: "Hide Gifs?",
            action: () => profile.isGifsHidden = !profile.isGifsHidden,
            isCheckbox: true,
            isChecked: () => profile.isGifsHidden
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
                try {
                    console.log(`[DEBUG] Auto-join toggle clicked, current state: ${profile.autoplay}`);
                    
                    // Always directly use the cancelAutojoin method to turn off
                    // and the setAutojoin method to turn on - this avoids relying on the profile.autoplay
                    // state which might be out of sync
                    if (profile.autoplay) {
                        console.log("[DEBUG] Attempting to turn off auto-join");
                        
                        // Force autoplay state to false first to ensure UI updates
                        profile.autoplay = false;
                        
                        // Then call our cancelAutojoin method
                        setTimeout(() => {
                            const success = waitlist.cancelAutojoin();
                            console.log(`[DEBUG] Cancel autojoin result: ${success}`);
                            
                            if (!success) {
                                toast("Failed to turn off auto-join. Try refreshing the page.", { type: "error" });
                            } else {
                                toast("Auto-join disabled", { type: "success" });
                            }
                        }, 0);
                    } else {
                        console.log("[DEBUG] Attempting to turn on auto-join");
                        // Currently disabled, so turn it on
                        Promise.resolve(waitlist.setAutojoin())
                            .catch(error => {
                                console.error("Error enabling auto-join:", error);
                                toast("Error enabling auto-join. Please try again.", { type: "error" });
                            });
                    }
                } catch (error) {
                    console.error("Error toggling auto-join:", error);
                    toast("Error with auto-join feature. Try refreshing your browser.", { type: "error" });
                }
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

        return dropdownItems.map(item => (
            (profile.rankPermissions.admin || !item.isAdminOnly) && {
                ...item,
                debouncedAction: createDebouncedHandler(item.action)
            }));
    }, []); // Empty dependency array - only created once

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
            <div id="userbitContainer" className="btn-group relative">
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

                    <MenuItems className="absolute right-0 top-full mt-1 w-64 max-w-[85vw] sm:max-w-xs origin-top-right rounded-md bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-[70vh] overflow-y-auto userbit-dropdown-scroll">
                        <div className="py-0.5">
                            {debouncedActions.map((item) => (
                                <MenuItem key={item.name}>
                                    <div key={item.name} onClick={(e) => {
                                        e.preventDefault();
                                        item.debouncedAction();  // Use the pre-debounced function
                                    }}
                                        className="flex items-center px-3 py-1 text-sm hover:bg-gray-700 cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis">
                                        <i className={cn([
                                            "fa",
                                            item.isCheckbox && (item.isChecked() ? "fa-check-square-o" : "fa-square-o"),
                                            !item.isCheckbox && item.icon,
                                            "w-4"
                                        ])} />
                                        <span className="ml-2 truncate">{item.name}</span>
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
                        <div className="my-4 btn btn-primary">
                            Allowed Domains <i className="fa fa-caret-down"></i>
                        </div>
                    </MenuButton>
                    <MenuItems>
                        {allowedDomains.map((d, i) => (
                            <MenuItem>
                                <div key={`${d}-${i}`}>{d}</div>
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
                                    className="p-2 form-control"
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
