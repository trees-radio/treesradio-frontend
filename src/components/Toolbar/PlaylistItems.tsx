import React, { useState } from 'react';
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
  isMobile: boolean;
}

/**
 * Component for displaying the current playlist items with mobile optimization
 */
const PlaylistItems: React.FC<PlaylistItemsProps> = ({ items, isMobile }) => {
  // State to track which items have open action menus
  const [openActionMenus, setOpenActionMenus] = useState<{[key: number]: boolean}>({});
  
  const toggleActionMenu = (index: number) => {
    setOpenActionMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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
        {isMobile ? (
          // Mobile optimized layout
          <div className="pl-item-mobile">
            <div className="pl-main-content">
              <img className="pl-thumb-mobile" src={video.thumb} alt={video.title} />
              <div className="pl-info-container">
                <div className="truncate pl-title-mobile">{video.title}</div>
                <div className="pl-meta-mobile">
                  <span className="pl-duration-mobile">
                    <i className="fa fa-clock-o" /> {humanDuration}
                  </span>
                  <span className="truncate pl-channel-mobile">
                    {video.channel.trim()}
                  </span>
                </div>
              </div>
              <button 
                className="pl-actions-toggle" 
                onClick={(e) => {
                    e.stopPropagation();
                    toggleActionMenu(i);
                  }
                }
              >
                <i className="fa fa-ellipsis-v"></i>
              </button>
            </div>
            
            {/* Expandable actions menu */}
            {openActionMenus[i] && (
              <div className="pl-actions-mobile">
                <button onClick={() => playlists.removeVideo(i)} className="pl-action-btn-mobile">
                  <i className="fa fa-trash"></i> Remove
                </button>
                <a href={`https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${video.url}`} target="_blank" rel="noopener noreferrer" className="pl-action-btn-mobile">
                  <i className="fa fa-globe"></i> Info
                </a>
                <button onClick={() => playlists.moveBottom(i)} className="pl-action-btn-mobile">
                  <i className="fa fa-arrow-down"></i> Bottom
                </button>
                <button onClick={() => playlists.moveTop(i)} className="pl-action-btn-mobile">
                  <i className="fa fa-arrow-up"></i> Top
                </button>
              </div>
            )}
          </div>
        ) : (
          // Desktop layout (unchanged)
          <>
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
          </>
        )}
      </li>
    );
  });
  
  return <ol id="playlist-ol" className={isMobile ? "playlist-ol-mobile" : ""}>{list}</ol>;
};

export default observer(PlaylistItems);