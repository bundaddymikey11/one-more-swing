import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  eventDate: text("event_date").notNull(),
  eventType: text("event_type").notNull(),
  startTime: text("start_time"),
  location: text("location"),
  message: text("message"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  eventDate: z.string().min(1, "Please select an event date"),
  eventType: z.string().min(1, "Please select an event type"),
  startTime: z.string().min(1, "Please select a start time"),
  location: z.string().min(1, "Please enter a location"),
  message: z.string().max(1000).optional().or(z.literal("")),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
