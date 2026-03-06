import { bookings, type Booking, type InsertBooking } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
}

export class DatabaseStorage implements IStorage {
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [result] = await db.insert(bookings).values(booking).returning();
    return result;
  }

  async getBookings(): Promise<Booking[]> {
    return db.select().from(bookings);
  }
}

export class MemStorage implements IStorage {
  private bookings: Booking[] = [];
  private currentId = 1;

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = String(this.currentId++);
    const newBooking: Booking = {
      ...booking,
      id,
      message: booking.message ?? null,
      attachmentUrl: booking.attachmentUrl ?? null,
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  async getBookings(): Promise<Booking[]> {
    return this.bookings;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
