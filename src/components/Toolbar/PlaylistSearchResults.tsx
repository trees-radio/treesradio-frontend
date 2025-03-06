import React from 'react';
import { observer } from 'mobx-react';
import playlists from '../../stores/playlists';
import moment from 'moment';

/**
 * Component for displaying search results within the current playlist
 */
const PlaylistSearchResults: React.FC = () => {
  // Function to clear playlist search
  const clearPlaylistSearch = () => {
    playlists.clearPlaylistSearch();
  };

  // If we have playlist search results, display them
  if (playlists.playlistSearchResults.length > 0) {
    const list = playlists.playlistSearchResults.map((video, i) => {
      const playlistPosClass = i % 2 === 0 ? "playlist-item-1" : "playlist-item-2";
      let humanDuration = "Unknown";

      if (video.duration) {
        const duration = moment.duration(video.duration);
        const hours = duration.hours();
        const hoursDisplay = hours > 0 ? `${hours}h ` : "";
        const mins = duration.minutes();
        const secs = `0${duration.seconds()}`.slice(-2);
        humanDuration = `${hoursDisplay}${mins}:${secs}`;
      }

      // Find the original index of this video in the full playlist
      const originalIndex = playlists.playlist.findIndex(
        item => item.url === video.url && item.title === video.title
      );

      return (
        <li className={`${playlistPosClass}`} key={i}>
          <div className="pl-title-section">
            <a target="_blank" href={video.url} rel="noopener noreferrer">
              <img className="self-center pl-thumbnail" src={video.thumb} alt={video.title} />
            </a>
            <span className="pl-media-title">{video.title}</span>
          </div>
          <div className="pl-button-section">
            <span className="pl-time">
              <i className="fa fa-clock-o" /> {humanDuration}
            </span>
            <span className={`pl-channel ${video.user ? "self-center" : ""}`}>
              {video.channel.trim()}
              {video.user && <br />}
              {video.user && `  (Grab: ${video.user})`}
            </span>

            <i
              onClick={() => playlists.removeVideo(originalIndex)}
              className="border-green-500 fa fa-2x fa-trash remove-from-playlist-btn"
            />

            <a
              target="_blank" 
              href={`https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${video.url}`}
              rel="noopener noreferrer"
            >
              <i className="border-green-500 fa fa-2x fa-globe add-to-playlist-btn" />
            </a>
            <i
              onClick={() => playlists.moveTop(originalIndex)}
              className="border-green-500 fa fa-2x fa-arrow-up pl-move-to-top"
            />
            <i
              onClick={() => playlists.moveBottom(originalIndex)}
              className="border-green-500 fa fa-2x fa-arrow-down pl-move-to-top"
            />
          </div>
        </li>
      );
    });
    
    return (
      <div className="playlist-search-results">
        <div className="playlist-search-header">
          <span>Search results for "{playlists.playlistSearchQuery}"</span>
          <button
            onClick={clearPlaylistSearch}
            className="clear-search-btn"
          >
            <i className="fa fa-times" /> Clear
          </button>
        </div>
        <ol id="playlist-ol">{list}</ol>
      </div>
    );
  }
  
  // If no playlist search results, display empty state
  return (
    <div className="empty-playlist">
      <div className="playlist-search-header">
        <span>No results found for "{playlists.playlistSearchQuery}"</span>
        <button
          onClick={clearPlaylistSearch}
          className="clear-search-btn"
        >
          <i className="fa fa-times" /> Clear
        </button>
      </div>
    </div>
  );
};

export default observer(PlaylistSearchResults);