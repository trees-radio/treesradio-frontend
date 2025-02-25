import React from "react";
import {defaultAvatar, listenAvatar} from "../../../libs/avatar";
import imageWhitelist from "../../../libs/imageWhitelist";
import EMPTY_IMG from "../../../assets/img/nothing.png";
import {DataSnapshot} from "firebase/database";

interface UserAvatarProps {
    uid: string;
    className?: string;
    imgClass?: string;
}

export default class UserAvatar extends React.Component {
    _isMounted = false;
    props: UserAvatarProps;
    state: { avatar?: string; visible: boolean };

    constructor(props: UserAvatarProps) {
        super(props);
        this.props = props;
        this.state = {
            visible: true
        };
        this.getAvatar();
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getAvatar = async () => {
        const fallback = await defaultAvatar(this.props.uid);

        this.setState(
            {
                avatar: fallback
            },
            () => {
                if (this._isMounted)
                    listenAvatar(this.props.uid, (snap: DataSnapshot) => {
                        this.setState({
                            avatar: snap.val() || fallback
                        });
                    });
            }
        );
    };

    onVisibility = (isVisible: boolean) => this.setState({visible: isVisible});

    render() {
        let avatar: string | undefined = "";
        if (imageWhitelist(this.state.avatar)) {
            avatar = this.state.avatar;
        } else {
            avatar = EMPTY_IMG;
        }

        avatar = avatar?.replace("http:", "https:");

        let style = {};

        return (
            <span className={this.props.className}>
        <img src={avatar} className={this.props.imgClass || "avatarimg"} style={style} id="user-avatar"/>
                {/*<VisibilitySensor onChange={this.onVisibility}/>*/}
      </span>
        );
    }
}
