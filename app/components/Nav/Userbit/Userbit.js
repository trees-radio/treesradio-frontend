/**
 * Created by zachb on 2015-12-02.
 *
 * For logging in and profiles and such.
 *
 */


import React from 'react';
import sweetAlert from 'sweetalert';
import classNames from 'classnames';
import Firebase from 'firebase';

import emitUserError from '../../../utils/userError.js';

var ref = new Firebase(window.__env.firebase_origin);

var Userbit = React.createClass({
    propTypes: {
        loginstate: React.PropTypes.bool.isRequired,
        loginhandler: React.PropTypes.func.isRequired,
        logouthandler: React.PropTypes.func.isRequired
    },
    handleSubmit: function(e){
      if (e.key === 'Enter'){
        this.loginButton();
      }
    },
    loginButton: function(){
        let useremail = this.refs.email.value;
        let userpassword = this.refs.password.value;
        this.refs.password.value = '';
        this.props.loginhandler(useremail, userpassword);
    },
    registerButton: function(){
      let desiredEml = this.refs.email.value;
      let desiredPw = this.refs.password.value;
      this.refs.email.value = '';
      this.refs.password.value = '';
      if (!desiredEml) {
        sweetAlert({
          "title": "Registration Error",
          "text": "You did not provide an email address!",
          "type": "error",
          "timer": 3000
        });
      } else {
        if (!desiredPw) {
          sweetAlert({
            "title": "Registration Error",
            "text": "You did not provide a password!",
            "type": "error",
            "timer": 3000
          });
        } else {
          this.props.handleRegister(desiredEml, desiredPw);
        }
      }

    },
    handleResetPassword: function() {
      sweetAlert({
        title: "Password Reset",
        text: "Please enter the email address associated with your account.",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
        inputPlaceholder: "Email address"
      }, function (inputValue) {
          if (inputValue === false) return false;
          if (inputValue === '') {
            sweetAlert.showInputError("You need to write something!");
            return false;
          }

          ref.resetPassword({
            email: inputValue
          }, function() { // removed arg (error)
            // not displaying error code in any way here to discourage potentially malicious checks for accounts
            sweetAlert({
              title: "Password Reset",
              text: "Your request has been recieved. If an account exists for the email ("+inputValue+"), a link to reset your password will be sent to that address",
              type: "success"
            });
          });
        });
    },
    handleChangeEmail: function() {
      sweetAlert({
        title: "Change Email",
        text: "First, enter your old email address below.",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputPlaceholder: "Old email address"
      }, function(oldEmail) {
        if (oldEmail === false) return false;
        if (oldEmail === '') {
          sweetAlert.showInputError("Error: Recieved blank address!");
          return false;
        }
        sweetAlert({
          title: "Change Email",
          text: "Now, enter your new email address.",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          inputPlaceholder: "New email address"
        }, function(newEmail) {
          if (newEmail === false) return false;
          if (newEmail === '') {
            sweetAlert.showInputError("Error: Recieved blank address!");
            return false;
          }
          sweetAlert({
            title: "Change Email",
            text: "Last, enter your password.",
            type: 'input',
            inputType: "password",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
            inputPlaceholder: "Password"
          }, function(password) {
            if (password === false) return false;
            if (password === '') {
              sweetAlert.showInputError("Error: Recieved blank password!");
              return false;
            }
            ref.changeEmail({
              oldEmail: oldEmail,
              newEmail: newEmail,
              password: password
            }, function(error) {
              if (error) {
                switch (error.code) {
                  case "INVALID_PASSWORD":
                  emitUserError("Change Email", "The specified user account password is incorrect.");
                  // console.log("The specified user account password is incorrect.");
                  break;
                  case "INVALID_USER":
                  emitUserError("Change Email", "The specified user account does not exist.");
                  // console.log("The specified user account does not exist.");
                  break;
                  default:
                  emitUserError("Change Email", "Unknown error.");
                  console.error("Error creating user:", error); //eslint-disable-line
                  // actually want this error here
                }
              } else {
                sweetAlert({
                  title: "Change Email",
                  text: "Success! Your account's email is now: "+newEmail,
                  type: 'success'
                });
              }
            });
          });
        });
      });
    },
    handleChangePassword: function() {
      sweetAlert({
        title: "Change Password",
        text: "First, enter the email address associated with this account.",
        type: 'input',
        showCancelButton: true,
        closeOnConfirm: false,
        inputPlaceholder: "Email address"
      }, function(email) {
        if (email === false) return false;
        if (email === '') {
          sweetAlert.showInputError("Error: Recieved blank email!");
          return false;
        }
        sweetAlert({
          title: "Change Password",
          text: "Next, enter your current (old) password.",
          type: 'input',
          inputType: 'password',
          showCancelButton: true,
          closeOnConfirm: false,
          inputPlaceholder: "Password"
        }, function(oldPassword) {
          if (oldPassword === false) return false;
          if (oldPassword === '') {
            sweetAlert.showInputError("Error: Recieved blank password!");
            return false;
          }
          sweetAlert({
            title: "Change Password",
            text: "Last, enter your new password.",
            type: 'input',
            inputType: 'password',
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
            inputPlaceholder: "New password"
          }, function(newPassword) {
            if (newPassword === false) return false;
            if (newPassword === '') {
              sweetAlert.showInputError("Error: Recieved blank password!");
              return false;
            }
            ref.changePassword({
              email: email,
              oldPassword: oldPassword,
              newPassword: newPassword
            }, function(error) {
              if (error) {
                switch (error.code) {
                  case "INVALID_PASSWORD":
                    emitUserError("Change Password", "The specified user account password is incorrect.");
                    // console.log("The specified user account password is incorrect.");
                  break;
                  case "INVALID_USER":
                    emitUserError("Change Password", "The specified user account does not exist.");
                    // console.log("The specified user account does not exist.");
                  break;
                  default:
                    emitUserError("Change Password", "Error: Unknown error.");
                    console.error("Error changing password:", error); //eslint-disable-line
                    // actually want this to error
                }
              } else {
                // console.log("User password changed successfully!");
                sweetAlert({
                  title: "Change Password",
                  text: "Success! Your password has been changed.",
                  type: 'success'
                });
              }
            });
          });
        });
      });
    },
    render: function(){
      var p = this.props;
        if (p.loginstate){
            //
            // IF user is logged in
            //
            // check user level
            var userLevel = "user-level-user";

            var sizeToggleIcon;
            var sizeToggleString;
            if (p.logindata.playerSize) {
              sizeToggleIcon = classNames("fa", "fa-expand");
              sizeToggleString = "Expand Player";
            } else {
              sizeToggleIcon = classNames("fa", "fa-compress");
              sizeToggleString = "Collapse Player";
            }

            return (
                <div className="btn-group">
                    <a className="btn btn-primary" id="usernametop"><i className="fa fa-user fa-fw"></i><span id="username" className={userLevel}><b>{p.logindata.username}</b></span></a>
                    <a className="btn btn-primary dropdown-toggle" id="usernamedropdown" data-toggle="dropdown">
                        <span className="fa fa-caret-down"></span></a>
                        <ul className="dropdown-menu">
                          <li onClick={p.setAvatar}><a href="#"><i className="fa fa-pencil fa-fw"></i> Set Avatar</a></li>
                          <li onClick={p.toggleSize}><a href="#"><i className={sizeToggleIcon}></i> {sizeToggleString}</a></li>
                          <li onClick={this.handleChangeEmail}><a href="#"><i className="fa fa-envelope"></i> Change Email</a></li>
                          <li onClick={this.handleChangePassword}><a href="#"><i className="fa fa-key"></i> Change Password</a></li>
                        </ul>

                    <button className="btn btn-default" id="logoutbutton" onClick={p.logouthandler}>Logout</button>
                </div>
            )
         } else {
            // User is not logged in
            return (
                <div className="form-inline">
                  <div className="form-group" id="emailpassfields">
                    <div className="input-group margin-bottom-sm" id="emailbox">
                      <span className="input-group-addon"><i className="fa fa-envelope-o fa-fw"></i></span>
                      <input className="form-control" type="email" id="emailInput" ref="email" />
                    </div>

                    <div className="input-group">
                      <span className="input-group-addon"><i className="fa fa-key fa-fw"></i></span>
                      <input className="form-control" type="password" id="passInput" ref="password" onKeyPress={this.handleSubmit} />
                    </div>

                  </div>

                    <button className="btn btn-primary" id="loginbutton" onClick={this.loginButton}>Login</button>
                    <button className="btn btn-default" id="regbutton" onClick={this.registerButton}>Register</button>
                    <button className="btn btn-primary" id="reset-password-btn" onClick={this.handleResetPassword}>Password Reset</button>

                </div>
            )
         }
    }
});

export default Userbit;
