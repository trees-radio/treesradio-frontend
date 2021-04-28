import React from "react";
import { observer } from "mobx-react";
import { computed, observable } from "mobx";
import { debounce } from "lodash";

import UserBit from "./Nav/UserBit";
import TokeTimer from "./Nav/TokeTimer";
import HypeProgress from "./Nav/HypeProgress";

import file from "src/version.json";
import profile from "stores/profile";
import $ from "jquery";
import Modal from "components/utility/Modal";
import imageWhitelist from "libs/imageWhitelist";
import tokeEvent from "../libs/tokeEvent";

@observer
class Nav extends React.Component {

    @observable
    settingAvatar = false;

    @observable
    avatarField = "";
    @observable
    resettingPassword = false;


    constructor(props) {
        super(props);
        this.state = { showHeartWeed: false, showPeaceWeed: false, showWeed: false };
        this.triggerTokeEffect = this.triggerTokeEffect.bind(this);
        if (this.props.show420) {
            tokeEvent.addEventListener('toke', this.triggerTokeEffect);
        }
    }

    componentDidMount() {
        if (window.matchMedia("only screen and (orientation: portrait)") && profile === null) {
            document.getElementById("navbar-grid").setAttribute("grid-template-columns", "15vw 85vw 0 0 0");
        }
    }

    @computed
    get avatarFieldValid() {
        return this.avatarField && imageWhitelist(this.avatarField);
    }

    onEnterKey(e, cb) {
        let key = e.keyCode || e.which;
        if (key === 13) {
            cb();
        }
    }

    async sendPassReset() {
        const result = await profile.sendPassReset(this._resetEmail.value);
        if (result) this.resettingPassword = false;
    }


    @observable hoveredTitle = false;
    @observable title = "[tr]";

    onHover = debounce(
        () => {
            this.hoveredTitle = true;
            this.title = "[treesradio]";
        },
        500,
        { leading: true }
    );
    offHover = debounce(() => {
        this.hoveredTitle = false;
        this.title = "[tr]";
    }, 500);

    triggerTokeEffect() {
        let randomEffect = Math.floor(Math.random() * 3);

        if (randomEffect === 0) {
            this.setState({ showHeartWeed: true });
            setTimeout(() => this.setState({ showHeartWeed: false }), 10000);
        } else if (randomEffect === 1) {
            this.setState({ showPeaceWeed: true });
            setTimeout(() => this.setState({ showPeaceWeed: false }), 10000);
        } else {
            this.setState({ showWeed: true });
            setTimeout(() => this.setState({ showWeed: false }), 10000);
        }
    }

    login() {
        if (profile.login(this._email.value, this._pass.value)) {
            document.getElementById("chatscroll").setAttribute("style", "");

            let navbarGrid = document.getElementById("navbar-grid");

            navbarGrid.classList.remove('navbar-grid-noLogin');

            if (window.matchMedia("only screen and (orientation: portrait)")) {
                navbarGrid
                    .setAttribute("grid-template-columns",
                        window
                            .matchMedia("only screen and (max-width: 1500px")
                            .matches ? "15vw 42vw 14vw 9vw 20vw" : "15vw 46vw 14vw 9vw 16vw");
            }

            let buttons = document.querySelectorAll('.disabledNoLogin');
            buttons.forEach(button => button.classList.remove('greyDisabled'));

            profile.setAvatar(this.avatarField);
        }
    }

    disableIfNecessary() {
        return profile.user !== null ? "" : "hide-small";
    }

