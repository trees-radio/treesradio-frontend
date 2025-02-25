import React from "react";
import imageWhitelist from "../../../libs/imageWhitelist";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";

const expression = /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
const regex = new RegExp(expression);

// regex for detecting an inline image.
const imgexpr = /(https?:)?\/\/?[^'"<>]+?\.(jpg|jpeg|gif|png)/i;
const imgregex = new RegExp(imgexpr);

const specialemoji = {
    ":weed:": "emoji-weed",
    ":marijuana:": "emoji-weed",
    ":canabis:": "emoji-weed",
    ":toke:": "emoji-toke",
    ":smoke:": "emoji-toke",
    ":hit:": "emoji-toke",
    ":plug:": "emoji-plug",
    ":joint:": "emoji-joint",
    ":j:": "emoji-joint",
    ":ferris:": "emoji-ferris",
    ":1:": "emoji-one",
    ":2:": "emoji-two",
    ":3:": "emoji-three",
    ":4:": "emoji-four",
    ":5:": "emoji-five",
    ":6:": "emoji-six",
    ":7:": "emoji-seven",
    ":8:": "emoji-eight",
    ":9:": "emoji-nine",
    ":10:": "emoji-ten",
    ":highaf:": "emoji-highaf",
    ":owo:": "emoji-owo",
    ":rolling:": "emoji-rolling",
    ":dude:": "emoji-dude",
    ":bong:": "emoji-bong",
    ":neat:": "emoji-neat",
    ":420:": "emoji-420",
    ":rasta:": "emoji-rasta"
};

interface MessageProps {
    text: string;
    userName: string;
    isEmote: boolean;
    onLoad: () => void;
}

export default class Message extends React.Component {
    props: MessageProps;
    state: { visible: boolean };
    constructor(props: MessageProps) {
        super(props);
        this.props = props;
        this.state = { visible: true };
    }

    imageCheck(tkn: string) {
        return tkn.match(imgregex) && imageWhitelist(tkn);
    }


    componentDidMount() {
        const text = this.props.text;
        let tokens = text.split(" ");
        if (!tokens.some(this.imageCheck)) this.props.onLoad();
    }

    onVisibility = (isVisible: boolean) => this.setState({ visible: isVisible });

    render() {
        let text = this.props.text;
        if (!text) text = "";

        const isBlazeBot = this.props.userName === "BlazeBot";

        if (text.substring(0, 12) === "==markdown==" || isBlazeBot) {
            if (text.substring(0, 12) === "==markdown==") text = text.substring(12);
            return (
                // <div dangerouslySetInnerHTML={{__html: emojifyWrap(marked(text))}} />
                <ReactMarkdown
                    rehypePlugins={isBlazeBot ? [rehypeRaw] : []}
                    remarkRehypeOptions={{ allowDangerousHtml: isBlazeBot, }}
                >
                    {emojifyWrap(DOMPurify.sanitize(text))}

                </ReactMarkdown>
            );
        }

        let tokens = text.split(" ");
        let emojisize = "emoji";
        if (tokens.length == 1) emojisize = "emojilarge";

        const result = tokens.map((tkn, i) => (
            <MessageItem
                key={i}
                token={tkn}
                isEmote={this.props.isEmote}
                show={this.state.visible.toString()}
                onLoad={this.props.onLoad}
                emojiSize={emojisize}
            />
        ));

        return (
            <div>
                {result}
                {/*<VisibilitySensor onChange={this.onVisibility} />*/}
            </div>
        );
    }
}

interface MessageItemProps {
    token: string;
    isEmote: boolean;
    show: string;
    onLoad: () => void;
    emojiSize: string;
}

class MessageItem extends React.Component {
    imageCheck(tkn: string) {
        return tkn.match(imgregex) && imageWhitelist(tkn);
    }

    componentDidMount() {
        if (!this.imageCheck(this.props.token)) this.props.onLoad();
    }

    props: MessageItemProps;

    constructor(props: MessageItemProps) {
        super(props);
        this.props = props;
    }

    render() {
        var { token, show, onLoad } = this.props;
        let thisClass;
        let bolded;
        let titletext;

        if (this.imageCheck(token)) {
            let style = {};
            token.replace("http:", "https:");

            return (
                <span>
                    <img src={token} onLoad={onLoad} style={style} className="inline-image" />
                </span>
            );
            // OR is this a plain URL?
        } else if (token.match(regex) && !token.match(/href/i)) {
            let link = token;
            if (link.slice(0, 4) !== "http") {
                link = `//${link}`;
            }
            return (
                <span>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        {token}{" "}
                    </a>
                </span>
            );
        } else if (specialemoji[token as keyof typeof specialemoji]) {
            thisClass = this.props.emojiSize + " " + specialemoji[token as keyof typeof specialemoji];
            titletext = token;
        } else if ((bolded = token.match(/^\*\*(\w+)\*\*$/))) {

            thisClass = "chat-bold";
            token = bolded[1];
        }
        return (
            <span
                className={this.props.isEmote ? "chat-italic" : thisClass}
                style={show ? { display: "inline" } : { display: "none" }}
                title={titletext}
            >
                {token}{" "}
            </span>
        );
    }
}


function emojifyWrap(text: string) {
    var newtext = text.replace(/:(\w+):/g, function (match, p1) {
        if (specialemoji[match as keyof typeof specialemoji]) {
            return `<span class="emoji ${specialemoji[match as keyof typeof specialemoji]}" title="${match}"></span>`;
        } else {
            return `<span class="emoji e1a-${p1}" title="${match}"></span>`;
        }
    });
    return newtext;
}
