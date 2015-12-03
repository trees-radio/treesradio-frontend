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
        loginhandle: React.PropTypes.func.isRequired
    },
    render: function(){
        return (
            <div id="tr-nav">
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        {/* Brand and toggle get grouped for better mobile display */}
                        <div className="navbar-header">
                            {/* <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar"> </span>
                                <span className="icon-bar"> </span>
                                <span className="icon-bar"> </span>
                            </button> */}
                            <a className="navbar-brand" href="#">TreesRadio</a>
                        </div>
                        { /* Collect the nav links, forms, and other content for toggling */ }
                        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                            <ul className="nav navbar-nav">
                                <li><a href="#home">Home</a></li>
                                <li><a href="#about">About</a></li>
                                <li><a href="#submit">Submit</a></li>
                            </ul>
                            <div className="nav navbar-nav navbar-right">
                                <Userbit loginstate={this.props.loginstate} />
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