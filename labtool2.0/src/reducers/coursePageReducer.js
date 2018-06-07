/**
 * The reducer for displaying pretty much all that you want to see
 * on the course page.
 *  See detailed documentation of the content below.
 *
 */

const courseInstancereducer = (store = [], action) => {
  switch (action.type) {
    case 'CP_INFO_SUCCESS':
      return action.response
    case 'ASSOCIATE_TEACHER_AND_STUDENT_SUCCESS': {
      console.log(store)
      const id = action.response.id
      const studentToChange = store.data.find(s => s.id === id)
      const changedStudent = { ...studentToChange, teacherInstanceId: action.response.teacherInstanceId }
      const mappedData = store.data.map(st => (st.id !== id ? st : changedStudent))
      return { ...store, data: mappedData }
    }
    default:
      return store
  }
}

export default courseInstancereducer

/**
 
{
  "role": String, tells if the user is a student or a teacher on this course.
  "data": {
      "id": Student or teacher instance id in database
      "github": String, the github address of the user
      "projectName": String, Projects name
      "courseInstanceId": Integer, on which course(id) does this instance belong
      "userId": Integer, on which user (id) does this instance belong
      "weeks": [
          {
              "id": Integer, database week id
              "points": Integer, points in course
              "weekNumber": integer, weeks number
              "feedback": String, the feedback on it.
              "studentInstanceId": integer, on which studentinstance does it belong.
              "comments": [
                  {
                      "id": Integer, comments database id
                      "hidden": boolean that tells whether the comment is a note or feedback
                      "comment": string, the comments message
                      "weekId": integer, on which week does the commentbelong
                      "from": String, the user who commented this.
                  }
              ]
          }
      ],
      "codeReviews": [
          {
              "reviewer": {
                  "github": string, github link for reviewer
                  "projectName": string, title for reviewer's project
              }
              "toReview": {
                  "github": string, github link to repository user should review
                  "projectName": string, title for project user should review
              }
              "reviewNumber": integer, indicates which round of code reviews this is.
              "points": number or null, Points awarded for this code review. Null if not reviewed.
          }
      ]
  }
}
*/
