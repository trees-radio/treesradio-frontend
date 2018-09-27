import toast from "utils/toast";
import audioNotify from "libs/audioNotify";
import profile from "../stores/profile";

let BOUNCE = Date.now() / 1000;

export default function mention(everyone, username) {
  BOUNCE = Date.now() / 1000;
  setTimeout(() => toast.info(`You were mentioned by ${username}.`));
  if (profile.notifications) audioNotify.play();
}
