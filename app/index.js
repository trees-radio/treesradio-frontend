import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from './components/Main';

// (S)CSS
import './scss/core/index.scss'; // our scss entry
// B u lma flex-fw
import "./scss/core/bulma.sass";

// import 'font-awesome-webpack-4';
// import 'script-loader!localforage'; 

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Try different possible container IDs
    const container = document.getElementById('app'); // Changed from 'root' to 'app'
    const root = createRoot(container);
    root.render(<Main />);
});
