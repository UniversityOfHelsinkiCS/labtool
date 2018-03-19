import React, { Component } from 'react'
/*
take some elements from SetEmail.js, if user has already email in db
text should be "Edit your email address" if email can be found from db
*/
class Email extends Component {
    render() {
        return (
            <div className="Email" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
                <form>
                    <label>
                        Please give your email address: <br />
                        <input focus placeholder='my.email@helsinki.fi' type="email" className="form-control" name="email" required />
                    </label>
                    <button type="submit">Submit</button>
                </form>

                <button>Cancel</button>
            </div>
        )
    }
}

/*
code below from SetEmail.js
*/
const SetEmail = ({ postEmail, handleFieldChange, handleFirstLoginFalse, email }) => {

    return (
        <div className="Email" style={{ textAlignVertical: 'center', textAlign: 'center', }}>

            <form onSubmit={postEmail}>
                <label>
                    Email address: <br />
                    <input value={email} type="email" className="form-control" name="email" onChange={handleFieldChange} required />
                </label>
                <button type="submit">Submit</button>
            </form>

            <button onClick={handleFirstLoginFalse}>Cancel</button>
        </div>
    )
}

export default Email