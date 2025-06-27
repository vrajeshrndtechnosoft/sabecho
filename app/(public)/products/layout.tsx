import React from 'react'

interface ProductLayoutProps {
  children: React.ReactNode
}

const ProductLayout : React.FC<ProductLayoutProps> = ({ children }) => {
  return (
    <>
    {children}
    </>
  )
}

export default ProductLayout