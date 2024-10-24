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

        const waitForFormToLoad = () => screen.queryByText(/loading/i)
        const getInputs = () => {
            return {
                nameInput: screen.getByPlaceholderText(/name/i),
                priceInput: screen.getByPlaceholderText(/price/i),
                categoryInput: screen.getByRole('combobox', { name: /category/i })
            }
        }

        return {
            getInputs,
            waitForFormToLoad,
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
        const { getInputs, waitForFormToLoad } = renderComponent()
        
        await waitForElementToBeRemoved(waitForFormToLoad)
        const { categoryInput, nameInput, priceInput } = getInputs()

        expect(nameInput).toBeInTheDocument()
        expect(priceInput).toBeInTheDocument()
        expect(categoryInput).toBeInTheDocument()
    })

    it('should render all options when clicking drop-down list', async () => {
        const { getInputs, waitForFormToLoad } = renderComponent()
        await waitForElementToBeRemoved(waitForFormToLoad)
        const { categoryInput } = getInputs()
        const combobox = categoryInput
        expect(combobox).toBeInTheDocument()

        const user = userEvent.setup()
        await user.click(combobox)
        
        expect(screen.getByRole('option', { name: category.name }))
    })

    it('should render initial data when editing a product', async () => {
        const { getInputs, waitForFormToLoad } = renderComponent(product)

        await waitForElementToBeRemoved(waitForFormToLoad)
        const { categoryInput, nameInput, priceInput } = getInputs()

        expect(nameInput).toHaveValue(product.name)
        expect(priceInput).toHaveValue(product.price.toString())
        expect(categoryInput).toHaveTextContent(category.name)
    })
})
