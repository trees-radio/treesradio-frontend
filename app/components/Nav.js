import React from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {debounce} from "lodash";

import UserBit from "./Nav/UserBit";
import TokeTimer from "./Nav/TokeTimer";
import HypeProgress from "./Nav/HypeProgress";

import file from "src/version.json";

@observer
class Nav extends React.Component {
    @observable hoveredTitle = false;
    @observable title = "[tr]";

    onHover = debounce(
        () => {
            this.hoveredTitle = true;
            this.title = "[treesradio]";
        },
        500,
        {leading: true}
    );
    offHover = debounce(() => {
        this.hoveredTitle = false;
        this.title = "[tr]";
    }, 500);

    render() {
        const title = (
            <span className="nav-title">
        <span>{this.title}</span> <Version show={this.hoveredTitle}/>
      </span>
        );
        return (
            <div id="tr-nav">
                <nav id="navbar-grid" className="navbar navbar-default">
                    <div className="navbar-header navbar-item">
                        <a
                            className="navbar-brand"
                            href="#"
                            onMouseOver={() => this.onHover()}
                            onMouseOut={() => this.offHover()}
                        >
                            {title}
                        </a>
                    </div>
                    <div id="navbar-space"></div>
                    <div id="hype-grid-container" className="container-fluid">
                        <div className="collapse navbar-collapse navbar-item" id="bs-example-navbar-collapse-1">
                            {/* <ul className="nav navbar-nav" id="nav-about">
                <li><a>About</a></li>
              </ul> */}
                            <div id="hype-container" className="nav navbar-nav navbar-right">
                                <HypeProgress/>
                            </div>
                        </div>
                    </div>
                        <div id="toketimer-container">
                            <TokeTimer/>
                        </div>
                        <div id="userbit-container">
                            <UserBit/>
                            {/* .navbar-collapse */}
                        </div>
                    {" "}
                    {/* .container-fluid */}
                </nav>
                <div id="nav-divider"/>
            </div>
        );
    }
}

export default Nav;

function Version({show}) {
    if (show === false) return null;
    return (
        <span className="version-tag">
      v{file.version.version}-{file.version.short}
    </span>
    );
}
