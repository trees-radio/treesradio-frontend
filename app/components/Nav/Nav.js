/**
 * Created by zachb on 2015-11-12.
 *
 * Navigation!
 *
 */

var React = require('react');
import Userbit from './Userbit/Userbit.js';

var Nav = React.createClass({
    propTypes: {
        loginstate: React.PropTypes.bool.isRequired,
        loginhandler: React.PropTypes.func.isRequired,
        logouthandler: React.PropTypes.func.isRequired
    },
    render: function(){
        return (
            <div id="tr-nav">
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand" href="#">TreesRadio</a>
                        </div>

                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            <ul className="nav navbar-nav">
                                <li><a href="#home">Home</a></li>
                                <li><a href="#about">About</a></li>
                                <li><a href="#submit">Submit</a></li>
                            </ul>
                            <div className="nav navbar-nav navbar-right">
                                <Userbit loginstate={this.props.loginstate} loginhandler={this.props.loginhandler} logouthandler={this.props.logouthandler} logindata={this.props.logindata} />
                            </div>
                        </div>{ /* .navbar-collapse */}
                    </div> { /* .container-fluid */}
                </nav>
                <div id="nav-divider"></div>
            </div>
        )
    }
});

module.exports = Nav;