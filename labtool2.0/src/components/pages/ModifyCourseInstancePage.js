import React from 'react'

const ModifyCourseInstance = (onSubmit, handleFieldChange, weekamount, weekmaxpoints, currentweek, courseactive) => {

    return (
        <div className="CourseInstance" style={{ textAlignVertical: "center", textAlign: "center" }}>
            <p>Modify course instance for this course</p>

            <form onSubmit={onSubmit} >
                <label>
                    Week amount: <br />
                    <input type="text" onChange={handleFieldChange} value={weekamount} className="form-control1" name="weekamount" requred="true"/>
                </label>
                <label> <br />
                    Weekly maxpoints: <br />
                    <input type="text" onChange={handleFieldChange} value={weekmaxpoints} className="form-control2" name="maxpointsweek" required />
                </label> <br />
                <label>
                    Current week: <br />
                    <input type="text"  onChange={handleFieldChange} value={currentweek} className="form-control3" name="currentweek"  required />
                </label> <br />
                <label> <br />
                    Activate course
            <input type="checkbox" onChange={handleFieldChange} value={courseactive} className="form-control4" name="courseactive" /> <br />
                </label> <br />
                <button type="submit">Sumbit</button>
            </form>
        </div>
    )
}

export default ModifyCourseInstance