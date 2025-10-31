import { Shops } from "./shop";

export type Categories = {
    id: string;
    categoryName: string;
    shopId: string;
    shop: Shops[];
}