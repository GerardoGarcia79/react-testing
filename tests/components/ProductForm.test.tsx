import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from 'react-hot-toast'
import ProductForm from '../../src/components/ProductForm'
import { Category, Product } from '../../src/entities'
import AllProviders from '../AllProviders'
import { db } from '../mocks/db'

describe('ProductForm', () => {
    let category: Category;
    let product: Product;

    const renderComponent = (product?: Product) => {
        const onSubmit = vi.fn()
        render(
        <>
            <ProductForm onSubmit={onSubmit} product={product}/>
            <Toaster />
        </>
        , { wrapper: AllProviders}
    )

        return {
            onSubmit,
            expectErrorToBeInTheDocument: (errorMessage: RegExp) => {
                const error = screen.getByRole('alert')
                expect(error).toBeInTheDocument()
                expect(error).toHaveTextContent(errorMessage)
            },
            
            waitForFormToLoad: async () => {
            await waitForElementToBeRemoved(screen.queryByText(/loading/i))
            
            const nameInput = screen.getByPlaceholderText(/name/i)
            const priceInput = screen.getByPlaceholderText(/price/i)
            const categoryInput = screen.getByRole('combobox', { name: /category/i })
            const submitButton = screen.getByRole('button', { name: /submit/i })

            type FormData = {
                [K in keyof Product]: any
            }

            const validData: FormData = {
                id: 1,
                name: 'a',
                price: 1,
                categoryId: category.id
            }

            const fill = async (product: FormData) => {
                const user = userEvent.setup()

                if(product.name !== undefined)
                    await user.type(nameInput, product.name)

                if(product.price !== undefined)
                    await user.type(priceInput, product.price.toString())

                await user.tab()
                await user.click(categoryInput)
                const options = screen.getAllByRole('option')
                await user.click(options[0])
                await user.click(submitButton)
            }

            return {
                nameInput,
                priceInput,
                categoryInput,
                submitButton,
                fill,
                validData,
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
        const { expectErrorToBeInTheDocument, waitForFormToLoad } = renderComponent()

        const form = await waitForFormToLoad()
        await form.fill({ ...form.validData, name })

        expectErrorToBeInTheDocument(errorMessage)
    })

    it.each([
        {
            scenario: 'missing',
            errorMessage: /required/i
        },
        {
            scenario: '0',
            price: '0',
            errorMessage: /1/i
        },
        {
            scenario: 'negative',
            price: '-1',
            errorMessage: /1/i
        },
        {
            scenario: 'greater than 1000',
            price: '1001',
            errorMessage: /1000/i
        },
        {
            scenario: 'not a number',
            price: 'true',
            errorMessage: /required/i
        },
    ])('should render an error message if price is $scenario', async ({ price, errorMessage }) => {
        const { expectErrorToBeInTheDocument, waitForFormToLoad } = renderComponent()

        const form = await waitForFormToLoad()
        await form.fill({ ...form.validData, price })
        
        expectErrorToBeInTheDocument(errorMessage)
    })

    it('should call onSubmit with the correct data when submitting the form', async () => {
        const { waitForFormToLoad, onSubmit } = renderComponent()
        const form = await waitForFormToLoad()
        await form.fill(form.validData)

        const { id, ...formData } = form.validData
        expect(onSubmit).toHaveBeenCalledWith(formData)
    })

    it('should show a toast notification with the incorrect data when submitting the form', async () => {
        const { waitForFormToLoad, onSubmit } = renderComponent()
        onSubmit.mockRejectedValue({})

        const form = await waitForFormToLoad()
        await form.fill(form.validData)

        const toast = await screen.findByRole('status')
        expect(toast).toBeInTheDocument()
        expect(toast).toHaveTextContent(/error/i)
    })

    it('should disable the submit button upon submission', async () => {
        const { waitForFormToLoad, onSubmit } = renderComponent()
        onSubmit.mockReturnValue(new Promise(() => {}))

        const form = await waitForFormToLoad()
        await form.fill(form.validData)

        expect(form.submitButton).toBeDisabled()
    })

    it('should re-enable the submit button after submission', async () => {
        const { waitForFormToLoad, onSubmit } = renderComponent()
        onSubmit.mockResolvedValue({})

        const form = await waitForFormToLoad()
        await form.fill(form.validData)

        expect(form.submitButton).not.toBeDisabled()
    })

    it('should re-enable the submit button after submission fails', async () => {
        const { waitForFormToLoad, onSubmit } = renderComponent()
        onSubmit.mockRejectedValue('error')

        const form = await waitForFormToLoad()
        await form.fill(form.validData)

        expect(form.submitButton).not.toBeDisabled()
    })
})
