
import axios from 'axios';

var youTube = (function(){
  var trModule = {};

  var apiKey = '';

  trModule.setKey = function(ytApiKey) {
    apiKey = ytApiKey;
  }

  trModule.parsePlaylist = function(playlistId, callback, nextToken, playlistItems, noMorePages, error) {
    console.log('Retrieving playlist items...');
    if (!playlistItems) {
      playlistItems = [];
    }
    if (!noMorePages) { //start/continue looping
      axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'contentDetails,snippet',
          playlistId: playlistId,
          key: apiKey,
          maxResults: 50,
          pageToken: nextToken
        }
      }).then(function(response) {
        var data = response.data;
        playlistItems = playlistItems.concat(data.items);
        if (data.nextPageToken) { //still looping
          trModule.parsePlaylist(playlistId, callback, data.nextPageToken, playlistItems);
        } else {
          trModule.parsePlaylist(playlistId, callback, nextToken, playlistItems, true); //ends the loop
        }
      }).catch(function(response) {
        // debugger;
        console.log(response);
        trModule.parsePlaylist(playlistId, callback, nextToken, playlistItems, true, true);
      });
    } else { //done with looping
      var playlist = {
        items: playlistItems
      }
      if (error) {
        playlist.error = true;
      }
      return callback(playlist);
    }
  }

  return trModule;
}());

export default youTube;
