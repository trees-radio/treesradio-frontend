import React from "react";
import {observer} from "mobx-react";

import leaderboard from "stores/leaderboard";
import UserAvatar from "components/utility/User/UserAvatar";
import UserName from "components/utility/User/UserName";

@observer
export default class LeaderBoard extends React.Component {

    render() {
        let leaders = leaderboard.leaders.map((leader, index) => {
            return (
                <div className="leaderboard-row">
                    <span className="leaderboard-cell-rank">#{index+1}</span>
                    <span className="leaderboard-cell-avatar"><UserAvatar uid={leader.uid} /></span>
                    <span className="leaderboard-cell-username"><UserName uid={leader.uid} /></span>
                    <span className="leaderboard-cell-songtitle">{leader.title}</span>
                    <span className="leaderboard-cell-songthumb">{leader.thumb}</span>
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
