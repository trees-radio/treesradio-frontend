import React from 'react';
import {observer} from 'mobx-react';

import UserBit from './New/Nav/UserBit';

export default @observer class Nav extends React.Component {
  render() {
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
                <UserBit/>
              </div>
            </div>{ /* .navbar-collapse */}
          </div> { /* .container-fluid */}
        </nav>
        <div id="nav-divider"></div>
      </div>
    );
  }
}
