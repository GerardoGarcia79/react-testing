import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import delay from 'delay'
import { http, HttpResponse } from 'msw'
import CategoryList from '../../src/components/CategoryList'
import { Category } from '../../src/entities'
import AllProviders from '../AllProviders'
import { db } from '../mocks/db'
import { server } from '../mocks/server'

describe('CategoryList', () => {
    const renderComponent = () => {
        render(
            <CategoryList />,
            { wrapper: AllProviders}
        )
    }
    
    const simulateDelay = (endpoint: string) => server.use(http.get(endpoint, async () => {
        await delay(2000)
    }))
    
    const simulateError = (endpoint: string) => server.use(http.get(endpoint, () => HttpResponse.error()))
    
    const categories: Category[] = []

    beforeAll(() => {
        [1, 2].forEach(() => {
            const category = db.category.create()
            categories.push(category)
        })

    afterAll(() => {
        const categoryIds = categories.map(c => c.id)
        db.category.deleteMany({ where: { id: { in: categoryIds }}})
    })

    })

    it('should render a list a categories', async () => {
        renderComponent()

        await waitForElementToBeRemoved(() =>
            screen.queryByText(/loading/i)
        )

        categories.forEach((category) => {
            expect(screen.getByText(category.name)).toBeInTheDocument()
        })
    })

    it('should render a loading message when fetching categories', () => {
        simulateDelay('/categories')

        renderComponent()
        
        expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should render a error message if fetch categories fail', async () => {
        simulateError('/categories')

        renderComponent()

        expect(await screen.findByText(/error/i)).toBeInTheDocument()
    })
})