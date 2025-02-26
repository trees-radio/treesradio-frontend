import React from "react";
import {defaultAvatar, listenAvatar} from "../../../libs/avatar";
import imageWhitelist from "../../../libs/imageWhitelist";
import EMPTY_IMG from "../../../assets/img/nothing.png";
import {DataSnapshot} from "@firebase/database-types";

interface UserAvatarProps {
    uid: string;
    className?: string;
    imgClass?: string;
}

interface UserAvatarState {
    avatar?: string;
    visible: boolean;
}

export default class UserAvatar extends React.Component<UserAvatarProps, UserAvatarState> {
    _isMounted = false;

    state: UserAvatarState = {
        visible: true
    };

    constructor(props: UserAvatarProps) {
        super(props);
    }

    componentDidMount() {
        this._isMounted = true;
        this.getAvatar();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getAvatar = async () => {
        if (!this._isMounted) return;

        const fallback = await defaultAvatar(this.props.uid);

        if (this._isMounted) {
            this.setState(
                {
                    avatar: fallback
                },
                () => {
                    listenAvatar(this.props.uid, (snap: DataSnapshot, _b?: string | null) => {
                        if (this._isMounted) {
                            this.setState({
                                avatar: snap.val() || fallback
                            });
                        }
                    });
                }
            );
        }
    };

    onVisibility = (isVisible: boolean) => this.setState({visible: isVisible});

    render() {
        let avatar: string | undefined = "";
        if (this.state.avatar && imageWhitelist(this.state.avatar)) {
            avatar = this.state.avatar;
        } else {
            avatar = EMPTY_IMG;
        }

        avatar = avatar?.replace("http:", "https:");

        let style = {};

        return (
            <span className={this.props.className}>
                <img 
                    src={avatar} 
                    className={this.props.imgClass || "avatarimg"} 
                    style={style} 
                    id="user-avatar"
                />
                {/*<VisibilitySensor onChange={this.onVisibility}/>*/}
            </span>
        );
    }
}