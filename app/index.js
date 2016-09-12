import React from 'react'; //eslint-disable-line
//React is required here for ReactDOM to work properly, has already been tested
import ReactDOM from 'react-dom';

import Main from './components/Main';

// (S)CSS
import './Main.scss';

require("font-awesome-webpack");
require('babel-polyfill');

ReactDOM.render(<Main />, document.getElementById('app'));
