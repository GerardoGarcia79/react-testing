import { render, screen } from '@testing-library/react'
import AuthStatus from '../../src/components/AuthStatus'
import { mockAuthState } from '../utils'

describe('AuthStatus', () => {
    it('should render the loading message while fetching the auth status', () => {
        mockAuthState({
            isAuthenticated: false,
            isLoading: true,
            user: undefined
        })

        render(<AuthStatus />)

        expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should render a Log In button if the user is not authenticated', () => {
        mockAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: undefined
        })

        render(<AuthStatus />)

        expect(screen.getByRole('button', { name: /in/i })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /out/i })).not.toBeInTheDocument()
    })

    it('should render user name', () => {
        const name = 'Gerardo'
        mockAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: {
                name
            }
        })

        render(<AuthStatus />)

        expect(screen.getByText(name)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /out/i })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /in/i })).not.toBeInTheDocument()
    })
})