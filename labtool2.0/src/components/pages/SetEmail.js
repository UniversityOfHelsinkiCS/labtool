import React from 'react'

const SetEmail = ({ postEmail, handleEmailChange, handleFirstLoginFalse, email }) => {

  return (
    <div className="Email">

      <form onSubmit={postEmail}>
        <label>
          Email address: <br />
          <input value={email} type="text" className="form-control" name="email" onChange={handleEmailChange} required />
        </label>
        <button type="submit">Submit</button>
      </form>

      <button onClick={handleFirstLoginFalse}>Cancel</button>
    </div>
  )
}


export default SetEmail