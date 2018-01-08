import React from "react";
import {
    observer
} from "mobx-react";
import UserName from "components/utility/User/UserName";
import UserAvatar from "components/utility/User/UserAvatar";
import profile from "stores/profile";
import online from "stores/online";
import {
    autorun
} from "mobx";

@observer
export default class OnlineUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sorted: []
        };

        autorun(() => {
            let sortable = [];
            for (var key in online.online) {
                sortable.push([key, online.online[key].rank.then(val => val)]);
            }
            sortable.sort((a, b) => {
                return this.ranks.indexOf(a[1]) - this.ranks.indexOf(b[1]);
            });
            this.setState({
                sorted: sortable
            });
        });
    }

    ranks = ['Admin', 'Dev', 'Senior Mod', 'Mod', 'VIP', 'User'];

    render() {

        let userRankCanSeeDislikes = profile.rankPermissions.canSeeDownvotes === true;
        let userCanSeeDislikes = profile.isAdmin || userRankCanSeeDislikes;
        return ( <div className = "users-scroll"
                style = {
                    this.props.show ? {} : {
                        display: "none"
                    }
                } >
                <ul className = "users-list" > {
                    online.sorted.map((user, i) => {
                            if (online.online[user['uid']])
                                return ( <li key = { i } className = { i % 2 == 0 ? "user-line-1 user-item" : "user-line-0 user-item" } >
                                    <UserAvatar uid = {
                                        online.online[user['uid']].uid
                                    } />
                                    <div className = "users-info" >
                                    <UserName className = "users-username"
                                    uid = {
                                        online.online[user['uid']].uid
                                    }
                                    username = {
                                        online.online[user['uid']].username
                                    }
                                    /> { " " } <i className = {
                                    online.online[user['uid']].liked === true ?
                                    "fa fa-arrow-up users-upvote" : online.online[user['uid']].disliked === true && userCanSeeDislikes ?
                                    "fa fa-arrow-down users-downvote" : ""
                                }
                            /> { " " } <i className = {
                            online.online[user['uid']].grabbed === true ?
                                "fa fa-bookmark users-grab" : ""
                        }
                        />   
                        </div>
                    </li> );
                    })
            } </ul>
        </div>
    );
}
}