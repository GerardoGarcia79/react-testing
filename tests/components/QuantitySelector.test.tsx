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

        const user = userEvent.setup()

        const addToCartButton = () => screen.queryByRole('button', { name: /add to cart/i })

        const getQuantityControls = () => ({
            quantity: screen.queryByRole('status'),
            incrementButton: screen.queryByRole('button', { name: '+' }),
            decrementButton: screen.queryByRole('button', { name: '-' })
        })

        const addToCart = async () => {
            const button = addToCartButton()
            await user.click(button!)
        }

        const incrementQuantity = async () => {
            const { incrementButton } = getQuantityControls()
            await user.click(incrementButton!)
        }

        const decrementQuantity = async () => {
            const { decrementButton } = getQuantityControls()
            await user.click(decrementButton!)
        }

        return {
            addToCartButton,
            getQuantityControls,
            addToCart,
            incrementQuantity,
            decrementQuantity
        }
    }

    it('should render buttons to add, remove and show current quantity when clicking Add To Cart', async () => {
        const { getQuantityControls, addToCart, addToCartButton } = renderComponent()
        
        await addToCart()
        
        const { decrementButton, incrementButton, quantity} = getQuantityControls()

        expect(quantity).toHaveTextContent('1')
        expect(incrementButton).toBeInTheDocument()
        expect(decrementButton).toBeInTheDocument()
        expect(addToCartButton()).not.toBeInTheDocument()
    })

    it('should increment the quantity', async () => {
        const { getQuantityControls, addToCart, incrementQuantity } = renderComponent()
        await addToCart()
        
        await incrementQuantity()
        
        const { quantity } = getQuantityControls()
        expect(quantity).toHaveTextContent('2')
    })

    it('should decrement quantity', async () => {
        const { incrementQuantity, decrementQuantity, getQuantityControls, addToCart } = renderComponent()
        await addToCart()
        await incrementQuantity()
        
        await decrementQuantity()
        
        const { quantity} = getQuantityControls()
        expect(quantity).toHaveTextContent('1')
    })

    it('should remove the product from the cart', async () => {
        const { addToCartButton, addToCart, getQuantityControls, decrementQuantity } = renderComponent()
        await addToCart()
        
        await decrementQuantity()
        
        const { decrementButton, incrementButton, quantity } = getQuantityControls()
        expect(addToCartButton()).toBeInTheDocument()
        expect(incrementButton).not.toBeInTheDocument()
        expect(decrementButton).not.toBeInTheDocument()
        expect(quantity).not.toBeInTheDocument()
    })
})