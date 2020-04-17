// Things we want in the about section:
//  Brief Summary of site
//  Rules
//  Bug Reports
//  Suggestions Form

import React from "react";
import Karan from "../Sidebar/karan";

export default class About extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      showKaran: false
    };

    this.showKaranObit = this.showKaranObit.bind(this);
  }

  showKaranObit() {
    this.setState({
      showKaran: !this.state.showKaran
    });
  }

  render() {
    return (
      <div className="sidebar-about" style={this.props.show ? {} : {display: "none"}}>
        <div className="about-summary">
          <p>TreesRadio is a online social music site.</p>
        </div>
        <div className="about-rules">
          <h5>Rules:</h5>
          <ul className="rules-list">
            <li id="rules-1">Max Video length is 8 minutes without a mod exemption.</li>
            <li id="rules-2">Like/Dislike Skip Ratio = 1:1.5 (Must have atleast 5 dislikes)</li>
            <li id="rules-3">Do not try to buy/sell/give/trade drugs on TreesRadio.</li>
            <li id="rules-4">
              Please be nice to each other, unneccesary rudeness/attacks may result in a ban.
            </li>
            <li id="rules-5">TreesRadio is 18+ only, minors will be banned.</li>
            <li id="rules-6">Do not queue NSFW videos</li>
            <li id="rules-7">
              Be mindful of controversial media/chat (group targeted hate/religion/politics/sex)
            </li>
            <li id="rules-8">Songs that have been recently played (2 hours) may be skipped.</li>
            <li id="rules-9">Staff reserve the right to skip any video.</li>
          </ul>
        </div>
        <div className="about-suggestions">
          <div>
            <h5>Legal</h5>
            <ul className="about-rules">
              <li>
                <a
                  href="https://www.youtube.com/static?template=terms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="https://policies.google.com/privacy?hl=en-US"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Privacy Policy
                </a>
              </li>
            </ul>
            <h5>Shoutouts!</h5>
            <ul className="about-rules">
              <li>
                @Rapty for @BlazeBot&apos;s awesome animated avatar, marketing, and sticker design.
                @JubieMeg for funding sticker production.
              </li>
              <li>
                @yellerjeep, @entlife, and many others for donating to the main Patreon page.{" "}
                <a href="https://www.patreon.com/treesradio">patreon.com/treesradio</a>
              </li>
              <li>
                @FredRodgers, @JubieMeg, @JohnPyro, @entlife for sponsoring @yellerjeep&apos;s
                <a
                  href="https://www.patreon.com/yellerjeep_tr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ongoing development of the site.
                </a>
              </li>
              <li>@SpeedWeed for the awesome bumps for SaeftBot</li>
              <li>@Pixelmac for expanding our bump library</li>
              <li>@Anarki for great ideas and assisting with debugging.</li>
              <li>@Player:, @TweeZee for heading on the quest to make TR mobile</li>
            </ul>
          </div>
          <div>
            <div className="tenorgif-attr">
              <h5>BlazeBot&apos;s GIFs:</h5>
            </div>
          </div>
        </div>
        <div className="about-emoji">
          <h6>
            <a href="https://www.emojicopy.com/" target="_blank" rel="noopener noreferrer">
              Emoji List
            </a>
          </h6>
          <h6>
            <a href="https://youtu.be/84qIWSRRZM8" target="_blank" rel="noopener noreferrer">
              Video Tutorial/Walkthrough
            </a>
          </h6>
          <h6>
            <a href="https://reddit.com/r/treesradio" target="_blank" rel="noopener noreferrer">
              /r/treesradio
            </a>
          </h6>
        </div>
        <div className="about-karan">
          <button
            type="button"
            className="btn btn-xs btn-default"
            onClick={() => {
              this.setState({showKaran: !this.state.showKaran});
            }}
          >
            <img className="avatarimg" src="//i.imgur.com/NgqxUDF.jpg" alt="In Memory of Saeft" />
          </button>
        </div>
        <Karan show={this.state.showKaran} hideCallback={this.showKaranObit} />
      </div>
    );
  }
}
