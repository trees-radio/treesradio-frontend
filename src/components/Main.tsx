// NEW MAIN COMPONENT

import {type FC, useState} from "react";
import {observer} from "mobx-react";

import app from "../stores/app";

import {Nav} from "./Nav";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Player from "./Player";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import events from "../stores/events";
import cn from "classnames";

// both are 1-indexed
type DateTuple = [month: number, day: number];

const specialOccasions = {
    "420": [4, 20],
    "april-fools": [4, 1],
} as const satisfies Readonly<Record<string, DateTuple>>;

type SpecialOccasion = keyof typeof specialOccasions;

const splashTexts = [
    // No messages over 40 characters
    "Grab a Bong and Sing A Long!",
    "Pimp Squad, Holdin it Down",
    "Livin' Young 'n Wild 'n Freeee",
    "Loaded... Or am I?",
    "Grinding Vigorously",
    "More uptime than Facebook",
    "Poking Badgers with Spoons",
    "Where's my Lighter?",
    'No officer, it\'s "Hi, how are you?"',
    "Home of the original musical inspiration",
] as const;

const randomSplash = () =>
    splashTexts[Math.floor(Math.random() * splashTexts.length)];

const isSpecialOccasion = (event: SpecialOccasion) =>
    new Date().getDate() === specialOccasions[event][0] && (new Date().getMonth() + 1) === specialOccasions[event][1];

const Main: FC = () => {
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

    //TODO April Fools Shenanigans

    if (!app.init) {
        events.register("force_refresh", () => location.reload());

        return (
            <div className="main-load">
                <div className="container main-loadingcard">
                    <div className="main-vcenter">
                        <div className="main-center">
                            <center className="loading-txt">
                                {" "}
                                {randomSplash()} <br/>
                                <i className="fa fa-spin fa-2x fa-circle-o-notch loadingscreenwheel"/>
                            </center>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn({
                "april-fools": isSpecialOccasion("april-fools"),
                "playlist-open": isPlaylistOpen,
            })}
            id="app-grid"
        >
            <link
                href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
                rel="stylesheet"
                integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"
                crossOrigin="anonymous"
            />

            <Nav show420={isSpecialOccasion("420")}/> {/* Start Container */}{" "}

            <div id="videotoplevel">
                <Player/>
            </div>

            <div id="toolbar">
                <div id="playlists-container">
                    <Toolbar togglePlaylist={() => setIsPlaylistOpen(!isPlaylistOpen)}/>
                </div>
                <a id="exportPlaylistDownload"/>
            </div>

            <div id="chattoplevel">
                <ToastContainer/>{" "}
                <Sidebar/>
            </div>

        </div>
    );
};

const $Main = observer(Main);

export {$Main as Main};

//
// class __Main extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {show420: false, isPlaylistOpen: false};
//         this.togglePlaylist = this.togglePlaylist.bind(this);
//     }
//
//     componentDidMount() {
//         this.check420();
//     }
//
//     togglePlaylist() {
//         this.setState((state) => ({isPlaylistOpen: !state.isPlaylistOpen}));
//     }
//
//
//     checkAprilFools() {
//         const curtime = new Date(),
//             curday = curtime.getDate(),
//             curmonth = curtime.getMonth() + 1;
//         if (curmonth === 4 && curday === 1) {
//             this.aprilFoolsShenanigans();
//             return "april-fools";
//         }
//         return "noop";
//     }
//
//     check420() {
//         const curtime = new Date(),
//             curday = curtime.getDate(),
//             curmonth = curtime.getMonth() + 1;
//         if (curmonth === 4 && curday === 20) {
//             this.effects420();
//         }
//     }
//
//     aprilFoolsShenanigans() {
//         const me = this;
//         setTimeout(function () {
//             if ($(".april-fools")) {
//                 $(".april-fools").removeClass("april-fools").addClass("noop");
//             } else {
//                 $(".noop").removeClass("noop").addClass("april-fools");
//             }
//             me.aprilFoolsShenanigans();
//         }, Math.floor(Math.random() * 5000) + 300000);
//     }
//
//     effects420() {
//         this.setState({show420: true});
//     }
//
//     isPlaylistOpen() {
//         return this.state.isPlaylistOpen ? "playlist-open" : "";
//     }
//
//     render() {
//         if (!app.init) {
//             events.register("force_refresh", () => {
//                 location.reload();
//             });
//             let randmsg = [
//                 // No messages over 40 characters
//                 "Grab a Bong and Sing A Long!",
//                 "Pimp Squad, Holdin it Down",
//                 "Livin' Young 'n Wild 'n Freeee",
//                 "Loaded... Or am I?",
//                 "Grinding Vigorously",
//                 "More uptime than Facebook",
//                 "Poking Badgers with Spoons",
//                 "Where's my Lighter?",
//                 'No officer, it\'s "Hi, how are you?"',
//                 "Home of the original musical inspiration",
//             ];
//             return (
//                 <div className="main-load">
//                     <div className="container main-loadingcard">
//                         <div className="main-vcenter">
//                             <div className="main-center">
//                                 <center className="loading-txt">
//                                     {" "}
//                                     {randmsg[Math.floor(Math.random() * randmsg.length)]} <br/>
//                                     <i className="fa fa-spin fa-2x fa-circle-o-notch loadingscreenwheel"/>
//                                 </center>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             );
//         }
//         return (
//             <div
//                 className={this.checkAprilFools() + " " + this.isPlaylistOpen()}
//                 id="app-grid"
//             >
//                 <link
//                     href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
//                     rel="stylesheet"
//                     integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN"
//                     crossOrigin="anonymous"
//                 />
//                 <Nav show420={this.state.show420}/> {/* Start Container */}{" "}
//                 {/* Video Component */}
//                 <div id="videotoplevel">
//                     <Player/>
//                 </div>
//                 <div id="toolbar">
//                     <div id="playlists-container">
//                         <Toolbar togglePlaylist={this.togglePlaylist}/>
//                     </div>
//                     <a id="exportPlaylistDownload"/>
//                 </div>
//                 {/* Chat Component */}
//                 <div id="chattoplevel">
//                     <ToastContainer/>{" "}
//                     {/* <Sidebar
//                                 loginData={this.state.user}
//                                 chatData={this.state.chat}
//                                 sendMsg={this.handleSendMsg}
//                                 loginState={this.state.loginstate}
//                                 currentSidebar={this.state.currentSidebar}
//                                 changeSidebar={this.changeSidebar}
//                                 userPresence={this.state.userPresence}
//                                 waitlist={this.state.waitlist}
//                                 staff={this.state.staff}
//                                 chatlock={this.state.chatlock}
//                               /> */}
//                     <Sidebar/>
//                 </div>
//                 {/* End Container */}
//             </div>
//         );
//     }
// }
//
// export default observer(__Main);
// */