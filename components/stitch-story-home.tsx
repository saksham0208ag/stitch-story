"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import {
  bookAppointment,
  INITIAL_ACTION_STATE,
  requestCustomization,
  saveMeasurements,
} from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import {
  appointmentTypes,
  appointmentTimes,
  formatDateLabel,
  formatDateShort,
  formatUpdatedAt,
  measurementFields,
} from "@/lib/stitch-story-schema";
import {
  type Appointment,
  type Design,
  type MeasurementProfile,
  type NotificationEntry,
  type Order,
} from "@/lib/stitch-story-schema";

type StitchStoryHomeProps = {
  appointments: Appointment[];
  designs: Design[];
  measurements: MeasurementProfile[];
  notifications: NotificationEntry[];
  orders: Order[];
  upcomingDates: string[];
};

const lookbookFilters = ["All", "Bridal", "Indo-Western", "Occasion", "Festive"];

function statusTone(status: string) {
  if (status === "Ready for Trial" || status === "Ready for Delivery") {
    return "bg-emerald-800";
  }

  if (status === "In Stitching" || status === "Fabric Sourced") {
    return "bg-amber-700";
  }

  return "bg-rose-500";
}

export function StitchStoryHome({
  appointments,
  designs,
  measurements,
  notifications,
  orders,
  upcomingDates,
}: StitchStoryHomeProps) {
  const searchParams = useSearchParams();
  const [measurementState, saveMeasurementAction] = useActionState(
    saveMeasurements,
    INITIAL_ACTION_STATE,
  );
  const [appointmentState, bookAppointmentAction] = useActionState(
    bookAppointment,
    INITIAL_ACTION_STATE,
  );
  const [customizationState, requestCustomizationAction] = useActionState(
    requestCustomization,
    INITIAL_ACTION_STATE,
  );
  const [filter, setFilter] = useState("All");
  const [selectedDesignId, setSelectedDesignId] = useState(designs[0]?.id ?? "");
  const customerEmail = searchParams.get("customer")?.trim().toLowerCase() || undefined;
  const activeMeasurement = customerEmail
    ? measurements.find((profile) => profile.email === customerEmail)
    : measurements[0];
  const activeCustomerEmail = activeMeasurement?.email ?? customerEmail;
  const activeNotifications = activeCustomerEmail
    ? notifications.filter((note) => note.email === activeCustomerEmail).slice(0, 4)
    : [];
  const activeOrders = activeCustomerEmail
    ? orders.filter((order) => order.customerEmail === activeCustomerEmail)
    : [];

  const filteredDesigns =
    filter === "All"
      ? designs
      : designs.filter((design) => design.category.toLowerCase() === filter.toLowerCase());
  const selectedDesign =
    designs.find((design) => design.id === selectedDesignId) ?? filteredDesigns[0] ?? designs[0];

  return (
    <div className="site-shell">
      <div className="page-grid mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-3 py-4 text-[15px] text-stone-800 sm:gap-10 sm:px-6 sm:py-6 lg:px-8">
        <header className="section-card fade-rise flex flex-col gap-6 rounded-[1.75rem] px-4 py-5 sm:gap-8 sm:rounded-[2rem] sm:px-8 sm:py-6 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500 sm:text-xs sm:tracking-[0.4em]">
                Jaipur Couture Concierge
              </p>
              <div className="space-y-4">
                <h1 className="display-type max-w-3xl text-[2.7rem] leading-[0.96] text-stone-900 sm:text-6xl">
                  Stitch Story turns bespoke tailoring into a luxury digital ritual.
                </h1>
                <p className="max-w-2xl text-[15px] leading-7 text-stone-700 sm:text-lg sm:leading-8">
                  Customers save measurements once, reserve fittings in real time, and request
                  customization from a curated Jaipur lookbook. Inside the atelier, owners manage
                  measurements, orders, appointments, and lookbook content from a single premium
                  command center.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#measurement-vault"
                  className="gold-button w-full rounded-full px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] transition sm:w-auto sm:tracking-[0.28em]"
                >
                  Build My Fit Profile
                </a>
                <a
                  href="#lookbook"
                  className="outline-button w-full rounded-full px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] transition sm:w-auto sm:tracking-[0.28em]"
                >
                  Explore The Lookbook
                </a>
                <Link
                  href="/atelier"
                  className="w-full rounded-full border border-stone-300 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-500 sm:w-auto sm:tracking-[0.28em]"
                >
                  Open Owner Dashboard
                </Link>
              </div>
            </div>

            <div className="mesh-panel section-card-strong w-full max-w-md rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                  Client Access
                </p>
                <span className="w-fit rounded-full bg-emerald-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-50 sm:tracking-[0.26em]">
                  Live Demo Store
                </span>
              </div>
              <div className="mt-5 space-y-5">
                <form
                  key={activeCustomerEmail ?? "guest-customer-access"}
                  method="get"
                  action="/"
                  className="space-y-4"
                >
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                      Load a returning client by email
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <input
                        type="email"
                        name="customer"
                        defaultValue={activeCustomerEmail}
                        placeholder="rina@stitchstory.in"
                        className="w-full bg-transparent outline-none"
                      />
                    </span>
                  </label>
                  <SubmitButton
                    label="Open Client Snapshot"
                    pendingLabel="Opening"
                    className="gold-button w-full"
                  />
                </form>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-stone-200/70 bg-white/75 p-4">
                    <p className="text-3xl font-semibold text-stone-900">{measurements.length}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-500">
                      Vault Profiles
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-stone-200/70 bg-white/75 p-4">
                    <p className="text-3xl font-semibold text-stone-900">
                      {appointments.length}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-500">
                      Consult Slots Booked
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-stone-200/70 bg-white/75 p-4">
                    <p className="text-3xl font-semibold text-stone-900">
                      {designs.filter((design) => design.trending).length}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-500">
                      Trending Looks
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Returning Client",
                value: activeMeasurement?.clientName ?? "Rina Mehta",
                note: activeMeasurement
                  ? `${activeMeasurement.email} loaded`
                  : "Use the email finder to load a customer record",
              },
              {
                label: "Latest Order",
                value: activeOrders[0]?.designTitle ?? "Amber Sitara Lehenga",
                note: activeOrders[0]?.status ?? "Consult Requested",
              },
              {
                label: "Next Open Slot",
                value: `${formatDateShort(upcomingDates[0])} / ${appointmentTimes[0]}`,
                note: "Auto-locking conflicts in real time",
              },
              {
                label: "Boutique Promise",
                value: "Fit. Finesse. Follow-through.",
                note: "Luxury service layer from enquiry to trial",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-stone-200/70 bg-white/72 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                  {item.label}
                </p>
                <p className="mt-3 text-xl font-semibold text-stone-900">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.note}</p>
              </div>
            ))}
          </div>
        </header>

        <main className="grid gap-10 pb-16">
          <section
            id="measurement-vault"
            className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr] xl:gap-8"
          >
            <div className="section-card-strong fade-rise rounded-[1.75rem] px-4 py-6 sm:rounded-[2rem] sm:px-8 sm:py-7">
              <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                    Digital Measurement Vault
                  </p>
                  <h2 className="display-type mt-3 text-[2rem] leading-tight text-stone-900 sm:text-4xl">
                    Save a client fit profile once and reuse it for every future order.
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-7 text-stone-600">
                  Perfect for returning customers, bridal trousseaus, and fast repeat custom work.
                </p>
              </div>

              <form
                key={activeCustomerEmail ?? "guest-measurement-form"}
                action={saveMeasurementAction}
                className="mt-6 space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Client Name
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <input
                        type="text"
                        name="clientName"
                        defaultValue={activeMeasurement?.clientName}
                        placeholder="Rina Mehta"
                        className="w-full bg-transparent outline-none"
                      />
                    </span>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Email Address
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <input
                        type="email"
                        name="email"
                        defaultValue={activeMeasurement?.email}
                        placeholder="rina@stitchstory.in"
                        className="w-full bg-transparent outline-none"
                      />
                    </span>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {measurementFields.map((field) => (
                    <label key={field.key} className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                        {field.label}
                      </span>
                      <span className="field-shell block rounded-3xl px-4 py-3">
                        <input
                          type="number"
                          name={field.key}
                          step="0.1"
                          min="1"
                          defaultValue={activeMeasurement?.metrics[field.key]}
                          placeholder={field.placeholder}
                          className="w-full bg-transparent outline-none"
                        />
                      </span>
                    </label>
                  ))}
                </div>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Styling Notes
                  </span>
                  <span className="field-shell block rounded-[1.6rem] px-4 py-3">
                    <textarea
                      name="notes"
                      rows={4}
                      defaultValue={activeMeasurement?.notes}
                      placeholder="Example: prefers a softer waist fit for festive wear, left shoulder slightly lower."
                      className="w-full resize-none bg-transparent outline-none"
                    />
                  </span>
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p
                      className={`text-sm font-semibold ${
                        measurementState.status === "error"
                          ? "text-rose-700"
                          : "text-emerald-800"
                      }`}
                    >
                      {measurementState.message || "Vault data is stored in a local demo database."}
                    </p>
                    {activeMeasurement ? (
                      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                        Last updated {formatUpdatedAt(activeMeasurement.updatedAt)}
                      </p>
                    ) : null}
                  </div>
                  <SubmitButton
                    label="Save Measurements"
                    pendingLabel="Saving"
                    className="gold-button"
                  />
                </div>
              </form>
            </div>

            <div className="grid gap-6">
              <div className="section-card rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                      How To Measure
                    </p>
                    <h3 className="display-type mt-3 text-[1.9rem] leading-tight text-stone-900 sm:text-3xl">
                      Visual guidance for accurate tailoring.
                    </h3>
                  </div>
                  <span className="w-fit rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 sm:tracking-[0.26em]">
                    Customer Assist
                  </span>
                </div>
                <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-stone-200/70 bg-[#f9efe0] p-4">
                  <Image
                    src="/measurement-guide.svg"
                    alt="How to measure guide"
                    width={720}
                    height={520}
                    className="w-full"
                  />
                </div>
                <div className="mt-5 grid gap-3">
                  {[
                    "Neck: Keep one finger of ease between tape and skin for comfort.",
                    "Chest: Measure around the fullest point while arms rest naturally.",
                    "Waist: Use the natural waistline, not the low-rise trouser point.",
                    "Sleeve: Start at shoulder tip and end where the cuff should fall.",
                  ].map((tip) => (
                    <div key={tip} className="pill rounded-[1.3rem] px-4 py-3 text-sm leading-6">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-card rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                  Customer Snapshot
                </p>
                {activeMeasurement ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-[1.5rem] border border-stone-200/70 bg-white/75 p-5">
                      <p className="text-xl font-semibold text-stone-900">
                        {activeMeasurement.clientName}
                      </p>
                      <p className="mt-1 text-sm text-stone-600">{activeMeasurement.email}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeOrders.slice(0, 2).map((order) => (
                        <div
                          key={order.id}
                          className="rounded-[1.4rem] border border-stone-200/70 bg-white/75 p-4"
                        >
                          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                            {order.designTitle}
                          </p>
                          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-stone-800">
                            <span className={`status-dot ${statusTone(order.status)}`} />
                            {order.status}
                          </p>
                          <p className="mt-2 text-sm text-stone-600">
                            Requested {formatUpdatedAt(order.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                        Recent notifications
                      </p>
                      {activeNotifications.length ? (
                        activeNotifications.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-[1.3rem] border border-stone-200/70 bg-white/75 p-4"
                          >
                            <p className="text-sm font-semibold text-stone-900">{note.title}</p>
                            <p className="mt-1 text-sm leading-6 text-stone-600">{note.message}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-stone-400">
                              {formatUpdatedAt(note.createdAt)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-[1.3rem] border border-dashed border-stone-300 px-4 py-5 text-sm leading-6 text-stone-600">
                          Status changes from the atelier appear here for the selected customer.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 rounded-[1.4rem] border border-dashed border-stone-300 px-4 py-5 text-sm leading-7 text-stone-600">
                    Search by customer email above to load a saved measurement vault, order stream,
                    and notifications.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section
            id="appointments"
            className="grid gap-6 lg:grid-cols-[1.15fr_0.95fr] xl:gap-8"
          >
            <div className="section-card-strong rounded-[1.75rem] px-4 py-6 sm:rounded-[2rem] sm:px-8 sm:py-7">
              <div className="flex flex-col gap-3 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                    Intelligent Appointment Booking
                  </p>
                  <h2 className="display-type mt-3 text-[2rem] leading-tight text-stone-900 sm:text-4xl">
                    A live boutique calendar for in-store consultations and virtual fittings.
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-7 text-stone-600">
                  Conflict checks run on the server, so the same slot cannot be booked twice.
                </p>
              </div>

              <div className="touch-scroll mt-6 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4">
                {upcomingDates.map((date) => (
                  <div
                    key={date}
                    className="min-w-[16.5rem] rounded-[1.6rem] border border-stone-200/70 bg-white/75 p-4 sm:min-w-0"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 sm:tracking-[0.24em]">
                      {formatDateLabel(date)}
                    </p>
                    <div className="mt-4 space-y-3">
                      {appointmentTimes.map((time) => {
                        const booking = appointments.find(
                          (appointment) => appointment.date === date && appointment.time === time,
                        );

                        return (
                          <div
                            key={`${date}-${time}`}
                            className={`rounded-2xl border px-3 py-3 text-sm ${
                              booking
                                ? "border-rose-200 bg-rose-50/90 text-rose-800"
                                : "border-emerald-200 bg-emerald-50/80 text-emerald-900"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="font-semibold">{time}</span>
                              <span className="text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.24em]">
                                {booking ? "Booked" : "Open"}
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-5 opacity-75">
                              {booking
                                ? `${booking.clientName} / ${booking.appointmentType}`
                                : "Available for consultation"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                Reserve A Slot
              </p>
              <h3 className="display-type mt-3 text-[1.9rem] leading-tight text-stone-900 sm:text-3xl">
                Book a fitting without waiting for WhatsApp back-and-forth.
              </h3>

              <form
                key={activeCustomerEmail ?? "guest-appointment-form"}
                action={bookAppointmentAction}
                className="mt-6 space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Client Name
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <input
                        type="text"
                        name="clientName"
                        defaultValue={activeMeasurement?.clientName}
                        placeholder="Rina Mehta"
                        className="w-full bg-transparent outline-none"
                      />
                    </span>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Email Address
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <input
                        type="email"
                        name="email"
                        defaultValue={activeMeasurement?.email}
                        placeholder="rina@stitchstory.in"
                        className="w-full bg-transparent outline-none"
                      />
                    </span>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Consultation Type
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <select
                        name="appointmentType"
                        defaultValue={appointmentTypes[0]}
                        className="w-full bg-transparent outline-none"
                      >
                        {appointmentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Date
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <select name="date" defaultValue={upcomingDates[0]} className="w-full bg-transparent outline-none">
                        {upcomingDates.map((date) => (
                          <option key={date} value={date}>
                            {formatDateLabel(date)}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Time
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <select name="time" defaultValue={appointmentTimes[0]} className="w-full bg-transparent outline-none">
                        {appointmentTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Notes For The Atelier
                  </span>
                  <span className="field-shell block rounded-[1.6rem] px-4 py-3">
                    <textarea
                      name="notes"
                      rows={4}
                      placeholder="Share event type, fabric reference, video fitting preference, or a preferred artisan."
                      className="w-full resize-none bg-transparent outline-none"
                    />
                  </span>
                </label>

                <div className="space-y-4">
                  <p
                    className={`text-sm font-semibold ${
                      appointmentState.status === "error" ? "text-rose-700" : "text-emerald-800"
                    }`}
                  >
                    {appointmentState.message ||
                      "Available slots refresh across the customer and admin views after each booking."}
                  </p>
                  <SubmitButton
                    label="Confirm Appointment"
                    pendingLabel="Booking"
                    className="gold-button w-full"
                  />
                </div>
              </form>
            </div>
          </section>

          <section id="lookbook" className="section-card-strong rounded-[1.75rem] px-4 py-6 sm:rounded-[2rem] sm:px-8 sm:py-7">
            <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                  Curated Lookbook
                </p>
                <h2 className="display-type mt-3 text-[2rem] leading-tight text-stone-900 sm:text-4xl">
                  Filter couture collections and send a customization brief in one step.
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-7 text-stone-600">
                Each design card can hand off its ID directly to the customization form so the
                purchase journey never loses context.
              </p>
            </div>

            <div className="touch-scroll -mx-1 mt-6 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {lookbookFilters.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition sm:tracking-[0.26em] ${
                    filter === option
                      ? "bg-stone-900 text-amber-50"
                      : "outline-button text-stone-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {filteredDesigns.map((design) => (
                <article
                  key={design.id}
                  className="overflow-hidden rounded-[1.8rem] border border-stone-200/80 bg-white/82"
                >
                  <div className="relative h-72 overflow-hidden sm:h-80">
                    <Image
                      src={design.image}
                      alt={design.title}
                      width={900}
                      height={1200}
                      className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
                    />
                    <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
                      <span className="rounded-full bg-stone-900/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-50 sm:tracking-[0.24em]">
                        {design.category}
                      </span>
                      {design.trending ? (
                        <span className="rounded-full bg-amber-100/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-900 sm:tracking-[0.24em]">
                          Trending
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                        {design.id}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-stone-900">{design.title}</h3>
                    </div>
                    <p className="text-sm leading-7 text-stone-600">{design.description}</p>
                    <div className="grid gap-3 text-sm text-stone-700">
                      <div className="rounded-[1.2rem] bg-stone-50 px-3 py-3">
                        <span className="font-semibold text-stone-900">Silhouette:</span>{" "}
                        {design.silhouette}
                      </div>
                      <div className="rounded-[1.2rem] bg-stone-50 px-3 py-3">
                        <span className="font-semibold text-stone-900">Fabric:</span> {design.fabric}
                      </div>
                      <div className="rounded-[1.2rem] bg-stone-50 px-3 py-3">
                        <span className="font-semibold text-stone-900">Lead time:</span>{" "}
                        {design.leadTime}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDesignId(design.id);
                        document
                          .getElementById("customization-studio")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="gold-button w-full rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition sm:tracking-[0.28em]"
                    >
                      Request Customization
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div
              id="customization-studio"
              className="mt-8 grid gap-6 rounded-[1.75rem] border border-stone-200/80 bg-white/78 p-4 sm:rounded-[2rem] sm:p-6 lg:grid-cols-[0.95fr_1.05fr]"
            >
              <div className="rounded-[1.7rem] bg-stone-950 px-5 py-5 text-amber-50 sm:px-6 sm:py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/80 sm:text-xs sm:tracking-[0.32em]">
                  Customization Brief
                </p>
                <h3 className="display-type mt-4 text-[2rem] leading-tight sm:text-4xl">
                  {selectedDesign?.title ?? "Select a lookbook design"}
                </h3>
                <p className="mt-4 text-sm leading-7 text-amber-50/76">
                  The selected design ID is carried into the request form automatically so the atelier
                  team knows exactly which silhouette to personalize.
                </p>
                {selectedDesign ? (
                  <div className="mt-6 grid gap-3">
                    {[
                      `Palette: ${selectedDesign.palette}`,
                      `Category: ${selectedDesign.category}`,
                      `Lead time: ${selectedDesign.leadTime}`,
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3 text-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <form
                key={activeCustomerEmail ?? "guest-customization-form"}
                action={requestCustomizationAction}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Customer Name
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <input
                        type="text"
                        name="customerName"
                        defaultValue={activeMeasurement?.clientName}
                        placeholder="Rina Mehta"
                        className="w-full bg-transparent outline-none"
                      />
                    </span>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Customer Email
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <input
                        type="email"
                        name="customerEmail"
                        defaultValue={activeMeasurement?.email}
                        placeholder="rina@stitchstory.in"
                        className="w-full bg-transparent outline-none"
                      />
                    </span>
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Selected Design ID
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <input
                        type="text"
                        name="designId"
                        value={selectedDesign?.id ?? ""}
                        readOnly
                        className="w-full bg-transparent outline-none"
                      />
                    </span>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      Event Date
                    </span>
                    <span className="field-shell block rounded-3xl px-4 py-3">
                      <input type="date" name="eventDate" className="w-full bg-transparent outline-none" />
                    </span>
                  </label>
                </div>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Personalization Notes
                  </span>
                  <span className="field-shell block rounded-[1.6rem] px-4 py-3">
                    <textarea
                      name="notes"
                      rows={5}
                      placeholder="Share embroidery direction, color swap, dupatta idea, event venue, or sleeve preference."
                      className="w-full resize-none bg-transparent outline-none"
                    />
                  </span>
                </label>
                <div className="space-y-4">
                  <p
                    className={`text-sm font-semibold ${
                      customizationState.status === "error"
                        ? "text-rose-700"
                        : "text-emerald-800"
                    }`}
                  >
                    {customizationState.message ||
                      "Submitted requests appear instantly in the owner dashboard with the chosen design attached."}
                  </p>
                  <SubmitButton
                    label="Send Customization Request"
                    pendingLabel="Sending"
                    className="gold-button w-full"
                  />
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
