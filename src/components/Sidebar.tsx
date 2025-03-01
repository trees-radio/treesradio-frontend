import { createRef, FC, useState, useEffect } from "react";
import { observer } from "mobx-react";
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
    
    // Initialize currentSidebar based on login status
    const [currentSidebar, setCurrentSidebar] = useState<SidebarState>(
        profile.loggedIn ? "CHAT" : "ABOUT"
    );
    
    // Effect to change to CHAT tab when user logs in
    useEffect(() => {
        if (profile.loggedIn && currentSidebar === "ABOUT") {
            setCurrentSidebar("CHAT");
        }
    }, [profile.loggedIn, currentSidebar]);

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
        const chatContainer = document.getElementById("chatbox")
        if (chatContainer) {
            const lastMessage = chatContainer.lastElementChild;
            if (lastMessage) {
                lastMessage.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setCurrentSidebar("CHAT");
        chatInputRef.current?.focus();
    }

    return (
        <div id="sidebar" className="flex flex-col h-full">
            <div className="sidebar-changer flex-shrink-0">
                <div className={chatBtnClass} ref={selChatRef} onClick={() => { goToChat(); }}>
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
            <Chat show={currentSidebar === "CHAT"} goToChat={goToChat} chatInputRef={chatInputRef} />
            <OnlineUsers show={currentSidebar === "ONLINE"} goToChat={goToChat} />
            <Waitlist show={currentSidebar === "WAITLIST"} goToChat={goToChat} />
            <About show={currentSidebar === "ABOUT"} />
        </div>
    );
}

export default observer(Sidebar);