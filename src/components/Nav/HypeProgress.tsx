import React, {type FC, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {action, runInAction} from "mobx";
import {hypeIntervalSeconds, hypetimer} from "../../stores/hype";
import profile from "../../stores/profile";
import toast from "../../utils/toast";
import cn from "classnames";
import $ from "cash-dom";

const doHype = action(
    "doHype", () => {
        (profile.user !== null && hypetimer.hypePercentageCharged === 100)
            ? hypetimer.getHyped()
            : toast.info("Log in to hype this song and boost it's likes!", {delay: 1300})
    }
)

const propertyUnitsStripped = (element: HTMLElement | null, property: string, unit: string) => {
    if (!element) {
        return 0;
    }
    const propertyValue = window.getComputedStyle(element).getPropertyValue(property)
    return Number.parseFloat(propertyValue.slice(0, propertyValue.indexOf(unit)));
};


const pxToRem =
    (px: number) => px / propertyUnitsStripped(document.querySelector(":root"), "font-size", "px");

//TODO explosive button is not working
const HypeProgress: FC = () => {
    const [explosiveButton, setExplosiveButton] = useState<ExplosiveButton | null>(null);

    useEffect(() => {
        if (profile.user !== null) {
            runInAction(() => {
                setExplosiveButton(new ExplosiveButton("#hypeboom"));
            });
        }

        // Cleanup on unmount or when profile.user changes
        return () => {
            if (explosiveButton) {
                runInAction(() => {
                    setExplosiveButton(null);
                });
            }
        };
    }, [profile.user]); // Only depend on profile.user, not explosiveButton


    return (
        <div
            className={cn(["hypepb", hypetimer.lasthype <= 0 && "hidden"])}
            onClick={doHype}
        >
            <div id="hypeboom" className="pt-3 mx-auto self-center h-12">
                {/* TODO style only works bc of mobx currently, replace with zustand store */}
                <div
                    className={cn(["hypeprogress", profile.user === null && "greyDisabled"])}
                    style={{width: hypetimer.hypePercentageCharged + "%"}}
                >
                    <div className="hypedone">
                        {hypetimer.hypePercentageCharged === 100
                            ? "Hype Ready!"
                            : convertHoursMinutesSeconds(
                                hypeIntervalSeconds - hypetimer.secondsfromhype
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const $HypeProgress = observer(HypeProgress);

export {$HypeProgress as HypeProgress};

function convertHoursMinutesSeconds(time: number) {
    const d = Number(time);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);
    return `${h}:${m.toString(10).padStart(2, "0")}:${s.toString(10).padStart(2, "0")}`;
}

/* #### Explosive hype button ####*/
/*Copyright (c) 2020 by Jon Kantner (https://codepen.io/jkantner/pen/oNjjEaJ)*/

/*
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

class ExplosiveButton {
    private readonly element?: HTMLElement;

    private width = 0;
    private height = 0;
    private centerX = 0;
    private centerY = 0;
    private pieceWidth = 0;
    private pieceHeight = 0;
    private piecesX = 9;
    private piecesY = 4;
    private duration = 5000;

    constructor(selector: string) {
        this.element = document.querySelector(selector) ?? undefined;

        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));

        this.element?.addEventListener(
            "click",
            (_) => this.element!.getAnimations().length ? hypetimer.getHyped() : this.explode.bind(this)(this.duration)
        );
    }

    updateDimensions() {
        if (!this.element) {
            return;
        }

        this.width = pxToRem(this.element.offsetWidth);
        this.height = pxToRem(this.element.offsetHeight);
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.pieceWidth = this.width / this.piecesX;
        this.pieceHeight = this.height / this.piecesY;
    }

    public async explode(duration: number = 5000) {
        if (!this.element) {
            return;
        }

        if (!profile.hypeBoom || hypetimer.hypePercentageCharged !== 100) {
            await hypetimer.getHyped();
            return;
        }

        const explodingState = "exploding";

        if (
            !this.element.classList.contains(explodingState) &&
            hypetimer.hypePercentageCharged === 100
        ) {
            this.element.classList.add(explodingState);

            hypetimer.getHyped().then(() => {
                const hypeDone = $(".hypedone");

                hypeDone.addClass("hidden");

                this.createParticles("fire", 35, duration);
                this.createParticles("debris", this.piecesX * this.piecesY, duration);
                window.setTimeout(() => {
                    hypeDone.removeClass("hidden");
                }, duration);
            });
        }
    }

    createParticles(kind: "fire" | "debris", count: number, duration: number) {
        if (!this.element) {
            return;
        }

        for (let c = 0; c < count; ++c) {
            const r = randomFloat(0.25, 0.5);
            const diam = r * 2;
            const xBound = this.centerX - r;
            const yBound = this.centerY - r;
            const easing = "cubic-bezier(0.15,0.5,0.5,0.85)";

            if (kind === "fire") {
                const x = this.centerX + randomFloat(-xBound, xBound);
                const y = this.centerY + randomFloat(-yBound, yBound);
                const a = calcAngle(this.centerX, this.centerY, x, y);
                const dist = randomFloat(1, 5);

                new FireParticle(
                    this.element,
                    x,
                    y,
                    diam,
                    diam,
                    a,
                    dist,
                    duration,
                    easing
                );
            } else if (kind === "debris") {
                const x = this.pieceWidth / 2 + this.pieceWidth * (c % this.piecesX);
                const y =
                    this.pieceHeight / 2 +
                    this.pieceHeight * Math.floor(c / this.piecesX);
                const a = calcAngle(this.centerX, this.centerY, x, y);
                const dist = randomFloat(4, 7);

                new DebrisParticle(
                    this.element,
                    x,
                    y,
                    this.pieceWidth,
                    this.pieceHeight,
                    a,
                    dist,
                    duration,
                    easing
                );
            }
        }
    }
}

type Coords = { x: number; y: number };

class Particle {
    protected readonly element: HTMLSpanElement;
    protected s: Coords;
    protected d: Coords;

    constructor(parent: HTMLElement, x: number, y: number, w: number, h: number, angle: number, distance = 1, className2 = "") {
        const width = `${w}em`;
        const height = `${h}em`;
        const adjustedAngle = angle + Math.PI / 2;

        this.element = document.createElement("span");
        this.element.className = "particle";

        if (className2) this.element.classList.add(className2);

        this.element.style.width = width;
        this.element.style.height = height;

        parent.appendChild(this.element);

        this.s = {
            x: x - w / 2,
            y: y - h / 2,
        };
        this.d = {
            x: this.s.x + Math.sin(adjustedAngle) * distance,
            y: this.s.y - Math.cos(adjustedAngle) * distance,
        };
    }

    runSequence(
        el: HTMLElement,
        keyframes: Keyframe[],
        duration = 1e3,
        easing = "linear",
        delay = 0
    ) {
        el.animate(keyframes, {
            duration: duration,
            easing: easing,
            delay: delay,
        }).onfinish = () => {
            if (!el.parentElement) {
                return;
            }
            const parentCL = el.parentElement.classList;

            el.remove();

            if (!document.querySelector(".particle")) {
                parentCL.remove(...parentCL);
            }
        };
    }
}

class DebrisParticle extends Particle {
    constructor(parent: HTMLElement, x: number, y: number, w: number, h: number, angle: number, distance: number, duration: number, easing: string) {
        super(parent, x, y, w, h, angle, distance, "particle--debris");

        const maxAngle = 1080;
        const rotX = randomInt(0, maxAngle);
        const rotY = randomInt(0, maxAngle);
        const rotZ = randomInt(0, maxAngle);

        this.runSequence(
            this.element,
            [
                {
                    opacity: 1,
                    transform: `translate(${this.s.x}em,${this.s.y}em) rotateX(0) rotateY(0) rotateZ(0)`,
                },
                {
                    opacity: 1,
                },
                {
                    opacity: 1,
                },
                {
                    opacity: 1,
                },
                {
                    opacity: 0,
                    transform: `translate(${this.d.x}em,${this.d.y}em) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
                },
            ],
            randomInt(duration / 2, duration),
            easing
        );
    }
}

class FireParticle extends Particle {
    constructor(parent: HTMLElement, x: number, y: number, w: number, h: number, angle: number, distance: number, duration: number, easing: string) {
        super(parent, x, y, w, h, angle, distance, "particle--fire");

        const sx = this.s.x;
        const sy = this.s.y;
        const dx = this.d.x;
        const dy = this.d.y;

        this.runSequence(
            this.element,
            [
                {
                    background: "hsl(60,100%,100%)",
                    transform: `translate(${sx}em,${sy}em) scale(1)`,
                },
                {
                    background: "hsl(60,100%,80%)",
                    transform: `translate(${sx + (dx - sx) * 0.25}em,${sy + (dy - sy) * 0.25
                    }em) scale(4)`,
                },
                {
                    background: "hsl(40,100%,60%)",
                    transform: `translate(${sx + (dx - sx) * 0.5}em,${sy + (dy - sy) * 0.5
                    }em) scale(7)`,
                },
                {
                    background: "hsl(20,100%,40%)",
                },
                {
                    background: "hsl(0,0%,20%)",
                    transform: `translate(${dx}em,${dy}em) scale(0)`,
                },
            ],
            randomInt(duration / 2, duration),
            easing
        );
    }
}

function calcAngle(x1: number, y1: number, x2: number, y2: number) {
    const opposite = y2 - y1;
    const adjacent = x2 - x1;
    let angle = Math.atan(opposite / adjacent);

    if (adjacent < 0) {
        angle += Math.PI;
    }

    if (isNaN(angle)) {
        angle = 0;
    }

    return angle;
}

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
    return Math.round(Math.random() * (max - min)) + min;
}

/*
class HypeProgress_ extends React.Component {
    getHyped = () => {
        if (profile.user !== null) {
            if (hypetimer.hypePercentageCharged === 100) hypetimer.getHyped();
        } else {
            toast.info("Log in to hype this song and boost it's likes!", {
                delay: 1300,
            });
        }
    };

    @observable accessor explosiveButton;

    componentDidUpdate() {
        this.componentDidMount();
    }

    componentDidMount() {
        if (profile.user !== null && this.explosiveButton === null) {
            this.explosiveButton = new ExplosiveButton("#hypeboom");
        } else {
            this.explosiveButton = null;
        }
    }

    disableIfNecessary() {
        return profile.user !== null ? "" : " greyDisabled";
    }

    render() {
        return (
            <div
                className={"hypepb"}
                onClick={this.getHyped}
                style={{visibility: hypetimer.lasthype > 0}}
            >
                <div id="hypeboom">
                    <div
                        className={"hypeprogress" + this.disableIfNecessary()}
                        style={{width: hypetimer.hypePercentageCharged + "%"}}
                    >
                        <a
                            className="hypedone"
                            text={
                                "Hype Recharging: " +
                                convertHoursMinutesSeconds(hypeIntervalSeconds - hypetimer.secondsfromhype)
                            }
                        >
                            {hypetimer.hypePercentageCharged === 100
                                ? "Hype Ready!"
                                : convertHoursMinutesSeconds(
                                    hypeIntervalSeconds - hypetimer.secondsfromhype
                                )}
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
*/
// export default observer(HypeProgress_);