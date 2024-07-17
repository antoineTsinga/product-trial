export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: string;
  rating: number;
}

export class ProductImpl implements Product {
  id: number;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: string;
  rating: number;
  constructor() {
    this.price = 1;
    this.quantity = 1;
    this.rating = 1;
    this.inventoryStatus = "INSTOCK";
    this.category = "Accessories";
  }
}
