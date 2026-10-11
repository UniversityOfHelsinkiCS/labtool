import {
  createRecordingServer,
  createApiStore,
  waitForAction,
  HttpResponse,
  DEV_API_BASE
} from './testUtils/httpMock'
import { handleRequest } from '../util/apiConnection'

import * as assistant from '../services/assistant'
import * as checklist from '../services/checklist'
import * as changeLog from '../services/changeLog'
import * as codeReview from '../services/codeReview'
import * as comment from '../services/comment'
import * as courseImport from '../services/courseImport'
import * as courseInstance from '../services/courseInstance'
import * as email from '../services/email'
import * as login from '../services/login'
import * as studentinstances from '../services/studentinstances'
import * as tags from '../services/tags'
import * as teacherinstances from '../services/teacherinstances'
import * as user from '../services/user'
import * as week from '../services/week'

const { server, requests, setResponse, reset } = createRecordingServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => reset())
afterAll(() => server.close())

const payload = { some: 'data', list: [1, 2, 3] }

/**
 * [name, thunk creator, http method, route, prefix, expected request body]
 * get/delete requests never carry a body.
 */
const cases = [
  [
    'assistant.associateTeacherToStudent',
    () => assistant.associateTeacherToStudent(payload),
    'post',
    '/course/assistant/create',
    'ASSOCIATE_TEACHER_AND_STUDENT_',
    payload
  ],
  [
    'assistant.getStudentsAssistant',
    () => assistant.getStudentsAssistant(42),
    'get',
    '/course/assistant/student/42',
    'GET_ASSISTANT_FOR_STUDENT_',
    null
  ],

  [
    'changeLog.getChangeLog',
    () => changeLog.getChangeLog(42),
    'get',
    '/changelog/42',
    'CHANGELOG_GET_',
    null
  ],
  [
    'checklist.createChecklist',
    () => checklist.createChecklist(payload),
    'post',
    '/checklist/create',
    'CHECKLIST_CREATE_',
    payload
  ],
  [
    'checklist.getOneChecklist',
    () => checklist.getOneChecklist(payload),
    'post',
    '/checklist/getone',
    'CHECKLIST_GET_ONE_',
    payload
  ],
  [
    'checklist.getCopyableChecklists',
    () => checklist.getCopyableChecklists(),
    'get',
    '/checklist/copyable',
    'CHECKLIST_GET_COPYABLE_',
    null
  ],
  [
    'checklist.copyAllChecklists',
    () => checklist.copyAllChecklists(2, 3),
    'post',
    '/checklist/copyall',
    'CHECKLIST_COPY_ALL_',
    { copyFrom: 2, copyTo: 3 }
  ],

  [
    'codeReview.bulkinsertCodeReviews',
    () => codeReview.bulkinsertCodeReviews(payload),
    'put',
    '/codereviews/bulkinsert',
    'CODE_REVIEW_BULKINSERT_',
    payload
  ],
  [
    'codeReview.gradeCodeReview',
    () => codeReview.gradeCodeReview(payload),
    'put',
    '/codereviews/grade',
    'CODE_REVIEW_GRADE_',
    payload
  ],
  [
    'codeReview.addLinkToCodeReview',
    () => codeReview.addLinkToCodeReview(payload),
    'put',
    '/codereviews/link',
    'CODE_REVIEW_ADD_LINK_',
    payload
  ],
  [
    'codeReview.removeOneCodeReview',
    () => codeReview.removeOneCodeReview({ reviewer: 5, codeReviewRound: 2 }),
    'post',
    // route concatenates reviewer + round: 5 + 2 === 7
    '/codereviews/delete/7',
    'CODE_REVIEW_REMOVE_ONE_',
    { reviewer: 5, codeReviewRound: 2 }
  ],

  [
    'comment.createOneComment',
    () => comment.createOneComment(payload),
    'post',
    '/comment',
    'COMMENT_CREATE_ONE_',
    payload
  ],
  [
    'comment.editComment',
    () => comment.editComment({ id: 7, comment: 'Corrected' }),
    'put',
    '/comment/7',
    'COMMENT_EDIT_ONE_',
    { comment: 'Corrected' }
  ],
  [
    'comment.markCommentsAsRead',
    () => comment.markCommentsAsRead(payload),
    'put',
    '/comments/update',
    'MARK_COMMENTS_AS_READ_',
    payload
  ],

  [
    'courseImport.getIsAllowedToImport',
    () => courseImport.getIsAllowedToImport(),
    'get',
    '/courseimport/allowed',
    'COURSE_IMPORT_GET_ALLOWED_',
    null
  ],
  [
    'courseImport.getImportableCourses',
    () => courseImport.getImportableCourses(),
    'get',
    '/courseimport/get',
    'COURSE_IMPORT_GET_COURSES_',
    null
  ],
  [
    'courseImport.importCourses',
    () => courseImport.importCourses(payload),
    'post',
    '/courseimport/import',
    'COURSE_IMPORT_DO_IMPORT_',
    payload
  ],

  [
    'courseInstance.getAllCI',
    () => courseInstance.getAllCI(),
    'get',
    '/courseInstances',
    'CI_GET_ALL_',
    null
  ],
  [
    'courseInstance.getOneCI',
    () => courseInstance.getOneCI('TKT1.2018'),
    'get',
    '/courses/TKT1.2018',
    'CI_GET_ONE_',
    null
  ],
  [
    'courseInstance.modifyOneCI',
    () => courseInstance.modifyOneCI(payload, 'TKT1.2018'),
    'put',
    '/courseinstances/TKT1.2018',
    'CI_MODIFY_ONE_',
    payload
  ],
  [
    'courseInstance.coursePageInformation',
    () => courseInstance.coursePageInformation('TKT1.2018'),
    'post',
    '/courseinstances/coursepage',
    'CP_INFO_',
    { course: 'TKT1.2018' }
  ],
  [
    'courseInstance.copyInformationFromCourse',
    () => courseInstance.copyInformationFromCourse(3, 1),
    'post',
    '/courseinstances/copy',
    'CI_COPY_INFO_',
    { copyTo: 3, copyFrom: 1 }
  ],
  [
    'courseInstance.setCourseInvalid',
    () => courseInstance.setCourseInvalid('TKT1', true),
    'put',
    '/courseinstances/TKT1/invalid',
    'CI_SET_INVALID_',
    { invalid: true }
  ],

  [
    'email.sendEmail',
    () => email.sendEmail({ commentId: 1, role: 'teacher' }),
    'post',
    '/email/send',
    'SEND_EMAIL_',
    { commentId: 1, role: 'teacher' }
  ],
  // note: prefix has no trailing underscore, reducers listen to MASS_EMAIL_SENDSUCCESS
  [
    'email.sendMassEmail',
    () => email.sendMassEmail(payload, 'TKT1'),
    'post',
    '/email/sendmass/TKT1',
    'MASS_EMAIL_SEND',
    payload
  ],

  [
    'login.login',
    () => login.login({ username: 'u', password: 'p' }),
    'post',
    '/login',
    'LOGIN_',
    { username: 'u', password: 'p' }
  ],
  [
    'login.fakeShibboLogin',
    () => login.fakeShibboLogin({ uid: 'tester' }),
    'post',
    '/loginFake',
    'LOGIN_',
    { __HEADERS: { uid: 'tester' } }
  ],
  [
    'login.updateSelf',
    () => login.updateSelf({ email: 'a@b.c' }),
    'put',
    '/users/update',
    'USER_UPDATE_',
    { email: 'a@b.c' }
  ],
  ['login.logout', () => login.logout(), 'post', '/logout', 'LOGOUT_', { returnUrl: window.location.href }],

  [
    'studentinstances.getAllStudentCourses',
    () => studentinstances.getAllStudentCourses(),
    'post',
    '/course/student',
    'STUDENT_COURSE_GET_ALL_',
    null
  ],
  [
    'studentinstances.getCoursesByStudentId',
    () => studentinstances.getCoursesByStudentId(9),
    'post',
    '/courseinstances/9',
    'STUDENT_COURSES_GET_ALL_BY_USERID_',
    null
  ],
  [
    'studentinstances.createStudentCourses',
    () => studentinstances.createStudentCourses(payload, 'TKT1'),
    'post',
    '/course/register/TKT1',
    'STUDENT_COURSE_CREATE_ONE_',
    payload
  ],
  [
    'studentinstances.updateStudentProjectInfo',
    () => studentinstances.updateStudentProjectInfo(payload),
    'post',
    '/studentinstance/update',
    'STUDENT_PROJECT_INFO_UPDATE_',
    payload
  ],
  [
    'studentinstances.massUpdateStudentProjectInfo',
    () => studentinstances.massUpdateStudentProjectInfo(payload),
    'post',
    '/studentinstance/massupdate',
    'STUDENT_PROJECT_INFO_MASS_UPDATE_',
    payload
  ],
  [
    'studentinstances.removeStudent',
    () => studentinstances.removeStudent({ id: 3 }),
    'post',
    '/users/student/remove',
    'STUDENT_REMOVE_',
    { id: 3 }
  ],

  ['tags.createTag', () => tags.createTag(payload), 'post', '/tags/create', 'TAG_CREATE_', payload],
  ['tags.removeTag', () => tags.removeTag(payload), 'post', '/tags/remove', 'TAG_REMOVE_', payload],
  ['tags.getAllTags', () => tags.getAllTags(), 'get', '/tags/list', 'TAGS_GET_ALL_', null],
  [
    'tags.tagStudent',
    () => tags.tagStudent({ studentId: 1, tagId: 2 }),
    'post',
    '/tags/tagStudent',
    'TAG_STUDENT_',
    { studentId: 1, tagId: 2 }
  ],
  [
    'tags.unTagStudent',
    () => tags.unTagStudent({ studentId: 1, tagId: 2 }),
    'post',
    '/tags/untagStudent',
    'UNTAG_STUDENT_',
    { studentId: 1, tagId: 2 }
  ],

  [
    'teacherinstances.getAllTeacherCourses',
    () => teacherinstances.getAllTeacherCourses(),
    'post',
    '/course/teacher',
    'TEACHER_COURSE_GET_ALL_',
    null
  ],
  [
    'teacherinstances.createOne',
    () => teacherinstances.createOne(payload),
    'post',
    '/users/teacher/create',
    'TEACHER_CREATE_',
    payload
  ],
  [
    'teacherinstances.removeOne',
    () => teacherinstances.removeOne(payload),
    'post',
    '/users/teacher/remove',
    'TEACHER_REMOVE_',
    payload
  ],

  ['user.getAllUsers', () => user.getAllUsers(), 'get', '/users', 'USERS_GET_ALL_', null],
  [
    'user.updateOtherUser',
    () => user.updateOtherUser(payload),
    'put',
    '/users/updateAdmin',
    'USER_UPDATE_ADMIN_',
    payload
  ],

  // note: prefixes WEEKS_CREATE_ONE and WEEKDRAFTS_CREATE_ONE have no trailing underscore
  [
    'week.createOneWeek',
    () => week.createOneWeek(payload),
    'post',
    '/weeks/create',
    'WEEKS_CREATE_ONE',
    payload
  ],
  [
    'week.getWeekDraft',
    () => week.getWeekDraft(payload),
    'post',
    '/weeks/getDraft',
    'WEEKDRAFTS_GET_ONE_',
    payload
  ],
  [
    'week.saveWeekDraft',
    () => week.saveWeekDraft(payload),
    'post',
    '/weeks/saveDraft',
    'WEEKDRAFTS_CREATE_ONE',
    payload
  ]
]

