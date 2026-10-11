import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ChecklistPreview, checklistResult, toGradingChecklist } from '../components/ChecklistPreview'

const data = {
  Koodi: [
    {
      id: 1,
      name: 'Koodi on selkeää',
      description: 'Nimet kuvaavat tarkoitustaan',
      checkedPoints: '1',
      uncheckedPoints: 0,
      textWhenOn: 'Selkeää koodia.',
      textWhenOff: 'Koodia kannattaa selkeyttää.',
      prerequisite: null
    },
    {
      tempId: 2,
      name: 'Koodi on kommentoitu',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      textWhenOn: 'Hyvät kommentit.',
      textWhenOff: '',
      prerequisite: 1
    }
  ],
  Testaus: [
    {
      id: 3,
      name: 'Yksikkötestit',
      checkedPoints: 2,
      uncheckedPoints: -1,
      textWhenOn: 'Testit kunnossa.',
      textWhenOff: 'Testit puuttuvat.',
      prerequisite: 99
    },
    {
      id: 4,
      name: 'Testit ajetaan CI:ssä',
      checkedPoints: 5,
      uncheckedPoints: 0,
      textWhenOn: '',
      textWhenOff: 'CI puuttuu.',
      minimumRequirement: true,
      prerequisite: null
    }
  ]
}

describe('toGradingChecklist', () => {
  it('gives rows their ids and order, numeric points and only prerequisites inside the checklist', () => {
    const { list } = toGradingChecklist(data)
    expect(Object.keys(list)).toEqual(['Koodi', 'Testaus'])
    expect(list.Koodi.map(item => [item.id, item.order, item.checkedPoints, item.prerequisite])).toEqual([
      [1, 0, 1, null],
      [2, 1, 0.5, 1]
    ])
    expect(list.Testaus[0].prerequisite).toBeNull()
  })
})

describe('checklistResult', () => {
  const checklist = toGradingChecklist(data)

  it('collects texts and points like the grading page', () => {
    expect(checklistResult(checklist, {}, 3)).toEqual({
      output: 'Koodia kannattaa selkeyttää.\n\nTestit puuttuvat.\n\nCI puuttuu.\n\n',
      points: 0
    })
    expect(checklistResult(checklist, { 1: true, 2: true, 3: true }, 10)).toEqual({
      output: 'Selkeää koodia.\n\nHyvät kommentit.\n\nTestit kunnossa.\n\nCI puuttuu.\n\n',
      points: 3.5
    })
  })

  it('caps the points at the maximum, and leaves them uncapped without one', () => {
    expect(checklistResult(checklist, { 1: true, 2: true, 3: true }, 3).points).toBe(3)
    expect(checklistResult(checklist, { 1: true, 2: true, 3: true, 4: true }, undefined).points).toBe(3.5)
  })
})

describe('<ChecklistPreview />', () => {
  const openPreview = async user => {
    await user.click(screen.getByRole('button', { name: /preview/i }))
    return document.querySelector('.checklistPreview')
  }

  it('shows the checklist as when grading, and checking boxes updates the feedback and points', async () => {
    const user = userEvent.setup()
    render(<ChecklistPreview data={data} maxPoints={3} />)
    const modal = await openPreview(user)

    expect(modal).toHaveTextContent('Checklist preview')
    expect(modal).toHaveTextContent('Koodi')
    expect(modal).toHaveTextContent('Nimet kuvaavat tarkoitustaan')
    // a check whose prerequisite is unchecked is hidden
    expect(modal).not.toHaveTextContent('Koodi on kommentoitu')
    expect(modal.querySelector('.checklistOutputPoints')).toHaveTextContent('points: 0')
    // nothing to copy to in the editor
    expect(modal).not.toHaveTextContent('Copy to review')

    await user.click(modal.querySelector('[data-testid="check-1"]'))
    expect(modal).toHaveTextContent('Koodi on kommentoitu')
    await user.click(modal.querySelector('[data-testid="check-2"]'))
    expect(modal.querySelector('.checklistOutputText textarea, textarea.checklistOutputText').value).toBe(
      'Selkeää koodia.\n\nHyvät kommentit.\n\nTestit puuttuvat.\n\nCI puuttuu.\n\n'
    )
    expect(modal.querySelector('.checklistOutputPoints')).toHaveTextContent('points: 0.5')

    // unchecking the prerequisite also unchecks the check that depends on it
    await user.click(modal.querySelector('[data-testid="check-1"]'))
    expect(modal).not.toHaveTextContent('Koodi on kommentoitu')
    await user.click(modal.querySelector('[data-testid="check-1"]'))
    expect(modal.querySelector('.checklistOutputPoints')).toHaveTextContent('points: 0')
  })

  it('starts with nothing checked each time it is opened', async () => {
    const user = userEvent.setup()
    render(<ChecklistPreview data={data} maxPoints={3} />)
    let modal = await openPreview(user)
    await user.click(modal.querySelector('[data-testid="check-1"]'))
    await user.click(modal.querySelector('.closePreviewButton'))
    expect(document.querySelector('.checklistPreview')).toBeNull()

    modal = await openPreview(user)
    expect(modal).not.toHaveTextContent('Koodi on kommentoitu')
  })

  it('does not submit the form it is placed in', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(e => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <ChecklistPreview data={data} maxPoints={3} />
      </form>
    )
    const modal = await openPreview(user)
    modal.querySelector('form.checklistOutput').requestSubmit()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('is disabled without a checklist', () => {
    render(<ChecklistPreview data={{}} disabled />)
    expect(screen.getByRole('button', { name: /preview/i })).toBeDisabled()
  })
})
