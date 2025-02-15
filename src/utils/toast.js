import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default (content, options) => toast(content, {
    ...options,
    position: "top-center",
    draggable: false,
    autoClose: 8000,
});