describe('services', () => {
  it.each(cases)('%s', async (name, thunk, method, route, prefix, body) => {
    const responseBody = { response: name }
    setResponse(() => HttpResponse.json(responseBody))
    const { store, actions } = createApiStore(handleRequest, { token: 'service-token' })

    store.dispatch(thunk())

    expect(actions[0]).toEqual({
      type: `${prefix}ATTEMPT`,
      payload: expect.objectContaining({ route, method, prefix })
    })

    const success = await waitForAction(actions, `${prefix}SUCCESS`)
    expect(success.response).toEqual(responseBody)

    expect(requests).toHaveLength(1)
    const [req] = requests
    expect(req.method).toBe(method.toUpperCase())
    expect(req.url).toBe(`${DEV_API_BASE}${route}`)
    expect(req.headers.authorization).toBe('bearer service-token')
    expect(req.body).toEqual(body)
  })

  it('fakeShibboLogin sends the login information as headers', async () => {
    const { store, actions } = createApiStore(handleRequest, { token: undefined })
    store.dispatch(
      login.fakeShibboLogin({ uid: 'tester', givenname: 'Terhi', sn: 'Testaaja', mail: 't@t.fi' })
    )
    await waitForAction(actions, 'LOGIN_SUCCESS')
    expect(requests[0].headers).toEqual(
      expect.objectContaining({ uid: 'tester', givenname: 'Terhi', sn: 'Testaaja', mail: 't@t.fi' })
    )
  })

  it('every exported service function is covered by the table', () => {
    const modules = {
      assistant,
      checklist,
      changeLog,
      codeReview,
      comment,
      courseImport,
      courseInstance,
      email,
      login,
      studentinstances,
      tags,
      teacherinstances,
      user,
      week
    }
    const covered = new Set(cases.map(c => c[0]))
    const exported = Object.entries(modules).flatMap(([moduleName, mod]) =>
      Object.keys(mod)
        .filter(key => key !== 'default')
        .map(key => `${moduleName}.${key}`)
    )
    expect(exported.filter(name => !covered.has(name))).toEqual([])
  })
})
