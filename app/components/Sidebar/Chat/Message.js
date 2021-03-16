import React from "react";
import {emojify} from "react-emojione";
import imageWhitelist from "libs/imageWhitelist";
import VisibilitySensor from "react-visibility-sensor";
import ReactMarkdown from "react-markdown";

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

const emojifyOptions = {
  style: {
    backgroundImage:
      "url('https://raw.githubusercontent.com/pladaria/react-emojione/master/assets/sprites/emojione-3.1.2-64x64.png')",
    height: 24,
    margin: 1
  }
};

//backgroundImage: "url(https://cdnjs.cloudflare.com/ajax/libs/emojione/2.2.7/assets/sprites/emojione.sprites.png)"
const imageCheck = tkn => tkn.match(imgregex) && imageWhitelist(tkn);

export default class Message extends React.Component {
  constructor() {
    super();
    this.state = {visible: true};
  }

  componentDidMount() {
    const text = this.props.text;
    let tokens = text.split(" ");
    if (!tokens.some(imageCheck)) this.props.onLoad();
  }

  onVisibility = isVisible => this.setState({visible: isVisible});

  render() {
    let text = this.props.text;
    if (!text) text = "";
    if (text.substring(0, 12) === "==markdown==" || this.props.userName == "BlazeBot") {
      if (text.substring(0, 12) === "==markdown==") text = text.substring(12);
      return (
        <ReactMarkdown
          source={emojifyWrap(text)}
          escapeHtml={false}
          linkTarget="_blank"
          rel="noopener noreferrer"
        />
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
        <VisibilitySensor onChange={this.onVisibility} />
      </div>
    );
  }
}

class MessageItem extends React.Component {
  componentDidMount() {
    if (!imageCheck(this.props.token)) this.props.onLoad();
  }

  render() {
    var {token, show, onLoad} = this.props;
    let thisClass;
    let bolded;
    let titletext;

    if (imageCheck(token)) {
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
      if (!link.slice(0, 4) === "http") {
        link = `//${link}`;
      }
      return (
        <span>
          <a href={link} target="_blank" rel="noopener noreferrer">
            {token}{" "}
          </a>
        </span>
      );
    } else if (specialemoji[token]) {
      thisClass = this.props.emojiSize + " " + specialemoji[token];
      titletext = token;
    } else if ((bolded = token.match(/^\*\*(\w+)\*\*$/))) {
      thisClass = "chat-bold";
      token = bolded[1];
    }
    return (
      <span
        className={this.props.isEmote ? "chat-italic" : thisClass}
        show={show}
        title={titletext}
      >
        {emojify(token, emojifyOptions)}{" "}
      </span>
    );
  }
}

function emojifyWrap(text) {
  var newtext = text.replace(/:(\w+):/g, function(match, p1) {
    if (specialemoji[match]) {
      return `<span class="emoji ${specialemoji[match]}" title="${match}"></span>`;
    } else {
      return `<span class="emoji e1a-${p1}" title="${match}"></span>`;
    }
  });
  return newtext;
}
