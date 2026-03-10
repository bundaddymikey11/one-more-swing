import { sql } from "drizzle-orm";
import { bookings, type Booking, type InsertBooking } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking>;
}

export class DatabaseStorage implements IStorage {
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [result] = await db.insert(bookings).values(booking).returning();
    return result;
  }

  async getBookings(): Promise<Booking[]> {
    return db.select().from(bookings);
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const [result] = await db
      .update(bookings)
      .set(updates)
      .where(sql`id = ${id}`)
      .returning();
    return result;
  }
}

export class MemStorage implements IStorage {
  private bookings: Booking[] = [];

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: Math.random().toString(36).substring(2, 9),
      status: "new",
      internalNotes: null,
      createdAt: new Date().toISOString(),
      message: booking.message ?? null,
      attachmentUrl: booking.attachmentUrl ?? null,
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  async getBookings(): Promise<Booking[]> {
    return this.bookings;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Booking not found");
    this.bookings[index] = { ...this.bookings[index], ...updates };
    return this.bookings[index];
  }
}

export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
