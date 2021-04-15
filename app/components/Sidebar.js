import React from "react";
import { observer } from "mobx-react";
import { observable, autorun } from "mobx";
import classNames from "classnames";

import online from "stores/online";
import waitlist from "stores/waitlist";
import profile from "stores/profile";

import Chat from "./Sidebar/Chat";
import OnlineUsers from "./Sidebar/OnlineUsers";
import About from "./Sidebar/About";
import Waitlist from "./Sidebar/Waitlist";

@observer
class Sidebar extends React.Component {
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
        this.currentSidebar = "CHAT";
      }
    });

    this.goToChat = this.goToChat.bind(this);
    this.chatInputRef = React.createRef();
  }

  update(tab) {
    if (tab === this.currentSidebar) return;
    this.currentSidebar = tab;
  }

  goToChat() {
    this.currentSidebar = "CHAT";
    this.chatInputRef.current.focus();
  }

  @observable currentSidebar = profile.loggedIn ? "CHAT" : "ABOUT";

  render() {
    const chatBtnClass = classNames("show-chat-btn", "col-lg-3", {
      "sidebar-selected": this.currentSidebar === "CHAT"
    });
    const onlineBtnClass = classNames("show-ousers-btn", "col-lg-3", {
      "sidebar-selected": this.currentSidebar === "ONLINE"
    });
    const waitlistBtnClass = classNames("show-waitlist-btn", "col-lg-3", {
      "sidebar-selected": this.currentSidebar === "WAITLIST"
    });
    const aboutBtnClass = classNames("show-about-btn", "col-lg-3", {
      "sidebar-selected": this.currentSidebar === "ABOUT"
    });

    return (
      <div id="sidebar">
        <div className="row sidebar-changer">
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
          <Chat show={this.currentSidebar === "CHAT"} ref={this.chatInputRef} goToChat={this.goToChat} />
          <OnlineUsers show={this.currentSidebar === "ONLINE"} goToChat={this.goToChat} />
          <Waitlist show={this.currentSidebar === "WAITLIST"} goToChat={this.goToChat} />
          <About show={this.currentSidebar === "ABOUT"} />
        </div>
      </div>
    );
  }
}

export default Sidebar;
