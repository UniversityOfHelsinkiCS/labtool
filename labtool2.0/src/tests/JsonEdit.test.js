import React from 'react'
import { shallow } from 'enzyme'
import { Button, TextArea } from 'semantic-ui-react'
import JsonEdit from '../components/JsonEdit'

describe('<JsonEdit />', () => {
  let onImport
  let wrapper

  beforeEach(() => {
    onImport = jest.fn()
    wrapper = shallow(<JsonEdit onImport={onImport} />)
  })

  describe('JsonEdit component', () => {
    it('renders ok', () => {
      expect(wrapper).toBeDefined()
      expect(
        wrapper
          .find(Button)
          .first()
          .children()
          .text()
      ).toEqual('Edit as JSON')
    })

    it('can import valid JSON', () => {
      wrapper
        .find(TextArea)
        .first()
        .simulate('change', { target: { value: `{ "a": "b" }` } })

      expect(wrapper.state('data')).toEqual({ a: 'b' })

      wrapper
        .find(Button)
        .at(2)
        .simulate('click')

      expect(onImport).toBeCalledWith({ a: 'b' })
    })

    it('displays error with invalid', () => {
      wrapper
        .find(TextArea)
        .first()
        .simulate('change', { target: { value: `abc` } })

      expect(wrapper.state('error')).toEqual(expect.stringContaining('Failed to parse JSON'))
    })
  })
})
