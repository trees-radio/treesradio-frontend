import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import playlists from '../../stores/playlists';

interface Song {
  url: string;
  title: string;
  thumb: string;
  channel: string;
  duration: number;
  name?: string;
  user?: string | undefined;
  added?: number;
}

interface PlaylistItemsProps {
  items: Song[];
}

/**
 * Component for displaying the current playlist items
 */
const PlaylistItems: React.FC<PlaylistItemsProps> = ({ items }) => {
  const list = items.map((video, i) => {
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
            onClick={() => playlists.removeVideo(i)}
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
            onClick={() => playlists.moveBottom(i)}
            className="border-green-500 fa fa-2x fa-arrow-down pl-move-to-top"
          />
          <i
            onClick={() => playlists.moveTop(i)}
            className="border-green-500 fa fa-2x fa-arrow-up pl-move-to-top"
          />
        </div>
      </li>
    );
  });
  
  return <ol id="playlist-ol">{list}</ol>;
};

export default observer(PlaylistItems);