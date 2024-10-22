import { render, screen } from '@testing-library/react'
import ProductDetail from '../../src/components/ProductDetail'
import { products } from '../mocks/data'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'

describe('ProductDetail', () => {
    it('should render the product description', async () => {
        render(<ProductDetail productId={1}/>)

        expect(await screen.findByText(new RegExp(products[0].name))).toBeInTheDocument()
        expect(await screen.findByText(new RegExp(products[0].price.toString()))).toBeInTheDocument()
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