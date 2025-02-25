import {toast, ToastContent, ToastOptions, Id} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default (content: ToastContent, options: ToastOptions) : Id => toast(content, {
    ...options,
    position: "top-center",
    draggable: false,
    autoClose: 8000,
});
