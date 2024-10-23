import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { server } from '../mocks/server'
import { delay, http, HttpResponse } from 'msw'
import BrowseProducts from '../../src/pages/BrowseProductsPage'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { db } from '../mocks/db'
import { Category, Product } from '../../src/entities'
import { CartProvider } from '../../src/providers/CartProvider'

describe('BrowseProductsPage', () => {
    const categories: Category[] = []
    const products: Product[] = []

    beforeAll(() => {
        [1, 2].forEach((item) => {
            categories.push(db.category.create({ name: 'Category ' + item}))
            products.push(db.product.create())
        })
    })

    afterAll(() => {
        const categoryIds = categories.map(c => c.id)
        db.category.deleteMany({ where: { id: { in: categoryIds }}})

        const productIds = products.map(c => c.id)
        db.product.deleteMany({ where: { id: { in: productIds }}})
    })

    const renderComponent = () => {
        render(
        <Theme>
            <CartProvider>
             <BrowseProducts />
            </CartProvider>
        </Theme>)
    }

    it('should render loading skeleton when categories is fetching', () => {
        server.use(http.get('/categories/', async () => {
            await delay(2000)

            HttpResponse.json([])
        }))

        renderComponent()

        expect(screen.getByRole('progressbar', { name: /categories/i })).toBeInTheDocument()
    })

    it('should remove loading skeleton when categories is fetched', async () => {
        renderComponent()

        await waitForElementToBeRemoved(() => screen.queryByRole('progressbar', { name: /categories/i }))
    })

    it('should render loading skeletons when fetching products', () => {
        server.use(http.get('/products', () => {
            delay(2000)

            HttpResponse.json([])
        }))
        
        renderComponent()
        
        expect((screen.getByRole('progressbar', { name: /products/i }))).toBeInTheDocument()
    })

    it('should remove loading skeletons when fetching products', async () => {
        renderComponent()

        await waitForElementToBeRemoved(() => screen.getByRole('progressbar', { name: /products/i }))
    })

    it('should not render an error if categories fetching fails', async () => {
        server.use(http.get('/categories', () => HttpResponse.error()))

        renderComponent()

        await waitForElementToBeRemoved(() => 
            screen.queryByRole('progressbar', { name: /categories/i })
        )

        expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
        expect(screen.queryByRole('combobox', { name: /category/i})).not.toBeInTheDocument()
    })

    it('should show an error message if products fetching fails', async () => {
        server.use(http.get('/products', () => HttpResponse.error()))

        renderComponent()

        expect(await screen.findByText(/error/i)).toBeInTheDocument()
    })

    it('should render list of categories', async () => {
        renderComponent()

        const combobox = await screen.findByRole('combobox')
        expect(combobox).toBeInTheDocument()

        const user = userEvent.setup()
        await user.click(combobox)
        
        expect(screen.getByRole('option', { name: /all/i })).toBeInTheDocument()
        categories.forEach(category => {
            expect(screen.getByRole('option', { name: category.name })).toBeInTheDocument()
        })
    })

    it('should render products', async () => {
        renderComponent()

        await waitForElementToBeRemoved(() => screen.queryByRole('progressbar', { name: /products/i }))

        products.forEach((product) => {
            expect(screen.getByText(product.name)).toBeInTheDocument()
        })
    })
})
