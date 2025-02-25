import PropTypes from 'prop-types';
import React from 'react';

function radToDeg(rad: number) {
    return rad * (180 / Math.PI);
}

function getCenter(element: HTMLElement) {
    var rect = element.getBoundingClientRect();
    return [
        rect.left + (rect.width / 2),
        rect.top + (rect.height / 2),
    ];
}

function angle(vector: number[], element: HTMLElement) {
    var center = getCenter(element);
    var x = vector[0] - center[0];
    var y = vector[1] - center[1];
    var deg = radToDeg(Math.atan2(x, y));
    deg -= 90;
    if (deg < 0) deg += 360;
    return deg;
}

var $all = document.body;

interface Props {
    defaultValue: number;
    max: number;
    min: number;
    step: number;
    onChange: (value: number) => void;
    onInput: (value: number) => void;
    className: string;
    pivotClassName: string;
    tabIndex: number;
    children: React.ReactNode;
}

class AngleInput extends React.Component {
    static displayName = 'AngleInput';
    
    static propTypes = {
        defaultValue: PropTypes.number,
        max: PropTypes.number,
        min: PropTypes.number,
        step: PropTypes.number,
        onChange: PropTypes.func,
        onInput: PropTypes.func,
        className: PropTypes.string,
        pivotClassName: PropTypes.string,
    };

    static defaultProps = {
        defaultValue: 0,
        max: 360,
        min: 0,
        step: 1,
        className: 'angle-input',
        pivotClassName: 'angle-input-pivot',
    };

    props: Props;
    myRef: React.RefObject<HTMLDivElement | null>;
    state: { value: number };
    tracking: boolean = false;
    keyboardInput: boolean = false;

    constructor(props: Props) {
        super(props);
        this.props = props;
        this.myRef = React.createRef();
        this.state = { value: props.defaultValue || 0 };
        
        // Bind methods
        this._onBlur = this._onBlur.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
    }

    normalize(degree: number) {
        const { max, min, step } = this.props;
        
        const n = Math.max(min, Math.min(degree, max));
        // const s = n - (n % step);
        const high = Math.ceil(n / step);
        const low = Math.round(n / step);
        return high >= (n / step)
            ? (high * step === 360) ? 0 : (high * step)
            : low * step;
    }

    _onFocus(_e: React.FocusEvent) {
        this.beginKeyboardInput();
    }

    _onBlur(_e: React.FocusEvent) {
        this.endKeyboardInput();
    }

    _onKeyDown(e: React.KeyboardEvent) {
        const { max, min, step } = this.props;
        const { value } = this.state;

        const LEFT_ARROW = 37;
        const UP_ARROW = 38;
        const RIGHT_ARROW = 39;
        const DOWN_ARROW = 40;

        let dir = 0;
        switch (e.keyCode) {
            case UP_ARROW:
            case RIGHT_ARROW:
                dir = 1;
                break;
            case DOWN_ARROW:
            case LEFT_ARROW:
                dir = -1;
                break;
        }
        
        let val = value + (dir * step);
        if (val === max + 1) val = min;
        if (val === min - 1) val = max - 1;
        val = this.normalize(val);
        
        if (dir) {
            e.preventDefault();
            this.setState({ value: val });
            if (this.props.onChange) {
                this.props.onChange(val);
            }
        }
    }

    _onMouseDown(_e: React.MouseEvent) {
        this.beginTracking();
    }

    _onMouseMove(e: React.MouseEvent) {
        this.updateWithEvent(e, false);
    }

    _onMouseUp(e: React.MouseEvent) {
        this.updateWithEvent(e, true);
        this.endTracking();
    }

    beginTracking() {
        $all.addEventListener('mousemove', this._onMouseMove as unknown as EventListener, false);
        $all.addEventListener('mouseup', this._onMouseUp as unknown as EventListener, false);
        this.tracking = true;
    }

    endTracking() {
        $all.removeEventListener('mousemove', this._onMouseMove as unknown as EventListener, false);
        $all.removeEventListener('mouseup', this._onMouseUp as unknown as EventListener, false);
        this.tracking = false;
    }

    updateWithEvent(event: React.MouseEvent, done: boolean) {
        const $dom = this.myRef.current;
        const vector = [event.clientX, event.clientY];
        var deg = 0;
        if ($dom) {
            deg = angle(vector, $dom);
            const value = this.normalize(deg);
            this.setState({ value });
            
            const fx = done ? this.props.onChange : this.props.onInput;
            if (fx) fx(value);
        }
        const value = this.normalize(deg);
        this.setState({ value });
        
        const fx = done ? this.props.onChange : this.props.onInput;
        if (fx) fx(value);
    }

    beginKeyboardInput() {
        $all.addEventListener('keydown', this._onKeyDown as unknown as EventListener, false);
        this.keyboardInput = true;
    }

    endKeyboardInput() {
        $all.removeEventListener('keydown', this._onKeyDown as unknown as EventListener, false);
        this.keyboardInput = false;
    }

    render() {
        const { className, pivotClassName, tabIndex, children } = this.props;
        const { value } = this.state;

        return (
            <div
                ref={this.myRef}
                className={className}
                onFocus={this._onFocus}
                onBlur={this._onBlur}
                onMouseDown={this._onMouseDown}
                tabIndex={tabIndex || 0}>
                <span
                    key="pivot"
                    className={pivotClassName}
                    style={{ transform: `rotate(-${value}deg)` }}>
                    {children || []}
                </span>
            </div>
        );
    }
}

export default AngleInput;