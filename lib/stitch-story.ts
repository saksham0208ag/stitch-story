import { put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import postgres, { type Sql, type TransactionSql } from "postgres";
import {
  type Design,
  type MeasurementProfile,
  type MeasurementRecord,
  type NotificationEntry,
  type Order,
  type StitchStoryDb,
} from "@/lib/stitch-story-schema";

export const DEFAULT_LOOKBOOK_ART = "/lookbook/atelier-default.svg";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "stitch-story-db.json");
const UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads");
const INDIA_TIMEZONE = "Asia/Kolkata";
const DATABASE_URL =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

type MeasurementInput = {
  clientName: string;
  email: string;
  notes: string;
  metrics: MeasurementRecord;
};

type AppointmentInput = {
  clientName: string;
  email: string;
  date: string;
  time: string;
  appointmentType: string;
  notes: string;
};

type CustomizationInput = {
  customerName: string;
  customerEmail: string;
  designId: string;
  eventDate: string;
  notes: string;
};

type DesignInput = Omit<Design, "id">;

declare global {
  var stitchStorySql: Sql | undefined;
  var stitchStorySchemaReady: Promise<void> | undefined;
}

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

function hasDatabaseConfig() {
  return Boolean(DATABASE_URL);
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function requireProductionDatabase() {
  if (!hasDatabaseConfig() && isVercelRuntime()) {
    throw new Error(
      "Production storage is not configured. Set POSTGRES_URL or DATABASE_URL before deploying to Vercel.",
    );
  }
}

function getSqlClient() {
  if (!hasDatabaseConfig()) {
    return null;
  }

  if (!globalThis.stitchStorySql) {
    globalThis.stitchStorySql = postgres(DATABASE_URL, {
      max: 1,
      prepare: false,
      ssl: "require",
    });
  }

  return globalThis.stitchStorySql;
}

async function seedPostgres(sql: Sql) {
  await sql.begin(async (tx) => {
    for (const measurement of seedData.measurements) {
      await tx`
        INSERT INTO measurements (id, client_name, email, notes, metrics, updated_at)
        VALUES (
          ${measurement.id},
          ${measurement.clientName},
          ${measurement.email},
          ${measurement.notes},
          ${tx.json(measurement.metrics)},
          ${measurement.updatedAt}
        )
        ON CONFLICT (email) DO NOTHING
      `;
    }

    for (const appointment of seedData.appointments) {
      await tx`
        INSERT INTO appointments (id, client_name, email, date, time, appointment_type, notes, created_at)
        VALUES (
          ${appointment.id},
          ${appointment.clientName},
          ${appointment.email},
          ${appointment.date},
          ${appointment.time},
          ${appointment.appointmentType},
          ${appointment.notes},
          ${appointment.createdAt}
        )
        ON CONFLICT (date, time) DO NOTHING
      `;
    }

    for (const design of seedData.designs) {
      await tx`
        INSERT INTO designs (id, title, category, silhouette, fabric, description, lead_time, image, palette, trending)
        VALUES (
          ${design.id},
          ${design.title},
          ${design.category},
          ${design.silhouette},
          ${design.fabric},
          ${design.description},
          ${design.leadTime},
          ${design.image},
          ${design.palette},
          ${design.trending}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }

    for (const order of seedData.orders) {
      await tx`
        INSERT INTO orders (
          id,
          customer_name,
          customer_email,
          design_id,
          design_title,
          status,
          event_date,
          notes,
          created_at
        )
        VALUES (
          ${order.id},
          ${order.customerName},
          ${order.customerEmail},
          ${order.designId},
          ${order.designTitle},
          ${order.status},
          ${order.eventDate},
          ${order.notes},
          ${order.createdAt}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }

    for (const notification of seedData.notifications) {
      await tx`
        INSERT INTO notifications (id, email, title, message, created_at)
        VALUES (
          ${notification.id},
          ${notification.email},
          ${notification.title},
          ${notification.message},
          ${notification.createdAt}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  });
}

async function ensurePostgresStorage() {
  const sql = getSqlClient();

  if (!sql) {
    return;
  }

  if (!globalThis.stitchStorySchemaReady) {
    globalThis.stitchStorySchemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS measurements (
          id TEXT PRIMARY KEY,
          client_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          notes TEXT NOT NULL DEFAULT '',
          metrics JSONB NOT NULL,
          updated_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          client_name TEXT NOT NULL,
          email TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          appointment_type TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          UNIQUE (date, time)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS designs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          silhouette TEXT NOT NULL,
          fabric TEXT NOT NULL,
          description TEXT NOT NULL,
          lead_time TEXT NOT NULL,
          image TEXT NOT NULL,
          palette TEXT NOT NULL,
          trending BOOLEAN NOT NULL DEFAULT FALSE
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          design_id TEXT NOT NULL,
          design_title TEXT NOT NULL,
          status TEXT NOT NULL,
          event_date TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `;

      const [{ count }] = await sql<{ count: number }[]>`
        SELECT COUNT(*)::int AS count FROM designs
      `;

      if (count === 0) {
        await seedPostgres(sql);
      }
    })();
  }

  await globalThis.stitchStorySchemaReady;
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(seedData, null, 2), "utf8");
  }
}

