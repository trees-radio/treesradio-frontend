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
  addManualSong() {
    if (!this._search) return;
    
    // Set the URL from the search input
    playlists.setManualUrl(this._search.value);
    
    // Add the song
    playlists.addManualSong();
    
    // Clear the input
    this._search.value = "";
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
    } else if (playlists.searchSource === "manual") {
      // Manual add
      this.addManualSong();
    } else {
      // External search (YouTube or Vimeo)
      playlists.runSearch(query);
    }

    // Don't clear search input for playlist search or manual add
    if (playlists.searchSource !== "playlist" && playlists.searchSource !== "manual") {
      this._search.value = "";
    }
  }

  render() {
    const { isMobile } = this.props;
    
    return (
      <div className={`playlist-search-box-container ${isMobile ? 'mobile-search' : ''}`}>
        <div className="search-input-group">
          <input
            type="text"
            id="playlist-search-box"
            ref={el => { this._search = el; }}
            placeholder={
              playlists.searchSource === "playlist"
                ? "Search in playlist..."
                : playlists.searchSource === "manual"
                  ? "Paste Soundcloud URL here..."
                  : `Search ${playlists.searchSource === "youtube" ? "YouTube" : "Vimeo"}`
            }
            className="form-control search-input"
            onKeyPress={e => this.onEnterKey(e, this.search)}
          />
          <button
            onClick={this.search}
            className="search-button"
          >
            <i className={playlists.searchSource === "manual" ? "fa fa-plus" : "fa fa-search"}></i>
          </button>
        </div>
        
        <div className="search-options">
          <button 
            className={`search-option youtube-option ${playlists.searchSource === "youtube" ? "active" : ""}`}
            onClick={() => this.changeSearchSource("youtube")}
          >
            <img className="inline w-5 mr-1 mb-0.5" src="data:image/png;base64,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KKCAAikLGABS7r61K6CAAgokK2AASLb1Fq6AAgookLKAASDl7lu7AgoooECyAgaAZFtv4QoooIACKQsYAFLuvrUroIACCiQrYABItvUWroACCiiQsoABIOXuW7sCCiigQLICBoBkW2/hCiiggAIpCxgAUu6+tSuggAIKJCtgAEi29RaugAIKKJCygAEg5e5buwIKKKBAsgIGgGRbb+EKKKCAAikLGABS7r61K6CAAgokK2AASLb1Fq6AAgookLKAASDl7lu7AgoooECyAgaAZFtv4QoooIACKQsYAFLuvrUroIACCiQrYABItvUWroACCiiQsoABIOXuW7sCCiigQLICBoBkW2/hCiiggAIpCxgAUu6+tSuggAIKJCtgAEi29RaugAIKKJCygAEg5e5buwIKKKBAsgIGgGRbb+EKKKCAAikLGABS7r61K6CAAgokK2AASLb1Fq6AAgookLKAASDl7lu7AgoooECyAgaAZFtv4QoooIACKQsYAFLuvrUroIACCiQrYABItvUWroACCiiQsoABIOXuW7sCCiigQLICBoBkW2/hCiiggAIpCxgAUu6+tSuggAIKJCtgAEi29RaugAIKKJCygAEg5e5buwIKKKBAsgIGgGRbb+EKKKCAAikLGABS7r61K6CAAgokK2AASLb1Fq6AAgookLKAASDl7lu7AgoooECyAgaAZFtv4QoooIACKQsYAFLuvrUroIACCiQrYABItvUWroACCiiQsoABIOXuW7sCCiigQLICBoBkW2/hCiiggAIpCxgAUu6+tSuggAIKJCvw/wHyw9l54kGLBQAAAABJRU5ErkJggg=="/> YouTube
          </button>
          <button 
            className={`search-option vimeo-option ${playlists.searchSource === "vimeo" ? "active" : ""}`}
            onClick={() => this.changeSearchSource("vimeo")}
          >
            <i className="mr-1 fa fa-vimeo"></i> Vimeo
          </button>
          <button
            className={`search-option playlist-option ${playlists.searchSource === "playlist" ? "active" : ""}`}
            onClick={() => this.changeSearchSource("playlist")}
          >
            <i className="mr-1 fa fa-list"></i> Playlist
          </button>
          <button
            className={`search-option manual-option ${playlists.searchSource === "manual" ? "active" : ""}`}
            onClick={() => this.changeSearchSource("manual")}
          >
            <i className="mr-1 fa fa-plus"></i> Manual Add
          </button>
        </div>
        
        {playlists.searchSource === "manual" && (
          <div className="manual-add-options">
            <input
              type="text"
              placeholder="Optional: Custom title"
              className="form-control manual-title-input"
              value={playlists.manualTitle}
              onChange={(e) => playlists.setManualTitle(e.target.value)}
            />
            <small className="text-muted">Leave empty to auto-detect title from URL</small>
          </div>
        )}
        
        {playlists.searchSource === "playlist" && playlists.searchWithinPlaylist && (
          <button
            onClick={this.clearPlaylistSearch}
            className="clear-search-btn"
          >
            <i className="fa fa-times"></i> Clear Search
          </button>
        )}
      </div>
    );
  }
}

export default observer(PlaylistSearch);