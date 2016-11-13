import toast from 'utils/toast';
import audioNotify from 'libs/audioNotify';

const BOUNCE = Date.now() + 3000; // milliseconds

export default function mention(everyone, username) {
  if (Date.now() > BOUNCE) {
    setTimeout(() => toast.info(`You were mentioned by ${username}.`));
    audioNotify.play();
  }
}
