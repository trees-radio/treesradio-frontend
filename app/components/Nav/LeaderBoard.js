import React from "react";
import {observer} from "mobx-react";

import LeadersBoard from "stores/leaderboard";
import UserAvatar from "components/utility/User/UserAvatar";
import UserName from "components/utility/User/UserName";

@observer
export default class LeaderBoard extends React.Component {
    
    render() {
        let leadersarray = LeadersBoard.leaders;
        let leaders = leadersarray.map((leader, index) => {
            return (
                <div key={index} className="leaderboard-row">
                    <span className="leaderboard-cell-rank"><i className="fa fa-trophy"></i> {index+1}:</span>
                    <span className="leaderboard-cell-avatar"><UserAvatar uid={leader.uid} /></span>
                    <span className="leaderboard-cell-username"><UserName uid={leader.uid} /></span>
                    <span className="leaderboard-cell-songtitle"><a target="_blank" rel="noopener noreferrer" href={leader.url}>{leader.title}</a></span>
                    <span className="leaderboard-cell-songthumb"><img src={leader.thumb}/></span>
                    <br/>
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
