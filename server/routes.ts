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

  const requireAdmin = (req: any, res: any, next: any) => {
    const adminPass = process.env.ADMIN_PASSWORD || "swing-admin-2024";
    if (req.headers["x-admin-password"] !== adminPass) {
      return res.status(401).json({ message: "Unauthorized: Admin access required" });
    }
    next();
  };

  app.get("/api/bookings", requireAdmin, async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.patch("/api/bookings/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateBooking(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
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

  return httpServer;
}
