import React, {FC, Fragment, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {computed, observable} from "mobx";
import {debounce} from "lodash";

import UserBit from "./Nav/UserBit.jsx";
import TokeTimer from "./Nav/TokeTimer.jsx";

import file from "../static/version.json";
import profile from "../stores/profile";
import $ from "cash-dom";
import Modal from "./utility/Modal";
import imageWhitelist from "../libs/imageWhitelist";
import tokeEvent from "../libs/tokeEvent";
import {HypeProgress} from "./Nav/HypeProgress.tsx";
import cn from "classnames";

/*
const Version: FC = () => (
    <span className="version-tag hidden group-hover:inline">
        v{file.version.version}-{file.version.short}
    </span>
);
*/

const Login: FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resettingPassword, setResettingPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    // TODO this is the most illegal dogshit code and needs to be completely rewritten p.s. kill me
    const login = async () => {
        if (await profile.login(email, password)) {
            document.getElementById("chatscroll")?.setAttribute("style", "");

            const navbarGrid = document.getElementById("navbar-grid");

            navbarGrid?.classList.remove('navbar-grid-noLogin');

            if (window.matchMedia("only screen and (orientation: portrait)")) {
                navbarGrid
                    ?.setAttribute("grid-template-columns",
                        window
                            .matchMedia("only screen and (max-width: 1500px")
                            .matches ? "15vw 42vw 14vw 9vw 20vw" : "15vw 46vw 14vw 9vw 16vw");
            }

            const buttons = document.querySelectorAll('.disabledNoLogin');
            buttons.forEach(button => button.classList.remove('greyDisabled'));

            // TODO noop?
            // profile.setAvatar(this.avatarField);
        }
    }
    const resetPassword = async () =>
        await profile.sendPassReset(resetEmail) && setResettingPassword(false);

    //TODO mobile?
    return (
        <div id="loginWrapper">
            <div className="form-inline" id="loginForm">
                <div className="form-group" id="emailpassfields">
                    <div className="input-group margin-bottom-sm" id="emailbox">
                                <span className="input-group-addon">
                                    <i className="fa fa-envelope-o fa-fw"></i>
                                </span>
                        <input
                            className="form-control"
                            type="email"
                            id="emailInput"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && $("#passInput").trigger("focus")}
                        />
                    </div>
                    <div className="input-group">
                                <span className="input-group-addon">
                                    <i className="fa fa-key fa-fw"></i>
                                </span>
                        <input
                            className="form-control"
                            type="password"
                            id="passInput"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && login()}
                        />
                    </div>
                </div>
                <div id="loginButtons">
                    <button className="btn btn-primary login-form-button" id="loginbutton"
                            onClick={login}>
                        Login
                    </button>
                    <button
                        className="btn btn-default login-form-button"
                        id="regbutton"
                        onClick={() => profile.register(email, password)}
                    >
                        Register
                    </button>
                    <button
                        className="btn btn-primary login-form-button"
                        id="reset-password-btn"
                        onClick={() => setResettingPassword(true)}
                    >
                        Password Reset
                    </button>
                </div>
            </div>
            {/* Password Reset Modal */}
            <Modal
                title="Password Reset"
                show={resettingPassword}
                hideModal={() => setResettingPassword(false)}
                leftButton={() => resetPassword()}
                leftButtonText="Send!"
            >
                <p>Please enter the email of the account you would like to recover.</p>
                <input
                    className="form-control"
                    type="text"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && resetPassword()}
                    placeholder="Email Address"
                />
            </Modal>
        </div>
    );
};

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

        <span className="version-tag hidden group-hover:inline">
            v{file.version.version}-{file.version.short}
        </span>
      </span>
    </a>
);

type TokeEffect = "heart" | "peace" | "weed";

