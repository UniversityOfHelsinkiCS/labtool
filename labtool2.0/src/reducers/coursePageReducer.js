import { sortStudentsByLastname } from '../util/sort'

/**
 * The reducer for displaying pretty much all that you want to see
 * on the course page.
 *  See detailed documentation of the content below.
 *
 */

const teacherCommentNotification = (state, commentId) => {
  const newData = [...state.data]
  newData.forEach(student => {
    student.weeks.forEach(week => {
      week.comments.forEach(comment => {
        if (comment.id === commentId) {
          comment.notified = true
          return { ...state, data: newData }
        }
      })
    })
  })
  return state
}

const studentCommentNotification = (state, commentId) => {
  const newWeeks = [...state.data.weeks]
  newWeeks.forEach(week => {
    week.comments.forEach(comment => {
      if (comment.id === commentId) {
        comment.notified = true
        return { ...state, data: { ...state.data, weeks: newWeeks } }
      }
    })
  })
  return state
}

const weekNotification = (state, weekId) => {
  const newData = [...state.data]
  newData.forEach(student => {
    student.weeks.forEach(week => {
      if (week.id === weekId) {
        week.notified = true
        return { ...state, data: newData }
      }
    })
  })
  return state
}

const INITIAL_STATE = {}

const courseInstancereducer = (store = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'CP_INFO_SUCCESS': {
      if (action.response.role === 'teacher') {
        return { ...action.response, data: sortStudentsByLastname(action.response.data) }
      } else {
        return action.response
      }
    }
    case 'ASSOCIATE_TEACHER_AND_STUDENT_SUCCESS': {
      const id = action.response.id
      const studentToChange = store.data.find(s => s.id === id)
      const changedStudent = { ...studentToChange, teacherInstanceId: action.response.teacherInstanceId }
      const mappedData = store.data.map(st => (st.id !== id ? st : changedStudent))
      return { ...store, data: mappedData }
    }
    case 'CODE_REVIEW_BULKINSERT_SUCCESS': {
      let assignedReviews = {}
      let reviewNumber = action.response.data.reviewNumber
      action.response.data.codeReviews.forEach(cr => {
        assignedReviews[cr.reviewer] = cr.toReview || cr.repoToReview
      })
      let newData = store.data.map(student => {
        const reviewee = assignedReviews[student.id]
        if (!reviewee) {
          return student
        }
        const index = student.codeReviews.map(cr => cr.reviewNumber).indexOf(reviewNumber)
        if (index === -1) {
          student.codeReviews.push({
            points: null,
            reviewNumber: reviewNumber,
            studentInstanceId: student.id,
            toReview: Number.isInteger(reviewee) ? reviewee : null,
            repoToReview: Number.isInteger(reviewee) ? null : reviewee
          })
        } else {
          if (Number.isInteger(reviewee)) {
            student.codeReviews[index].toReview = reviewee
            student.codeReviews[index].repoToReview = null
          } else {
            student.codeReviews[index].toReview = null
            student.codeReviews[index].repoToReview = reviewee
          }
        }
        return student
      })
      return { ...store, data: newData }
    }
    case 'CODE_REVIEW_GRADE_SUCCESS': {
      const newData = store.data.map(student => {
        if (student.id !== action.response.data.studentInstanceId) {
          return student
        }
        const index = student.codeReviews.map(cr => cr.reviewNumber).indexOf(action.response.data.reviewNumber)
        student.codeReviews[index] = { ...student.codeReviews[index], points: action.response.data.points }
        return student
      })
      return { ...store, data: newData }
    }
    case 'CODE_REVIEW_ADD_LINK_SUCCESS': {
      let updatedCodeReview = store.data.codeReviews.filter(review => review.reviewNumber === action.response.data.reviewNumber)[0]
      if (updatedCodeReview) {
        const otherCodeReviews = store.data.codeReviews.filter(review => review.reviewNumber !== action.response.data.reviewNumber)
        updatedCodeReview = { ...updatedCodeReview, linkToReview: action.response.data.linkToReview }
        return { ...store, data: { ...store.data, codeReviews: [...otherCodeReviews, updatedCodeReview] } }
      } else {
        return store
      }
    }
    case 'TAG_STUDENT_SUCCESS': {
      return { ...store, data: store.data.map(student => (student.id === action.response.id ? action.response : student)) }
    }
    case 'UNTAG_STUDENT_SUCCESS': {
      return { ...store, data: store.data.map(student => (student.id === action.response.id ? action.response : student)) }
    }
    case 'SEND_EMAIL_SUCCESS': {
      if (store.role === 'teacher') {
        if (action.response.data.commentId) {
          return teacherCommentNotification(store, action.response.data.commentId)
        } else {
          return weekNotification(store, action.response.data.weekId)
        }
      } else {
        return studentCommentNotification(store, action.response.data.commentId)
      }
    }
    case 'COMMENT_CREATE_ONE_SUCCESS': {
      if (store.role === 'teacher') {
        const newStudents = store.data.map(student => ({
          ...student,
          weeks: student.weeks.map(week => (week.id === action.response.weekId ? { ...week, comments: [...week.comments, action.response] } : week))
        }))
        return { ...store, data: newStudents }
      } else if (store.role === 'student') {
        const newWeeks = [...store.data.weeks]
        newWeeks.find(week => week.id === action.response.weekId).comments.push(action.response)
        return { ...store, data: { ...store.data, weeks: newWeeks } }
      } else {
        return store
      }
    }
    case 'MARK_COMMENTS_AS_READ_SUCCESS': {
      const weekId = action.response[0].weekId
      const replaceComments = action.response
      const newStudents = store.data.map(student => ({
        ...student,
        weeks: student.weeks.map(week => (week.id === weekId ? { ...week, comments: week.comments.map(comment => replaceComments.find(c => c.id === comment.id) || comment) } : week))
      }))
      return { ...store, data: newStudents }
    }
    case 'CODE_REVIEW_REMOVE_ONE_SUCCESS': {
      let studentToChange = store.data.find(student => student.id === action.response.data.reviewer)
      studentToChange.codeReviews = studentToChange.codeReviews.filter(codeR => codeR.reviewNumber !== action.response.data.codeReviewRound)
      const newData = store.data.map(student => (student.id !== action.response.data.reviewer ? student : studentToChange))
      return { ...store, data: newData }
    }
    case 'STUDENT_PROJECT_INFO_UPDATE_SUCCESS': {
      if (store.data.find) {
        // don't do this student changing stuff if we are a student
        return {
          ...store,
          data: store.data.map(student => {
            return student.id === action.response.id ? { ...student, ...action.response } : student
          })
        }
      }
      return store
    }
    case 'STUDENT_PROJECT_INFO_MASS_UPDATE_SUCCESS': {
      if (store.data.map) {
        // don't do this student changing stuff if we are a student
        return {
          ...store,
          data: store.data.map(student => {
            const updatedStudent = action.response.find(responseStudent => responseStudent.id === student.id)
            return updatedStudent ? { ...student, ...updatedStudent } : student
          })
        }
      }
      return store
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
