import { render, screen } from '@testing-library/react'
import SearchBox from '../../src/components/SearchBox'
import userEvent from '@testing-library/user-event'

describe('SearchBox', () => {
    const renderComponent = () => {
        const onChange = vi.fn()
        render(<SearchBox onChange={ onChange }/>)

        return {
            input: screen.getByPlaceholderText(/search/i),
            user: userEvent.setup(),
            onChange
        }
    }

    it('should render an input field for searching', async () => {
        const { input } = renderComponent()

        expect(input).toBeInTheDocument()
    })
    
    it('should call onChange when Enter is pressed', async () => {
        const { input, onChange, user } = renderComponent()
        
        const search = 'Gerardo'
        await user.type(input, `${search}{enter}`)
        
        expect(onChange).toHaveBeenCalledWith(search)
    })
    
    it('should not call onChange if input field is empty', async () => {
        const { input, onChange, user } = renderComponent()
        
        await user.type(input, '{enter}')
        
        expect(onChange).not.toHaveBeenCalled()
    })
})