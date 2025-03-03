import { createRef, FC, useState, useEffect, useRef } from "react";
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
    
    // Track initial login state to prevent automatic tab switching after manual selection
    const initialLoginRef = useRef(profile.loggedIn);
    const userSelectedTabRef = useRef(false);
    
    // Modified effect that only switches tabs on initial login, not after user selects a tab
    useEffect(() => {
        // Only switch tabs automatically on the initial login transition
        if (profile.loggedIn && !initialLoginRef.current && !userSelectedTabRef.current) {
            setCurrentSidebar("CHAT");
        }
        
        // Update the initial login state
        initialLoginRef.current = profile.loggedIn;
    }, [profile.loggedIn]);

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

    // Wrapper for tab selection that marks user interaction
    const selectTab = (tab: SidebarState) => {
        userSelectedTabRef.current = true;
        setCurrentSidebar(tab);
    };

    const goToChat = () => {
        const chatContainer = document.getElementById("chatbox");
        if (chatContainer) {
            const lastMessage = chatContainer.lastElementChild;
            if (lastMessage) {
                lastMessage.scrollIntoView({ behavior: 'smooth' });
            }
        }
        selectTab("CHAT");
        chatInputRef.current?.focus();
    }

    return (
        <div id="sidebar" className="flex flex-col h-full">
            <div className="sidebar-changer flex-shrink-0">
                <div className={chatBtnClass} ref={selChatRef} onClick={() => goToChat()}>
                    Chat
                </div>
                <div
                    className={onlineBtnClass}
                    ref={selOnlineRef}
                    onClick={() => selectTab("ONLINE")}
                >
                    Online Ents <span className="online-count">{online.online.length}</span>
                </div>
                <div
                    className={waitlistBtnClass}
                    ref={selWaitlistRef}
                    onClick={() => selectTab("WAITLIST")}
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
                    onClick={() => selectTab("ABOUT")}
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