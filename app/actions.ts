"use server";

import { revalidatePath } from "next/cache";
import {
  createAppointmentBooking,
  createCustomizationOrder,
  DEFAULT_LOOKBOOK_ART,
  publishDesign,
  saveUploadedLookbookAsset,
  toggleDesignTrendingById,
  updateOrderStatusById,
  upsertMeasurementProfile,
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

  try {
    await upsertMeasurementProfile({
      clientName,
      email,
      notes,
      metrics,
    });
    revalidatePath("/");
    revalidatePath("/atelier");
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not save measurements right now. Please try again.",
    };
  }

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

  try {
    const result = await createAppointmentBooking({
      clientName,
      email,
      date,
      time,
      appointmentType,
      notes,
    });

    if (result === "conflict") {
      return {
        status: "error",
        message: "That slot was just taken. Choose another one and we will reserve it.",
      };
    }

    revalidatePath("/");
    revalidatePath("/atelier");
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not book that appointment right now. Please try again.",
    };
  }

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

  try {
    const result = await createCustomizationOrder({
      customerName,
      customerEmail,
      designId,
      eventDate,
      notes,
    });

    if (result === "missing-design") {
      return {
        status: "error",
        message: "We could not find that design. Pick another lookbook piece.",
      };
    }

    revalidatePath("/");
    revalidatePath("/atelier");
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not send that customization request right now. Please try again.",
    };
  }

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

  await updateOrderStatusById(orderId, validatedStatus);
  revalidatePath("/");
  revalidatePath("/atelier");
}

export async function toggleTrending(formData: FormData) {
  const designId = String(formData.get("designId") ?? "").trim();

  if (!designId) {
    return;
  }

  await toggleDesignTrendingById(designId);
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

  try {
    const image =
      designImage instanceof File && designImage.size > 0
        ? await saveUploadedLookbookAsset(designImage)
        : DEFAULT_LOOKBOOK_ART;

    await publishDesign({
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

    revalidatePath("/");
    revalidatePath("/atelier");
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not publish that design right now. Please try again.",
    };
  }

  return {
    status: "success",
    message: "New lookbook design published without touching the code.",
  };
}
