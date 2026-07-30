// Server-side email notifications via Hostinger SMTP using Nodemailer.
// These functions are called from Next.js API routes — NOT from client components.
import nodemailer from "nodemailer";
import {
  ContactNotificationData,
  EmailSendResult,
  OrderNotificationData
} from "@/types/email";

const SMTP_HOST = "smtp.hostinger.com";
const SMTP_PORT = 465;
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || SMTP_USER; // where order/contact alerts go
const FROM_NAME = "Sawera Collection";

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function formatOrderProducts(data: OrderNotificationData) {
  return data.products
    .map((item) => {
      const options = [item.color, item.size].filter(Boolean).join(" / ");
      const optionText = options ? ` (${options})` : "";
      const priceText = item.lineTotal ? ` - Rs. ${item.lineTotal.toLocaleString("en-PK")}` : "";
      return `<li>${item.productName}${optionText} x ${item.quantity}${priceText}</li>`;
    })
    .join("\n");
}

export async function sendOrderNotification(data: OrderNotificationData): Promise<EmailSendResult> {
  if (!SMTP_USER || !SMTP_PASS) {
    const message = "SMTP credentials are not configured.";
    console.warn(message);
    return { ok: false, message };
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `[${data.actionType === "new" ? "NEW ORDER" : "ORDER UPDATE"}] #${data.orderId} — ${data.customerName}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#222;max-width:560px;margin:0 auto;padding:28px 20px">
          <h2 style="margin-bottom:4px">Sawera Collection</h2>
          <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase">Order Notification</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Email:</strong> ${data.customerEmail}</p>
          <p><strong>Phone:</strong> ${data.customerPhone}</p>
          <p><strong>Date:</strong> ${data.dateTime}</p>
          <p><strong>Shipping Address:</strong><br/>${data.shippingAddress}</p>
          <p><strong>Items:</strong></p>
          <ul style="padding-left:18px;line-height:2">${formatOrderProducts(data)}</ul>
          <p style="font-size:18px;font-weight:700;margin-top:16px">Total: Rs. ${data.totalAmount.toLocaleString("en-PK")}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="color:#aaa;font-size:11px;text-align:center">Sawera Collection · support@saweracollection.com</p>
        </div>
      `,
    });
    return { ok: true, message: "Admin email notification sent." };
  } catch (error) {
    console.error("Order email notification failed:", error);
    return { ok: false, message: "Order saved, but admin email notification failed." };
  }
}

export async function sendContactNotification(data: ContactNotificationData): Promise<EmailSendResult> {
  if (!SMTP_USER || !SMTP_PASS) {
    const message = "SMTP credentials are not configured.";
    console.warn(message);
    return { ok: false, message };
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `[Contact Form] New message from ${data.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#222;max-width:520px;margin:0 auto;padding:28px 20px">
          <h2 style="margin-bottom:4px">Sawera Collection</h2>
          <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase">Contact Form Submission</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          <p><strong>Phone:</strong> ${data.phone ?? "Not provided"}</p>
          <p><strong>Date:</strong> ${data.dateTime}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f9f5f4;border-left:3px solid #c98386;padding:12px 16px;border-radius:4px;line-height:1.8">
            ${data.message}
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="color:#aaa;font-size:11px;text-align:center">Sawera Collection · support@saweracollection.com</p>
        </div>
      `,
    });
    return { ok: true, message: "Message sent successfully." };
  } catch (error) {
    console.error("Contact email notification failed:", error);
    return { ok: false, message: "Message could not be emailed right now." };
  }
}
