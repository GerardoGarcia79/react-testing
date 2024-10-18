import { render, screen } from "@testing-library/react"
import UserAccount from "../../src/components/UserAccount"

describe('UserAccount', () => {
    const user = { id: 1, name: 'gerardo' }
    const adminUser = { id: 1, name: 'gerardo', isAdmin: true }

    it('should render user name when user is provided', () => {
        render(<UserAccount user={user}/>)

        const div = screen.getByText(/gerardo/i)

        expect(div).toBeInTheDocument();
    })

    it('should render edit button if an admin user is provided', () => {
        render(<UserAccount user={adminUser}/>)

        const button = screen.getByRole('button')
        
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(/edit/i)
    })

    it('should not render edit button if an not admin user is provided', () => {
        render(<UserAccount user={user}/>)

        const button = screen.queryByRole('button')
        
        expect(button).not.toBeInTheDocument();
    })
})