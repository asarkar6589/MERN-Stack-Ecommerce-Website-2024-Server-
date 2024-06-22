export interface Product {
    id: string,
    name: string,
    quantity: number,
    price: number,
    photo: string
}
interface ShippingAddress {
    address: string,
    city: string,
    country: string,
    pinCode: number
}
export interface newOrderBody {
    user: string,
    product: Product[],
    discount: number,
    subTotal: number,
    shippingCharges: number,
    tax: number,
    shippingAddress: ShippingAddress,
    total: number
}
