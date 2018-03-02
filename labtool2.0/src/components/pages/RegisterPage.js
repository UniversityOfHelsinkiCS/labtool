import React from 'react'


const Register = () => {

    return (
      <div className="Register" style={{textAlignVertical: "center",textAlign: "center",}} >
        <h3>Register for TiraLabra</h3>
  
        <form >
          <label >
            GitHub link: <br/>
            <input type="url" className="form-control1" name="github"  required={true}  />
          </label>
          <br />
          <label> 
        
            Project name:  <br/>
            <input type="text" className="form-control2" name="name" required />
          </label> <br />
        
          <button  type="submit">Submit</button>
        </form>
      </div>
    )
  }
  
  
  export default Register