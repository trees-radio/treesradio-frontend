import React from 'react';
import {observer} from 'mobx-react';
import {observable} from 'mobx';

import fbase from 'stores/fbase';
import account from 'libs/account';

import Modal from 'components/utility/Modal';

export default @observer class UserBit extends React.Component {

  login() {
    fbase.login(this._email.value, this._pass.value);
  }

  onEnterKey(e, cb) {
    var key = e.keyCode || e.which;
    if (key == 13) {
      cb();
    }
  }

  addUsername() {
    account.updateUsername(this._username.value)
  }

  sendPassReset() {
    fbase.sendPassReset(this._resetEmail.value);
  }

  render() {
    if (fbase.user !== null) {
      return (
        <div>
          <div className="btn-group">
            <a className="btn btn-primary" id="usernametop"><i className="fa fa-user fa-fw"></i><span id="username" className={'userLevel'}><b>{fbase.safeUsername}</b></span></a>
            <a className="btn btn-primary dropdown-toggle" id="usernamedropdown" data-toggle="dropdown">
              <span className="fa fa-caret-down"></span>
            </a>
            <ul className="dropdown-menu">
              {/* <li onClick={p.setAvatar}><a href="#"><i className="fa fa-pencil fa-fw"></i> Set Avatar</a></li>
                <li onClick={p.toggleSize}><a href="#"><i className={sizeToggleIcon}></i> {sizeToggleString}</a></li>
                <li onClick={this.handleChangeEmail}><a href="#"><i className="fa fa-envelope"></i> Change Email</a></li>
              <li onClick={this.handleChangePassword}><a href="#"><i className="fa fa-key"></i> Change Password</a></li> */}
            </ul>

            <button className="btn btn-default" id="logoutbutton" onClick={() => fbase.logout()}>Logout</button>

          </div>
          <Modal isOpen={fbase.noName} hideModal={() => {}} title="Missing Username" noClose={true} leftButton={() => this.addUsername()} leftButtonText="Go!">
            <p>We're missing a username for you! Please choose one. This will be your permanent username, so choose wisely!</p>
            <input className="form-control" type="text" ref={(c) => this._username = c} onKeyPress={(e) => this.onEnterKey(e, () => this.addUsername())} placeholder="Username"/>
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
                <input className="form-control" type="email" id="emailInput" ref={(c) => this._email = c} />
              </div>

              <div className="input-group">
                <span className="input-group-addon"><i className="fa fa-key fa-fw"></i></span>
                <input className="form-control" type="password" id="passInput" onKeyPress={(e) => this.onEnterKey(e, () => this.login())} ref={(c) => this._pass = c} />
              </div>

            </div>

            <button className="btn btn-primary" id="loginbutton" onClick={() => this.login()}>Login</button>
            <button className="btn btn-default" id="regbutton" onClick={() => fbase.register(this._email.value, this._pass.value)}>Register</button>
            <button className="btn btn-primary" id="reset-password-btn" onClick={() => fbase.startResettingPassword()}>Password Reset</button>

          </div>
          <Modal title="Password Reset" isOpen={fbase.resettingPassword} hideModal={() => fbase.stopResettingPassword()} leftButton={() => this.sendPassReset()} leftButtonText="Send!">
            <p>Please enter the email of the account you would like to recover.</p>
            <input className="form-control" type="text" ref={(c) => this._resetEmail = c} onKeyPress={(e) => this.onEnterKey(e, () => this.sendPassReset())} placeholder="Email Address"/>
          </Modal>

          <Modal title="Password Reset Error" isOpen={fbase.resetPassError !== ''} hideModal={() => fbase.clearPassResetError()}>
            {fbase.resetPassError}
          </Modal>
          <Modal title="Password Reset Success" isOpen={fbase.resetPassSuccess} hideModal={() => fbase.clearPassResetSuccess()}>
            Success! An email with instructions has been sent to {fbase.lastResetEmail}.
          </Modal>
          <Modal title="Registration Error" isOpen={fbase.registrationError !== ''} hideModal={() => fbase.clearRegError()}>
            {fbase.registrationError}
          </Modal>
        </div>

      );
    }

  }
}
