export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberUser?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  startingPrice: number;
  endsAt: string;
  category: string;
  sellerId: string;
}

export interface Order {
  id: string;
  productId: string;
  product: Product;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
