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

// Maintenance types
export interface MaintenanceTaskResponse {
  id: string;
  itemId: string;
  title: string;
  description: string | null;
  frequency: string | null;
  nextDueDate: string | null;
  priority: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  item?: {
    id: string;
    name: string;
    category: string;
    brand: string | null;
    room?: { id: string; name: string } | null;
  };
  logs?: MaintenanceLogResponse[];
}

export interface MaintenanceLogResponse {
  id: string;
  taskId: string;
  notes: string | null;
  cost: number | null;
  performedAt: string;
  performedBy: string | null;
  createdAt: string;
}

// Chat types
export interface ChatSessionResponse {
  id: string;
  userId: string;
  homeId: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessageResponse[];
  _count?: {
    messages: number;
  };
}

export interface ChatMessageResponse {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// Manual types
export interface ManualResponse {
  id: string;
  title: string;
  brand: string | null;
  model: string | null;
  fileUrl: string | null;
  sourceUrl: string | null;
  fileType: string | null;
  pageCount: number | null;
  createdAt: string;
  updatedAt: string;
  items?: Array<{ id: string; name: string }>;
  _count?: {
    chunks: number;
  };
}

// Provider types
export interface ProviderResponse {
  id: string;
  name: string;
  company: string | null;
  specialty: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  reviews?: ProviderReviewResponse[];
  availability?: ProviderAvailabilityResponse[];
}

export interface ProviderReviewResponse {
  id: string;
  providerId: string;
  rating: number;
  comment: string | null;
  authorName: string | null;
  createdAt: string;
}

export interface ProviderAvailabilityResponse {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// Service request types
export interface ServiceRequestResponse {
  id: string;
  homeId: string;
  providerId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  cost: number | null;
  createdAt: string;
  updatedAt: string;
  provider?: ProviderResponse | null;
}

// Notification types
export interface NotificationResponse {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

// Home invitation types
export interface HomeInvitationResponse {
  id: string;
  homeId: string;
  email: string;
  role: string;
  status: string;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  home?: { id: string; name: string };
}

// Home member types
export interface HomeMemberResponse {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

// Analytics types
export interface HomeAnalyticsResponse {
  homeHealthScore: number;
  maintenanceCompliance: number;
  totalItemValue: number;
  warrantyFreshness: number;
  monthlySpending: Array<{ month: string; amount: number }>;
  categoryBreakdown: Array<{ category: string; count: number; value: number }>;
  maintenanceTrends: Array<{ month: string; completed: number; overdue: number }>;
}

// Home passport types
export interface HomePassportResponse {
  id: string;
  homeId: string;
  generatedAt: string | null;
  shareToken: string | null;
  shareExpiresAt: string | null;
  isPublic: boolean;
  data: Record<string, unknown>;
  home: HomeResponse & {
    rooms: RoomResponse[];
    items: ItemResponse[];
  };
}

// Recall types
export interface ItemRecallResponse {
  id: string;
  itemId: string;
  title: string;
  description: string | null;
  severity: string | null;
  recallDate: string | null;
  sourceUrl: string | null;
  createdAt: string;
  item?: { id: string; name: string; brand: string | null; model: string | null };
}

// AI Repair Help types
export interface RepairHelpResponse {
  diagnosis: string;
  steps: string[];
  difficulty: "easy" | "moderate" | "hard" | "professional";
  estimatedTime: string;
  toolsNeeded: string[];
  safetyWarnings: string[];
  videos: Array<{
    title: string;
    url: string;
    source: string;
    description: string;
  }>;
  articles: Array<{
    title: string;
    url: string;
    source: string;
  }>;
  partsNeeded: Array<{
    name: string;
    estimatedPrice: string;
    searchUrl: string;
  }>;
}

// Subscription types
export interface SubscriptionResponse {
  id: string;
  userId: string;
  plan: string;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface PlanUsageResponse {
  plan: string;
  usage: {
    homes: { used: number; limit: number };
    items: { used: number; limit: number };
    aiScans: { used: number; limit: number };
    members: { used: number; limit: number };
  };
}

// Scan result type
export interface ScanResultResponse {
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  description: string;
  condition: string;
  estimatedAge: string | null;
}
