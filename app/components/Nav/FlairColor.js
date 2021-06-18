import React from "react";
import { getFlairColors, setFlairColors } from "../../libs/flair";
import profile from "../../stores/profile";
import { debounce } from "lodash";
import { send } from "../../libs/events";



export default class FlairColor extends React.Component {

    constructor(props) {
        super(props);
        this.state = { colors: ['#808080'], backgroundColor: [] };
        this.saveFlairColors = this.saveFlairColors.bind(this);
    }

    async componentDidMount() {
        let flairColors = await getFlairColors(profile.uid);

        if (flairColors) {
            this.setState({ colors: flairColors.colors, backgroundColor: flairColors.backgroundColor });
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
            'background': `-webkit-linear-gradient(0deg, ${this.state.colors.join(',')})`,
            'WebkitTextFillColor': 'transparent',
            'WebkitBackgroundClip': 'text'
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
            setFlairColors(profile.uid, { colors: this.state.colors });
        }

        this.props.close();
    }

    render() {

        return (
            <>
                <div className="flair-color">
                    <p>Pick your flair colors!</p>
                    <p className="preview">
                        <span key={this.state.colors} style={this.getFlairColors()}>This is a preview of your flair colors!</span>
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


                </div>
                <div>
                    <button className="btn btn-primary" onClick={this.saveFlairColors}>
                        Save flair colors
                    </button>
                </div>
            </>
        );
    }
}
