// Things we want in the about section:
//  Brief Summary of site
//  Rules
//  Bug Reports
//  Suggestions Form


import React from 'react';
``
var About = React.createClass({

  render: function() {
    return (
      <div className="sidebar-about">
        <div className="about-summary">
          <p>TreesRadio is a online social music site for the reddit /r/trees community. Sign up to queue up some tunes or kick back and listen to the musical tastes of Ents around the world!</p>
        </div>
        <div className="about-rules">
          <h5>Rules:</h5>
          <ul className="rules-list">
            <li id="rules-1">- Max Video length is 8 minutes without a mod exemption.</li>
            <li id="rules-2">- Like/Dislike Skip Ratio = 1:1</li>
            <li id="rules-3">- Do not try to buy/sell/give/trade drugs on TreesRadio.</li>
            <li id="rules-4">- Please be nice to each other, unneccesary rudeness/attacks may result in a ban.</li>
            <li id="rules-5">- TreesRadio is 18+ only, minors will be banned.</li>
            <li id="rules-6">- Do not queue NSFW videos</li>
            <li id="rules-7">- Be mindful of controversial media/chat (group targeted hate/religion/politics/sex)</li>
            <li id="rules-8">- Songs that have been recently played (2 hours) may be skipped.</li>
            <li id="rules-9">- Staff reserve the right to skip any video.</li>
          </ul>
        </div>
        <div className="about-bugs">
          <div>
            <h5>Bug Report:</h5>
            <p>Found a bug on TreesRadio? Help us fix it by reporting it, just click the link <a href="https://github.com/TreesRadio/treesradio-issues/blob/master/README.md" target="_blank">HERE</a> to find out how!</p>
            <p id="bug-github">(Requires registering with GitHub)</p>
          </div>
        </div>
        <div className="about-suggestions">
          <div>
            <h5>Suggestions Form:</h5>
            <a href="http://goo.gl/forms/j7hua7F8aN" target="_blank">Send us a suggestion report!</a>
          </div>
        </div>
        <div className="about-emoji">
            <h6><a href="http://www.emoji-cheat-sheet.com/" target="_blank">Emoji List</a></h6>
            <h6><a href="https://youtu.be/84qIWSRRZM8" target="_blank">Video Tutorial/Walkthrough</a></h6>
            <h6><a href="https://reddit.com/r/treesradio" target="_blank">/r/treesradio</a></h6>
        </div>
      </div>
    );
  }

});

export default About;
