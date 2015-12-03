/**
 * Created by zachb on 2015-12-02.
 *
 * For logging in and profiles and such.
 *
 */


var React = require('react');

var Userbit = React.createClass({
    propTypes: {
        loginstate: React.PropTypes.bool.isRequired,
        loginhandle: React.PropTypes.func.isRequired
    },
    render: function(){

        if (this.props.loginstate){
            // User is logged in
            return (
                <div></div>
            )
         } else {
            // User is not logged in
            return (
                <form className="form-inline">
                    <div className="form-group">
                            <input type="email" className="form-control" id="emailInput" ref="email" placeholder="Email" />
                            <input type="password" className="form-control" id="passInput" ref="password" placeholder="Password" />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                    <button className="btn btn-default">Register</button>
                </form>
            )
         }
    }
});

module.exports = Userbit;

