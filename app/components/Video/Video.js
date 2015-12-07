

import React from 'react';
import ReactPlayer from 'react-player';

var Video = React.createClass({
  shouldBePlaying: function(){
    return true;
  },
  render: function() {
    return(
      <div>
        <ReactPlayer
          className=""
          url='https://www.youtube.com/watch?v=fgF7O_-vQzc'
          playing={this.shouldBePlaying()}
          />
      </div>
    )
  }

});

module.exports = Video;
