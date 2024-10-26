import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuantitySelector from '../../src/components/QuantitySelector'
import { Product } from '../../src/entities'
import { CartProvider } from '../../src/providers/CartProvider'
import { db } from '../mocks/db'

describe('Quantity Selector', () => {
    let product: Product;

    beforeAll(() => {
        product = db.product.create({ id: 1 })
    })

    afterAll(() => {
        db.product.delete({ where: { id: { equals: 1 }}})
    })

    const renderComponent = () => {
        render(
            <CartProvider>
                <QuantitySelector product={product}/>
            </CartProvider>
        )

        return {
            addToCartButton: () => screen.getByRole('button', { name: /add to cart/i }),
            getQuantityControls: () => ({
                quantity: screen.queryByRole('status'),
                incrementButton: screen.queryByRole('button', { name: '+' }),
                decrementButton: screen.queryByRole('button', { name: '-' })
            }),
            user: userEvent.setup(),
        }
    }

    it('should render buttons to add, remove and show current quantity when clicking Add To Cart', async () => {
        const { addToCartButton, user, getQuantityControls } = renderComponent()
        
        await user.click(addToCartButton())
        const { decrementButton, incrementButton, quantity} = getQuantityControls()

        expect(quantity).toHaveTextContent('1')
        expect(incrementButton).toBeInTheDocument()
        expect(decrementButton).toBeInTheDocument()
        // expect(addToCartButton).not.toBeInTheDocument()
    })

    it('should increment the quantity', async () => {
        const { addToCartButton, user, getQuantityControls } = renderComponent()
        await user.click(addToCartButton())
        
        const { incrementButton, quantity} = getQuantityControls()
        await user.click(incrementButton!)

        expect(quantity).toHaveTextContent('2')
    })

    it('should decrement quantity', async () => {
        const { addToCartButton, user, getQuantityControls } = renderComponent()
        await user.click(addToCartButton())
        const { incrementButton, decrementButton, quantity} = getQuantityControls()
        await user.click(incrementButton!)

        await user.click(decrementButton!)

        expect(quantity).toHaveTextContent('1')
    })

    it('should remove the product from the cart', async () => {
        const { addToCartButton, user, getQuantityControls } = renderComponent()
        await user.click(addToCartButton())
        const { decrementButton, incrementButton, quantity } = getQuantityControls()

        await user.click(decrementButton!)

        expect(addToCartButton()).toBeInTheDocument()
        expect(incrementButton).not.toBeInTheDocument()
        expect(decrementButton).not.toBeInTheDocument()
        expect(quantity).not.toBeInTheDocument()
    })
})