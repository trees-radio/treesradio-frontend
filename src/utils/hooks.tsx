import {RefObject, useCallback, useEffect, useState} from "react";

export const useOnClickOutside = <T extends HTMLElement>(ref: RefObject<T | null>, callback: VoidFunction) => {
    const [listening, setListening] = useState(false);
    const cb = useCallback(callback, [callback]);

    useEffect(() => {
        if (listening || !ref.current) {
            return;
        }

        setListening(true);
        ([`click`, `touchstart`] as const).forEach((type: "click" | "touchstart") =>
            document.addEventListener(type, (evt) =>
                ref.current && !ref.current.contains(evt.target as Node) && cb()));

    }, [listening, ref]);
}