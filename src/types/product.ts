export interface NewProductBody {
    name: string,
    stock: number,
    price: number,
    photo: string,
    description: string,
    category: string,
    brand: string
}

export interface BaseQueryType {
    name?: {
        $regex: string,
        $options: string
    },
    price?: {
        $lte: number
    },
    category?: string,
    brand?: string
}

export interface SearchQuery {
    name?: string,
    sort?: string,
    price?: number,
    category?: string,
    brand?: string,
    page: string
}