import React from 'react';
import { observer } from 'mobx-react';
import { action, observable, makeObservable } from 'mobx';
import playlists from '../../stores/playlists';

interface PlaylistSearchProps {
  isMobile: boolean;
}

class PlaylistSearch extends React.Component<PlaylistSearchProps> {
  @observable accessor searchInput = '';
  _search: HTMLInputElement | null = null;

  constructor(props: PlaylistSearchProps) {
    super(props);
    makeObservable(this);

    this.search = this.search.bind(this);
    this.onEnterKey = this.onEnterKey.bind(this);
    this.changeSearchSource = this.changeSearchSource.bind(this);
    this.clearExternalSearch = this.clearExternalSearch.bind(this);
    this.clearPlaylistSearch = this.clearPlaylistSearch.bind(this);
  }

  @action
  searchInPlaylist() {
    if (!this._search) return;

    const query = this._search.value;
    if (query) {
      playlists.searchInCurrentPlaylist(query);
    } else {
      this.clearPlaylistSearch();
    }
  }

  @action
  clearPlaylistSearch() {
    if (this._search) {
      this._search.value = "";
    }
    playlists.clearPlaylistSearch();
  }

  @action
  clearExternalSearch() {
    playlists.setOpenSearch(false);
    playlists.setSearch([]);

    if (this._search) {
      this._search.value = "";
    }
  }

  @action
  changeSearchSource(source: string) {
    // Clear previous search results
    playlists.clearPlaylistSearch();
    playlists.setOpenSearch(false);
    playlists.search = [];

    // Set new search source
    playlists.searchSource = source;

    // Clear search input when switching search modes
    if (this._search) {
      this._search.value = "";
    }
  }

  onEnterKey(e: React.KeyboardEvent, cb: () => void) {
    const key = e.keyCode || e.which;
    if (key === 13) {
      cb();
    }
  }

  @action
  search() {
    if (!this._search) return;

    const query = this._search.value;

    if (playlists.searchSource === "playlist") {
      // Search within playlist
      this.searchInPlaylist();
    } else {
      // External search (YouTube or Vimeo)
      playlists.runSearch(query);
    }

    // Don't clear search input for playlist search
    if (playlists.searchSource !== "playlist") {
      this._search.value = "";
    }
  }

  render() {
    const { isMobile } = this.props;
    
    if (isMobile) {
      // Mobile-optimized search UI
      return (
        <div className="playlist-search-mobile">
          <div className="search-input-group">
            <input
              type="text"
              ref={el => { this._search = el; }}
              placeholder={playlists.searchSource === "playlist" 
                ? "Search in playlist..." 
                : `Search ${playlists.searchSource === "youtube" ? "YouTube" : "Vimeo"}`}
              className="search-input"
              onKeyPress={e => this.onEnterKey(e, this.search)}
            />
            <button
              onClick={this.search}
              className="search-button"
            >
              <i className="fa fa-search"></i>
            </button>
          </div>
          
          <div className="search-options">
            <button 
              className={`search-option ${playlists.searchSource === "youtube" ? "active" : ""}`}
              onClick={() => this.changeSearchSource("youtube")}
            >
              <i className="mr-1 fa fa-youtube-play"></i> YouTube
            </button>
            <button 
              className={`search-option ${playlists.searchSource === "vimeo" ? "active" : ""}`}
              onClick={() => this.changeSearchSource("vimeo")}
            >
              <i className="mr-1 fa fa-vimeo"></i> Vimeo
            </button>
            <button 
              className={`search-option ${playlists.searchSource === "playlist" ? "active" : ""}`}
              onClick={() => this.changeSearchSource("playlist")}
            >
              <i className="mr-1 fa fa-list"></i> Playlist
            </button>
          </div>
          
          {playlists.searchSource === "playlist" && playlists.searchWithinPlaylist && (
            <button
              onClick={this.clearPlaylistSearch}
              className="mt-2 clear-search-btn"
            >
              <i className="fa fa-times"></i> Clear Search
            </button>
          )}
        </div>
      );
    }
    
    // Desktop search UI (unchanged)
    return (
      <div className="playlist-search-box-container">
        <input
          type="text"
          id="playlist-search-box"
          ref={el => { this._search = el; }}
          placeholder={playlists.searchSource === "playlist" 
            ? "Search in playlist..." 
            : `Search ${playlists.searchSource === "youtube" ? "YouTube" : "Vimeo"}`}
          className="form-control md:w-8"
          onKeyPress={e => this.onEnterKey(e, this.search)}
        />
        <button
          onClick={this.search}
          className="playlist-search-btn"
        >
          <i className="fa fa-search"></i>
        </button>
        {playlists.searchSource === "playlist" && playlists.searchWithinPlaylist && (
          <button
            onClick={this.clearPlaylistSearch}
            className="playlist-clear-search-btn"
          >
            <i className="fa fa-times"></i>
          </button>
        )}
        <div className="playlist-search-source">
          <input
            type="radio"
            checked={playlists.searchSource === "youtube"}
            id="search-youtube"
            name="search-source"
            onChange={() => this.changeSearchSource("youtube")}
          />
          <label htmlFor="search-youtube">YouTube</label>

          <input
            type="radio"
            checked={playlists.searchSource === "vimeo"}
            id="search-vimeo"
            name="search-source"
            onChange={() => this.changeSearchSource("vimeo")}
            className="ml-4"
          />
          <label htmlFor="search-vimeo">Vimeo</label>

          <input
            type="radio"
            checked={playlists.searchSource === "playlist"}
            id="search-playlist"
            name="search-source"
            onChange={() => this.changeSearchSource("playlist")}
            className="ml-4"
          />
          <label htmlFor="search-playlist">Playlist</label>
        </div>
      </div>
    );
  }
}

export default observer(PlaylistSearch);