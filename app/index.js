import React from 'react';
import ReactDOM from 'react-dom';

import Main from './Main';
require("font-awesome-webpack");
require('babel-polyfill');

ReactDOM.render(<Main />, document.getElementById('app'));
