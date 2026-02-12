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

// Type exports from schemas
export type CreateHomeInput = z.infer<typeof createHomeSchema>;
export type UpdateHomeInput = z.infer<typeof updateHomeSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
