import { screen, waitForElementToBeRemoved } from '@testing-library/react'
import { db } from './mocks/db'
import { navigateTo } from './utils'

describe('Router', () => {
    it('should render the home page for /', () => {
        navigateTo('/')

        expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument()
    })

    it('should render the products page for /products', () => {
        navigateTo('/products')

        expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument()
    })

    it('should render the product details page for /products/:id', async () => {
        const product = db.product.create()
        
        navigateTo('/products/' + product.id)
        await waitForElementToBeRemoved(() => screen.getByText(/loading/i))

        expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument()

        db.product.delete({ where: { id: { equals: product.id }}})
    })

    it('should render the error page for an invalid route', () => {
        navigateTo('/x')

        expect(screen.getByRole('heading', { name: /oops/i })).toBeInTheDocument()
    })

    it('should render the admin home page for /admin', () => {
        navigateTo('/admin')

        expect(screen.getByRole('heading', { name: /admin/i })).toBeInTheDocument()
    })
})