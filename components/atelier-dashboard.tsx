"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { addDesign, INITIAL_ACTION_STATE, toggleTrending, updateOrderStatus } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import {
  appointmentTimes,
  formatDateLabel,
  formatUpdatedAt,
  orderStatuses,
} from "@/lib/stitch-story-schema";
import {
  type Appointment,
  type Design,
  type MeasurementProfile,
  type Order,
} from "@/lib/stitch-story-schema";

type AtelierDashboardProps = {
  appointments: Appointment[];
  designs: Design[];
  measurements: MeasurementProfile[];
  orders: Order[];
  upcomingDates: string[];
};

export function AtelierDashboard({
  appointments,
  designs,
  measurements,
  orders,
  upcomingDates,
}: AtelierDashboardProps) {
  const [search, setSearch] = useState("");
  const [addDesignState, addDesignAction] = useActionState(addDesign, INITIAL_ACTION_STATE);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredMeasurements = measurements.filter((profile) => {
    if (!normalizedSearch) {
      return true;
    }

    return [profile.clientName, profile.email, profile.notes]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });
  const filteredOrders = orders.filter((order) => {
    if (!normalizedSearch) {
      return true;
    }

    return [order.customerName, order.customerEmail, order.designTitle, order.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);
  });

  return (
    <div className="site-shell">
      <div className="page-grid mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-3 py-4 sm:gap-10 sm:px-6 sm:py-6 lg:px-8">
        <header className="section-card-strong fade-rise rounded-[1.75rem] px-4 py-6 sm:rounded-[2rem] sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-stone-500 sm:text-xs sm:tracking-[0.36em]">
                Owner Console
              </p>
              <h1 className="display-type mt-4 text-[2.7rem] leading-[0.96] text-stone-900 sm:text-6xl">
                Stitch Story&apos;s atelier dashboard keeps fittings, orders, and lookbook content
                moving in sync.
              </h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/"
                className="outline-button w-full rounded-full px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 transition sm:w-auto sm:tracking-[0.28em]"
              >
                Back To Client Experience
              </Link>
              <a
                href="#cms"
                className="gold-button w-full rounded-full px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] transition sm:w-auto sm:tracking-[0.28em]"
              >
                Open CMS
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Active Orders",
                value: orders.length,
                note: "All customization requests and in-progress garments",
              },
              {
                label: "Vault Profiles",
                value: measurements.length,
                note: "Searchable measurement records in one place",
              },
              {
                label: "Booked Slots",
                value: appointments.length,
                note: "Daily and weekly oversight for consult scheduling",
              },
              {
                label: "Trending Designs",
                value: designs.filter((design) => design.trending).length,
                note: "Managed inside the CMS without editing code",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-stone-200/70 bg-white/76 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  {item.label}
                </p>
                <p className="mt-3 text-4xl font-semibold text-stone-900">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.note}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="section-card rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                Search Engine
              </p>
              <h2 className="display-type mt-3 text-[1.9rem] leading-tight text-stone-900 sm:text-3xl">
                Find customers, orders, and garment progress instantly.
              </h2>
            </div>
            <div className="field-shell w-full rounded-3xl px-4 py-3 lg:max-w-md">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by client, email, order, or status"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="section-card-strong rounded-[1.75rem] px-4 py-6 sm:rounded-[2rem] sm:px-8 sm:py-7">
            <div className="flex flex-col gap-3 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                  Order And Measurement Management
                </p>
                <h2 className="display-type mt-3 text-[2rem] leading-tight text-stone-900 sm:text-4xl">
                  Update garment progress and keep every client record close at hand.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-stone-600">
                Status updates automatically create client notifications in the customer view.
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              {filteredOrders.map((order) => {
                const profile = measurements.find((item) => item.email === order.customerEmail);

                return (
                  <article
                    key={order.id}
                    className="rounded-[1.7rem] border border-stone-200/80 bg-white/82 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                          {order.id}
                        </p>
                        <h3 className="text-2xl font-semibold text-stone-900">{order.designTitle}</h3>
                        <p className="text-sm leading-6 text-stone-600">
                          {order.customerName} / {order.customerEmail}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-stone-500">
                          <span className="rounded-full bg-stone-100 px-3 py-1">
                            Event {order.eventDate || "TBD"}
                          </span>
                          <span className="rounded-full bg-stone-100 px-3 py-1">
                            Created {formatUpdatedAt(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      <form action={updateOrderStatus} className="w-full max-w-sm space-y-3">
                        <input type="hidden" name="orderId" value={order.id} />
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                            Update Status
                          </span>
                          <span className="field-shell block rounded-3xl px-4 py-3">
                            <select
                              name="status"
                              defaultValue={order.status}
                              className="w-full bg-transparent outline-none"
                            >
                              {orderStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </span>
                        </label>
                        <SubmitButton
                          label="Trigger Client Update"
                          pendingLabel="Updating"
                          className="gold-button w-full"
                        />
                      </form>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.1fr]">
                      <div className="rounded-[1.3rem] bg-stone-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                          Client Notes
                        </p>
                        <p className="mt-2 text-sm leading-6 text-stone-700">
                          {order.notes || "No additional customization notes attached."}
                        </p>
                      </div>
                      <div className="rounded-[1.3rem] bg-stone-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                          Measurement Vault Snapshot
                        </p>
                        {profile ? (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {Object.entries(profile.metrics)
                              .slice(0, 6)
                              .map(([label, value]) => (
                                <div key={label} className="rounded-2xl bg-white px-3 py-3 text-sm">
                                  <span className="font-semibold capitalize text-stone-900">
                                    {label.replace(/([A-Z])/g, " $1")}
                                  </span>
                                  <span className="mt-1 block text-stone-600">{value}&quot;</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            No saved measurement profile found for this client yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="section-card rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
              Measurement Directory
            </p>
            <h2 className="display-type mt-3 text-[1.9rem] leading-tight text-stone-900 sm:text-3xl">
              Every saved profile is searchable from one boutique-ready list.
            </h2>
            <div className="mt-6 grid gap-4">
              {filteredMeasurements.map((profile) => (
                <article
                  key={profile.id}
                  className="rounded-[1.5rem] border border-stone-200/80 bg-white/80 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-900">{profile.clientName}</h3>
                      <p className="mt-1 text-sm text-stone-600">{profile.email}</p>
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
                      {formatUpdatedAt(profile.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {Object.entries(profile.metrics).map(([label, value]) => (
                      <div key={label} className="rounded-[1.1rem] bg-stone-50 px-3 py-3 text-sm">
                        <span className="font-semibold capitalize text-stone-900">
                          {label.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="mt-1 block text-stone-600">{value}&quot;</span>
                      </div>
                    ))}
                  </div>
                  {profile.notes ? (
                    <p className="mt-4 rounded-[1.1rem] bg-stone-50 px-4 py-4 text-sm leading-6 text-stone-700">
                      {profile.notes}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="section-card-strong rounded-[1.75rem] px-4 py-6 sm:rounded-[2rem] sm:px-8 sm:py-7">
            <div className="flex flex-col gap-3 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
                  Appointment Oversight
                </p>
                <h2 className="display-type mt-3 text-[2rem] leading-tight text-stone-900 sm:text-4xl">
                  Daily and weekly slot visibility for floor and staffing decisions.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-stone-600">
                Virtual and in-store visits share the same calendar, so traffic is easy to balance.
              </p>
            </div>

            <div className="touch-scroll mt-6 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4">
              {upcomingDates.map((date) => (
                <div
                  key={date}
                  className="min-w-[16.5rem] rounded-[1.5rem] border border-stone-200/80 bg-white/80 p-4 sm:min-w-0"
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
                          className={`rounded-[1rem] border px-3 py-3 text-sm ${
                            booking
                              ? "border-stone-200 bg-stone-50 text-stone-800"
                              : "border-dashed border-stone-200 bg-transparent text-stone-400"
                          }`}
                        >
                          <p className="font-semibold">{time}</p>
                          <p className="mt-1 text-xs leading-5">
                            {booking
                              ? `${booking.clientName} / ${booking.appointmentType}`
                              : "Open slot"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="cms" className="section-card rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-xs sm:tracking-[0.32em]">
              Content Management
            </p>
            <h2 className="display-type mt-3 text-[1.9rem] leading-tight text-stone-900 sm:text-3xl">
              Publish new looks and change trending items without touching the code.
            </h2>

            <div className="mt-6 grid gap-4">
              {designs.map((design) => (
                <article
                  key={design.id}
                  className="rounded-[1.5rem] border border-stone-200/80 bg-white/82 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Image
                      src={design.image}
                      alt={design.title}
                      width={96}
                      height={112}
                      className="h-56 w-full rounded-[1.2rem] object-cover sm:h-28 sm:w-24"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                            {design.category}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-stone-900">
                            {design.title}
                          </h3>
                        </div>
                        <form action={toggleTrending}>
                          <input type="hidden" name="designId" value={design.id} />
                          <SubmitButton
                            label={design.trending ? "Remove Trending" : "Mark Trending"}
                            pendingLabel="Updating"
                            className={
                              design.trending
                                ? "w-full rounded-full border border-stone-300 bg-white text-stone-700 sm:w-auto"
                                : "gold-button w-full sm:w-auto"
                            }
                          />
                        </form>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{design.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <form action={addDesignAction} className="mt-8 space-y-4 rounded-[1.6rem] bg-stone-950 px-4 py-5 text-amber-50 sm:px-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/80">
                  Add New Design
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-50/75">
                  Upload a preview image or let the system use a default artwork placeholder.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                    Title
                  </span>
                  <input
                    type="text"
                    name="title"
                    className="w-full rounded-3xl border border-white/12 bg-white/10 px-4 py-3 outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                    Category
                  </span>
                  <select
                    name="category"
                    defaultValue="Bridal"
                    className="w-full rounded-3xl border border-white/12 bg-white/10 px-4 py-3 outline-none"
                  >
                    <option value="Bridal">Bridal</option>
                    <option value="Indo-Western">Indo-Western</option>
                    <option value="Occasion">Occasion</option>
                    <option value="Festive">Festive</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                    Silhouette
                  </span>
                  <input
                    type="text"
                    name="silhouette"
                    className="w-full rounded-3xl border border-white/12 bg-white/10 px-4 py-3 outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                    Fabric
                  </span>
                  <input
                    type="text"
                    name="fabric"
                    className="w-full rounded-3xl border border-white/12 bg-white/10 px-4 py-3 outline-none"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                    Lead Time
                  </span>
                  <input
                    type="text"
                    name="leadTime"
                    className="w-full rounded-3xl border border-white/12 bg-white/10 px-4 py-3 outline-none"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                    Palette
                  </span>
                  <input
                    type="text"
                    name="palette"
                    placeholder="Sandstone / Rose / Brass"
                    className="w-full rounded-3xl border border-white/12 bg-white/10 px-4 py-3 outline-none"
                  />
                </label>
              </div>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                  Description
                </span>
                <textarea
                  name="description"
                  rows={4}
                  className="w-full rounded-[1.5rem] border border-white/12 bg-white/10 px-4 py-3 outline-none"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                  Optional Image Upload
                </span>
                <input type="file" name="designImage" accept="image/*" className="block w-full text-sm" />
              </label>
              <label className="flex items-center gap-3 text-sm text-amber-50/80">
                <input type="checkbox" name="trending" className="h-4 w-4 rounded border-white/20" />
                Publish as trending
              </label>
              <div className="space-y-3">
                <p
                  className={`text-sm font-semibold ${
                    addDesignState.status === "error" ? "text-rose-300" : "text-amber-100"
                  }`}
                >
                  {addDesignState.message ||
                    "Publishing here updates both the storefront lookbook and the owner CMS list."}
                </p>
                <SubmitButton
                  label="Publish Design"
                  pendingLabel="Publishing"
                  className="gold-button w-full"
                />
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
