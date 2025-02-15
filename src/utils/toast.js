import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastConfig = {
    position: "top-center",
    draggable: false,
    autoClose: 8000,
}

export default {
    show: (content, options) => toast(content, {
        ...toastConfig,
        ...options,
        type: "default",
    }),
    success: (content, options) => toast(content, {
        ...toastConfig,
        ...options,
        type: "success",
    }),
    error: (content, options) => toast(content, {
        ...toastConfig,
        ...options,
        type: "error",
    }),
    info: (content, options) => toast(content, {
        ...toastConfig,
        ...options,
        type: "info",
    }),
    warn: (content, options) => toast(content, {
        ...toastConfig,
        ...options,
        type: "warning",
    }),
}
