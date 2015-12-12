


 import React from 'react';

 var Playlists = React.createClass({
   render: function() {
     return(
       <div id="playlists-bar">
         <div id="playlists-open-button">
           <i id="playlists-open-icon" className="fa fa-angle-double-up fa-4x"></i>
         </div>
       </div>
     )
   }
 });

module.exports = Playlists;
