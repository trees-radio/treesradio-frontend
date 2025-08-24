import React from "react";
import imageWhitelist from "../../../libs/imageWhitelist";
import { processImageUrl } from "../../../libs/imageProxy";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";
import Emoji from "react-emoji-render";

const expression = /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
const regex = new RegExp(expression);

// regex for detecting an inline image.
const imgexpr = /(https?:)?\/\/?[^'"<>]+?\.(jpg|jpeg|gif|png)/i;
const imgregex = new RegExp(imgexpr);

// regex for detecting our embedded image format
const embeddedImageRegex = /\[img:([^\]]+)\]/;

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
        
        // Count the number of images in the message (both regular and embedded)
        const tokens = props.text.split(" ");
        const regularImageCount = tokens.filter(this.imageCheck).length;
        const embeddedImageCount = tokens.filter(this.embeddedImageCheck).length;
        const totalImageCount = regularImageCount + embeddedImageCount;
        
        this.state = { 
            visible: true, 
            imagesLoaded: totalImageCount === 0,
            imageCount: totalImageCount,
            loadedImages: 0
        };
        
        this.handleImageLoad = this.handleImageLoad.bind(this);
    }

    // Check for regular image URLs
    imageCheck(tkn: string): boolean {
        return !!tkn.match(imgregex) && imageWhitelist(tkn);
    }
    
    // Check for our embedded image format: [img:url]
    embeddedImageCheck(tkn: string) {
        return embeddedImageRegex.test(tkn);
    }
    
    // Extract URL from embedded image format
    extractImageUrl(tkn: string) {
        const match = tkn.match(embeddedImageRegex);
        return match ? match[1] : null;
    }
    
    hasLargeContent(text: string): boolean {
        return text.includes("img") || 
               text.includes("tenorgif") || 
               text.includes("previewvideo") || 
               text.includes("previewavatar") ||
               embeddedImageRegex.test(text);
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
            
            // For BlazeBot, add referrer protection to all img tags
            if (isBlazeBot) {
                // Configure DOMPurify to add referrer policy to images
                DOMPurify.addHook('afterSanitizeAttributes', function (node) {
                    if (node.tagName === 'IMG') {
                        node.setAttribute('referrerpolicy', 'origin');
                        node.setAttribute('crossorigin', 'anonymous');
                        // Process the src URL if needed
                        const src = node.getAttribute('src');
                        if (src) {
                            node.setAttribute('src', processImageUrl(src));
                        }
                    }
                });
            }
            
            const sanitizedContent = DOMPurify.sanitize(text);
            
            // Clean up the hook after use
            if (isBlazeBot) {
                DOMPurify.removeAllHooks();
            }
            
            return (
                <ReactMarkdown
                    rehypePlugins={isBlazeBot ? [rehypeRaw] : []}
                    remarkRehypeOptions={{ allowDangerousHtml: isBlazeBot, }}
                >
                    {emojifyWrap(sanitizedContent)}
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
                embeddedImageCheck={this.embeddedImageCheck}
                extractImageUrl={this.extractImageUrl}
                imageCheck={this.imageCheck}
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
    embeddedImageCheck: (tkn: string) => boolean;
    extractImageUrl: (tkn: string) => string | null;
    imageCheck: (tkn: string) => boolean;
}

class MessageItem extends React.Component {
    props: MessageItemProps;

    constructor(props: MessageItemProps) {
        super(props);
        this.props = props;
    }

    componentDidMount() {
        if (!this.props.imageCheck(this.props.token) && !this.props.embeddedImageCheck(this.props.token)) {
            // If not an image, signal load is complete
            this.props.onLoad();
        }
        // Image loading will be handled by the onLoad event in the render
    }

    render() {
        var { token, show, onLoad, embeddedImageCheck, extractImageUrl, imageCheck } = this.props;
        let thisClass;
        let bolded;
        let titletext;

        // Handle embedded images [img:url]
        if (embeddedImageCheck(token)) {
            const imageUrl = extractImageUrl(token);
            if (imageUrl) {
                const processedUrl = processImageUrl(imageUrl);
                return (
                    <span className="chat-embedded-image">
                        <img 
                            src={processedUrl} 
                            onLoad={onLoad} 
                            className="chat-image-uploaded" 
                            loading="eager"
                            max-width="240px"
                            max-height="240px"
                            referrerPolicy="origin"
                            crossOrigin="anonymous"
                        />
                    </span>
                );
            }
        }
        // Handle regular image URLs
        else if (imageCheck(token)) {
            let style = {};
            token = token.replace("http:", "https:");
            const processedUrl = processImageUrl(token);

            return (
                <span>
                    <img 
                        src={processedUrl} 
                        onLoad={onLoad} 
                        style={style} 
                        className="inline-image" 
                        loading="eager"
                        referrerPolicy="origin"
                        crossOrigin="anonymous"
                    />
                </span>
            );
        } 
        // Handle URLs
        else if (token.match(regex) && !token.match(/href/i)) {
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
        } 
        // Handle special emoji
        else if (specialemoji[token as keyof typeof specialemoji]) {
            thisClass = this.props.emojiSize + " " + specialemoji[token as keyof typeof specialemoji];
            titletext = token;
        } 
        // Handle bold text
        else if ((bolded = token.match(/^\*\*(\w+)\*\*$/))) {
            thisClass = "chat-bold";
            token = bolded[1];
        }
        
        // Handle regular text/emoji
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