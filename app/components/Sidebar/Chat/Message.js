import React from 'react';
import {emojify} from 'react-emojione';

// regex for links (protocol not required): http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
const regex = new RegExp(expression);

const emojifyOptions = {
  styles: {
    backgroundImage: 'url(https://cdnjs.cloudflare.com/ajax/libs/emojione/1.5.2/assets/sprites/emojione.sprites.png)'
  }
};

const Message = props => {
  const text = props.text;

  let tokens = text.split(' ');

  let result = tokens.map((tkn, i) => {
    if (tkn.match(regex)) {
      let link = tkn;
      if (!link.slice(0, 4) === 'http') {
        link = `http://${link}`;
      }
      return <span key={i}> <a href={link} target='_blank'>{tkn}</a> </span>;
    } else {
      return <span key={i}> {emojify(tkn, emojifyOptions)} </span>;
    }
  });

  return <div>{result}</div>;
};

export default Message;