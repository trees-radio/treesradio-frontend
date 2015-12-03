/**
 * Created by zachb on 2015-12-02.
 *
 * For logging in and profiles and such.
 *
 */


var React = require('react');

var Userbit = React.createClass({
    render: function(){
        return (
            <ul className="nav navbar-nav navbar-right">
                <li><a href="#login">Login</a></li>
                <li><a href="#register">Register</a></li>
            </ul>
            )
    }
});

module.exports = Userbit;