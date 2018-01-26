import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Etusivu from './Etusivu';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Etusivu />, document.getElementById('root'));
registerServiceWorker();
