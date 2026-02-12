import { z } from "zod";

// Home schemas
export const createHomeSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(100).default("US"),
  homeType: z.string().optional(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  squareFeet: z.number().int().positive().optional(),
  photoUrl: z.string().url().optional(),
  description: z.string().max(2000).optional(),
});

export const updateHomeSchema = createHomeSchema.partial();

// Room schemas
export const createRoomSchema = z.object({
  homeId: z.string().min(1, "Home ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  roomType: z.string().min(1, "Room type is required"),
  floor: z.number().int().optional().default(1),
  description: z.string().max(2000).optional(),
  photoUrl: z.string().url().optional(),
});

export const updateRoomSchema = createRoomSchema.omit({ homeId: true }).partial();

// Item schemas
export const createItemSchema = z.object({
  homeId: z.string().min(1, "Home ID is required"),
  roomId: z.string().optional(),
  name: z.string().min(1, "Name is required").max(300),
  category: z.string().min(1, "Category is required"),
  brand: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  serialNumber: z.string().max(200).optional(),
  modelNumber: z.string().max(200).optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().positive().optional(),
  warrantyExpiry: z.string().optional(),
  condition: z.string().optional().default("good"),
  description: z.string().max(5000).optional(),
  photoUrl: z.string().url().optional(),
  notes: z.string().max(5000).optional(),
});

export const updateItemSchema = createItemSchema.omit({ homeId: true }).partial();

// Maintenance schemas
export const createMaintenanceTaskSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(5000).optional(),
  frequency: z.string().optional(),
  nextDueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed", "skipped", "overdue"]).default("pending"),
});

export const updateMaintenanceTaskSchema = createMaintenanceTaskSchema
  .omit({ itemId: true })
  .partial();

export const createMaintenanceLogSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  notes: z.string().max(5000).optional(),
  cost: z.number().min(0).optional(),
  performedBy: z.string().max(200).optional(),
});

// Chat schemas
export const createChatSessionSchema = z.object({
  homeId: z.string().optional(),
  title: z.string().max(200).optional(),
});

export const sendChatMessageSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  content: z.string().min(1, "Message is required").max(10000),
});

// Manual schemas
export const createManualSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  brand: z.string().max(200).optional(),
  model: z.string().max(200).optional(),
  fileUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  fileType: z.string().max(50).optional(),
  pageCount: z.number().int().positive().optional(),
  itemIds: z.array(z.string()).optional(),
});

export const updateManualSchema = createManualSchema.partial();

// Provider schemas
export const createProviderSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  company: z.string().max(200).optional(),
  specialty: z.string().min(1, "Specialty is required").max(200),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().max(500).optional(),
});

export const updateProviderSchema = createProviderSchema.partial();

// Service request schemas
export const createServiceRequestSchema = z.object({
  homeId: z.string().min(1, "Home ID is required"),
  providerId: z.string().optional(),
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(5000).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  scheduledAt: z.string().optional(),
});

export const updateServiceRequestSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(["pending", "scheduled", "in_progress", "completed", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  providerId: z.string().optional(),
  scheduledAt: z.string().optional(),
  completedAt: z.string().optional(),
  cost: z.number().min(0).optional(),
});

// Provider review schemas
export const createProviderReviewSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  authorName: z.string().max(200).optional(),
});

// Type exports from schemas
export type CreateHomeInput = z.infer<typeof createHomeSchema>;
export type UpdateHomeInput = z.infer<typeof updateHomeSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type CreateMaintenanceTaskInput = z.infer<typeof createMaintenanceTaskSchema>;
export type UpdateMaintenanceTaskInput = z.infer<typeof updateMaintenanceTaskSchema>;
export type CreateMaintenanceLogInput = z.infer<typeof createMaintenanceLogSchema>;
export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
export type CreateManualInput = z.infer<typeof createManualSchema>;
export type UpdateManualInput = z.infer<typeof updateManualSchema>;
export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
export type UpdateServiceRequestInput = z.infer<typeof updateServiceRequestSchema>;
export type CreateProviderReviewInput = z.infer<typeof createProviderReviewSchema>;
