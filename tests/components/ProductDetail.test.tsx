import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import ProductDetail from '../../src/components/ProductDetail'
import { delay, http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { db } from '../mocks/db'
import AllProviders from '../AllProviders'

describe('ProductDetail', () => {
    const productIds: number[] = []

    beforeAll(() => {
        [1, 2, 3].forEach(() => {
            const product = db.product.create()
            productIds.push(product.id)
        })
    })

    afterAll(() => {
        db.product.delete({ where: { id: { in: productIds }}})
    })

    it('should render product details', async () => {
        const product = db.product.findFirst({ where: { id: { equals: productIds[0] } }})
        const id = product?.id as number
        render(<ProductDetail productId={id}/>, { wrapper: AllProviders })

        expect(await screen.findByText(new RegExp(product!.name))).toBeInTheDocument()
        expect(await screen.findByText(new RegExp(product!.price.toString()))).toBeInTheDocument()
    })

    it('should render message if product not found', async () => {
        server.use(http.get('products/1', () => {
            return HttpResponse.json(null)
        }))
        render(<ProductDetail productId={1}/>, { wrapper: AllProviders })

        expect(await screen.findByText(/not found/i)).toBeInTheDocument()
    })

    it('should render an error for invalid productId', async () => {
        render(<ProductDetail productId={0}/>, { wrapper: AllProviders })

        expect(await screen.findByText(/error/i)).toBeInTheDocument()
    })
    
    it('should render an error message when there is an error', async () => {
        server.use(http.get('products/1', () => HttpResponse.error()))

        render(<ProductDetail productId={1}/>, { wrapper: AllProviders })

        expect(await screen.findByText(/error/i)).toBeInTheDocument()
    })

    it('should render a loading indicator when fetching the data', async () => {
        server.use(http.get('/products/1', async () => {
            await delay()
            return HttpResponse.json([])
        }))

        render(<ProductDetail productId={1}/>, { wrapper: AllProviders })

        expect(await screen.findByText(/loading/i)).toBeInTheDocument()
    })

    it('should remove the loading indicator when data is fetched', () => {
        render(<ProductDetail productId={1}/>, { wrapper: AllProviders })

        waitForElementToBeRemoved(() => screen.getByText(/loading/i))
    })

    it('should remove the loading indicator if data fetching fails', () => {
        server.use(http.get('/products/1', () => HttpResponse.error()))

        render(<ProductDetail productId={1}/>, { wrapper: AllProviders })

        waitForElementToBeRemoved(() => screen.getByText(/loading/i))
    })
})