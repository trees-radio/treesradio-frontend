import toast from "utils/toast";
import audioNotify from "libs/audioNotify";
import profile from "../stores/profile";
import favicon from "../img/favicon.png"

export default function mention(everyone, username) {

    if (profile.username !== username) {


        setTimeout(() => {
            if (profile.desktopNotifications) {
                let options = {
                    icon: favicon,
                    badge: favicon,
                    body: 'You were mentioned by ' + username + '.',
                    renotify: true,
                    silent: true,
                }

                let n = new Notification("TreesRadio", options);
                n.onclick = () => document.getElementById("chatinput").focus();

            } else {
                toast.info(`You were mentioned by ${username}.`);
            }
        });
        if (profile.notifications) audioNotify.play();
    }
}
