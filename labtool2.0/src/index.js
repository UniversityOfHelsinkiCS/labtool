import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import Courses from '../src/components/pages/Courses'
import Mainpage from '../src/components/pages/MainPage'
import ModifyCourseInstancePage from '../src/components/pages/ModifyCourseInstancePage'

ReactDOM.render((
  <BrowserRouter>
    <ModifyCourseInstancePage />
  </BrowserRouter>), document.getElementById('root'))
registerServiceWorker()

