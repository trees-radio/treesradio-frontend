/**
 * Created by zachb on 2015-12-02.
 *
 * For logging in and profiles and such.
 *
 */


import React from 'react';
import sweetAlert from 'sweetalert';

// import scss
// import './Userbit.scss'


var Userbit = React.createClass({
    propTypes: {
        loginstate: React.PropTypes.bool.isRequired,
        loginhandler: React.PropTypes.func.isRequired,
        logouthandler: React.PropTypes.func.isRequired,
        checkUserLevel: React.PropTypes.func.isRequired
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
      this.refs.email.getDOMNode().value = '';
      this.refs.password.getDOMNode().value = '';
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
    render: function(){
        if (this.props.loginstate){
            //
            // IF user is logged in
            //
            // check user level
            var userLevel = "user-level-user";
            if (this.props.checkUserLevel(this.props.logindata.username) === 2) {
              userLevel = "user-level-admin";
            } else if (this.props.checkUserLevel(this.props.logindata.username) === 1) {
              userLevel = "user-level-mod";
            }
            return (
                <div className="btn-group">
                    <a className="btn btn-primary" id="usernametop"><i className="fa fa-user fa-fw"></i><span id="username" className={userLevel}><b>{this.props.logindata.username}</b></span></a>
                    <a className="btn btn-primary dropdown-toggle" id="usernamedropdown" data-toggle="dropdown">
                        <span className="fa fa-caret-down"></span></a>
                        <ul className="dropdown-menu">
                          <li><a href="#"><i className="fa fa-pencil fa-fw"></i> Edit Profile</a></li>
                          <li><a href="#"><i className="fa fa-cog fa-fw"></i> Edit Site Settings</a></li>
                          <li className="divider"></li>
                          <li><a href="#"><i className="fa fa-cog fa-fw"></i> Admin Settings</a></li>
                        </ul>

                    <button className="btn btn-default" id="logoutbutton" onClick={this.props.logouthandler}>Logout</button>
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

                </div>
            )
         }
    }
});

export default Userbit;
