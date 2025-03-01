import React from "react";
import imageWhitelist from "../../../libs/imageWhitelist";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";
import Emoji from "react-emoji-render";

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
    state: { visible: boolean; imagesLoaded: boolean; imageCount: number; loadedImages: number };
    
    constructor(props: MessageProps) {
        super(props);
        this.props = props;
        
        // Count the number of images in the message
        const tokens = props.text.split(" ");
        const imageCount = tokens.filter(this.imageCheck).length;
        
        this.state = { 
            visible: true, 
            imagesLoaded: imageCount === 0,
            imageCount,
            loadedImages: 0
        };
        
        this.handleImageLoad = this.handleImageLoad.bind(this);
    }

    imageCheck(tkn: string) {
        return tkn.match(imgregex) && imageWhitelist(tkn);
    }
    
    hasLargeContent(text: string): boolean {
        return text.includes("img") || 
               text.includes("tenorgif") || 
               text.includes("previewvideo") || 
               text.includes("previewavatar");
    }
    
    handleImageLoad() {
        // Increment loaded images count
        this.setState(
            (prevState: any) => ({ 
                loadedImages: prevState.loadedImages + 1,
                imagesLoaded: prevState.loadedImages + 1 >= prevState.imageCount
            }),
            () => {
                // Call onLoad when all images are loaded
                if (this.state.imagesLoaded) {
                    // Add a small delay to ensure rendering is complete
                    setTimeout(() => {
                        this.props.onLoad();
                    }, 50);
                }
            }
        );
    }

    componentDidMount() {
        const text = this.props.text;
        const isBlazeBot = this.props.userName === "BlazeBot";
        const hasLargeContent = this.hasLargeContent(text);
        
        // If no images and not a bot with large content, call onLoad immediately
        if (this.state.imageCount === 0 && !(isBlazeBot && hasLargeContent)) {
            this.props.onLoad();
        }
        
        // For BlazeBot messages with large content, add an additional delayed onLoad
        if (isBlazeBot && hasLargeContent) {
            setTimeout(() => {
                this.props.onLoad();
            }, 300);
            
            // Add one more delayed load for very large content
            if (text.includes("tenorgif") || text.length > 500) {
                setTimeout(() => {
                    this.props.onLoad();
                }, 800);
            }
        }
    }

    onVisibility = (isVisible: boolean) => this.setState({ visible: isVisible });

    render() {
        let text = this.props.text;
        if (!text) text = "";

        const isBlazeBot = this.props.userName === "BlazeBot";

        if (text.substring(0, 12) === "==markdown==" || isBlazeBot) {
            if (text.substring(0, 12) === "==markdown==") text = text.substring(12);
            return (
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
        if (tokens.length === 1) emojisize = "emojilarge";

        const result = tokens.map((tkn, i) => (
            <MessageItem
                key={i}
                token={tkn}
                isEmote={this.props.isEmote}
                show={this.state.visible.toString()}
                onLoad={this.handleImageLoad}
                emojiSize={emojisize}
            />
        ));

        return (
            <div>
                {result}
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
        if (!this.imageCheck(this.props.token)) {
            // If not an image, signal load is complete
            this.props.onLoad();
        }
        // Image loading will be handled by the onLoad event in the render
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
                    <img 
                        src={token} 
                        onLoad={onLoad} 
                        style={style} 
                        className="inline-image" 
                        loading="eager" // Use eager loading for chat images
                    />
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
                style={show ? {} : { display: "none" }}
                title={titletext}
            >
                <Emoji>
                    {token}{" "}
                </Emoji>
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