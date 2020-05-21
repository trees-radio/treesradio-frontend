import React from "react";
import { observer } from "mobx-react";

import SongHistory from "stores/songhistory";
import UserAvatar from "components/utility/User/UserAvatar";
import UserName from "components/utility/User/UserName";

@observer
export default class PlayHistory extends React.Component {

    render() {
        let historyarray = SongHistory.history;
        let history = historyarray.map((song, index) => {
            let now = Math.floor(Date.now() / 1000);
            let time = song.time;
            let ago = Math.floor((now - time) / 60) + " minutes ago";
            if (now - time > 3600) {
                let hours = Math.floor((now - time) / 3600);
                let s = "s";
                if (hours == 1) s = "";
                ago = `${hours} hour${s} ago`;
            }

            return (
                <div key={index} className="leaderboard-row">
                    <span className="leaderboard-cell-avatar"><UserAvatar uid={song.uid} /></span>
                    <span className="leaderboard-cell-username"><UserName uid={song.uid} /><br/>
                    <a target="_blank" rel="noopener noreferrer" href={song.url}>{song.title}</a><br />
                    <i className="fa fa-thumbs-up"/> {song.likes}      
                    <i className="fa fa-thumbs-down"/> {song.dislikes}                  
                    <i className="fa fa-plus-square"/> {song.grabs}
                    <i className="fa fa-fire"/> {song.hypes} <br/>{ago}
                    </span>
                    <span className="leaderboard-cell-songthumb"><img src={song.thumb} /></span>
                </div>
            )
        });
        return (
            <div className="leaderboard-list">
                {history}
            </div>
        );
    }
}
