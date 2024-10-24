import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductForm from '../../src/components/ProductForm'
import { Category, Product } from '../../src/entities'
import AllProviders from '../AllProviders'
import { db } from '../mocks/db'

describe('ProductForm', () => {
    let category: Category;
    let product: Product;

    const renderComponent = (product?: Product) => {
        render(<ProductForm onSubmit={vi.fn()} product={product}/>, { wrapper: AllProviders})

        return { 
            waitForFormToLoad: async () => {
            await waitForElementToBeRemoved(screen.queryByText(/loading/i))

            return {
                nameInput: screen.getByPlaceholderText(/name/i),
                priceInput: screen.getByPlaceholderText(/price/i),
                categoryInput: screen.getByRole('combobox', { name: /category/i }),
                submitButton: screen.getByRole('button', { name: /submit/i })
                }
            }
        } 
    }

    beforeAll(() => {
        category = db.category.create()
        product = db.product.create({ categoryId: category.id })
    })

    afterAll(() => {
        db.category.delete({ where: { id: { equals: category.id }}})
        db.product.delete({ where: { id: { equals: product.id }}})
    })

    it('should render form fields', async () => {
        const { waitForFormToLoad } = renderComponent()
        
        const { categoryInput, nameInput, priceInput } = await waitForFormToLoad()

        expect(nameInput).toBeInTheDocument()
        expect(priceInput).toBeInTheDocument()
        expect(categoryInput).toBeInTheDocument()
    })

    it('should render all options when clicking drop-down list', async () => {
        const { waitForFormToLoad } = renderComponent()
        const { categoryInput } = await waitForFormToLoad()
        const combobox = categoryInput
        expect(combobox).toBeInTheDocument()

        const user = userEvent.setup()
        await user.click(combobox)
        
        expect(screen.getByRole('option', { name: category.name }))
    })

    it('should render initial data when editing a product', async () => {
        const { waitForFormToLoad } = renderComponent(product)

        const { categoryInput, nameInput, priceInput } = await waitForFormToLoad()

        expect(nameInput).toHaveValue(product.name)
        expect(priceInput).toHaveValue(product.price.toString())
        expect(categoryInput).toHaveTextContent(category.name)
    })

    it('should put focus on the name input', async () => {
        const { waitForFormToLoad } = renderComponent(product)

        const { nameInput } = await waitForFormToLoad()

        expect(nameInput).toHaveFocus()
    })

    it.each([
        {
            scenario: 'missing',
            errorMessage: /required/i,
        },
        {
            scenario: 'longer than 255 characters',
            name: 'a'.repeat(256),
            errorMessage: /255/i,
        },
    ])('should display an error if name is $scenario', async ({ name, errorMessage }) => {
        const { waitForFormToLoad } = renderComponent()

        const form = await waitForFormToLoad()
        const user = userEvent.setup()
        if(name !== undefined)
            await user.type(form.nameInput, name)
        await user.type(form.priceInput, '1')
        await user.click(form.categoryInput)
        const options = screen.getAllByRole('option')
        await user.click(options[0])
        await user.click(form.submitButton)

        const error = screen.getByRole('alert')
        expect(error).toBeInTheDocument()
        expect(error).toHaveTextContent(errorMessage)
    })
})
