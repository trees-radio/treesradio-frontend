import React from 'react'; //eslint-disable-line
//React is required here for ReactDOM to work properly, has already been tested
import ReactDOM from 'react-dom';
// (S)CSS
import './scss/core/index.scss'; // our scss entry
// B u lma flex-fw
import "./scss/core/bulma.sass";

// import 'font-awesome-webpack-4';
import 'script-loader!localforage'; //needs to execute as script, ugly console warnings otherwise
import Main from './components/Main';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

ReactDOM.render(<Main />, document.getElementById('app'));