async function readLocalDb() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as StitchStoryDb;
}

async function writeLocalDb(data: StitchStoryDb) {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function createNotification(email: string, title: string, message: string): NotificationEntry {
  return {
    id: crypto.randomUUID(),
    email,
    title,
    message,
    createdAt: new Date().toISOString(),
  };
}

async function insertNotificationRow(sql: Sql | TransactionSql, notification: NotificationEntry) {
  await sql`
    INSERT INTO notifications (id, email, title, message, created_at)
    VALUES (
      ${notification.id},
      ${notification.email},
      ${notification.title},
      ${notification.message},
      ${notification.createdAt}
    )
  `;
}

export async function readDb() {
  if (!hasDatabaseConfig()) {
    requireProductionDatabase();
    return readLocalDb();
  }

  await ensurePostgresStorage();
  const sql = getSqlClient();

  if (!sql) {
    return readLocalDb();
  }

  const [measurements, appointments, designs, orders, notifications] = await Promise.all([
    sql<MeasurementProfile[]>`
      SELECT
        id,
        client_name AS "clientName",
        email,
        notes,
        metrics,
        updated_at AS "updatedAt"
      FROM measurements
      ORDER BY updated_at DESC
    `,
    sql<StitchStoryDb["appointments"]>`
      SELECT
        id,
        client_name AS "clientName",
        email,
        date,
        time,
        appointment_type AS "appointmentType",
        notes,
        created_at AS "createdAt"
      FROM appointments
      ORDER BY date ASC, time ASC
    `,
    sql<Design[]>`
      SELECT
        id,
        title,
        category,
        silhouette,
        fabric,
        description,
        lead_time AS "leadTime",
        image,
        palette,
        trending
      FROM designs
      ORDER BY title ASC
    `,
    sql<Order[]>`
      SELECT
        id,
        customer_name AS "customerName",
        customer_email AS "customerEmail",
        design_id AS "designId",
        design_title AS "designTitle",
        status,
        event_date AS "eventDate",
        notes,
        created_at AS "createdAt"
      FROM orders
      ORDER BY created_at DESC
    `,
    sql<NotificationEntry[]>`
      SELECT
        id,
        email,
        title,
        message,
        created_at AS "createdAt"
      FROM notifications
      ORDER BY created_at DESC
    `,
  ]);

  return {
    measurements,
    appointments,
    designs,
    orders,
    notifications,
  };
}

export async function upsertMeasurementProfile(input: MeasurementInput) {
  if (!hasDatabaseConfig()) {
    requireProductionDatabase();
    const db = await readLocalDb();
    const existingProfile = db.measurements.find((profile) => profile.email === input.email);
    const updatedAt = new Date().toISOString();

    if (existingProfile) {
      existingProfile.clientName = input.clientName;
      existingProfile.notes = input.notes;
      existingProfile.metrics = input.metrics;
      existingProfile.updatedAt = updatedAt;
    } else {
      db.measurements.unshift({
        id: crypto.randomUUID(),
        clientName: input.clientName,
        email: input.email,
        notes: input.notes,
        metrics: input.metrics,
        updatedAt,
      });
    }

    db.notifications.unshift(
      createNotification(
        input.email,
        "Measurement vault updated",
        "Your latest fit profile is saved and ready for future Stitch Story orders.",
      ),
    );

    await writeLocalDb(db);
    return;
  }

  await ensurePostgresStorage();
  const sql = getSqlClient();

  if (!sql) {
    return;
  }

  const updatedAt = new Date().toISOString();
  const notification = createNotification(
    input.email,
    "Measurement vault updated",
    "Your latest fit profile is saved and ready for future Stitch Story orders.",
  );

  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO measurements (id, client_name, email, notes, metrics, updated_at)
      VALUES (
        ${crypto.randomUUID()},
        ${input.clientName},
        ${input.email},
        ${input.notes},
        ${tx.json(input.metrics)},
        ${updatedAt}
      )
      ON CONFLICT (email) DO UPDATE
      SET
        client_name = EXCLUDED.client_name,
        notes = EXCLUDED.notes,
        metrics = EXCLUDED.metrics,
        updated_at = EXCLUDED.updated_at
    `;
    await insertNotificationRow(tx, notification);
  });
}

export async function createAppointmentBooking(input: AppointmentInput) {
  if (!hasDatabaseConfig()) {
    requireProductionDatabase();
    const db = await readLocalDb();
    const conflict = db.appointments.some(
      (appointment) => appointment.date === input.date && appointment.time === input.time,
    );

    if (conflict) {
      return "conflict" as const;
    }

    db.appointments.push({
      id: crypto.randomUUID(),
      clientName: input.clientName,
      email: input.email,
      date: input.date,
      time: input.time,
      appointmentType: input.appointmentType,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    });
    db.notifications.unshift(
      createNotification(
        input.email,
        "Consultation confirmed",
        `Your ${input.appointmentType.toLowerCase()} is booked for ${input.date} at ${input.time}.`,
      ),
    );

    await writeLocalDb(db);
    return "booked" as const;
  }

  await ensurePostgresStorage();
  const sql = getSqlClient();

  if (!sql) {
    return "conflict" as const;
  }

  const appointmentId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const notification = createNotification(
    input.email,
    "Consultation confirmed",
    `Your ${input.appointmentType.toLowerCase()} is booked for ${input.date} at ${input.time}.`,
  );

  const booked = await sql.begin(async (tx) => {
    const inserted = await tx<{ id: string }[]>`
      INSERT INTO appointments (id, client_name, email, date, time, appointment_type, notes, created_at)
      VALUES (
        ${appointmentId},
        ${input.clientName},
        ${input.email},
        ${input.date},
        ${input.time},
        ${input.appointmentType},
        ${input.notes},
        ${createdAt}
      )
      ON CONFLICT (date, time) DO NOTHING
      RETURNING id
    `;

    if (!inserted.length) {
      return false;
    }

    await insertNotificationRow(tx, notification);
    return true;
  });

  return booked ? ("booked" as const) : ("conflict" as const);
}

export async function createCustomizationOrder(input: CustomizationInput) {
  if (!hasDatabaseConfig()) {
    requireProductionDatabase();
    const db = await readLocalDb();
    const design = db.designs.find((item) => item.id === input.designId);

    if (!design) {
      return "missing-design" as const;
    }

    db.orders.unshift({
      id: crypto.randomUUID(),
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      designId: design.id,
      designTitle: design.title,
      status: "Consult Requested",
      eventDate: input.eventDate,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    });
    db.notifications.unshift(
      createNotification(
        input.customerEmail,
        "Customization request received",
        `${design.title} is now with the atelier for design review and fit planning.`,
      ),
    );

    await writeLocalDb(db);
    return "created" as const;
  }

  await ensurePostgresStorage();
  const sql = getSqlClient();

  if (!sql) {
    return "missing-design" as const;
  }

  const result = await sql.begin(async (tx) => {
    const [design] = await tx<{ title: string }[]>`
      SELECT title FROM designs WHERE id = ${input.designId} LIMIT 1
    `;

    if (!design) {
      return "missing-design" as const;
    }

    const createdAt = new Date().toISOString();
    await tx`
      INSERT INTO orders (
        id,
        customer_name,
        customer_email,
        design_id,
        design_title,
        status,
        event_date,
        notes,
        created_at
      )
      VALUES (
        ${crypto.randomUUID()},
        ${input.customerName},
        ${input.customerEmail},
        ${input.designId},
        ${design.title},
        ${"Consult Requested"},
        ${input.eventDate},
        ${input.notes},
        ${createdAt}
      )
    `;
    await insertNotificationRow(
      tx,
      createNotification(
        input.customerEmail,
        "Customization request received",
        `${design.title} is now with the atelier for design review and fit planning.`,
      ),
    );
    return "created" as const;
  });

  return result;
}

export async function updateOrderStatusById(orderId: string, nextStatus: Order["status"]) {
  if (!hasDatabaseConfig()) {
    requireProductionDatabase();
    const db = await readLocalDb();
    const order = db.orders.find((item) => item.id === orderId);

    if (!order) {
      return false;
    }

    order.status = nextStatus;
    db.notifications.unshift(
      createNotification(
        order.customerEmail,
        "Order status updated",
        `${order.designTitle} moved to "${nextStatus}" in the atelier timeline.`,
      ),
    );

    await writeLocalDb(db);
    return true;
  }

  await ensurePostgresStorage();
  const sql = getSqlClient();

  if (!sql) {
    return false;
  }

  const updated = await sql.begin(async (tx) => {
    const [order] = await tx<{ customerEmail: string; designTitle: string }[]>`
      UPDATE orders
      SET status = ${nextStatus}
      WHERE id = ${orderId}
      RETURNING
        customer_email AS "customerEmail",
        design_title AS "designTitle"
    `;

    if (!order) {
      return false;
    }

    await insertNotificationRow(
      tx,
      createNotification(
        order.customerEmail,
        "Order status updated",
        `${order.designTitle} moved to "${nextStatus}" in the atelier timeline.`,
      ),
    );
    return true;
  });

  return updated;
}

export async function toggleDesignTrendingById(designId: string) {
  if (!hasDatabaseConfig()) {
    requireProductionDatabase();
    const db = await readLocalDb();
    const design = db.designs.find((item) => item.id === designId);

    if (!design) {
      return false;
    }

    design.trending = !design.trending;
    await writeLocalDb(db);
    return true;
  }

  await ensurePostgresStorage();
  const sql = getSqlClient();

  if (!sql) {
    return false;
  }

  const updated = await sql<{ id: string }[]>`
    UPDATE designs
    SET trending = NOT trending
    WHERE id = ${designId}
    RETURNING id
  `;

  return updated.length > 0;
}

export async function saveUploadedLookbookAsset(file: File) {
  if (!file || file.size === 0) {
    return null;
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const fileName = `${Date.now()}-${safeName}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const uploaded = await put(`lookbook/${fileName}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return uploaded.url;
  }

  if (isVercelRuntime()) {
    throw new Error(
      "Image uploads need Vercel Blob in production. Set BLOB_READ_WRITE_TOKEN before publishing uploaded designs.",
    );
  }

  await fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });
  const outputPath = path.join(UPLOAD_DIRECTORY, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(outputPath, bytes);
  return `/uploads/${fileName}`;
}

export async function publishDesign(input: DesignInput) {
  if (!hasDatabaseConfig()) {
    requireProductionDatabase();
    const db = await readLocalDb();
    db.designs.unshift({
      id: `design-${crypto.randomUUID().slice(0, 8)}`,
      ...input,
    });
    await writeLocalDb(db);
    return;
  }

  await ensurePostgresStorage();
  const sql = getSqlClient();

  if (!sql) {
    return;
  }

  await sql`
    INSERT INTO designs (id, title, category, silhouette, fabric, description, lead_time, image, palette, trending)
    VALUES (
      ${`design-${crypto.randomUUID().slice(0, 8)}`},
      ${input.title},
      ${input.category},
      ${input.silhouette},
      ${input.fabric},
      ${input.description},
      ${input.leadTime},
      ${input.image},
      ${input.palette},
      ${input.trending}
    )
  `;
}

export function getUpcomingDates(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + index);
    return toIndiaDateString(nextDate);
  });
}
