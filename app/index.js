import React from 'react'; //eslint-disable-line
//React is required here for ReactDOM to work properly, has already been tested
import ReactDOM from 'react-dom';

import Main from './Main';
require("font-awesome-webpack");
require('babel-polyfill');

ReactDOM.render(<Main />, document.getElementById('app'));
