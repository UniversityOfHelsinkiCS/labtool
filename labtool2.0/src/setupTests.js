import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() }) 

const Enzyme = require('enzyme')

// make Enzyme functions available in all test files without importing
global.shallow = Enzyme.shallow
global.render = Enzyme.render
global.mount = Enzyme.mount

// this is where we reference the adapter package we installed  
// earlier
const EnzymeAdapter = require('enzyme-adapter-react-16')

// This sets up the adapter to be used by Enzyme
Enzyme.configure({ adapter: new EnzymeAdapter() })