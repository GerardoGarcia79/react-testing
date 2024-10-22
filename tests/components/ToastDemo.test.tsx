import { render, screen } from '@testing-library/react'
import ToastDemo from '../../src/components/ToastDemo'
import { Toaster } from 'react-hot-toast'
import userEvent from '@testing-library/user-event'

describe('ToastDemo', () => {
    it('should render a button to show a toast notification', () => {
        render(<><ToastDemo /><Toaster /></>)

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render a toast notification when clicking the button', async () => {
        render(<><ToastDemo /><Toaster /></>)
        const user = userEvent.setup()
        const button = screen.getByRole('button')
        await user.click(button)

        const toaster = await screen.findByText(/success/i)
        expect(toaster).toBeInTheDocument()
    })
})