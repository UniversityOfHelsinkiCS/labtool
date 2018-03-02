import React from 'react'

const ModifyCourseInstance = () => {

    return (
        <div className="CourseInstance" style={{ textAlignVewtical: "center", textAlign: "center" }}>
            <p>Create new course instance for this course</p>

            <form >
                <label>
                    Week amount: <br />
                    <input type="text" className="form-control1" name="week" requred="true"/>
                </label>
                <label> <br />
                    Weekly maxpoints: <br />
                    <input type="text" className="form-control2" name="maxpointsweek" required />
                </label> <br />
                <label>
                    Current week: <br />
                    <input type="text" className="form-control3" name="currentweek"  required />
                </label> <br />
                <label> <br />
                    Activate course
            <input type="checkbox" className="form-control4" name="CourseState" /> <br />
                </label> <br />
                <button type="submit">Sumbit</button>
            </form>
        </div>
    )
}

export default ModifyCourseInstance