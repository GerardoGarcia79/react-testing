import { render, screen } from '@testing-library/react'
import ProductDetail from '../../src/components/ProductDetail'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { db } from '../mocks/db'

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
        render(<ProductDetail productId={id}/>)

        expect(await screen.findByText(new RegExp(product!.name))).toBeInTheDocument()
        expect(await screen.findByText(new RegExp(product!.price.toString()))).toBeInTheDocument()
    })

    it('should render message if product not found', async () => {
        server.use(http.get('products/1', () => {
            return HttpResponse.json(null)
        }))
        render(<ProductDetail productId={1}/>)

        expect(await screen.findByText(/not found/i)).toBeInTheDocument()
    })

    it('should render an error for invalid productId', async () => {
        render(<ProductDetail productId={0}/>)

        expect(await screen.findByText(/invalid/i)).toBeInTheDocument()
    })
})