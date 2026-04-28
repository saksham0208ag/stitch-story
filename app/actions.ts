"use server";

import { revalidatePath } from "next/cache";
import {
  DEFAULT_LOOKBOOK_ART,
  readDb,
  saveUploadedLookbookAsset,
  writeDb,
} from "@/lib/stitch-story";
import {
  measurementFields,
  orderStatuses,
  type MeasurementRecord,
} from "@/lib/stitch-story-schema";

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const INITIAL_ACTION_STATE: ActionState = {
  status: "idle",
  message: "",
};

function parseMetricValue(rawValue: FormDataEntryValue | null) {
  const value = Number.parseFloat(String(rawValue ?? "").trim());
  return Number.isFinite(value) ? value : Number.NaN;
}

function appendNotification(
  db: Awaited<ReturnType<typeof readDb>>,
  email: string,
  title: string,
  message: string,
) {
  db.notifications.unshift({
    id: crypto.randomUUID(),
    email,
    title,
    message,
    createdAt: new Date().toISOString(),
  });
}

export async function saveMeasurements(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const clientName = String(formData.get("clientName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!clientName || !email) {
    return {
      status: "error",
      message: "Client name and email are required to build a measurement vault.",
    };
  }

  const metrics = measurementFields.reduce<MeasurementRecord>((record, field) => {
    record[field.key] = parseMetricValue(formData.get(field.key));
    return record;
  }, {} as MeasurementRecord);

  if (Object.values(metrics).some((value) => Number.isNaN(value) || value <= 0)) {
    return {
      status: "error",
      message: "Every measurement must be added as a positive number in inches.",
    };
  }

  const db = await readDb();
  const existingProfile = db.measurements.find((profile) => profile.email === email);

  if (existingProfile) {
    existingProfile.clientName = clientName;
    existingProfile.notes = notes;
    existingProfile.updatedAt = new Date().toISOString();
    existingProfile.metrics = metrics;
  } else {
    db.measurements.unshift({
      id: crypto.randomUUID(),
      clientName,
      email,
      notes,
      metrics,
      updatedAt: new Date().toISOString(),
    });
  }

  appendNotification(
    db,
    email,
    "Measurement vault updated",
    "Your latest fit profile is saved and ready for future Stitch Story orders.",
  );

  await writeDb(db);
  revalidatePath("/");
  revalidatePath("/atelier");

  return {
    status: "success",
    message: "Measurements saved. Your vault is ready for the next order.",
  };
}

export async function bookAppointment(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const clientName = String(formData.get("clientName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const appointmentType = String(formData.get("appointmentType") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!clientName || !email || !date || !time || !appointmentType) {
    return {
      status: "error",
      message: "Name, email, date, time, and consultation type are required.",
    };
  }

  const db = await readDb();
  const conflict = db.appointments.some(
    (appointment) => appointment.date === date && appointment.time === time,
  );

  if (conflict) {
    return {
      status: "error",
      message: "That slot was just taken. Choose another one and we will reserve it.",
    };
  }

  db.appointments.push({
    id: crypto.randomUUID(),
    clientName,
    email,
    date,
    time,
    appointmentType,
    notes,
    createdAt: new Date().toISOString(),
  });

  appendNotification(
    db,
    email,
    "Consultation confirmed",
    `Your ${appointmentType.toLowerCase()} is booked for ${date} at ${time}.`,
  );

  await writeDb(db);
  revalidatePath("/");
  revalidatePath("/atelier");

  return {
    status: "success",
    message: "Appointment booked. The atelier calendar updated instantly.",
  };
}

export async function requestCustomization(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim().toLowerCase();
  const designId = String(formData.get("designId") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!customerName || !customerEmail || !designId) {
    return {
      status: "error",
      message: "Add your name, email, and a design selection to request customization.",
    };
  }

  const db = await readDb();
  const design = db.designs.find((item) => item.id === designId);

  if (!design) {
    return {
      status: "error",
      message: "We could not find that design. Pick another lookbook piece.",
    };
  }

  db.orders.unshift({
    id: crypto.randomUUID(),
    customerName,
    customerEmail,
    designId: design.id,
    designTitle: design.title,
    status: "Consult Requested",
    eventDate,
    notes,
    createdAt: new Date().toISOString(),
  });

  appendNotification(
    db,
    customerEmail,
    "Customization request received",
    `${design.title} is now with the atelier for design review and fit planning.`,
  );

  await writeDb(db);
  revalidatePath("/");
  revalidatePath("/atelier");

  return {
    status: "success",
    message: "Customization request sent. The order now appears in the atelier dashboard.",
  };
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "").trim();
  const nextStatus = String(formData.get("status") ?? "").trim();
  const validatedStatus = orderStatuses.find((status) => status === nextStatus);

  if (!orderId || !validatedStatus) {
    return;
  }

  const db = await readDb();
  const order = db.orders.find((item) => item.id === orderId);

  if (!order) {
    return;
  }

  order.status = validatedStatus;
  appendNotification(
    db,
    order.customerEmail,
    "Order status updated",
    `${order.designTitle} moved to "${nextStatus}" in the atelier timeline.`,
  );

  await writeDb(db);
  revalidatePath("/");
  revalidatePath("/atelier");
}

export async function toggleTrending(formData: FormData) {
  const designId = String(formData.get("designId") ?? "").trim();

  if (!designId) {
    return;
  }

  const db = await readDb();
  const design = db.designs.find((item) => item.id === designId);

  if (!design) {
    return;
  }

  design.trending = !design.trending;
  await writeDb(db);
  revalidatePath("/");
  revalidatePath("/atelier");
}

export async function addDesign(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const silhouette = String(formData.get("silhouette") ?? "").trim();
  const fabric = String(formData.get("fabric") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const leadTime = String(formData.get("leadTime") ?? "").trim();
  const palette = String(formData.get("palette") ?? "").trim();
  const trending = formData.get("trending") === "on";
  const designImage = formData.get("designImage");

  if (!title || !category || !silhouette || !fabric || !description || !leadTime) {
    return {
      status: "error",
      message: "Add the design essentials so the atelier can publish it confidently.",
    };
  }

  const image =
    designImage instanceof File && designImage.size > 0
      ? await saveUploadedLookbookAsset(designImage)
      : DEFAULT_LOOKBOOK_ART;

  const db = await readDb();
  db.designs.unshift({
    id: `design-${crypto.randomUUID().slice(0, 8)}`,
    title,
    category,
    silhouette,
    fabric,
    description,
    leadTime,
    image: image ?? DEFAULT_LOOKBOOK_ART,
    palette: palette || "Sandstone / Rose / Brass",
    trending,
  });

  await writeDb(db);
  revalidatePath("/");
  revalidatePath("/atelier");

  return {
    status: "success",
    message: "New lookbook design published without touching the code.",
  };
}
