import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css';
import './scss/core/index.scss'; // our scss entry
import './scss/core/bulma.sass';
import {Main} from './components/Main'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div id="app">
            <Main/>
        </div>
    </StrictMode>,
)
