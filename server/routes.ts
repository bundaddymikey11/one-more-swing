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

  app.get("/api/bookings", async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  return httpServer;
}
