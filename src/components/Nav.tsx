import {FC, useEffect, useState} from "react";
import {observer} from "mobx-react";

import {UserBit} from "./Nav/UserBit.tsx";
import TokeTimer from "./Nav/TokeTimer.js";

import file from "../static/version.json";
import profile from "../stores/profile.ts";
import tokeEvent from "../libs/tokeEvent.ts";
import {HypeProgress} from "./Nav/HypeProgress.tsx";
import cn from "classnames";
import HeartWeed from "../assets/img/heart_weed.svg";
import PeaceWeed from "../assets/img/peace_and_weed.svg";
import WeedOne from "../assets/img/weed1.svg";
import WeedTwo from "../assets/img/weed2.svg";
import WeedThree from "../assets/img/weed3.svg";
import WeedFour from "../assets/img/weed4.svg";
import WeedFive from "../assets/img/weed5.svg";
import Login from "./Login.tsx";
import { hasTosBeenAccepted } from "../libs/tos";

const TrLogo: FC = () => (
    <a
        className="navbar-brand"
        href="#"
    >
      <span className="nav-title group transition-[width]">
          <span className="group-hover:hidden">
              [tr]
          </span>

          <span className="hidden group-hover:inline">
                [treesradio]
            </span>

        <span className="hidden version-tag group-hover:inline">
            v{file.version.version}-{file.version.short}
        </span>
      </span>
    </a>
);

type TokeEffect = "heart" | "peace" | "weed";

const Nav: FC<{ show420: boolean }> = ({show420}) => {
    const [tokeEffect, setTokeEffect] = useState<TokeEffect | null>(null);
    // Track TOS acceptance state
    const [tosAccepted, setTosAccepted] = useState(hasTosBeenAccepted());

    // Update TOS state when it changes
    useEffect(() => {
        const checkTos = () => {
            setTosAccepted(hasTosBeenAccepted());
        };
        
        // Check initially
        checkTos();
        
        // Create an interval to periodically check if TOS has been accepted
        const interval = setInterval(checkTos, 1000);
        
        // Clean up interval
        return () => clearInterval(interval);
    }, []);

    const triggerTokeEffect = () => {
        const effects: TokeEffect[] = ["heart", "peace", "weed"];
        setTokeEffect(effects[Math.floor(Math.random() * 3)]);
        setTimeout(() => setTokeEffect(null), 10000);
    };

    useEffect(() => void (show420 && tokeEvent.addEventListener('toke', triggerTokeEffect)), [show420]);

    return (
        <div id="tr-nav">
            <nav id="navbar-grid"
                 className={cn("navbar navbar-default", profile.user === null && "navbar-grid-nologin")}>
                <div className="navbar-header navbar-item">
                    <TrLogo/>
                </div>
                {/* Only render Login component if TOS has been accepted */}
                <div id="navbar-space">
                    {tosAccepted && !profile.user && <Login/>}
                </div>
                {show420 && <div id="toke-effects">
                    {tokeEffect === "heart" && <div className="container-weed">
                        <img className="heart" src={HeartWeed}/>
                    </div>}
                    {tokeEffect === "peace" && <div className="container-weed">
                        <img className="peace" src={PeaceWeed}/>
                    </div>}
                    {tokeEffect === "weed" && <div className="container-weed">
                        <img className="weed" src={WeedOne}/>
                        <img className="weed" src={WeedTwo}/>
                        <img className="weed" src={WeedThree}/>
                        <img className="weed" src={WeedFour}/>
                        <img className="weed" src={WeedFive}/>
                        <img className="weed" src={WeedOne}/>
                        <img className="weed" src={WeedTwo}/>
                        <img className="weed" src={WeedThree}/>
                        <img className="weed" src={WeedFour}/>
                        <img className="weed" src={WeedFive}/>
                    </div>}
                </div>}
                <div id="hype-grid-container" className={cn([profile.user === null && "hide-small"])}>
                    <div id="hype-container" className="">
                        <HypeProgress/>
                    </div>
                </div>
                <div id="toketimer-container" className={cn([profile.user === null && "hide-small"])}>
                    <TokeTimer/>
                </div>
                <div id="userbit-container" className={cn([profile.user === null && "hide-small"])}>
                    <UserBit/>
                </div>
            </nav>
            <div id="nav-divider"/>
        </div>
    );
};

const $Nav = observer(Nav);

export {$Nav as Nav};