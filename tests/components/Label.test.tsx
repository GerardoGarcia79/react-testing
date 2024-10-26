import { render, screen } from '@testing-library/react'
import Label from '../../src/components/Label'
import { LanguageProvider } from '../../src/providers/language/LanguageProvider'
import { Language } from '../../src/providers/language/type'

describe('Label', () => {
    const renderComponent = (language: Language, label: string) => {
        render(
            <LanguageProvider language={language}>
                <Label labelId={label} />
            </LanguageProvider>
        )
    }

    it.each([
        {
            language: "en",
            label: 'welcome',
            content: /welcome/i
        },
        {
            language: "en",
            label: 'new_product',
            content: /new product/i
        },
        {
            language: "en",
            label: 'edit_product',
            content: /edit product/i
        },
        {
            language: "es",
            label: 'welcome',
            content: /bienvenidos/i
        },
        {
            language: "es",
            label: 'new_product',
            content: /nuevo producto/i
        },
        {
            language: "es",
            label: 'edit_product',
            content: /editar producto/i
        },
    ])('should render $content content given $language language', ({ language, label, content }) => {
        renderComponent(language as Language, label)

        expect(screen.getByRole('label')).toBeInTheDocument()
        expect(screen.getByRole('label')).toHaveTextContent(content)
    })

    it('should throw an error if given an invalid labelId', () => {
        expect(() => renderComponent('en', 'wel')).toThrowError()
    })
})