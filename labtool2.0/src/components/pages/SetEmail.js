import React from 'react'

const SetEmail = ({ postEmail, handleFieldChange, handleFirstLoginFalse, email }) => {

  return (
    <div className="Email" style={{ textAlignVertical: 'center', textAlign: 'center', }}>

      <form onSubmit={postEmail}>
        <label>
          Email address: <br />
          <input value={email} type="text" className="form-control" name="email" onChange={handleFieldChange} required />
        </label>
        <button type="submit">Submit</button>
      </form>

      <button onClick={handleFirstLoginFalse}>Cancel</button>
    </div>
  )
}


export default SetEmail