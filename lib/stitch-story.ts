import { promises as fs } from "node:fs";
import path from "node:path";
import { type StitchStoryDb } from "@/lib/stitch-story-schema";

export const DEFAULT_LOOKBOOK_ART = "/lookbook/atelier-default.svg";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "stitch-story-db.json");
const UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads");
const INDIA_TIMEZONE = "Asia/Kolkata";

function toIndiaDateString(date: Date) {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: INDIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

const seedData: StitchStoryDb = {
  measurements: [
    {
      id: "vault-rina",
      clientName: "Rina Mehta",
      email: "rina@stitchstory.in",
      notes: "Prefers a graceful shoulder line and slightly eased waist on festive looks.",
      updatedAt: "2026-04-12T10:00:00.000Z",
      metrics: {
        neck: 13.5,
        chest: 36,
        waist: 30,
        hips: 40,
        shoulder: 15,
        sleeveLength: 22.5,
        inseam: 30,
      },
    },
    {
      id: "vault-isha",
      clientName: "Isha Bhandari",
      email: "isha@stitchstory.in",
      notes: "Likes structured bodices, fitted sleeves, and a higher natural waist emphasis.",
      updatedAt: "2026-04-13T15:30:00.000Z",
      metrics: {
        neck: 12.8,
        chest: 34,
        waist: 28,
        hips: 38,
        shoulder: 14.5,
        sleeveLength: 21.8,
        inseam: 29.5,
      },
    },
  ],
  appointments: [
    {
      id: "appt-rina",
      clientName: "Rina Mehta",
      email: "rina@stitchstory.in",
      date: toIndiaDateString(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      time: "13:30",
      appointmentType: "In-Store Consultation",
      notes: "Bridal skirt flare check with dupatta drape options.",
      createdAt: "2026-04-14T11:15:00.000Z",
    },
    {
      id: "appt-isha",
      clientName: "Isha Bhandari",
      email: "isha@stitchstory.in",
      date: toIndiaDateString(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
      time: "16:00",
      appointmentType: "Virtual Fitting",
      notes: "Sleeve refinement and neckline discussion for reception jacket set.",
      createdAt: "2026-04-14T15:40:00.000Z",
    },
  ],
  designs: [
    {
      id: "SS-BR-108",
      title: "Amber Sitara Lehenga",
      category: "Bridal",
      silhouette: "Panelled lehenga with sculpted blouse",
      fabric: "Raw silk, organza, and dabka embroidery",
      description:
        "A Jaipur bridal statement with antique gold detailing and a fluid organza drape.",
      leadTime: "4-6 weeks",
      image: "/lookbook/amber-sitara.svg",
      palette: "Amber / Antique Gold / Rose",
      trending: true,
    },
    {
      id: "SS-IW-214",
      title: "Pink City Cape Set",
      category: "Indo-Western",
      silhouette: "Structured corset, draped skirt, embellished cape",
      fabric: "Crepe satin and hand-cut mukaish",
      description:
        "Designed for destination soirees with a sharp Jaipur edge and a floaty cape line.",
      leadTime: "3-4 weeks",
      image: "/lookbook/pink-city-cape.svg",
      palette: "Rose / Sandstone / Brass",
      trending: true,
    },
    {
      id: "SS-OC-317",
      title: "Marble Courtyard Saree Gown",
      category: "Occasion",
      silhouette: "Pre-draped saree gown with statement pallu",
      fabric: "Textured georgette and tonal sequins",
      description:
        "An elegant pre-stitched silhouette for cocktail evenings and luxury resort celebrations.",
      leadTime: "2-3 weeks",
      image: "/lookbook/marble-courtyard.svg",
      palette: "Ivory / Bronze / Stone",
      trending: false,
    },
    {
      id: "SS-FE-411",
      title: "Sanganeri Mehfil Jacket",
      category: "Festive",
      silhouette: "Printed long jacket with sharara set",
      fabric: "Cotton silk with gota accents",
      description:
        "A festive fusion set with hand-block charm, ideal for intimate celebrations and pujas.",
      leadTime: "10-14 days",
      image: "/lookbook/sanganeri-mehfil.svg",
      palette: "Terracotta / Cream / Emerald",
      trending: false,
    },
  ],
  orders: [
    {
      id: "order-rina-1",
      customerName: "Rina Mehta",
      customerEmail: "rina@stitchstory.in",
      designId: "SS-BR-108",
      designTitle: "Amber Sitara Lehenga",
      status: "Fabric Sourced",
      eventDate: "2026-05-22",
      notes: "Customer requested a second dupatta styling option and softer sleeve finish.",
      createdAt: "2026-04-12T12:00:00.000Z",
    },
    {
      id: "order-isha-1",
      customerName: "Isha Bhandari",
      customerEmail: "isha@stitchstory.in",
      designId: "SS-IW-214",
      designTitle: "Pink City Cape Set",
      status: "In Stitching",
      eventDate: "2026-05-03",
      notes: "Need a detachable cape fastening for a faster outfit change.",
      createdAt: "2026-04-13T10:30:00.000Z",
    },
  ],
  notifications: [
    {
      id: "note-rina-1",
      email: "rina@stitchstory.in",
      title: "Fabric sourced",
      message: "Your Amber Sitara Lehenga fabrics have been sourced and swatches are ready.",
      createdAt: "2026-04-13T09:30:00.000Z",
    },
    {
      id: "note-isha-1",
      email: "isha@stitchstory.in",
      title: "In stitching",
      message: "Your Pink City Cape Set is now with the stitching team for construction.",
      createdAt: "2026-04-14T08:20:00.000Z",
    },
  ],
};

async function ensureDataFile() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(seedData, null, 2), "utf8");
  }
}

export async function readDb() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as StitchStoryDb;
}

export async function writeDb(data: StitchStoryDb) {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function saveUploadedLookbookAsset(file: File) {
  if (!file || file.size === 0) {
    return null;
  }

  await fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const fileName = `${Date.now()}-${safeName}`;
  const outputPath = path.join(UPLOAD_DIRECTORY, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(outputPath, bytes);
  return `/uploads/${fileName}`;
}

export function getUpcomingDates(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + index);
    return toIndiaDateString(nextDate);
  });
}
