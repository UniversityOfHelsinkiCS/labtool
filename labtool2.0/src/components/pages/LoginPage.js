import React, {Component} from 'react'
import { Form, Input, Button } from 'semantic-ui-react'

class LoginPage extends Component {
  
  render() {
    //const LoginPage = ({ postLogin, handleFieldChange, username, password }) => {
    return (
      
      <div className="LoginPage"
        style={{
          textAlignVertical: 'center',
          textAlign: 'center',
        }}>

        <p>Enter your University of Helsinki username and password.</p>

        <Form>

          <Form.Field>
            <label>
              Username:
              <Form.Input
                type="text"
                className="form-control1"
                //value={username}
                name="username"
                //onChange={handleFieldChange}
                required />
            </label>

            <label>
              Password:
              <Form.Input
                type="password"
                className="form-control2"
                //value={password}
                name="password"
                //onChange={handleFieldChange}
                required />
            </label>
          </Form.Field>

          <Form.Field>
            <Button type="submit">Login</Button>
          </Form.Field>

        </Form>
      </div>

    )
  }
}


export default LoginPage