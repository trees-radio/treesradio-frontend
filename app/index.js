import React from 'react'; //eslint-disable-line
//React is required here for ReactDOM to work properly, has already been tested
import ReactDOM from 'react-dom';
// (S)CSS
import './scss/index.scss'; // our scss entry
// B u lma flex-fw
import "./scss/bulma.sass";

import 'bootstrap'; //load bootstrap js, depends on $
import 'font-awesome-webpack-4';
//import 'babel-polyfill'; // required for IE
import 'script-loader!localforage'; //needs to execute as script, ugly console warnings otherwise
import Main from './components/Main';

ReactDOM.render(<Main />, document.getElementById('app'));
