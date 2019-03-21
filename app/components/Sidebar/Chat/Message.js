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

const specialemoji = {
    ':weed:': 'emoji emoji-weed',
    ':marijuana:': 'emoji emoji-weed',
    ':canabis:': 'emoji emoji-weed',
    ':toke:': 'emoji emoji-toke',
    ':smoke:': 'emoji emoji-toke',
    ':hit:': 'emoji emoji-toke'
};

const emojifyOptions = {
    style: {
        backgroundImage: "url('https://raw.githubusercontent.com/pladaria/react-emojione/master/assets/sprites/emojione-3.1.2-64x64.png')",
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
                if (text.substring(0, 12) === '==markdown==' || this.props.userName == 'BlazeBot' ) {
			if ( text.substring(0, 12) === '==markdown==' ) text = text.substring(12);
                    return <ReactMarkdown source={ emojifyWrap(text, emojifyOptions) } escapeHtml={false} linkTarget="_blank"/>;
		}

                        let tokens = text.split(" ");
                        const result = tokens.map((tkn, i) => ( <MessageItem key={ i } token={ tkn } isEmote={ this.props.isEmote } show={ this.state.visible } onLoad={ this.props.onLoad }/>
                        ));

                        return ( <div>{ result }<VisibilitySensor onChange={ this.onVisibility }/></div>
                        );
                    }
                }

                class MessageItem extends React.Component {
                    componentDidMount() {
                        if (!imageCheck(this.props.token)) this.props.onLoad();
                    }

                    render() {
                        var { token, show, onLoad } = this.props;
                        let emclass = false;
                        let thisClass;
                        if (imageCheck(token)) {
                            let style = {};
			    token.replace('http:', 'https:');

                            return ( <span><img src={ token } onLoad={ onLoad } style={ style } className="inline-image"/></span>);
                            // OR is this a plain URL?
                        } else if (token.match(regex) && !token.match(/href/i)) {
                            let link = token;
                            if (!link.slice(0, 4) === "http") {
                                link = `//${link}`;
                            }
                            return <span><a href={ link } target="_blank">{ token } </a></span>;
                        } else if (specialemoji[token]) {
                            thisClass = specialemoji[token];
                        } else if ( token.match(/^\*\*\w+\*\*$/) ) {
                            thisClass = "chat-bold";
			    token = token.substr(2, -2);
                        }
                        return <span className={ this.props.isEmote ? 'chat-italic' : thisClass }>{ emojify(token, emojifyOptions) } </span>;
                    }
                }


		function emojifyWrap(text, emojOpts) {
			var newtext = text.replace(/:(\w+):/g, function (match, p1, offset, string) {
				if ( specialemoji[match] ) {
					return `<span class="emoji emoji-${p1}"></span>`;
				} else {
					return `<span class="emoji e1a-${p1}"></span>`;
				}
			});
			return newtext;
		}
