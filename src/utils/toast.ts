import {toast, ToastContent, ToastOptions, Id, Flip} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default (content: ToastContent, options: ToastOptions) : Id => toast(content, {
    ...options,
    position: "top-right",
    draggable: false,
    autoClose: 8000,
    theme: "dark",
    transition: Flip,
    closeOnClick: true,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    style: {
        zIndex: 9999
    }
});
