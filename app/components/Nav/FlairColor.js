import React from "react";
import { getFlairColors, setFlairColors } from "../../libs/flair";
import profile from "../../stores/profile";
import { debounce } from "lodash";
import AngleInput from "../utility/AngleInput";

const GREY = ['#808080'];
const BLACK = ['#000000'];

export default class FlairColor extends React.Component {

    constructor(props) {
        super(props);
        this.state = { colors: ['#808080'], backgroundColor: BLACK, backgroundOpacity: 0, angle: 0, backgroundColorInput: BLACK, backgroundOpacityInput: 0 };
        this.saveFlairColors = this.saveFlairColors.bind(this);
        this.resetFlairColors = this.resetFlairColors.bind(this);
        this.changeBackgroundOpacityDebounced = this.changeBackgroundOpacityDebounced.bind(this);
    }

    async componentDidMount() {
        let flairColors = await getFlairColors(profile.uid);

        if (flairColors) {
            this.setState({ ...flairColors, backgroundColorInput: flairColors.backgroundColor ?? BLACK, backgroundOpacityInput: flairColors.backgroundOpacity ?? 0 });
        }
    }

    setColorDebounced(color, index) {
        if (!this.debounceColorInput) {
            this.debounceColorInput = debounce((color, index) => this.setColor(color, index), 100);
        }

        this.debounceColorInput(color, index);
    }

    setColor(color, index) {
        this.setState(state => {
            let newColors = [...state.colors];
            newColors[index] = color;
            return { colors: newColors };
        });
    }

    getFlairColors() {
        if (!this.state || !this.state.colors || this.state.colors.length === 0) {
            return {};
        }

        if (this.state.colors.length === 1) {
            return { color: this.state.colors[0] };
        }

        return {
            'background': `-webkit-linear-gradient(${this.state.angle ?? 0}deg, ${this.state.colors.join(',')})`
        };
    }

    getFlairBackgroundColor() {
        if (!this.state || !this.state.backgroundColor || this.state.backgroundColor.length === 0) {
            return {};
        }

        let opacity = Math.floor(this.state.backgroundOpacity * 255 / 100);
        return {
            'background': this.state.backgroundColor[0] + opacity.toString(16).padStart(2, '0')
        };
    }

    removeColor(index) {
        this.setState(state => {
            let newColors = [...state.colors];
            newColors.splice(index, 1);
            return { colors: newColors };
        });
    }

    addColor(index) {
        this.setState(state => {
            let newColors = [...state.colors];
            newColors.splice(index, 0, newColors[index]);
            return { colors: newColors };
        });
    }

    saveFlairColors() {
        if (this.state.colors) {
            setFlairColors(profile.uid, {
                colors: this.state.colors
                , angle: this.state.angle
                , backgroundColor: this.state.backgroundColor
                , backgroundOpacity: this.state.backgroundOpacity
            });
        }

        this.props.close();
    }

    resetFlairColors() {
        // setFlairColors(profile.uid, { colors: GREY });
        this.setState({ colors: GREY, angle: 0, backgroundOpacity: 0, backgroundColor: BLACK, backgroundColorInput: BLACK, backgroundOpacityInput: 0 });
    }

    angleChange(newAngle) {
        this.setState({ angle: newAngle });
    }

    changeBackgroundOpacityDebounced(event) {
        let opacity = event.target.value;

        this.setState({ backgroundOpacityInput: opacity });

        if (!this.debounceBackgroundOpacitySlider) {
            this.debounceBackgroundOpacitySlider = debounce(() => this.changeBackgroundOpacity(), 100);
        }

        this.debounceBackgroundOpacitySlider();
    }

    changeBackgroundOpacity() {
        let opacity = this.state.backgroundOpacityInput;
        this.setState({ backgroundOpacity: opacity });
    }

    setBackgroundColorDebounced(color) {
        this.setState({ backgroundColorInput: [color] });

        if (!this.debounceBackgroundColor) {
            this.debounceBackgroundColor = debounce(() => this.changeBackgroundColor(), 100);
        }

        this.debounceBackgroundColor();
    }

    changeBackgroundColor() {
        let color = this.state.backgroundColorInput;
        this.setState({ backgroundColor: color });
    }

    render() {

        return (
            <>
                <div className="flair-color">
                    <p>Pick your flair colors!</p>
                    <p className="preview">
                        <span style={this.getFlairBackgroundColor()}><span key={this.state.colors} style={this.getFlairColors()} className={this.state.colors && this.state.colors.length > 1 && "gradient-text"}>This is a preview of your flair colors!</span></span>
                        {this.state.colors && this.state.colors.length > 1 && <div className="angle"><AngleInput defaultValue={this.state.angle} max="360" min="0" step="45"
                            onChange={newAngle => this.angleChange(newAngle)} onInput={newAngle => this.angleChange(newAngle)} /></div>}
                    </p>
                    {this.state.colors.map((color, idx) => (
                        <div key={idx} className="color">
                            <label htmlFor={idx}>Color {idx + 1}</label>
                            <input name={idx} type="color" value={color} onChange={e => this.setColorDebounced(e.target.value, idx)} className="html5colorpicker" />
                            <button><i
                                onClick={() => this.addColor(idx)}
                                className="fa fa-2x fa-plus"
                            /></button>
                            {this.state.colors && this.state.colors.length > 1 && <button><i
                                onClick={() => this.removeColor(idx)}
                                className="fa fa-2x fa-minus"
                            /></button>}
                        </div>
                    ))}
                    <div className="color">
                        <label htmlFor="backgroundColor">Background color</label>
                        <input name="backgroundColor" type="color" value={this.state.backgroundColorInput[0]} onChange={e => this.setBackgroundColorDebounced(e.target.value)} className="html5colorpicker" />

                    </div>
                    <div>
                        <span>Background opacity:</span>
                        <span className="slidecontainer">
                            <input type="range" min="0" max="100" className="slider" id="opacityRange" value={this.state.backgroundOpacityInput}
                                onChange={this.changeBackgroundOpacityDebounced} />
                        </span>
                    </div>

                </div>
                <div className="buttons">
                    <button className="btn btn-primary" onClick={this.saveFlairColors}>
                        Save flair colors
                    </button>
                    <button className="btn btn-primary" onClick={this.resetFlairColors}>
                        Reset
                    </button>
                </div>
            </>
        );
    }
}
