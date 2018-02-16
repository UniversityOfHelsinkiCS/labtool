import React from 'react'
import './RegisterPage.css'

const Register = () => {

    return (
      <div className="Register"  style={{textAlignVertical: "center",textAlign: "center",}}>
        <h3>Register for TiraLabra</h3>
  
        <form >
          <label>
            Github link: <br />
            <input type="text" className="form-control" name="github"  required />
          </label>
          <label> <br />
        
            Project name: <br />
            <input type="text" className="form-control" name="name" required />
          </label> <br />
         
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  }
  
  
  export default Register