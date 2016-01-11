import React from 'react';
import classNames from 'classnames';

var Waitlist = React.createClass({

  render: function() {
    var waitlistItems;
    var waitlistPos = 0;
    var waitlistPlace = 0;
    waitlistItems = this.props.waitlist.map(function(waitlistItem, index) {
      var waitlistPosClass;
      if (waitlistPos === 0) {
        waitlistPosClass = "waitlist-line-1";
        waitlistPos = 1;
      } else {
        waitlistPosClass = "waitlist-line-0";
        waitlistPos = 0;
      }
      var waitlistLineClasses = classNames('waitlist-item', waitlistPosClass);
      var userAvatar = "http://api.adorable.io/avatars/50/" + waitlistItem['user'] + ".png";
      waitlistPlace++;
      return (
          <li key={index} className={waitlistLineClasses}>
            <div className="waitlist-position">
              <span>{waitlistPlace}</span>
            </div>
            <div className="waitlist-avatar">
              <img className="waitlist-avatarimg" src={userAvatar}></img>
            </div>
            <div>
              <span className="waitlist-name">{waitlistItem['user']}</span>
            </div>
          </li>
      )
    });
    return (
      <div>
        <ul className="waitlist-list">
          {waitlistItems}
        </ul>
      </div>
    );
  }

});

export default Waitlist;
