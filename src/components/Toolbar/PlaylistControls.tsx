import React from 'react';
import { observer } from 'mobx-react';
import playlists from '../../stores/playlists';

interface PlaylistControlsProps {
  onMergePlaylists: () => void;
}

/**
 * Component for playlist action buttons including export, shuffle, and sorting
 */
const PlaylistControls: React.FC<PlaylistControlsProps> = ({ 
  onMergePlaylists 
}) => {
  const shuffle = playlists.hasPlaylist ? (
    <span
      onClick={() => playlists.shufflePlaylist()}
      className="playlist-shuffle-btn fa fa-random fa-2x"
      title="Shuffle this Playlist"
    />
  ) : null;

  const sortNameAsc = playlists.hasPlaylist ? (
    <span
      onClick={() => playlists.sortPlaylist("asc", "title")}
      className="playlist-shuffle-btn fa fa-sort-alpha-asc fa-2x"
      title="Sort this Playlist Alphabetically"
    />
  ) : null;

  const sortNameDesc = playlists.hasPlaylist ? (
    <span
      onClick={() => playlists.sortPlaylist("desc", "title")}
      className="playlist-shuffle-btn fa fa-sort-alpha-desc fa-2x"
      title="Sort this Playlist Reverse Alphabetically"
    />
  ) : null;

  const sortTimeAsc = playlists.hasPlaylist ? (
    <span
      onClick={() => playlists.sortPlaylist("asc", "duration")}
      className="playlist-shuffle-btn fa fa-sort-numeric-asc fa-2x"
      title="Sort this Playlist by shortest song first"
    />
  ) : null;

  const sortTimeDesc = playlists.hasPlaylist ? (
    <span
      onClick={() => playlists.sortPlaylist("desc", "duration")}
      className="playlist-shuffle-btn fa fa-sort-numeric-desc fa-2x"
      title="Sort this Playlist by longest song first"
    />
  ) : null;

  return (
    <div className="playlist-actions">
      <button onClick={onMergePlaylists} className="playlist-action-btn">
        <i className="fa fa-code-fork fa-lg" title="Merge Two Playlists"></i>
      </button>
      <button onClick={() => playlists.exportPlaylist()} className="playlist-action-btn">
        <i className="fa fa-download fa-lg" title="Download Playlist (json)"></i>
      </button>
      {sortTimeDesc}
      {sortTimeAsc}
      {sortNameDesc}
      {sortNameAsc}
      {shuffle}
    </div>
  );
};

export default observer(PlaylistControls);