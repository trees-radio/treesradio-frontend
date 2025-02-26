import React, { useRef } from "react";
import { observer } from "mobx-react";
import { observable, action } from "mobx";

// Note that lazy loading doesn't work. Filing an issue with the project
import ReactPlayer, { ReactPlayerProps } from "react-player";
import { Line } from "rc-progress";

import playing from "../stores/playing";
import { FC } from "react";

const rPlayerYoutubeConfig = {
    playerVars: {
        iv_load_policy: 1,
        controls: true,
        playsinline: true,
        color: "white",
        autoplay: true,
    },
    preload: true,
    controls: true,
};

const rPlayerSoundcloudConfig = {
    options: {
        auto_play: true,
        buying: false,
        sharing: false,
        download: false,
        show_playcount: false,
        single_active: false,
        color: "#77b300",
        show_user: false,
    },
    preload: true,
};

// TODO sync is not working :o
const Player: FC = () => {
    const playerRef = useRef<ReactPlayer>(null);

    const containerStyle = {
        backgroundImage: `url(${playing.backgroundImage})`,
    };

    return (
        <div id="vidcontainer" style={containerStyle}>
            <div
                id="player-size"
                className={
                    playing.playerSize === "BIG"
                        ? "large-player-size"
                        : "small-player-size"
                }
            >

                <ReactPlayer
                    ref={playerRef}
                    className="reactplayer border-0 outline-0 appearance-none active:outline-none"
                    width="100%"
                    height="100%"
                    id="reactplayerid"
                    url={playing.data.info.url}
                    playing={playing.data.playing}
                    volume={playing.volume}
                    onProgress={(p) => {
                        playing.setPlayerProgress(p.played);
                        const syncTo = playing.shouldSync;

                        if (syncTo) {
                            console.log(`syncing to ${syncTo}`);
                            playerRef.current?.seekTo(syncTo, "seconds");
                        }
                    }}
                    onError={(e) => playing.userReportsError(e)}
                    onStart={() => playerRef.current?.seekTo(0, "seconds")}
                    onEnded={() => {
                        if (!playerRef.current) {
                            return;
                        }
                        //playerRef.current.playing = false;
                    }}
                    onPause={undefined}
                    controls={true}
                    config={{
                        youtube: rPlayerYoutubeConfig,
                        soundcloud: rPlayerSoundcloudConfig,
                    }}
                    onDuration={() => {
                        playing.setPlayerDuration(playing.data.info.duration / 1000);
                    }}
                />
            </div>
            {" "}
            <Line
                className="progressbar-container"
                strokeWidth={2}
                percent={playing.fraction * 100 > 100 ? 100 : playing.fraction * 100}
                strokeColor="#000000"
                trailColor="#77b420"
            />
        </div>
    );
}

const $Player = observer(Player);

export { $Player as Player };

class Player_ extends React.Component {
    onProgress(p: { played: number }) {
        action(() => {
            playing.playerProgress = p.played;
            const syncTo = playing.shouldSync;

            if (syncTo) {
                this._player.seekTo(syncTo, "seconds");
            }
        });
    }

    playerError(e: number) {
        playing.userReportsError(e);
    }

    @observable accessor showVideo = true;

    _player!: ReactPlayerProps;
    onkeydownListener!: (e: KeyboardEvent) => void;
    syncs = 0;

    componentDidMount() {
        this.onkeydownListener = (e) => {
            if (e.ctrlKey && e.shiftKey && e.keyCode === 86) {
                e.preventDefault();
                this.showVideo = !this.showVideo;
            }
        };

        window.addEventListener("keydown", this.onkeydownListener);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.onkeydownListener);
    }

    render() {
        const containerStyle = {
            backgroundImage: `url(${playing.backgroundImage})`,
        };
        let controls = true;
        let progress = {};

        return (
            <div id="vidcontainer" style={containerStyle}>
                <div
                    id="player-size"
                    className={
                        playing.playerSize === "BIG"
                            ? "large-player-size"
                            : "small-player-size"
                    }
                >
                    {this.showVideo && (
                        <ReactPlayer
                            ref={(c) => { this._player = c!; }}
                            className="reactplayer"
                            width="100%"
                            height="100%"
                            id="reactplayerid"
                            url={playing.data.info.url}
                            playing={playing.data.playing}
                            volume={playing.volume}
                            onProgress={(p) => this.onProgress(p)}
                            onError={(e) => this.playerError(e)}
                            onStart={() => this._player.seekTo(0, "seconds")}
                            onEnded={() => {
                                this.syncs = 0;
                                this._player.playing = false;
                            }}
                            onPause={undefined}
                            controls={controls}
                            config={{
                                youtube: rPlayerYoutubeConfig,
                                soundcloud: rPlayerSoundcloudConfig,
                            }}
                            onDuration={() => {
                                playing.setPlayerDuration(playing.data.info.duration / 1000);
                            }}
                        />
                    )}{" "}
                </div>
                {" "}
                <Line
                    className="progressbar-container"
                    style={progress}
                    strokeWidth={2}
                    percent={playing.fraction * 100 > 100 ? 100 : playing.fraction * 100}
                    strokeColor="#000000"
                    //TrailColor="#77b300"
                    trailColor="#77b300"
                />
            </div>
        );
    }
}

export default observer(Player_);
