// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Entity types (mirrors Prisma but without internal fields)
export interface HomeResponse {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  homeType: string | null;
  yearBuilt: number | null;
  squareFeet: number | null;
  photoUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    rooms: number;
    items: number;
  };
}

export interface RoomResponse {
  id: string;
  homeId: string;
  name: string;
  roomType: string;
  floor: number | null;
  description: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

export interface ItemResponse {
  id: string;
  homeId: string;
  roomId: string | null;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  modelNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  warrantyExpiry: string | null;
  condition: string | null;
  description: string | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  room?: {
    id: string;
    name: string;
    roomType: string;
  } | null;
}
