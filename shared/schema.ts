import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  package: text("package").notNull(),
  eventDate: text("event_date").notNull(),
  startTime: text("start_time").notNull(),
  eventType: text("event_type").notNull(),
  eventLength: text("event_length").notNull(),
  location: text("location").notNull(),
  message: text("message"),
  attachmentUrl: text("attachment_url"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
}).extend({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  package: z.string().min(1, "Please select a package"),
  eventDate: z.string().min(1, "Please select an event date"),
  startTime: z.string().min(1, "Please select a start time"),
  eventType: z.string().min(1, "Please select an event type"),
  eventLength: z.string().min(1, "Please select an event length"),
  location: z.string().min(1, "Please enter a desired location"),
  message: z.string().max(1000).optional().or(z.literal("")),
  attachmentUrl: z.string().optional().or(z.literal("")),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
