/**
 * Created by zachb on 2015-12-02.
 *
 * For logging in and profiles and such.
 *
 */


var React = require('react');
var sweetAlert = require('sweetalert');

var Userbit = React.createClass({
    propTypes: {
        loginstate: React.PropTypes.bool.isRequired,
        loginhandler: React.PropTypes.func.isRequired,
        logouthandler: React.PropTypes.func.isRequired
    },
    loginButton: function(){
        let useremail = this.refs.email.getDOMNode().value;
        let userpassword = this.refs.password.getDOMNode().value;
        this.props.loginhandler(useremail, userpassword);
    },
    registerButton: function(){
      let desiredEml = this.refs.email.getDOMNode().value;
      let desiredPw = this.refs.password.getDOMNode().value;
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
            // User is logged in
            var userlevel = "user";
            if (this.props.logindata.admin === 1) { this.userlevel = "admin";}
            if (this.props.logindata.moderator === 1) { this.userlevel = "mod";}
            return (
                <div>
                    <span id="username" className={userlevel}><b>{this.props.logindata.username}</b></span>
                    <button className="btn btn-primary" onClick={this.props.logouthandler}>Logout</button>
                </div>
            )
         } else {
            // User is not logged in
            return (
                <div className="form-inline">
                    <div className="form-group">
                            <input type="email" className="form-control" id="emailInput" ref="email" placeholder="Email" />
                            <input type="password" className="form-control" id="passInput" ref="password" placeholder="Password" />
                    </div>
                    <button className="btn btn-primary" onClick={this.loginButton}>Login</button>
                    <button className="btn btn-default" onClick={this.registerButton}>Register</button>
                </div>
            )
         }
    }
});

module.exports = Userbit;
