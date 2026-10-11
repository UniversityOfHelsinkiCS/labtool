import React from 'react'
import { render } from '@testing-library/react'
import { createCourseIdWithYearAndTerm, formatCourseName, roundPoints } from '../util/format'
import { Points } from '../components/Points'

describe('should generate courseId with year and term', () => {
  it('when course starts in 1.period', () => {
    expect(createCourseIdWithYearAndTerm('TKT20010.2018.S.K.1', '2018-09-16T21:00:00.000Z')).toEqual(
      'TKT20010 2018-2019 P.I'
    )
  })
  it('when course starts in 2.period', () => {
    expect(createCourseIdWithYearAndTerm('TKT20010.2018.S.K.2', '2018-10-16T21:00:00.000Z')).toEqual(
      'TKT20010 2018-2019 P.II'
    )
  })
  it('when course starts in 3.period', () => {
    expect(createCourseIdWithYearAndTerm('TKT20010.2018.K.A.1', '2018-01-16T21:00:00.000Z')).toEqual(
      'TKT20010 2017-2018 P.III'
    )
  })
  it('when course starts in 4.period', () => {
    expect(createCourseIdWithYearAndTerm('TKT20010.2018.K.A.2', '2018-03-21T21:00:00.000Z')).toEqual(
      'TKT20010 2017-2018 P.IV'
    )
  })
  it('when course starts in early Summer', () => {
    expect(createCourseIdWithYearAndTerm('TKT20010.2018.V.K.1', '2018-05-11T21:00:00.000Z')).toEqual(
      'TKT20010 2018 early Summer'
    )
  })
  it('when course starts in late Summer', () => {
    expect(createCourseIdWithYearAndTerm('TKT20010.2018.V.K.2', '2018-07-27T21:00:00.000Z')).toEqual(
      'TKT20010 2018 late Summer'
    )
  })
  it('when course starts in the turn of the year', () => {
    expect(createCourseIdWithYearAndTerm('TKT20010.2018.V.V.1', '2018-12-16T21:00:00.000Z')).toEqual(
      'TKT20010 2018-2019 turn of the year'
    )
  })
})

describe('should format course name correctly', () => {
  describe('course name includes a period', () => {
    it('periodi', () => {
      expect(
        formatCourseName(
          'Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)',
          'TKT20011.2019.K.A.1',
          '2019-03-11T21:00:00.000Z'
        )
      ).toEqual('Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV, 2018-2019)')
    })
    it('alkukesä', () => {
      expect(
        formatCourseName(
          'Aineopintojen harjoitustyö: Tietokantasovellus (alkukesä)',
          'TKT20011.2019.V.K.1',
          '2019-05-11T21:00:00.000Z'
        )
      ).toEqual('Aineopintojen harjoitustyö: Tietokantasovellus (alkukesä, 2019)')
    })
    it('loppukesä', () => {
      expect(
        formatCourseName(
          'Aineopintojen harjoitustyö: Tietokantasovellus (loppukesä)',
          'TKT20011.2019.V.K.2',
          '2019-07-21T21:00:00.000Z'
        )
      ).toEqual('Aineopintojen harjoitustyö: Tietokantasovellus (loppukesä, 2019)')
    })
    it('vuodenvaihde', () => {
      expect(
        formatCourseName(
          'Aineopintojen harjoitustyö: Tietokantasovellus (vuodenvaihde)',
          'TKT20011.2019.V.K.1',
          '2019-12-16T21:00:00.000Z'
        )
      ).toEqual('Aineopintojen harjoitustyö: Tietokantasovellus (vuodenvaihde, 2019-2020)')
    })
  })
  it('course name has no period', () => {
    expect(
      formatCourseName('Ohjelmistotekniikan menetelmät', 'TTKT20002.2019.K.K.1', '2019-03-11T21:00:00.000Z')
    ).toEqual('Ohjelmistotekniikan menetelmät (spring, 2019)')
  })
})

describe('roundPoints (#508)', () => {
  it.each([
    [0.1 + 0.2, '0.3'],
    [2.9999999999, '3'],
    [0.5, '0.5'],
    [1.25, '1.25'],
    [1.256, '1.26'],
    [-0.5, '-0.5'],
    [-0.0001, '0'],
    [0, '0'],
    [12, '12']
  ])('shows %s as %s', (points, shown) => {
    expect(roundPoints(points)).toBe(shown)
  })
})

describe('<Points /> (#508)', () => {
  it('shows a floating point sum rounded, and a missing value as a dash', () => {
    expect(render(<Points points={0.1 + 0.2} />).container).toHaveTextContent(/^0\.3$/)
    expect(render(<Points points={null} />).container).toHaveTextContent(/^-$/)
  })
})
