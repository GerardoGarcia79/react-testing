import { render, screen } from '@testing-library/react'
import TagList from '../../src/components/TagList'

describe('TagList', () => {
    it('should render tags', async () => {
        render(<TagList />)

        // 1st approach: waitFor
        // Call repeatedly each 50 milliseconds until 1 sec by default
        // Avoid code that would cause side effects in this callback
        // Only have assertions
        // await waitFor(() => {
        //     const listItems = screen.getAllByRole('listitem')
        //     expect(listItems.length).toBeGreaterThan(1)
        // })

        // 2nd approach: findBy (findBy combines waitFor and a get query)
        const listItems = await screen.findAllByRole('listitem')
        expect(listItems.length).toBeGreaterThan(0)
    })
})