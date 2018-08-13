import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainScene from './scenes';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<MainScene />, document.getElementById('root'));
registerServiceWorker();
