import React from 'react';
import { observer } from 'mobx-react';
import playlists from '../../stores/playlists';
import SearchResults from './SearchResults';
import PlaylistSearchResults from './PlaylistSearchResults';
import PlaylistItems from './PlaylistItems';

interface PlaylistContentProps {
  isMobile: boolean;
}

/**
 * Component that renders the appropriate content based on the current state:
 * - Loading indicator
 * - External search results
 * - Playlist search results
 * - Regular playlist items
 */
const PlaylistContent: React.FC<PlaylistContentProps> = ({ isMobile }) => {
  const clearPlaylistSearch = () => {
    playlists.clearPlaylistSearch();
  };
  // Show loading indicator when searching
  if (playlists.searching) {
    return (
      <div className="playlist-search-results">
        <div className="playlist-search-header">
          <span>Waiting for results.</span>
          <button
            onClick={clearPlaylistSearch}
            className="clear-search-btn"
          >
            <i className="fa fa-times" /> Clear
          </button>
        </div>
        <i className="fa fa-spin fa-4x fa-circle-o-notch playlist-loading" />
      </div>
    );
  }

  // Show external search results
  if (playlists.openSearch) {
    return <SearchResults />;
  }

  // Show playlist search results
  if (playlists.searchWithinPlaylist) {
    return <PlaylistSearchResults />;
  }

  // Show regular playlist
  if (playlists.playlist.length > 0) {
    return <PlaylistItems items={playlists.playlist} isMobile={isMobile} />;
  }

  // Show empty state
  return <div className="empty-playlist">Empty playlist.</div>;
};

export default observer(PlaylistContent);