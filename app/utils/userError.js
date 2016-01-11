
import sweetAlert from 'sweetalert';

export default function emitUserError(title, text) {
  sweetAlert({
    "title": title,
    "text": text,
    "type": "error",
    "timer": 3000
  });
}
