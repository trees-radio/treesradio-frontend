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
          showKaran: false,
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
        <div className="about-karan">
          <div>
            <button type="button" className="btn btn-xs btn-default" onClick={() => this.setState({ showKaran: !this.state.showKaran }) }>
              <img className="avatarimg" src="//i.imgur.com/NgqxUDF.jpg" alt="In Memory of Saeft"/>
              </button>
          </div>
        </div>
        { this.state.showKaran && <Karan/> }
        <div className="about-summary">
          <p>
            TreesRadio is a online social music site for the reddit /r/trees community. Sign up to queue up some tunes or kick back and listen to the musical tastes of Ents around the world!
          </p>
        </div>
        <div className="about-rules">
          <h5>Rules:</h5>
          <ul className="rules-list">
            <li id="rules-1">- Max Video length is 8 minutes without a mod exemption.</li>
            <li id="rules-2">- Like/Dislike Skip Ratio = 1:1.5 (Must have atleast 5 dislikes)</li>
            <li id="rules-3">- Do not try to buy/sell/give/trade drugs on TreesRadio.</li>
            <li id="rules-4">
              - Please be nice to each other, unneccesary rudeness/attacks may result in a ban.
            </li>
            <li id="rules-5">- TreesRadio is 18+ only, minors will be banned.</li>
            <li id="rules-6">- Do not queue NSFW videos</li>
            <li id="rules-7">
              - Be mindful of controversial media/chat (group targeted hate/religion/politics/sex)
            </li>
            <li id="rules-8">- Songs that have been recently played (2 hours) may be skipped.</li>
            <li id="rules-9">- Staff reserve the right to skip any video.</li>
            <li id="rules-10">- This is a multi-genre site that appreciates varying music types. Mood is everything. Excessive criticism of another's music will not be tolerated</li> 
          </ul>
        </div>
        <div className="about-suggestions">
          <div>
            <h5>YouTube Region Checker</h5>
            See above in the drop down for an instant check.<br/>
            <a href="https://polsy.org.uk/stuff/ytrestrict.cgi" target="_blank">
              Check if a video has any region restrictions
            </a>
          </div>
	  <div>
	    <h5>Shoutouts!</h5>
	    <ul>
	    <li>@minicing for @BlazeBot's awesome animated avatar.</li>
	    <li>@pandersson97 for sponsoring @yellerjeep's ongoing development.</li>
	    <li>@SpeedWeed for the awesome bumps for SaeftBot</li>
	    </ul>
	    </div>
        </div>
        <div className="about-emoji">
          <h6><a href="https://www.emojione.com/emoji/v3" target="_blank">Emoji List</a></h6>
          <h6>
            <a href="https://youtu.be/84qIWSRRZM8" target="_blank">Video Tutorial/Walkthrough</a>
          </h6>
          <h6><a href="https://reddit.com/r/treesradio" target="_blank">/r/treesradio</a></h6>
        </div>
      </div>
    );
  }
}
