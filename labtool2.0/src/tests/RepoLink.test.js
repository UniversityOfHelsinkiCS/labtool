import React from 'react'
import { render, screen } from '@testing-library/react'
import RepoLink from '../components/RepoLink'

describe('<RepoLink />', () => {
  describe('Repository link', () => {
    it('shows a shortened label for a GitHub repository', () => {
      const url = 'https://github.com/userName/repo'

      render(<RepoLink url={url} />)

      const repositoryLink = screen.getByRole('link', { name: 'userName/repo' })

      expect(repositoryLink).toHaveAttribute('href', url)
      expect(repositoryLink).toHaveAttribute('target', '_blank')
      expect(repositoryLink).toHaveAttribute('rel', 'noopener noreferrer')
      expect(repositoryLink).not.toHaveTextContent('https://github.com/')
    })
  })
})
