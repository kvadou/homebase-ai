export const HOME_TYPES = {
  single_family: "Single Family",
  townhouse: "Townhouse",
  condo: "Condo",
  apartment: "Apartment",
  duplex: "Duplex",
  mobile_home: "Mobile Home",
  other: "Other",
} as const;

export const ROOM_TYPES = {
  kitchen: "Kitchen",
  living_room: "Living Room",
  bedroom: "Bedroom",
  bathroom: "Bathroom",
  dining_room: "Dining Room",
  office: "Office",
  garage: "Garage",
  basement: "Basement",
  attic: "Attic",
  laundry: "Laundry Room",
  mudroom: "Mudroom",
  pantry: "Pantry",
  closet: "Closet",
  patio: "Patio/Deck",
  yard: "Yard",
  other: "Other",
} as const;

export const ITEM_CATEGORIES = {
  appliance: "Appliance",
  hvac: "HVAC",
  plumbing: "Plumbing",
  electrical: "Electrical",
  furniture: "Furniture",
  electronics: "Electronics",
  outdoor: "Outdoor",
  safety: "Safety & Security",
  structural: "Structural",
  flooring: "Flooring",
  window: "Window & Door",
  lighting: "Lighting",
  other: "Other",
} as const;

export const ITEM_CONDITIONS = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  needs_repair: "Needs Repair",
  non_functional: "Non-Functional",
} as const;

export const MAINTENANCE_PRIORITIES = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
} as const;

export const MAINTENANCE_STATUSES = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  skipped: "Skipped",
  overdue: "Overdue",
} as const;

export const SERVICE_REQUEST_STATUSES = {
  pending: "Pending",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export type HomeType = keyof typeof HOME_TYPES;
export type RoomType = keyof typeof ROOM_TYPES;
export type ItemCategory = keyof typeof ITEM_CATEGORIES;
export type ItemCondition = keyof typeof ITEM_CONDITIONS;
export type MaintenancePriority = keyof typeof MAINTENANCE_PRIORITIES;
export type MaintenanceStatus = keyof typeof MAINTENANCE_STATUSES;
export type ServiceRequestStatus = keyof typeof SERVICE_REQUEST_STATUSES;