    render() {

        //TODO research what this is
        /*   let emailVerificationResendIcon;
           if (profile.resendVerificationLoading) {
               emailVerificationResendIcon = (
                   <span>
               <i className="fa fa-spin fa-circle-o-notch"></i>
             </span>
               );
           } else if (profile.resendVerificationResult) {
               emailVerificationResendIcon = (
                   <span>
               <i className="fa fa-check"></i>
             </span>
               );
           }*/

        // document.addEventListener("DOMContentLoaded",() => {
        //     let button = new ExplosiveButton("button");
        // });

        let login;

        if (profile.user !== null) {
            login = "";
        } else {
            //TODO use state ?
            login = (
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
                                    ref={c => (this._email = c)}
                                    onKeyPress={e => this.onEnterKey(e, () => $("#passInput").focus())}
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
                                    onKeyPress={e => this.onEnterKey(e, () => this.login())}
                                    ref={c => (this._pass = c)}
                                />
                            </div>
                        </div>
                        <div id="loginButtons">
                            <button className="btn btn-primary login-form-button" id="loginbutton"
                                onClick={() => this.login()}>
                                Login
                            </button>
                            <button
                                className="btn btn-default login-form-button"
                                id="regbutton"
                                onClick={() => profile.register(this._email.value, this._pass.value)}
                            >
                                Register
                            </button>
                            <button
                                className="btn btn-primary login-form-button"
                                id="reset-password-btn"
                                onClick={() => (this.resettingPassword = true)}
                            >
                                Password Reset
                            </button>
                        </div>
                    </div>
                    {/* Password Reset Modal */}
                    <Modal
                        title="Password Reset"
                        show={this.resettingPassword}
                        hideModal={() => (this.resettingPassword = false)}
                        leftButton={() => this.sendPassReset()}
                        leftButtonText="Send!"
                    >
                        <p>Please enter the email of the account you would like to recover.</p>
                        <input
                            className="form-control"
                            type="text"
                            ref={c => (this._resetEmail = c)}
                            onKeyPress={e => this.onEnterKey(e, () => this.sendPassReset())}
                            placeholder="Email Address"
                        />
                    </Modal>
                </div>
            );
        }


        const title = (
            <span className="nav-title">
                <span>{this.title}</span> <Version show={this.hoveredTitle} />
            </span>
        );



        return (
            <div id="tr-nav">
                <nav id="navbar-grid"
                    className={profile.user === null ? "navbar navbar-default navbar-grid-nologin" : "navbar navbar-default"}>
                    <div className="navbar-header navbar-item">
                        <a
                            className="navbar-brand"
                            href="#"
                            onMouseOver={() => this.onHover()}
                            onMouseOut={() => this.offHover()}
                        >
                            {title}
                        </a>
                    </div>
                    <div id="navbar-space">{login}</div>
                    {this.props.show420 && <div id="toke-effects">
                        {this.state.showHeartWeed && <div className="container-weed">
                            <img className="heart" src="img/heart_weed.svg" />
                        </div>}
                        {this.state.showPeaceWeed && <div className="container-weed">
                            <img className="peace" src="img/peace_and_weed.svg" />
                        </div>}
                        {this.state.showWeed && <div className="container-weed">
                            <img className="weed" src="img/weed1.svg" />
                            <img className="weed" src="img/weed2.svg" />
                            <img className="weed" src="img/weed3.svg" />
                            <img className="weed" src="img/weed4.svg" />
                            <img className="weed" src="img/weed5.svg" />
                            <img className="weed" src="img/weed1.svg" />
                            <img className="weed" src="img/weed2.svg" />
                            <img className="weed" src="img/weed3.svg" />
                            <img className="weed" src="img/weed4.svg" />
                            <img className="weed" src="img/weed5.svg" />
                        </div>}
                    </div>}
                    <div id="hype-grid-container" className={this.disableIfNecessary()}>
                        <div id="hype-container" className="">
                            <HypeProgress />
                        </div>
                    </div>
                    <div id="toketimer-container" className={this.disableIfNecessary()}>
                        <TokeTimer />
                    </div>
                    <div id="userbit-container" className={this.disableIfNecessary()}>
                        <UserBit />
                        {/* .navbar-collapse */}
                    </div>
                    {/*<div id="bump"></div>*/}
                    {" "}
                    {/* .container-fluid */}
                </nav>
                <div id="nav-divider" />
            </div>
        );
    }
}

export default Nav;

function Version({ show }) {
    if (show === false) return null;
    return (
        <span className="version-tag">
            v{file.version.version}-{file.version.short}
        </span>
    );
}