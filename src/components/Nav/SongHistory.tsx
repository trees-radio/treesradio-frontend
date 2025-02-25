import React from "react";
import {observer} from "mobx-react";
import SongHistory from "../../stores/songhistory";
import UserAvatar from "../utility/User/UserAvatar";
import UserName from "../utility/User/UserName";
import Nothing from "../../assets/img/nothing.png";

class PlayHistory extends React.Component {

    render() {
        let historyarray = SongHistory.history;
        let history = historyarray.map((song, index) => {
            let now = Math.floor(Date.now() / 1000);
            let time = song.time;
            let ago = Math.floor((now - time) / 60) + " minutes ago";
            if (now - time > 3600) {
                let hours = Math.floor((now - time) / 3600);
                let s = "s";
                if (hours === 1) s = "";
                ago = `${hours} hour${s} ago`;
                if (hours > 2) {
                    return;   
                }
            }
            var thumb = song.thumb;
            if (thumb == undefined || thumb == "") {
                thumb = Nothing;
            }
            return (
                <div key={index} className="leaderboard-row">
                    <span className="leaderboard-cell-avatar"><UserAvatar uid={song.uid}/></span>
                    <span className="leaderboard-cell-username"><UserName uid={song.uid}/><br/>
                    <a target="_blank" rel="noopener noreferrer" href={song.url}>{song.title}</a><br/>
                    👍 {song.likes} │  
                    👎 {song.dislikes} │              
                    ⊕ {song.grabs} │ 
                    🔥 {song.hypes} <br/>{ago}
                    </span>
                    <span className="leaderboard-cell-songthumb">
                        <img src={thumb} id="songHistory-img"
                             alt="imagine image"/>
                    </span>
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

export default observer(PlayHistory);