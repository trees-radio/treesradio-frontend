/**
 * Created by zachb on 2015-11-12.
 *
 * Navigation!
 *
 */

import React from 'react';
import Userbit from './Userbit/Userbit.js';

var Nav = React.createClass({
    propTypes: {
        loginstate: React.PropTypes.bool.isRequired,
        loginhandler: React.PropTypes.func.isRequired,
        logouthandler: React.PropTypes.func.isRequired
    },
    render: function(){
      var betaString = "\u03B2eta";
        var title = <span><span>TreesRadio</span> <span className="beta-tag">{betaString}</span></span>;
        // if (this.props.devCheck) {
        //   title = "TreesRadio Dev";
        // }
        return (
            <div id="tr-nav">
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand" href="#">{title}</a>
                        </div>

                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            {/* <ul className="nav navbar-nav" id="nav-about">
                                <li><a>About</a></li>
                            </ul> */}
                            <div className="nav navbar-nav navbar-right">
                                <Userbit
                                  handleRegister={this.props.handleRegister}
                                  loginstate={this.props.loginstate}
                                  loginhandler={this.props.loginhandler}
                                  logouthandler={this.props.logouthandler}
                                  logindata={this.props.logindata}
                                  setAvatar={this.props.setAvatar}
                                  toggleSize={this.props.toggleSize}
                                  />
                            </div>
                        </div>{ /* .navbar-collapse */}
                    </div> { /* .container-fluid */}
                </nav>
                <div id="nav-divider"></div>
            </div>
        )
    }
});


export default Nav;
