import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import App from './App'
import Register from './components/pages/RegisterPage.js'
ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
