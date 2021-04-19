import toast from "utils/toast";
import audioNotify from "libs/audioNotify";
import profile from "../stores/profile";
import favicon from "../img/favicon.png"
import tokeEvent from "../libs/tokeEvent";

export default function mention(everyone, username, toke) {

    if (profile.username !== username) {

        setTimeout(() => {
            let notificationMessage = toke ? 'Toke!' : 'You were mentioned by ' + username + '.';
            if (toke) {
                tokeEvent.tokeNow();
            }
            if (profile.desktopNotifications) {
                let options = {
                    icon: favicon,
                    badge: favicon,
                    body: notificationMessage,
                    renotify: true,
                    silent: true,
                }

                let n = new Notification("TreesRadio", options);
                n.onclick = () => document.getElementById("chatinput").focus();

            } else {
                toast.info(notificationMessage);
            }
        });
        if (profile.notifications) audioNotify.play();
    }

}
