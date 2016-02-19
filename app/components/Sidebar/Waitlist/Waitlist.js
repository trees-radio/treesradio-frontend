import React from 'react';
import classNames from 'classnames';
import ReactImageFallback from 'react-image-fallback';

var Waitlist = React.createClass({

  render: function() {
    var waitlistItems;
    var waitlistPos = 0;
    var waitlistPlace = 0;
    waitlistItems = this.props.waitlist.map(function(waitlistItem, index) {
      if (waitlistItem['_state']) {
        return "";
      }
      var waitlistPosClass;
      if (waitlistPos === 0) {
        waitlistPosClass = "waitlist-line-1";
        waitlistPos = 1;
      } else {
        waitlistPosClass = "waitlist-line-0";
        waitlistPos = 0;
      }
      var waitlistLineClasses = classNames('waitlist-item', waitlistPosClass);

      var userAvatar;
      if (waitlistItem['avatar']) {
        userAvatar = "//" + waitlistItem['avatar'];
      } else {
        userAvatar = "//api.adorable.io/avatars/50/" + waitlistItem['user'] + ".png";
      }
      var avatarFallback = "//api.adorable.io/avatars/50/" + waitlistItem['user'] + ".png";

      waitlistPlace++;
      return (
          <li key={index} className={waitlistLineClasses}>
            <div className="waitlist-position">
              <span>#{waitlistPlace}</span>
            </div>
            <div className="waitlist-avatar">
              <ReactImageFallback
                className="waitlist-avatarimg"
                src={userAvatar}
                fallbackImage={avatarFallback}
                initialImage="/img/no-avatar.gif"
                />
            </div>
            <div className="waitlist-name-top">
              <span className="waitlist-name">{waitlistItem['user']}</span>
            </div>
          </li>
      )
    });
    return (
      <div className="waitlist-scroll">
        <ul className="waitlist-list">
          {waitlistItems}
        </ul>
      </div>
    );
  }

});

export default Waitlist;
