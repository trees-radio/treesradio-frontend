import React from 'react'; //eslint-disable-line
//React is required here for ReactDOM to work properly, has already been tested
import ReactDOM from 'react-dom';

// (S)CSS
import './vendor/bootswatch/cyborg/bootstrap.min.css'; // load bootstrap css
import 'modules/toastr/build/toastr.css';
import './scss/index.scss'; // our scss entry

import 'bootstrap'; //load bootstrap js, depends on $

import 'font-awesome-webpack';
import 'babel-polyfill'; // required for IE
import 'script!localforage'; //needs to execute as script, ugly console warnings otherwise

import Main from './components/Main';

ReactDOM.render(<Main />, document.getElementById('app'));
