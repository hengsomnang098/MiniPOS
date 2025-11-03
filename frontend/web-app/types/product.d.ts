export interface Product {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    costPrice?: number;
    categoryId?: string;
    categoryName?: string;
    serviceId?: string;
    serviceName?: string;
    imageUrl?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}
