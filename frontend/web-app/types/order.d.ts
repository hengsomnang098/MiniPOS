export interface OrderItemCreate {
  productId: string;
  quantity: number;
}

export interface OrderCreate {
  shopId: string;
  items: OrderItemCreate[];
  discount: number; // fixed amount discount
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface OrderDto {
  id: string;
  orderDate: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: string;
  items: OrderItemDto[];
}
