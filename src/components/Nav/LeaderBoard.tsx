import React from "react";
import {observer} from "mobx-react";

import LeadersBoard from "../../stores/leaderboard";
import UserAvatar from "../utility/User/UserAvatar";
import UserName from "../utility/User/UserName";

class LeaderBoard extends React.Component {

    render() {
        let leadersarray: Array<{ uid: string, timestamp: number, likes: number, grabs: number, dislikes: number, onlineents?: number, url: string, title: string, thumb: string }> = LeadersBoard.leaders;
        let leaders = leadersarray.map((leader, index) => {
            let now = Math.floor(Date.now() / 1000);
            let time = leader.timestamp;
            let ago = Math.floor((now - time) / 60) + " minutes ago";
            if (now - time > 3600) {
                let hours = Math.floor((now - time) / 3600);
                let s = "s";
                if (hours == 1) s = "";
                ago = `${hours} hour${s} ago`;
            }
            let multiplier = 1;
            let basescore = leader.likes + leader.grabs - Math.floor(leader.dislikes / 2);

            if (leader.onlineents) {
                multiplier = basescore / leader.onlineents;
            }

            let actualscore = Math.ceil(basescore * multiplier);

            return (
                <div key={index} className="leaderboard-row">
                    <span className="leaderboard-cell-rank"><i className="fa fa-trophy"></i> {index + 1}:</span>
                    <span className="leaderboard-cell-avatar"><UserAvatar uid={leader.uid}/></span>
                    <span className="leaderboard-cell-username"><UserName uid={leader.uid}/><br/>
                    <a target="_blank" rel="noopener noreferrer" href={leader.url}>{leader.title}</a><br/>
                        Score: <strong>{actualscore}</strong> {ago}</span>
                    <span className="leaderboard-cell-song-thumb"><img src={leader.thumb}/></span>
                </div>
            )
        });
        return (
            <div className="leaderboard-list">
                {leaders}
            </div>
        );
    }
}
export default observer(LeaderBoard);