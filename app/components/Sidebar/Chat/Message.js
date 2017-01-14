import React from 'react';
import {emojify} from 'react-emojione';

// regex for links (protocol not required): http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
const regex = new RegExp(expression);

// regex for detecting an inline image.
const imgexpr = /(https?:)?\/\/?[^'"<>]+?\.(jpg|jpeg|gif|png)/i;
const imgregex = new RegExp(imgexpr);

// XXX Maybe we should move this to a library?
// regex for accepted image domains
const domexpr = /^(https?:)?\/\/?(.*?)\//i;
const domregex = new RegExp(domexpr);

// This is temporary, this should be stored in firebase.
const alloweddoms = {
    'i.imgur.com': true,
    'imgur.com': true,
    'i.reddituploads.com': true
};

const emojifyOptions = {
  styles: {
    backgroundImage: 'url(https://cdnjs.cloudflare.com/ajax/libs/emojione/1.5.2/assets/sprites/emojione.sprites.png)'
  }
};

const Message = props => {
  const text = props.text;

  let tokens = text.split(' ');

  let result = tokens.map((tkn, i) => {
    // Is this an image link?
    if ( tkn.match(imgregex) && alloweddoms[tkn.match(domregex)[2]] ) {
      return <span key={i}> <img src={tkn} className='inline-image'/> </span>;
    } 
    // Is this a plain URL?
    else if (tkn.match(regex)) {
      let link = tkn;
      if (!link.slice(0, 4) === 'http') {
        link = `http://${link}`;
      }
      return <span key={i}> <a href={link} target='_blank'>{tkn}</a> </span>;
    }
    
    return <span key={i}> {emojify(tkn, emojifyOptions)} </span>;

  });

  return <div>{result}</div>;
};

export default Message;