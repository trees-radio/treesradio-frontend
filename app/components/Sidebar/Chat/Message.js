import React from 'react';
import {emojify} from 'react-emojione';
import imageWhitelist from 'libs/imageWhitelist';
import VisibilitySensor from 'react-visibility-sensor';

// regex for links (protocol not required): http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
const regex = new RegExp(expression);

// regex for detecting an inline image.
const imgexpr = /(https?:)?\/\/?[^'"<>]+?\.(jpg|jpeg|gif|png)/i;
const imgregex = new RegExp(imgexpr);


const emojifyOptions = {
  styles: {
    backgroundImage: 'url(https://cdnjs.cloudflare.com/ajax/libs/emojione/1.5.2/assets/sprites/emojione.sprites.png)'
  }
};

export default class Message extends React.Component {
  constructor() {
    super();
    this.state = {visible: false};
  }

  onVisibility = isVisible => this.setState({visible: isVisible});

  render() {
    const text = this.props.text;

    let tokens = text.split(' ');

    let result = tokens.map((tkn, i) => {
      // Is this an image link?
      if (tkn.match(imgregex) && imageWhitelist(tkn)) {
        let style = {};
        if (!this.state.visible) {
          style.visibility = 'hidden';
        }
        
        return <span key={i}><img src={tkn} style={style} className='inline-image'/></span>;
        // OR is this a plain URL?
      } else if (tkn.match(regex)) { 
        let link = tkn;
        if (!link.slice(0, 4) === 'http') {
          link = `http://${link}`;
        }
        return <span key={i}><a href={link} target='_blank'>{tkn}</a></span>;
      }
      
      return <span key={i}> {emojify(tkn, emojifyOptions)} </span>;
    });

    return (
      <div>
        {result}
        <VisibilitySensor onChange={this.onVisibility}/>
      </div>
    );
  }
}
  