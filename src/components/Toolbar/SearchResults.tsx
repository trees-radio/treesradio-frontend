import React from 'react';
import { observer } from 'mobx-react';
import playlists from '../../stores/playlists';
import moment from 'moment';
import Favicon from '../../assets/img/favicon.png';

/**
 * Component for displaying search results from external sources (YouTube/Vimeo)
 */
const SearchResults: React.FC = () => {
  // Function to clear search results
  const clearExternalSearch = () => {
    playlists.setOpenSearch(false);
    playlists.setSearch([]);
  };

  // If we have search results, display them
  if (playlists.search.length > 0) {
    const list = playlists.search.map((video, i) => {
      const playlistPosClass = i % 2 === 0 ? "playlist-item-1" : "playlist-item-2";
      let url = "";
      let humanDuration = "";
      let title = "";
      let channelTitle = "";
      let thumbnail = "";
      let skipLink = "";

      if (video.snippet) {
        // Handle both YouTube and Vimeo videos
        if (video.source === "vimeo") {
          url = video.link || `https://vimeo.com/${video.id}`;
          const duration = moment.duration(video.contentDetails.duration);
          const hours = duration.hours();
          const hoursDisplay = hours > 0 ? `${hours}h ` : "";
          const mins = duration.minutes();
          const secs = `0${duration.seconds()}`.slice(-2);
          humanDuration = `${hoursDisplay}${mins}:${secs}`;
          thumbnail = video.snippet.thumbnails.medium.url;
          title = video.snippet.title;
          channelTitle = video.snippet.channelTitle;
        } else {
          // YouTube
          url = `https://www.youtube.com/watch?v=${video.id}`;
          const duration = moment.duration(video.contentDetails.duration);
          const hours = duration.hours();
          const hoursDisplay = hours > 0 ? `${hours}h ` : "";
          const mins = duration.minutes();
          const secs = `0${duration.seconds()}`.slice(-2);
          humanDuration = `${hoursDisplay}${mins}:${secs}`;
          thumbnail = video.snippet.thumbnails.default.url;
          title = video.snippet.title;
          channelTitle = video.snippet.channelTitle;
          skipLink = `https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${video.id}`;
        }
      } else if (video.title) {
        // Legacy code for any other source types
        url = video.permalink_url;
        const duration = moment.duration(video.duration);
        const hours = duration.hours();
        const hoursDisplay = hours > 0 ? `${hours}h ` : "";
        const mins = duration.minutes();
        const secs = `0${duration.seconds()}`.slice(-2);
        humanDuration = `${hoursDisplay}${mins}:${secs}`;
        thumbnail = video.artwork_url || video.user?.avatar_url || Favicon;
        title = video.title;
        channelTitle = video.user?.username || "";
      }

      return (
        <li className={`${playlistPosClass}`} key={i}>
          <div className="pl-title-section">
            <a target="_blank" href={url} rel="noopener noreferrer">
              <img className="pl-thumbnail" src={thumbnail} alt={title} />
            </a>
            <span className="pl-media-title">{title}</span>
          </div>
          <div className="pl-button-section">
            <span className="pl-time">
              <i className="fa fa-clock-o" /> {humanDuration}
            </span>
            <span className="pl-channel">{channelTitle?.trim()}</span>
            <i
              onClick={() => playlists.addFromSearch(i)}
              className="fa fa-2x fa-plus add-to-playlist-btn"
            />
            {skipLink && (
              <a
                target="_blank"
                href={skipLink}
                rel="noopener noreferrer"
              >
                <i className="fa fa-2x fa-globe add-to-playlist-btn" />
              </a>
            )}
          </div>
        </li>
      );
    });

    return (
      <div className="playlist-search-results">
        <div className="playlist-search-header">
          <span>
            Search results from {
              playlists.searchSource === "youtube" 
                ? "YouTube" 
                : playlists.searchSource === "vimeo" 
                  ? "Vimeo" 
                  : "Playlist"
            }
          </span>
          <button
            onClick={clearExternalSearch}
            className="clear-search-btn"
          >
            <i className="fa fa-times" /> Clear
          </button>
        </div>
        <ol id="playlist-ol">{list}</ol>
      </div>
    );
  }

  // If no search results, display empty state
  return (
    <div className="empty-playlist">
      <div className="playlist-search-header">
        <span>No results found</span>
        <button
          onClick={clearExternalSearch}
          className="clear-search-btn"
        >
          <i className="fa fa-times" /> Clear
        </button>
      </div>
    </div>
  );
};

export default observer(SearchResults);