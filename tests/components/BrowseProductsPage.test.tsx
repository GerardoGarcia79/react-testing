import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import BrowseProducts from '../../src/pages/BrowseProductsPage'
import { Theme } from '@radix-ui/themes'
import userEvent from '@testing-library/user-event'
import { db } from '../mocks/db'
import { Category, Product } from '../../src/entities'
import { CartProvider } from '../../src/providers/CartProvider'
import { simulateDelay, simulateError } from '../utils'

describe('BrowseProductsPage', () => {
    const categories: Category[] = []
    const products: Product[] = []

    beforeAll(() => {
        [1, 2].forEach((item) => {
            const category = db.category.create({ name: 'Category ' + item })
            categories.push(category);
            [1, 2].forEach(() => {
                products.push(db.product.create({ categoryId: category.id }))
            })
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

        return {
            getProductsSkeleton: () => screen.getByRole('progressbar', { name: /products/i }),
            getCategoriesSkeleton: () => screen.getByRole('progressbar', { name: /categories/i }),
            getCategoriesComboBox: () => screen.queryByRole('combobox')
        }
    }

    it('should render loading skeleton when categories is fetching', () => {
        simulateDelay('/categories')

        const { getCategoriesSkeleton } = renderComponent()

        expect(getCategoriesSkeleton()).toBeInTheDocument()
    })

    it('should remove loading skeleton when categories is fetched', async () => {
        const { getCategoriesSkeleton } = renderComponent()

        await waitForElementToBeRemoved(getCategoriesSkeleton)
    })

    it('should render loading skeletons when fetching products', () => {
        simulateDelay('/products')
        
        const { getProductsSkeleton } = renderComponent()
        
        expect(getProductsSkeleton()).toBeInTheDocument()
    })

    it('should remove loading skeletons when fetching products', async () => {
        const { getProductsSkeleton } = renderComponent()

        await waitForElementToBeRemoved(getProductsSkeleton)
    })

    it('should not render an error if categories fetching fails', async () => {
        simulateError('/categories')

        const { getCategoriesSkeleton, getCategoriesComboBox } = renderComponent()

        await waitForElementToBeRemoved(getCategoriesSkeleton)

        expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
        expect(getCategoriesComboBox()).not.toBeInTheDocument()
    })

    it('should show an error message if products fetching fails', async () => {
        simulateError('/products')

        renderComponent()

        expect(await screen.findByText(/error/i)).toBeInTheDocument()
    })

    it('should render list of categories', async () => {
        const { getCategoriesSkeleton, getCategoriesComboBox } = renderComponent()

        await waitForElementToBeRemoved(getCategoriesSkeleton)

        const combobox = getCategoriesComboBox()
        expect(combobox).toBeInTheDocument()

        const user = userEvent.setup()
        await user.click(combobox!)
        
        expect(screen.getByRole('option', { name: /all/i })).toBeInTheDocument()
        categories.forEach(category => {
            expect(screen.getByRole('option', { name: category.name })).toBeInTheDocument()
        })
    })

    it('should render products', async () => {
        const { getProductsSkeleton } = renderComponent()

        await waitForElementToBeRemoved(getProductsSkeleton)

        products.forEach((product) => {
            expect(screen.getByText(product.name)).toBeInTheDocument()
        })
    })

    it('should filter products by category', async () => {
        const { getCategoriesSkeleton, getCategoriesComboBox } = renderComponent()

        await waitForElementToBeRemoved(getCategoriesSkeleton)
        const combobox = getCategoriesComboBox()
        const user = userEvent.setup()
        await user.click(combobox!)

        const selectedCategory = categories[0]
        const option = screen.getByRole('option', { name: selectedCategory.name })
        await user.click(option)

        const products = db.product.findMany({
            where: {
                categoryId: { equals: selectedCategory.id }
            }
        })
        const rows = screen.getAllByRole('row')
        const dataRows = rows.slice(1)
        expect(dataRows).toHaveLength(products.length)

        products.forEach(product => {
            expect(screen.getByText(product.name)).toBeInTheDocument()
        })
    })

    it('should render all products if All category is selected', async () => {
        const { getCategoriesSkeleton, getCategoriesComboBox } = renderComponent()

        await waitForElementToBeRemoved(getCategoriesSkeleton)
        const combobox = getCategoriesComboBox()
        const user = userEvent.setup()
        await user.click(combobox!)

        const option = screen.getByRole('option', { name: /all/i })
        await user.click(option)

        const products = db.product.getAll()
        const rows = screen.getAllByRole('row')
        const dataRows = rows.slice(1)
        expect(dataRows).toHaveLength(products.length)

        products.forEach(product => {
            expect(screen.getByText(product.name)).toBeInTheDocument()
        })
    })
})
