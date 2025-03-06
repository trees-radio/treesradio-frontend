import React from 'react';
import { observer } from 'mobx-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import playlists from '../../stores/playlists';

interface PlaylistItem {
  name: string;
  index: number;
  onSelect: () => void;
  onRemove: () => void;
}

interface PlaylistSelectorProps {
  playlists: PlaylistItem[];
  onAddPlaylist: () => void;
  onImportPlaylist: () => void;
  isMobile: boolean;
}

/**
 * Component for selecting playlists from a dropdown menu
 */
const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ 
  playlists: playlistItems,
  onAddPlaylist,
  onImportPlaylist,
  isMobile 
}) => {
  const playlistsList = playlistItems.map((playlist, i) => (
    <MenuItem key={i}>
      <div
        onClick={playlist.onSelect}
        className="cursor-pointer hover:bg-gray-800"
      >
        <a>{playlist.name}</a>
        <div
          onClick={(e) => {
            e.stopPropagation();
            playlist.onRemove();
          }}
          className="fa fa-trash remove-playlist"
        />
      </div>
    </MenuItem>
  ));

  return (
    <Menu as="div" className={`playlist-selector ${isMobile ? 'playlist-selector-mobile' : ''}`}>
      <MenuButton className="playlist-selector-btn">
        <div className="playlist-selector-content">
          <div className="button-nooverflow">
            {playlists.selectedPlaylistName || "Select Playlist"}
          </div>
          <span className="fa fa-chevron-down"></span>
        </div>
      </MenuButton>
      <MenuItems className="playlist-menu">
        <div className="dropdown-inner-text">
          <MenuItem>
            <a 
              onClick={onAddPlaylist} 
              className="playlist-menu-item"
            >
              <i className="fa fa-plus"></i> New Playlist
            </a>
          </MenuItem>
          <MenuItem>
            <a 
              onClick={onImportPlaylist} 
              className="playlist-menu-item"
            >
              <i className="fa fa-youtube-play"></i> Import Playlist
            </a>
          </MenuItem>
          {playlistsList}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default observer(PlaylistSelector);