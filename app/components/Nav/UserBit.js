import React from "react";
import {observer} from "mobx-react";
import {observable,computed} from "mobx";
import classNames from "classnames";

import profile from "stores/profile";
import account from "libs/account";
import playing from "stores/playing";
import imageWhitelist, {allowedDomains} from "libs/imageWhitelist";
import UserAvatar from "components/utility/User/UserAvatar";

import Modal from "components/utility/Modal";

@observer
export default class UserBit extends React.Component {
  login() {
    profile.login(this._email.value, this._pass.value);
  }

  onEnterKey(e, cb) {
    var key = e.keyCode || e.which;
    if (key == 13) {
      cb();
    }
  }

  addUsername() {
    account.updateUsername(this._username.value);
  }

  sendPassReset() {
    profile.sendPassReset(this._resetEmail.value);
  }

  @observable
  resettingPassword = false;
  @observable
  settingAvatar = false;
  @observable
  avatarField = "";

  @computed
  get avatarFieldValid() {
    return this.avatarField && imageWhitelist(this.avatarField);
  }

  render() {
    if (profile.user !== null) {
      let emailVerificationResendIcon;
      if (profile.resendVerificationLoading) {
        emailVerificationResendIcon = <span><i className="fa fa-spin fa-circle-o-notch"></i></span>;
      } else if (profile.resendVerificationResult) {
        emailVerificationResendIcon = <span><i className="fa fa-check"></i></span>;
      }

      return (
        <div>
          <div className="btn-group">
            <a className="btn btn-primary" id="usernametop">
              <i className="fa fa-user fa-fw"></i><span id="username" className={"userLevel"}>
              <b>{profile.safeUsername}</b>
            </span>
            </a>
            <a className="btn btn-primary dropdown-toggle" id="usernamedropdown" data-toggle="dropdown">
              <span className="fa fa-caret-down"></span>
            </a>
            <ul className="dropdown-menu">
              <li onClick={() => this.settingAvatar = true}>
                <a href="#"><i className="fa fa-pencil fa-fw"></i> Set Avatar</a>
              </li>
              <li onClick={() => playing.togglePlayerSize()}>
                <a href="#">
                  <i className={classNames("fa", playing.playerSize === "BIG" ? "fa-compress" : "fa-expand")}></i> {
                    playing.playerSize === "BIG" ? "Collapse Player" : "Expand Player"
                  }
                </a>
              </li>
              <li onClick={() => {}}><a href="#"><i className="fa fa-envelope"></i> Change Email</a></li>
              <li onClick={() => {}}><a href="#"><i className="fa fa-key"></i> Change Password</a></li>
              <li ><a href={`https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${playing.data.info.url}`} target='blank'><i className="fa fa-youtube"></i> Region Check</a></li>
              <li onClick={() => profile.logout()}><a href="#"><i className="fa fa-sign-out"></i> Logout</a></li>
            </ul>
          </div>
          <Modal
            isOpen={profile.noName}
            hideModal={() => {}}
            title="Missing Username"
            noClose={true}
            leftButton={() => this.addUsername()}
            leftButtonText="Go!"
          >
            <p>
              We're missing a username for you! Please choose one. This will be your permanent username, so choose wisely!
            </p>
            <input
              className="form-control"
              type="text"
              ref={c => this._username = c}
              onKeyPress={e => this.onEnterKey(e, () => this.addUsername())}
              placeholder="Username"
            />
          </Modal>
          <Modal isOpen={profile.unverified} hideModal={() => {}} title="Please Verify Your Email" noClose={true}>
            <p>
              Your email hasn't been verified yet! Please click the link in the activation email that was sent to your address or use one of the buttons below to help you.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Re-check Verification Status
            </button>
            <button className="btn btn-info" onClick={() => profile.resendVerification()}>
              Re-send Verification Email {emailVerificationResendIcon}
            </button>
          </Modal>
          <Modal isOpen={this.settingAvatar} hideModal={() => this.settingAvatar = false} title="Set Your Avatar">
            <p>Avatars must be hosted at one of the following sites:</p>
            <ul>
              {allowedDomains.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
            <hr />
            <div className="row">
              <div className="col-md-8">
                <div className="form-group">
                  <label>Avatar URL</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      placeholder="http://i.imgur.com/1y3IemI.gif"
                      onChange={e => this.avatarField = e.target.value}
                    />
                    <div className="input-group-addon">
                      <i className={this.avatarFieldValid ? "fa fa-check" : "fa fa-times"}></i>
                    </div>
                  </div>
                  <br />
                  <div className="btn-group">
                    <button className="btn btn-primary" onClick={() => profile.setAvatar(this.avatarField)}>
                      Set Avatar
                    </button>
                    <button className="btn" onClick={() => profile.clearAvatar()}>Clear Avatar</button>
                  </div>
                  
                </div>
              </div>
              <div className="col-md-4">
                <UserAvatar uid={profile.uid} className="user-avatar-preview"/>
              </div>
            </div>
          </Modal>
        </div>
      );
    } else {
      return (
        <div>
          <div className="form-inline">
            <div className="form-group" id="emailpassfields">
              <div className="input-group margin-bottom-sm" id="emailbox">
                <span className="input-group-addon"><i className="fa fa-envelope-o fa-fw"></i></span>
                <input className="form-control" type="email" id="emailInput" ref={c => this._email = c} />
              </div>
              <div className="input-group">
                <span className="input-group-addon"><i className="fa fa-key fa-fw"></i></span>
                <input
                  className="form-control"
                  type="password"
                  id="passInput"
                  onKeyPress={e => this.onEnterKey(e, () => this.login())}
                  ref={c => this._pass = c}
                />
              </div>
            </div>
            <button className="btn btn-primary" id="loginbutton" onClick={() => this.login()}>Login</button>
            <button
              className="btn btn-default"
              id="regbutton"
              onClick={() => profile.register(this._email.value, this._pass.value)}
            >
              Register
            </button>
            <button className="btn btn-primary" id="reset-password-btn" onClick={() => this.resettingPassword = true}>
              Password Reset
            </button>
          </div>
          <Modal
            title="Password Reset"
            isOpen={this.resettingPassword}
            hideModal={() => this.resettingPassword = false}
            leftButton={() => this.sendPassReset()}
            leftButtonText="Send!"
          >
            <p>Please enter the email of the account you would like to recover.</p>
            <input
              className="form-control"
              type="text"
              ref={c => this._resetEmail = c}
              onKeyPress={e => this.onEnterKey(e, () => this.sendPassReset())}
              placeholder="Email Address"
            />
          </Modal>
        </div>
      );
    }
  }
}
