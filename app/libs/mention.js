import toast from "utils/toast";
import audioNotify from "libs/audioNotify";
import profile from "../stores/profile";

export default function mention(everyone, username) {
  setTimeout(() => toast.info(`You were mentioned by ${username}.`));
  if (profile.notifications) audioNotify.play();
}
