export const measurementFields = [
  { key: "neck", label: "Neck", placeholder: "13.5" },
  { key: "chest", label: "Chest", placeholder: "36" },
  { key: "waist", label: "Waist", placeholder: "30" },
  { key: "hips", label: "Hips", placeholder: "40" },
  { key: "shoulder", label: "Shoulder", placeholder: "15" },
  { key: "sleeveLength", label: "Sleeve Length", placeholder: "22.5" },
  { key: "inseam", label: "Inseam", placeholder: "30" },
] as const;

export const appointmentTimes = ["11:00", "13:30", "16:00", "18:30"] as const;
export const appointmentTypes = ["In-Store Consultation", "Virtual Fitting"] as const;
export const orderStatuses = [
  "Consult Requested",
  "Fabric Sourced",
  "In Stitching",
  "Ready for Trial",
  "Ready for Delivery",
] as const;

type MeasurementKey = (typeof measurementFields)[number]["key"];

export type MeasurementRecord = Record<MeasurementKey, number>;

export type MeasurementProfile = {
  id: string;
  clientName: string;
  email: string;
  notes: string;
  metrics: MeasurementRecord;
  updatedAt: string;
};

export type Appointment = {
  id: string;
  clientName: string;
  email: string;
  date: string;
  time: string;
  appointmentType: string;
  notes: string;
  createdAt: string;
};

export type Design = {
  id: string;
  title: string;
  category: string;
  silhouette: string;
  fabric: string;
  description: string;
  leadTime: string;
  image: string;
  palette: string;
  trending: boolean;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  designId: string;
  designTitle: string;
  status: (typeof orderStatuses)[number];
  eventDate: string;
  notes: string;
  createdAt: string;
};

export type NotificationEntry = {
  id: string;
  email: string;
  title: string;
  message: string;
  createdAt: string;
};

export type StitchStoryDb = {
  measurements: MeasurementProfile[];
  appointments: Appointment[];
  designs: Design[];
  orders: Order[];
  notifications: NotificationEntry[];
};

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

export function formatDateShort(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

export function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
