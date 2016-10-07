import React from 'react'; //eslint-disable-line
//React is required here for ReactDOM to work properly, has already been tested
import ReactDOM from 'react-dom';

import Main from './components/Main';

// (S)CSS
import 'modules/bootstrap/dist/css/bootstrap.css'; // load bootstrap css
import 'modules/toastr/build/toastr.css';
import './Main.scss'; // our scss entry

import 'bootstrap'; //load bootstrap js, depends on $

import 'font-awesome-webpack';
import 'babel-polyfill'; // required for IE

ReactDOM.render(<Main />, document.getElementById('app'));
