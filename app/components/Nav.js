import React from "react";
import {observer} from "mobx-react";
import {computed, observable} from "mobx";
import {debounce} from "lodash";

import UserBit from "./Nav/UserBit";
import TokeTimer from "./Nav/TokeTimer";
import HypeProgress from "./Nav/HypeProgress";

import file from "src/version.json";
import profile from "stores/profile";
import $ from "jquery";
import Modal from "components/utility/Modal";
import imageWhitelist from "libs/imageWhitelist";

@observer
class Nav extends React.Component {

    @observable
    settingAvatar = false;

    @observable
    avatarField = "";
    @observable
    resettingPassword = false;

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
        {leading: true}
    );
    offHover = debounce(() => {
        this.hoveredTitle = false;
        this.title = "[tr]";
    }, 500);

    login() {
        if (profile.login(this._email.value, this._pass.value)) {

            document.getElementById('navbar-grid').classList.remove('navbar-grid-noLogin');

            let buttons = document.querySelectorAll('.disabledNoLogin');

            for (let i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('greyDisabled');
            }

            // this.avatarField = profile.avatarURL;
            profile.setAvatar(this.avatarField);

        }
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
            //  document.getElementById('navbar-grid').classList.add('navbar-grid-nologin')
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
        <span>{this.title}</span> <Version show={this.hoveredTitle}/>
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
                    <div id="hype-grid-container" className="">
                            <div id="hype-container" className="">
                                <HypeProgress/>
                        </div>
                    </div>
                    <div id="toketimer-container">
                        <TokeTimer/>
                    </div>
                    <div id="userbit-container">
                        <UserBit/>
                        {/* .navbar-collapse */}
                    </div>
                    {/*<div id="bump"></div>*/}
                    {" "}
                    {/* .container-fluid */}
                </nav>
                <div id="nav-divider"/>
            </div>
        );
    }
}

export default Nav;

function Version({show}) {
    if (show === false) return null;
    return (
        <span className="version-tag">
      v{file.version.version}-{file.version.short}
    </span>
    );
}