import React from "react";
import { emojify } from "react-emojione";
import imageWhitelist from "libs/imageWhitelist";
import VisibilitySensor from "react-visibility-sensor";
import ReactMarkdown from 'react-markdown';

// regex for links (protocol not required): http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
const regex = new RegExp(expression);

// regex for detecting an inline image.
const imgexpr = /(https?:)?\/\/?[^'"<>]+?\.(jpg|jpeg|gif|png)/i;
const imgregex = new RegExp(imgexpr);

const emojifyOptions = {
    style: {
	    backgroundImage:"url('https://raw.githubusercontent.com/pladaria/react-emojione/master/assets/sprites/emojione-3.1.2-64x64.png')",
	    height: 24,
	    margin: 1
    }
};

        //backgroundImage: "url(https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.7/assets/sprites/emojione.sprites.png)"
const imageCheck = tkn => tkn.match(imgregex) && imageWhitelist(tkn);

export default class Message extends React.Component {
    constructor() {
        super();
        this.state = { visible: true };
    }

    componentDidMount() {
        const text = this.props.text;
        let tokens = text.split(" ");
        if (!tokens.some(imageCheck)) this.props.onLoad();
    }

    onVisibility = isVisible => this.setState({ visible: isVisible });

    render() {
        let text = this.props.text;
        if (!text)
            text = '';
        if (text.substring(0, 12) === '==markdown==')
            return <ReactMarkdown source = { text.substring(12) }
        />;

        let tokens = text.split(" ");
        const result = tokens.map((tkn, i) => ( < MessageItem key = { i }
            token = { tkn }
	    isEmote={ this.props.isEmote }
            show = { this.state.visible }
            onLoad = { this.props.onLoad }
            />
        ));

        return ( < div > { result } < VisibilitySensor onChange = { this.onVisibility }
            /></div >
        );
    }
}

class MessageItem extends React.Component {
    componentDidMount() {
        if (!imageCheck(this.props.token)) this.props.onLoad();
    }

    render() {
        const { token, show, onLoad } = this.props;
	let isWeed = false;
        if (imageCheck(token)) {
            let style = {};
            if (!show) {
                style.visibility = "hidden";
            }

            return ( < span >
                <
                img src = { token }
                onLoad = { onLoad }
                style = { style }
                className = "inline-image" / >
                <
                /span>
            );
            // OR is this a plain URL?
        } else if (token.match(regex) && !token.match(/href/i)) {
            let link = token;
            if (!link.slice(0, 4) === "http") {
                link = `//${link}`;
            }
            return <span > < a href = { link }
            target = "_blank" > { token } < /a> </span > ;
        } else if ( token == ':weed:' || token == ':cannabis:' || token == ":marijuana:" ) {
		isWeed = true;
	}
        return <span className={ this.props.isEmote ? 'chat-italic' : isWeed ? 'emoji-weed' : '' } > { emojify(token, emojifyOptions) } < /span>;
    }
}
