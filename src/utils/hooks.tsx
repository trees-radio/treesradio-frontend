import {RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";

export const useUpdateEffect = (callback: VoidFunction, dependencies: unknown[]) =>{
    const firstRenderRef = useRef(true)

    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false
            return;
        }
        return callback();
    }, dependencies)
}

export const useOnClickOutside = <T extends HTMLElement>(ref: RefObject<T | null>, callback: VoidFunction) => {
    const [listening, setListening] = useState(false);
    const cb = useCallback(callback, [callback]);

    useLayoutEffect(() => {
        if (listening || !ref.current) {
            return;
        }

        setListening(true);
        ([`click`, `touchstart`] as const).forEach((type: "click" | "touchstart") =>
            document.addEventListener(type, (evt) => {
                return ref.current && !ref.current.contains(evt.target as Node) && cb();
            }));

    }, [listening, ref]);
}
