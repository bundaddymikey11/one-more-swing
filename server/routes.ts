import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import nodemailer from "nodemailer";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  let transporter: nodemailer.Transporter | null = null;

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.log("SMTP not configured — email sending disabled");
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("[Email Error] Transporter initialization failed:", error);
      } else {
        console.log("[Email] Transporter initialized successfully. Ready to send emails.");
      }
    });
  }

  app.post("/api/email-test", async (req, res) => {
    try {
      if (!process.env.EMAIL_TEST_TOKEN) {
        return res.status(500).json({ message: "EMAIL_TEST_TOKEN not configured." });
      }

      if (req.body.token !== process.env.EMAIL_TEST_TOKEN) {
        return res.status(401).json({ message: "Unauthorized. Invalid token." });
      }

      if (!transporter) {
        return res.status(500).json({ message: "Transporter not initialized. Check SMTP env vars." });
      }

      const mailOptions = {
        from: '"One More Swing System" <info@onemoreswing.golf>',
        to: "info@onemoreswing.golf",
        subject: "Test Email from AntiGravity API",
        text: "This is a test email confirming the SMTP connection works.",
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Test email sent successfully." });
    } catch (error) {
      console.error("[Test Email Error]", error);
      res.status(500).json({ success: false, message: "Failed to send test email.", error: String(error) });
    }
  });

  app.post("/api/bookings", upload.single("attachment"), async (req, res) => {
    try {
      const data = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(data);

      try {
        if (transporter) {
          const attachments: nodemailer.SendMailOptions["attachments"] = [];

          if (req.file) {
            attachments.push({
              filename: req.file.originalname,
              content: req.file.buffer,
              contentType: req.file.mimetype,
            });
          }

          const mailOptions: nodemailer.SendMailOptions = {
            from: '"One More Swing Booking" <info@onemoreswing.golf>',
            to: "info@onemoreswing.golf",
            replyTo: data.email,
            subject: `New Booking – ${data.firstName} ${data.lastName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-w-xl; color: #333;">
                <h2 style="color: #22c55e;">New Booking Request</h2>
                <p>A new request has been submitted via the website.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.firstName} ${data.lastName}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.email}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.phone}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Package:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.package}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Event Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.eventDate}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Start Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.startTime}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Event Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.eventType}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Event Length:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.eventLength}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Location:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.location}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Message:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.message || 'None'}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Photo Attached:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${req.file ? req.file.originalname : 'None'}</td></tr>
                </table>
              </div>
            `,
            attachments,
          };

          await transporter.sendMail(mailOptions);
          console.log(`[Email] Booking notification sent for ${data.firstName} ${data.lastName}`);
        }
      } catch (emailError) {
        console.error("[Email] Failed to send email notification:", emailError);
      }

      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("[Booking Error]", error);
        res.status(500).json({ message: "Failed to create booking" });
      }
    }
  });

  // Auth middleware — checks ALL user passwords, attaches role to req
  const requireAuth = async (req: any, res: any, next: any) => {
    const password = req.headers["x-admin-password"];
    if (!password) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.findUserByPassword(password as string);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    req.adminUser = user;
    next();
  };

  const requireAdminRole = async (req: any, res: any, next: any) => {
    await requireAuth(req, res, () => {
      if (req.adminUser?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin role required" });
      }
      next();
    });
  };

  // Login — returns user info for frontend
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { password } = req.body;
      const user = await storage.findUserByPassword(password);
      if (!user) return res.status(401).json({ message: "Invalid password" });
      res.json({ name: user.name, email: user.email, role: user.role });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User management (admin only)
  app.get("/api/admin/users", requireAdminRole, async (_req, res) => {
    try { res.json(await storage.getUsers()); }
    catch { res.status(500).json({ message: "Failed to fetch users" }); }
  });

  app.post("/api/admin/users", requireAdminRole, async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields required" });
      }
      const user = await storage.createUser({ name, email, password, role });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdminRole, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete user" });
    }
  });

  app.get("/api/bookings", requireAuth, async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.patch("/api/bookings/:id", requireAdminRole, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateBooking(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.post("/api/admin/seed", requireAdminRole, async (_req, res) => {
    const demoLeads = [
      {
        firstName: "James", lastName: "Harrison", email: "james.harrison@gmail.com", phone: "6025551234",
        package: "Executive Package", eventDate: "2026-04-12", startTime: "10:00 AM",
        eventType: "Corporate Outing", eventLength: "4 Hours", location: "Scottsdale, AZ",
        message: "Need setup for a team of 20. Can we add a putting contest?",
        status: "confirmed", internalNotes: "Deposit received. Contract signed.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        firstName: "Sofia", lastName: "Martinez", email: "sofia.m@outlook.com", phone: "4805559876",
        package: "All Day Package", eventDate: "2026-05-03", startTime: "9:00 AM",
        eventType: "Private Event", eventLength: "8+ Hours", location: "Paradise Valley, AZ",
        message: "Birthday celebration for my husband. He loves golf!",
        status: "contacted", internalNotes: "Called on 3/8. Sent invoice. Awaiting deposit.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        firstName: "Derek", lastName: "Patel", email: "d.patel@company.co", phone: "6025558888",
        package: "Practice Package", eventDate: "2026-04-20", startTime: "2:00 PM",
        eventType: "Private Lesson", eventLength: "2 Hours", location: "Tempe, AZ",
        message: "First time golfer, want to learn the basics.",
        status: "new", internalNotes: "",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        firstName: "Amanda", lastName: "Chen", email: "a.chen@startup.io", phone: "4805552222",
        package: "Executive Package", eventDate: "2026-04-27", startTime: "11:00 AM",
        eventType: "Bachelor Party", eventLength: "4 Hours", location: "Chandler, AZ",
        message: "Groom is a huge golf fan. Want to make it memorable.",
        status: "completed", internalNotes: "Event was a huge success! Left 5-star review.",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        firstName: "Tyler", lastName: "Brooks", email: "tyler.brooks@gmail.com", phone: "6025557777",
        package: "All Day Package", eventDate: "2026-06-15", startTime: "8:00 AM",
        eventType: "Corporate Outing", eventLength: "8+ Hours", location: "Peoria, AZ",
        message: "We have a group of 30 execs. Need catering too.",
        status: "new", internalNotes: "",
        createdAt: new Date().toISOString(),
      },
    ];

    try {
      for (const lead of demoLeads) {
        const { status, internalNotes, createdAt, ...bookingData } = lead;
        const created = await storage.createBooking({ ...bookingData, message: bookingData.message || undefined, attachmentUrl: undefined });
        await storage.updateBooking(created.id, { status, internalNotes, createdAt });
      }
      res.json({ success: true, message: `${demoLeads.length} demo leads seeded!` });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed demo data", error: String(error) });
    }
  });

  app.get("/api/admin/stats", requireAdminRole, async (_req, res) => {
    try {
      const allBookings = await storage.getBookings();

      // -- Package price map
      const packagePrice = (pkg: string) => {
        if (pkg.includes("Practice")) return 250;
        if (pkg.includes("Executive")) return 450;
        if (pkg.includes("All Day")) return 800;
        return 0;
      };

      // -- Daily lead counts for the last 30 days
      const today = new Date();
      const dailyCounts: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split("T")[0];
        dailyCounts[key] = 0;
      }
      for (const b of allBookings) {
        const key = b.createdAt.split("T")[0].split(" ")[0]; // handle both ISO and space-separated
        if (dailyCounts[key] !== undefined) dailyCounts[key]++;
      }
      const dailyLeads = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

      // -- Day of week breakdown
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayOfWeekCounts = dayNames.map(name => ({ day: name, count: 0 }));
      for (const b of allBookings) {
        const day = new Date(b.createdAt).getDay();
        dayOfWeekCounts[day].count++;
      }

      // -- Monthly revenue for the last 6 months
      const monthlyRevenue: Record<string, { confirmed: number; pipeline: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today);
        d.setMonth(today.getMonth() - i);
        const key = d.toISOString().slice(0, 7); // "YYYY-MM"
        monthlyRevenue[key] = { confirmed: 0, pipeline: 0 };
      }
      for (const b of allBookings) {
        const key = b.createdAt.slice(0, 7);
        if (monthlyRevenue[key]) {
          const val = packagePrice(b.package);
          if (b.status === "confirmed" || b.status === "completed") {
            monthlyRevenue[key].confirmed += val;
          } else if (b.status !== "cancelled") {
            monthlyRevenue[key].pipeline += val;
          }
        }
      }
      const monthlyRevArr = Object.entries(monthlyRevenue).map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleString("default", { month: "short" }),
        confirmed: data.confirmed,
        pipeline: data.pipeline,
        total: data.confirmed + data.pipeline,
      }));

      // -- Conversion funnel
      const funnel = {
        new: allBookings.filter(b => b.status === "new").length,
        contacted: allBookings.filter(b => b.status === "contacted").length,
        confirmed: allBookings.filter(b => b.status === "confirmed").length,
        completed: allBookings.filter(b => b.status === "completed").length,
        cancelled: allBookings.filter(b => b.status === "cancelled").length,
      };

      // -- Package breakdown
      const byPackage = {
        Practice: allBookings.filter(b => b.package.includes("Practice")).length,
        Executive: allBookings.filter(b => b.package.includes("Executive")).length,
        "All Day": allBookings.filter(b => b.package.includes("All Day")).length,
      };

      // -- Revenue summaries
      const confirmedRevenue = allBookings
        .filter(b => b.status === "confirmed" || b.status === "completed")
        .reduce((acc, b) => acc + packagePrice(b.package), 0);
      const pipelineRevenue = allBookings
        .filter(b => b.status === "new" || b.status === "contacted")
        .reduce((acc, b) => acc + packagePrice(b.package), 0);

      // -- Simple 3-month forecast (avg monthly confirmed * 3)
      const avgMonthly = confirmedRevenue / Math.max(1, monthlyRevArr.filter(m => m.confirmed > 0).length);
      const forecast = [1, 2, 3].map(i => {
        const d = new Date(today);
        d.setMonth(today.getMonth() + i);
        const growth = 1 + (0.1 * i); // 10% growth assumption
        return {
          month: d.toLocaleString("default", { month: "short" }),
          projected: Math.round(avgMonthly * growth),
        };
      });

      res.json({
        totalLeads: allBookings.length,
        newLeads: funnel.new,
        confirmedRevenue,
        pipelineRevenue,
        avgDealSize: allBookings.length > 0
          ? Math.round(allBookings.reduce((acc, b) => acc + packagePrice(b.package), 0) / allBookings.length)
          : 0,
        dailyLeads,
        dayOfWeek: dayOfWeekCounts,
        monthlyRevenue: monthlyRevArr,
        forecast,
        funnel,
        byPackage,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate stats" });
    }
  });

  // ── Expenses ──────────────────────────────────────────────
  app.get("/api/admin/expenses", requireAdminRole, async (_req, res) => {
    try { res.json(await storage.getExpenses()); }
    catch { res.status(500).json({ message: "Failed to fetch expenses" }); }
  });
  app.post("/api/admin/expenses", requireAdminRole, async (req, res) => {
    try { res.status(201).json(await storage.createExpense(req.body)); }
    catch { res.status(500).json({ message: "Failed to create expense" }); }
  });
  app.patch("/api/admin/expenses/:id", requireAdminRole, async (req, res) => {
    try { res.json(await storage.updateExpense(req.params.id, req.body)); }
    catch { res.status(500).json({ message: "Failed to update expense" }); }
  });
  app.delete("/api/admin/expenses/:id", requireAdminRole, async (req, res) => {
    try { await storage.deleteExpense(req.params.id); res.json({ success: true }); }
    catch { res.status(500).json({ message: "Failed to delete expense" }); }
  });

  // ── Legal Docs ────────────────────────────────────────────
  app.get("/api/admin/legal", requireAdminRole, async (_req, res) => {
    try { res.json(await storage.getLegalDocs()); }
    catch { res.status(500).json({ message: "Failed to fetch legal docs" }); }
  });
  app.post("/api/admin/legal", requireAdminRole, async (req, res) => {
    try { res.status(201).json(await storage.createLegalDoc(req.body)); }
    catch { res.status(500).json({ message: "Failed to create legal doc" }); }
  });
  app.patch("/api/admin/legal/:id", requireAdminRole, async (req, res) => {
    try { res.json(await storage.updateLegalDoc(req.params.id, req.body)); }
    catch { res.status(500).json({ message: "Failed to update legal doc" }); }
  });
  app.delete("/api/admin/legal/:id", requireAdminRole, async (req, res) => {
    try { await storage.deleteLegalDoc(req.params.id); res.json({ success: true }); }
    catch { res.status(500).json({ message: "Failed to delete legal doc" }); }
  });

  return httpServer;
}
