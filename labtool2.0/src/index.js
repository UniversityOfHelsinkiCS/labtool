import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import App from './App'
import ModifyCourseInstancePage from './components/pages/ModifyCourseInstancePage'

ReactDOM.render(<ModifyCourseInstancePage />, document.getElementById('root'))
registerServiceWorker()
