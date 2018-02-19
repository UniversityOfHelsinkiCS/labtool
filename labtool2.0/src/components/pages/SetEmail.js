import React from 'react'

const SetEmail = ({ postEmail, handleEmailChange, handleFirstLoginFalse }) => {

  return (
    <div className="Email">

      <form onSubmit={postEmail}>
        <label>
          Email address: <br />
          <input type="text" className="form-control" name="email" onChange={handleEmailChange} required />
        </label>
        <button type="submit">Submit</button>
      </form>

      <button onClick={handleFirstLoginFalse}>Cancel</button>
    </div>
  )
}


export default SetEmail