import { sortStudentsByLastname } from '../util/sort'

/**
 * The reducer for displaying pretty much all that you want to see
 * on the course page.
 *  See detailed documentation of the content below.
 *
 */

const markCommentNotified = (weeks, commentId) =>
  weeks.map(week =>
    week.comments.some(comment => comment.id === commentId)
      ? {
          ...week,
          comments: week.comments.map(comment =>
            comment.id === commentId ? { ...comment, notified: true } : comment
          )
        }
      : week
  )

const teacherCommentNotification = (state, commentId) => ({
  ...state,
  data: state.data.map(student => ({ ...student, weeks: markCommentNotified(student.weeks, commentId) }))
})

const studentCommentNotification = (state, commentId) => ({
  ...state,
  data: { ...state.data, weeks: markCommentNotified(state.data.weeks, commentId) }
})

const weekNotification = (state, weekId) => ({
  ...state,
  data: state.data.map(student => ({
    ...student,
    weeks: student.weeks.map(week => (week.id === weekId ? { ...week, notified: true } : week))
  }))
})

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
      const assignedReviews = {}
      const reviewNumber = action.response.data.reviewNumber
      action.response.data.codeReviews.forEach(cr => {
        assignedReviews[cr.reviewer] = cr.toReview || cr.repoToReview
      })
      const newData = store.data.map(student => {
        const reviewee = assignedReviews[student.id]
        if (!reviewee) {
          return student
        }
        const assignment = {
          toReview: Number.isInteger(reviewee) ? reviewee : null,
          repoToReview: Number.isInteger(reviewee) ? null : reviewee
        }
        const index = student.codeReviews.map(cr => cr.reviewNumber).indexOf(reviewNumber)
        const codeReviews =
          index === -1
            ? [
                ...student.codeReviews,
                { points: null, reviewNumber, studentInstanceId: student.id, ...assignment }
              ]
            : student.codeReviews.map((cr, i) => (i === index ? { ...cr, ...assignment } : cr))
        return { ...student, codeReviews }
      })
      return { ...store, data: newData }
    }
    case 'CODE_REVIEW_GRADE_SUCCESS': {
      const newData = store.data.map(student => {
        if (student.id !== action.response.data.studentInstanceId) {
          return student
        }
        const { reviewNumber, points } = action.response.data
        return {
          ...student,
          codeReviews: student.codeReviews.map(cr =>
            cr.reviewNumber === reviewNumber ? { ...cr, points } : cr
          )
        }
      })
      return { ...store, data: newData }
    }
    case 'CODE_REVIEW_ADD_LINK_SUCCESS': {
      let updatedCodeReview = store.data.codeReviews.filter(
        review => review.reviewNumber === action.response.data.reviewNumber
      )[0]
      if (updatedCodeReview) {
        const otherCodeReviews = store.data.codeReviews.filter(
          review => review.reviewNumber !== action.response.data.reviewNumber
        )
        updatedCodeReview = { ...updatedCodeReview, linkToReview: action.response.data.linkToReview }
        return { ...store, data: { ...store.data, codeReviews: [...otherCodeReviews, updatedCodeReview] } }
      } else {
        return store
      }
    }
    case 'TAG_STUDENT_SUCCESS': {
      return {
        ...store,
        data: store.data.map(student => (student.id === action.response.id ? action.response : student))
      }
    }
    case 'UNTAG_STUDENT_SUCCESS': {
      return {
        ...store,
        data: store.data.map(student => (student.id === action.response.id ? action.response : student))
      }
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
          weeks: student.weeks.map(week =>
            week.id === action.response.weekId
              ? { ...week, comments: [...week.comments, action.response] }
              : week
          )
        }))
        return { ...store, data: newStudents }
      } else if (store.role === 'student') {
        const newWeeks = store.data.weeks.map(week =>
          week.id === action.response.weekId
            ? { ...week, comments: [...week.comments, action.response] }
            : week
        )
        return { ...store, data: { ...store.data, weeks: newWeeks } }
      } else {
        return store
      }
    }
    case 'COMMENT_EDIT_ONE_SUCCESS': {
      const edited = action.response
      const replaceIn = weeks =>
        weeks.map(week =>
          week.id === edited.weekId
            ? {
                ...week,
                comments: week.comments.map(comment =>
                  comment.id === edited.id ? { ...comment, ...edited } : comment
                )
              }
            : week
        )
      if (Array.isArray(store.data)) {
        return {
          ...store,
          data: store.data.map(student => ({ ...student, weeks: replaceIn(student.weeks) }))
        }
      }
      if (store.data && store.data.weeks) {
        return { ...store, data: { ...store.data, weeks: replaceIn(store.data.weeks) } }
      }
      return store
    }
    case 'MARK_COMMENTS_AS_READ_SUCCESS': {
      const weekId = action.response[0].weekId
      const replaceComments = action.response
      const newStudents = store.data.map(student => ({
        ...student,
        weeks: student.weeks.map(week =>
          week.id === weekId
            ? {
                ...week,
                comments: week.comments.map(
                  comment => replaceComments.find(c => c.id === comment.id) || comment
                )
              }
            : week
        )
      }))
      return { ...store, data: newStudents }
    }
    case 'CODE_REVIEW_REMOVE_ONE_SUCCESS': {
      const { reviewer, codeReviewRound } = action.response.data
      const newData = store.data.map(student =>
        student.id !== reviewer
          ? student
          : { ...student, codeReviews: student.codeReviews.filter(cr => cr.reviewNumber !== codeReviewRound) }
      )
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
