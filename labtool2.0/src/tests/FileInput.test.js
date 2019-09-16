import React from 'react'
import { shallow } from 'enzyme'
import { Button, Form } from 'semantic-ui-react'
import FileInput from '../components/FileInput'

describe('<FileInput />', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallow(<FileInput allowedFileTypes={['text/plain', 'application/json']} />)
  })

  describe('FileInput component', () => {
    it('renders ok', () => {
      expect(wrapper).toBeDefined()
      expect(
        wrapper
          .find(Button)
          .first()
          .children()
          .text()
      ).toEqual('Upload')
    })

    it('accepts specified file types', () => {
      expect(
        wrapper
          .find(Form.Input)
          .first()
          .prop('accept')
      ).toEqual('text/plain,application/json')
    })
  })
})
