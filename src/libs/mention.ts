import toast from "../utils/toast";
import audioNotify from "./audioNotify";
import profile from "../stores/profile";
import favicon from "../assets/img/favicon.png"
import tokeEvent from "./tokeEvent";

export default function mention(_everyone: boolean, username: string, toke: boolean) {

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
                n.onclick = () => document.getElementById("chatinput")?.focus();

            } else {
                toast(notificationMessage, {type:"info"});
            }
        });
        if (profile.notifications) audioNotify.play();
    }

}
