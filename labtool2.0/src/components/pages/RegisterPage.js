import React, { Component } from 'react'
import GridRow, { Form, Input, Button, Grid } from 'semantic-ui-react'
import GridColumn from 'semantic-ui-react';

class RegisterPage extends Component {

  render() {
    return (
      <div className="RegisterPage"
        style={{
          textAlignVertical: 'center',
          textAlign: 'center',
        }}>

        <Grid>
          <Grid.Row centered>
            <h3>Register for *kurssin nimi*</h3>
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>

            <Form>

              <Form.Field inline >
                <label> Project name </label>
                <Input
                  type="text"
                  className="form-control2"
                  name="project name"
                  placeholder="MyProjectName"
                  required />
              </Form.Field>

              <Form.Field inline>
                <label> GitHub link </label>
                <Input
                  type="url"
                  className="form-control1"
                  name="github"
                  placeholder="https://github.com/myrepository"
                  required />
              </Form.Field>

                <Form.Field>
                    <Button type="submit" color="blue">Submit</Button>
                    <Button color="red">Cancel</Button>
                </Form.Field>

            </Form>
          </Grid.Row>
        </Grid>
      </div >
    )
  }
}

// const RegisterPage = ({onSubmit, handleFieldChange, projectname, github, cancel, name }) => {

//   return (
//     <div className="Register" style={{ textAlignVertical: 'center', textAlign: 'center', }} >
//       <h3>Register for {name}</h3>

//       <form onSubmit={onSubmit} >
//         <label >
//           GitHub link: <br />
//           <input type="url" onChange={handleFieldChange} className="form-control1" name="github" required={true} value={github} />
//         </label>
//         <br />
//         <label>

//           Project name:  <br />
//           <input type="text" onChange={handleFieldChange} className="form-control2" name="projectname" value={projectname} required />
//         </label> <br />

//         <button type="submit">Submit</button>
//       </form>
//       <button onClick={cancel}>Cancel</button>
//     </div>
//   )
// }


export default RegisterPage
