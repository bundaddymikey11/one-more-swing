import { sql } from "drizzle-orm";
import { bookings, type Booking, type InsertBooking } from "@shared/schema";
import { db } from "./db";

// ── User types ────────────────────────────────────────────
export type UserRole = "admin" | "viewer";
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}
export type CreateUser = Omit<User, "id" | "createdAt">;

// ── Expense types ─────────────────────────────────────────
export type ExpenseCategory = "Equipment" | "Marketing" | "Travel" | "Maintenance" | "Staff" | "Supplies" | "Other";
export type ExpenseStatus = "pending" | "paid" | "cancelled";
export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  status: ExpenseStatus;
  notes: string;
  createdAt: string;
}
export type CreateExpense = Omit<Expense, "id" | "createdAt">;

// ── Legal document types ──────────────────────────────────
export type LegalStatus = "active" | "pending" | "expired" | "draft";
export interface LegalDoc {
  id: string;
  title: string;
  type: string;
  clientName: string;
  dateCreated: string;
  expiryDate: string;
  status: LegalStatus;
  notes: string;
  createdAt: string;
}
export type CreateLegalDoc = Omit<LegalDoc, "id" | "createdAt">;

// ── Shared interface ──────────────────────────────────────
export interface IStorage {
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking>;
  // Users
  getUsers(): Promise<User[]>;
  createUser(user: CreateUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  findUserByPassword(password: string): Promise<User | null>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  // Expenses
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: CreateExpense): Promise<Expense>;
  updateExpense(id: string, updates: Partial<Expense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  // Legal
  getLegalDocs(): Promise<LegalDoc[]>;
  createLegalDoc(doc: CreateLegalDoc): Promise<LegalDoc>;
  updateLegalDoc(id: string, updates: Partial<LegalDoc>): Promise<LegalDoc>;
  deleteLegalDoc(id: string): Promise<void>;
}

// ── DatabaseStorage (with postgres) ──────────────────────
export class DatabaseStorage implements IStorage {
  // Users stored in memory even for DB mode (no user table yet)
  private users: User[] = [];

  constructor() {
    this.users.push({
      id: "master",
      name: "Master Admin",
      email: "admin@onemoreswing.golf",
      password: process.env.ADMIN_PASSWORD || "swing-admin-2024",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [result] = await db.insert(bookings).values(booking).returning();
    return result;
  }

  async getBookings(): Promise<Booking[]> {
    return db.select().from(bookings);
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const [result] = await db.update(bookings).set(updates).where(sql`id = ${id}`).returning();
    return result;
  }

  async getUsers(): Promise<User[]> {
    return this.users.map(u => ({ ...u, password: "••••••••" }));
  }

  async createUser(user: CreateUser): Promise<User> {
    const newUser: User = { ...user, id: Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    this.users.push(newUser);
    return { ...newUser, password: "••••••••" };
  }

  async deleteUser(id: string): Promise<void> {
    if (id === "master") throw new Error("Cannot delete master admin");
    this.users = this.users.filter(u => u.id !== id);
  }

  async findUserByPassword(password: string): Promise<User | null> {
    return this.users.find(u => u.password === password) || null;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    user.password = newPassword;
  }

  // Expenses and Legal — stored in memory for DB mode too
  private expenses: Expense[] = [];
  private legalDocs: LegalDoc[] = [];

  async getExpenses(): Promise<Expense[]> { return this.expenses; }
  async createExpense(expense: CreateExpense): Promise<Expense> {
    const e: Expense = { ...expense, id: Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    this.expenses.unshift(e); return e;
  }
  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const i = this.expenses.findIndex(e => e.id === id);
    if (i === -1) throw new Error("Expense not found");
    this.expenses[i] = { ...this.expenses[i], ...updates }; return this.expenses[i];
  }
  async deleteExpense(id: string): Promise<void> { this.expenses = this.expenses.filter(e => e.id !== id); }

  async getLegalDocs(): Promise<LegalDoc[]> { return this.legalDocs; }
  async createLegalDoc(doc: CreateLegalDoc): Promise<LegalDoc> {
    const d: LegalDoc = { ...doc, id: Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    this.legalDocs.unshift(d); return d;
  }
  async updateLegalDoc(id: string, updates: Partial<LegalDoc>): Promise<LegalDoc> {
    const i = this.legalDocs.findIndex(d => d.id === id);
    if (i === -1) throw new Error("Document not found");
    this.legalDocs[i] = { ...this.legalDocs[i], ...updates }; return this.legalDocs[i];
  }
  async deleteLegalDoc(id: string): Promise<void> { this.legalDocs = this.legalDocs.filter(d => d.id !== id); }
}


// ── MemStorage (in-memory) ────────────────────────────────
export class MemStorage implements IStorage {
  private bookings: Booking[] = [];
  private users: User[] = [];

  constructor() {
    this.users.push({
      id: "master",
      name: "Master Admin",
      email: "admin@onemoreswing.golf",
      password: process.env.ADMIN_PASSWORD || "swing-admin-2024",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }

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

  async getBookings(): Promise<Booking[]> { return this.bookings; }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Booking not found");
    this.bookings[index] = { ...this.bookings[index], ...updates };
    return this.bookings[index];
  }

  async getUsers(): Promise<User[]> {
    return this.users.map(u => ({ ...u, password: "••••••••" }));
  }

  async createUser(user: CreateUser): Promise<User> {
    const newUser: User = { ...user, id: Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    this.users.push(newUser);
    return { ...newUser, password: "••••••••" };
  }

  async deleteUser(id: string): Promise<void> {
    if (id === "master") throw new Error("Cannot delete master admin");
    this.users = this.users.filter(u => u.id !== id);
  }

  async findUserByPassword(password: string): Promise<User | null> {
    return this.users.find(u => u.password === password) || null;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    user.password = newPassword;
  }

  private expenses: Expense[] = [];
  private legalDocs: LegalDoc[] = [];

  async getExpenses(): Promise<Expense[]> { return this.expenses; }
  async createExpense(expense: CreateExpense): Promise<Expense> {
    const e: Expense = { ...expense, id: Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    this.expenses.unshift(e); return e;
  }
  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const i = this.expenses.findIndex(e => e.id === id);
    if (i === -1) throw new Error("Expense not found");
    this.expenses[i] = { ...this.expenses[i], ...updates }; return this.expenses[i];
  }
  async deleteExpense(id: string): Promise<void> { this.expenses = this.expenses.filter(e => e.id !== id); }

  async getLegalDocs(): Promise<LegalDoc[]> { return this.legalDocs; }
  async createLegalDoc(doc: CreateLegalDoc): Promise<LegalDoc> {
    const d: LegalDoc = { ...doc, id: Math.random().toString(36).substring(2, 9), createdAt: new Date().toISOString() };
    this.legalDocs.unshift(d); return d;
  }
  async updateLegalDoc(id: string, updates: Partial<LegalDoc>): Promise<LegalDoc> {
    const i = this.legalDocs.findIndex(d => d.id === id);
    if (i === -1) throw new Error("Document not found");
    this.legalDocs[i] = { ...this.legalDocs[i], ...updates }; return this.legalDocs[i];
  }
  async deleteLegalDoc(id: string): Promise<void> { this.legalDocs = this.legalDocs.filter(d => d.id !== id); }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
