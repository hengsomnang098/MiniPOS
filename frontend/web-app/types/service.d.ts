import { Categories } from "./category";

export type Services ={
    id: string;
    name: string;
    categoryId: string;
    category:Categories[];
}