const Nav: FC<{ show420: boolean }> = ({show420}) => {
    const [tokeEffect, setTokeEffect] = useState<TokeEffect | null>(null);

    const triggerTokeEffect = () => {
        const effects: TokeEffect[] = ["heart", "peace", "weed"];
        setTokeEffect(effects[Math.floor(Math.random() * 3)]);
        setTimeout(() => setTokeEffect(null), 10000);
    };

    // TODO pretty sure this does not work, either way it is illegal and should be handled differently
    useEffect(() => void (show420 && tokeEvent.addEventListener('toke', triggerTokeEffect)), [show420]);

    return (
        <div id="tr-nav">
            <nav id="navbar-grid"
                 className={cn("navbar navbar-default", profile.user === null && "navbar-grid-nologin")}>
                <div className="navbar-header navbar-item">
                    <TrLogo/>
                </div>
                <div id="navbar-space">{!profile.user && <Login/>}</div>
                {show420 && <div id="toke-effects">
                    {tokeEffect === "heart" && <div className="container-weed">
                        <img className="heart" src="../assets/img/heart_weed.svg"/>
                    </div>}
                    {tokeEffect === "peace" && <div className="container-weed">
                        <img className="peace" src="../assets/img/peace_and_weed.svg"/>
                    </div>}
                    {tokeEffect === "weed" && <div className="container-weed">
                        <img className="weed" src="../assets/img/weed1.svg"/>
                        <img className="weed" src="../assets/img/weed2.svg"/>
                        <img className="weed" src="../assets/img/weed3.svg"/>
                        <img className="weed" src="../assets/img/weed4.svg"/>
                        <img className="weed" src="../assets/img/weed5.svg"/>
                        <img className="weed" src="../assets/img/weed1.svg"/>
                        <img className="weed" src="../assets/img/weed2.svg"/>
                        <img className="weed" src="../assets/img/weed3.svg"/>
                        <img className="weed" src="../assets/img/weed4.svg"/>
                        <img className="weed" src="../assets/img/weed5.svg"/>
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

//
// class Nav_ extends React.Component {
//
//     @observable accessor avatarField = "";
//     @observable accessor resettingPassword = false;
//
//     constructor(props) {
//         super(props);
//         this.state = {showHeartWeed: false, showPeaceWeed: false, showWeed: false};
//         this.triggerTokeEffect = this.triggerTokeEffect.bind(this);
//         if (this.props.show420) {
//             tokeEvent.addEventListener('toke', this.triggerTokeEffect);
//         }
//     }
//
//     componentDidMount() {
//         if (window.matchMedia("only screen and (orientation: portrait)") && profile === null) {
//             document.getElementById("navbar-grid").setAttribute("grid-template-columns", "15vw 85vw 0 0 0");
//         }
//     }
//
//     @computed
//     get avatarFieldValid() {
//         return this.avatarField && imageWhitelist(this.avatarField);
//     }
//
//     onEnterKey(e, cb) {
//         let key = e.keyCode || e.which;
//         if (key === 13) {
//             cb();
//         }
//     }
//
//     async sendPassReset() {
//         const result = await profile.sendPassReset(this._resetEmail.value);
//         if (result) this.resettingPassword = false;
//     }
//
//
//     @observable accessor hoveredTitle = false;
//     @observable accessor title = "[tr]";
//
//     onHover = debounce(
//         () => {
//             this.hoveredTitle = true;
//             this.title = "[treesradio]";
//         },
//         500,
//         {leading: true}
//     );
//     offHover = debounce(() => {
//         this.hoveredTitle = false;
//         this.title = "[tr]";
//     }, 500);
//
//     triggerTokeEffect() {
//         let randomEffect = Math.floor(Math.random() * 3);
//
//         if (randomEffect === 0) {
//             this.setState({showHeartWeed: true});
//             setTimeout(() => this.setState({showHeartWeed: false}), 10000);
//         } else if (randomEffect === 1) {
//             this.setState({showPeaceWeed: true});
//             setTimeout(() => this.setState({showPeaceWeed: false}), 10000);
//         } else {
//             this.setState({showWeed: true});
//             setTimeout(() => this.setState({showWeed: false}), 10000);
//         }
//     }
//
//     login() {
//         if (profile.login(this._email.value, this._pass.value)) {
//             document.getElementById("chatscroll").setAttribute("style", "");
//
//             let navbarGrid = document.getElementById("navbar-grid");
//
//             navbarGrid.classList.remove('navbar-grid-noLogin');
//
//             if (window.matchMedia("only screen and (orientation: portrait)")) {
//                 navbarGrid
//                     .setAttribute("grid-template-columns",
//                         window
//                             .matchMedia("only screen and (max-width: 1500px")
//                             .matches ? "15vw 42vw 14vw 9vw 20vw" : "15vw 46vw 14vw 9vw 16vw");
//             }
//
//             let buttons = document.querySelectorAll('.disabledNoLogin');
//             buttons.forEach(button => button.classList.remove('greyDisabled'));
//
//             profile.setAvatar(this.avatarField);
//         }
//     }
//
//     disableIfNecessary() {
//         return profile.user !== null ? "" : "hide-small";
//     }
//
//     render() {
//
//         //TODO research what this is
//         /*   let emailVerificationResendIcon;
//            if (profile.resendVerificationLoading) {
//                emailVerificationResendIcon = (
//                    <span>
//                <i className="fa fa-spin fa-circle-o-notch"></i>
//              </span>
//                );
//            } else if (profile.resendVerificationResult) {
//                emailVerificationResendIcon = (
//                    <span>
//                <i className="fa fa-check"></i>
//              </span>
//                );
//            }*/
//
//         // document.addEventListener("DOMContentLoaded",() => {
//         //     let button = new ExplosiveButton("button");
//         // });
//
//         let login;
//
//         if (profile.user !== null) {
//             login = "";
//         } else {
//             //TODO use state ?
//             login = (
//                 <div id="loginWrapper">
//                     <div className="form-inline" id="loginForm">
//                         <div className="form-group" id="emailpassfields">
//                             <div className="input-group margin-bottom-sm" id="emailbox">
//                                 <span className="input-group-addon">
//                                     <i className="fa fa-envelope-o fa-fw"></i>
//                                 </span>
//                                 <input
//                                     className="form-control"
//                                     type="email"
//                                     id="emailInput"
//                                     ref={c => (this._email = c)}
//                                     onKeyPress={e => this.onEnterKey(e, () => $("#passInput").focus())}
//                                 />
//                             </div>
//                             <div className="input-group">
//                                 <span className="input-group-addon">
//                                     <i className="fa fa-key fa-fw"></i>
//                                 </span>
//                                 <input
//                                     className="form-control"
//                                     type="password"
//                                     id="passInput"
//                                     onKeyPress={e => this.onEnterKey(e, () => this.login())}
//                                     ref={c => (this._pass = c)}
//                                 />
//                             </div>
//                         </div>
//                         <div id="loginButtons">
//                             <button className="btn btn-primary login-form-button" id="loginbutton"
//                                     onClick={() => this.login()}>
//                                 Login
//                             </button>
//                             <button
//                                 className="btn btn-default login-form-button"
//                                 id="regbutton"
//                                 onClick={() => profile.register(this._email.value, this._pass.value)}
//                             >
//                                 Register
//                             </button>
//                             <button
//                                 className="btn btn-primary login-form-button"
//                                 id="reset-password-btn"
//                                 onClick={() => (this.resettingPassword = true)}
//                             >
//                                 Password Reset
//                             </button>
//                         </div>
//                     </div>
//                     {/* Password Reset Modal */}
//                     <Modal
//                         title="Password Reset"
//                         show={this.resettingPassword}
//                         hideModal={() => (this.resettingPassword = false)}
//                         leftButton={() => this.sendPassReset()}
//                         leftButtonText="Send!"
//                     >
//                         <p>Please enter the email of the account you would like to recover.</p>
//                         <input
//                             className="form-control"
//                             type="text"
//                             ref={c => (this._resetEmail = c)}
//                             onKeyDown={e => this.onEnterKey(e, () => this.sendPassReset())}
//                             placeholder="Email Address"
//                         />
//                     </Modal>
//                 </div>
//             );
//         }
//
//
//         const title = (
//             <span className="nav-title group">
//                 <span>{this.title}</span> <Version/>
//             </span>
//         );
//
//
//         return (
//             <div id="tr-nav">
//                 <nav id="navbar-grid"
//                      className={profile.user === null ? "navbar navbar-default navbar-grid-nologin" : "navbar navbar-default"}>
//                     <div className="navbar-header navbar-item">
//                         <a
//                             className="navbar-brand"
//                             href="#"
//                             onMouseOver={() => this.onHover()}
//                             onMouseOut={() => this.offHover()}
//                         >
//                             {title}
//                         </a>
//                     </div>
//                     <div id="navbar-space">{login}</div>
//                     {this.props.show420 && <div id="toke-effects">
//                         {this.state.showHeartWeed && <div className="container-weed">
//                             <img className="heart" src="img/heart_weed.svg"/>
//                         </div>}
//                         {this.state.showPeaceWeed && <div className="container-weed">
//                             <img className="peace" src="img/peace_and_weed.svg"/>
//                         </div>}
//                         {this.state.showWeed && <div className="container-weed">
//                             <img className="weed" src="img/weed1.svg"/>
//                             <img className="weed" src="img/weed2.svg"/>
//                             <img className="weed" src="img/weed3.svg"/>
//                             <img className="weed" src="img/weed4.svg"/>
//                             <img className="weed" src="img/weed5.svg"/>
//                             <img className="weed" src="img/weed1.svg"/>
//                             <img className="weed" src="img/weed2.svg"/>
//                             <img className="weed" src="img/weed3.svg"/>
//                             <img className="weed" src="img/weed4.svg"/>
//                             <img className="weed" src="img/weed5.svg"/>
//                         </div>}
//                     </div>}
//                     <div id="hype-grid-container" className={this.disableIfNecessary()}>
//                         <div id="hype-container" className="">
//                             <HypeProgress/>
//                         </div>
//                     </div>
//                     <div id="toketimer-container" className={this.disableIfNecessary()}>
//                         <TokeTimer/>
//                     </div>
//                     <div id="userbit-container" className={this.disableIfNecessary()}>
//                         <UserBit/>
//                         {/* .navbar-collapse */}
//                     </div>
//                     {/*<div id="bump"></div>*/}
//                     {" "}
//                     {/* .container-fluid */}
//                 </nav>
//                 <div id="nav-divider"/>
//             </div>
//         );
//     }
// }
//
// export default observer(Nav_);