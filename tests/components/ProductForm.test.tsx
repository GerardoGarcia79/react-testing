import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductForm from '../../src/components/ProductForm'
import { Category, Product } from '../../src/entities'
import AllProviders from '../AllProviders'
import { db } from '../mocks/db'

describe('ProductForm', () => {
    const categories: Category[] = []
    const products: Product[] = []
    
    beforeAll(() => {
        [1, 2].forEach(() => {
            const category = db.category.create()
            categories.push(category)
        })

        const product = db.product.create({ categoryId: categories[0].id })
        products.push(product)
    })

    afterAll(() => {
        const categoryIds = categories.map(c => c.id)
        db.category.deleteMany({ where: { id: { in: categoryIds }}})
        db.product.delete({ where: { id: { equals: products[0].id }}})
    })

    it('should render form fields', async () => {
        render(<ProductForm onSubmit={vi.fn()}/>, { wrapper: AllProviders})

        await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))

        expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/price/i)).toBeInTheDocument()
        expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument()
    })

    it('should render all options when clicking drop-down list', async () => {
        render(<ProductForm onSubmit={vi.fn()}/>, { wrapper: AllProviders})

        await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))
        const combobox = screen.getByRole('combobox', { name: /category/i })
        expect(combobox).toBeInTheDocument()
        const user = userEvent.setup()
        await user.click(combobox)
        
        categories.forEach(product => {
            expect(screen.getByRole('option', { name: product.name }))
        })
    })

    it('should render initial data when editing a product', async () => {
        const product = products[0]
        render(<ProductForm onSubmit={vi.fn()} product={product}/>, { wrapper: AllProviders})

        await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))

        expect(screen.getByPlaceholderText(/name/i)).toHaveValue(product.name)
        expect(screen.getByPlaceholderText(/price/i)).toHaveValue(product.price.toString())
        expect(screen.getByRole('combobox', { name: /category/i })).toHaveTextContent(categories[0].name)
    })
})