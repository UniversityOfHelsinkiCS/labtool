import React from 'react'
import { render } from '@testing-library/react'
import { isHttpUrl, isGithubRepoUrl, safeHref } from '../util/links'
import { CoursePageHeader } from '../components/pages/CoursePage/Header'

describe('link checks', () => {
  it('accept only http(s) web links', () => {
    expect(isHttpUrl('https://studies.helsinki.fi/kurssit/x')).toBe(true)
    expect(isHttpUrl('http://example.com')).toBe(true)
    ;[
      'javascript:alert(1)',
      'JAVASCRIPT:alert(1)//http://x.fi',
      'data:text/html,x',
      'example.com',
      '',
      null
    ].forEach(link => expect(isHttpUrl(link)).toBe(false))
  })

  it('accept only GitHub repositories as repositories to review', () => {
    expect(isGithubRepoUrl('https://github.com/owner/repo')).toBe(true)
    expect(isGithubRepoUrl('https://github.com/owner/repo/tree/main/part2')).toBe(true)
    ;[
      'https://github.com/owner',
      'https://gitlab.com/owner/repo',
      'https://github.com.evil.example/owner/repo',
      'javascript:alert(1)//https://github.com/o/r'
    ].forEach(link => expect(isGithubRepoUrl(link)).toBe(false))
  })

  it('drops the href of anything but a web link', () => {
    expect(safeHref('https://github.com/o/r')).toBe('https://github.com/o/r')
    expect(safeHref('javascript:alert(1)')).toBeUndefined()
  })
})

describe('<CoursePageHeader />', () => {
  it('does not render a javascript: course link as a link target', () => {
    const { container } = render(
      <CoursePageHeader
        courseInstance={{
          name: 'Course',
          ohid: 'TKT1.2026.K.1',
          start: '2026-01-01',
          coursesPage: 'javascript:alert(1)',
          courseMaterial: 'https://material.example/x'
        }}
      />
    )
    const hrefs = [...container.querySelectorAll('a')].map(a => a.getAttribute('href'))
    expect(hrefs).toEqual([null, 'https://material.example/x'])
  })
})
