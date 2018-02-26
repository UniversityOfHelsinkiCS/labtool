import React from 'react'

const SetEmail = ({ history, postEmail, handleFieldChange, handleFirstLoginFalse, email }) => {


  const onSubmit = async (event) => {
    event.preventDefault()
    const message = await postEmail
    if (message === 'succ' ) {
      history.push('/')
    } 
  }

  return (
    <div className="Email">

      <form onSubmit={onSubmit}>
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