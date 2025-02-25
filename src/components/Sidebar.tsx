import React, {createRef, FC, useState} from "react";
import {observer} from "mobx-react";
import {action, autorun, observable} from "mobx";
import classNames from "classnames";

import online from "../stores/online";
import waitlist from "../stores/waitlist";
import profile from "../stores/profile";

import Chat from "./Sidebar/Chat";
import OnlineUsers from "./Sidebar/OnlineUsers";
import About from "./Sidebar/About";
import Waitlist from "./Sidebar/Waitlist";

type SidebarState = "CHAT" | "ONLINE" | "WAITLIST" | "ABOUT";

const Sidebar: FC = () => {
    const selChatRef = createRef<HTMLDivElement>();
    const selOnlineRef = createRef<HTMLDivElement>();
    const selWaitlistRef = createRef<HTMLDivElement>();
    const selAboutRef = createRef<HTMLDivElement>();
    const chatInputRef = createRef<HTMLInputElement>();
    const [currentSidebar, setCurrentSidebar] = useState<SidebarState>(profile.loggedIn ? "CHAT" : "ABOUT");

    const chatBtnClass = classNames("show-chat-btn", {
        "sidebar-selected": currentSidebar === "CHAT"
    });
    const onlineBtnClass = classNames("show-ousers-btn", {
        "sidebar-selected": currentSidebar === "ONLINE"
    });
    const waitlistBtnClass = classNames("show-waitlist-btn", {
        "sidebar-selected": currentSidebar === "WAITLIST"
    });
    const aboutBtnClass = classNames("show-about-btn", {
        "sidebar-selected": currentSidebar === "ABOUT"
    });

    const goToChat = () => {
        setCurrentSidebar("CHAT");
        chatInputRef.current?.focus();
    }

    return (
        <div id="sidebar">
            <div className="sidebar-changer">
                <div className={chatBtnClass} ref={selChatRef} onClick={() => setCurrentSidebar("CHAT")}>
                    Chat
                </div>
                <div
                    className={onlineBtnClass}
                    ref={selOnlineRef}
                    onClick={() => setCurrentSidebar("ONLINE")}
                >
                    Online Ents <span className="online-count">{online.online.length}</span>
                </div>
                <div
                    className={waitlistBtnClass}
                    ref={selWaitlistRef}
                    onClick={() => setCurrentSidebar("WAITLIST")}
                >
                    Waitlist{" "}
                    <span className="waitlist-count">
              {waitlist.inWaitlist && waitlist.waitlistPosition !== false
                  ? waitlist.waitlistPosition + "/"
                  : ""}
                        {waitlist.count}
            </span>
                </div>
                <div
                    className={aboutBtnClass}
                    ref={selAboutRef}
                    onClick={() => setCurrentSidebar("ABOUT")}
                >
                    About
                </div>
            </div>
            <div id="chatcontainertop" className="">
                <Chat show={currentSidebar === "CHAT"} ref={chatInputRef} goToChat={goToChat}/>
                <OnlineUsers show={currentSidebar === "ONLINE"} goToChat={goToChat}/>
                <Waitlist show={currentSidebar === "WAITLIST"} goToChat={goToChat}/>
                <About show={currentSidebar === "ABOUT"}/>
            </div>
        </div>
    );
}

const $Sidebar = observer(Sidebar);

export {$Sidebar as Sidebar};

class Sidebar_ extends React.Component {
    constructor() {
        super();

        const loggedInAtRender = profile.loggedIn;
        this.selChatRef = React.createRef();
        this.selOnlineRef = React.createRef();
        this.selWaitlistRef = React.createRef();
        this.selAboutRef = React.createRef();

        autorun(() => {
            const loggedInAfterRender = !loggedInAtRender && profile.loggedIn;
            if (this.currentSidebar === "ABOUT" && loggedInAfterRender) {
                this.setCurrentSidebar("CHAT");
            }
        });
    }

    @observable accessor currentSidebar = profile.loggedIn ? "CHAT" : "ABOUT";

    @action
    setCurrentSidebar(tab) {
        this.currentSidebar = tab;
    }

    @action
    update(tab) {
        if (tab === this.currentSidebar) return;
        this.setCurrentSidebar(tab);
    }

    @action
    goToChat = () => {
        this.setCurrentSidebar("CHAT");
        this.chatInputRef.current.focus();
    }

    render() {
        const chatBtnClass = classNames("show-chat-btn", {
            "sidebar-selected": this.currentSidebar === "CHAT"
        });
        const onlineBtnClass = classNames("show-ousers-btn", {
            "sidebar-selected": this.currentSidebar === "ONLINE"
        });
        const waitlistBtnClass = classNames("show-waitlist-btn", {
            "sidebar-selected": this.currentSidebar === "WAITLIST"
        });
        const aboutBtnClass = classNames("show-about-btn", {
            "sidebar-selected": this.currentSidebar === "ABOUT"
        });

        return (
            <div id="sidebar">
                <div className="sidebar-changer">
                    <div className={chatBtnClass} ref={this.selChatRef} onClick={() => this.update("CHAT")}>
                        Chat
                    </div>
                    <div
                        className={onlineBtnClass}
                        ref={this.selOnlineRef}
                        onClick={() => this.update("ONLINE")}
                    >
                        Online Ents <span className="online-count">{online.online.length}</span>
                    </div>
                    <div
                        className={waitlistBtnClass}
                        ref={this.selWaitlistRef}
                        onClick={() => this.update("WAITLIST")}
                    >
                        Waitlist{" "}
                        <span className="waitlist-count">
              {waitlist.inWaitlist && waitlist.waitlistPosition !== false
                  ? waitlist.waitlistPosition + "/"
                  : ""}
                            {waitlist.count}
            </span>
                    </div>
                    <div
                        className={aboutBtnClass}
                        ref={this.selAboutRef}
                        onClick={() => this.update("ABOUT")}
                    >
                        About
                    </div>
                </div>
                <div id="chatcontainertop" className="">
                    <Chat show={this.currentSidebar === "CHAT"} ref={this.chatInputRef} goToChat={this.goToChat}/>
                    <OnlineUsers show={this.currentSidebar === "ONLINE"} goToChat={this.goToChat}/>
                    <Waitlist show={this.currentSidebar === "WAITLIST"} goToChat={this.goToChat}/>
                    <About show={this.currentSidebar === "ABOUT"}/>
                </div>
            </div>
        );
    }
}

export default observer(Sidebar_);
