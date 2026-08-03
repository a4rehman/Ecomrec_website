// Server-side email notifications via Hostinger SMTP using Nodemailer.
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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || SMTP_USER;
const FROM_NAME = "Sawera Collection";

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes("example.com");
}

function formatOrderProducts(data: OrderNotificationData) {
  return data.products
    .map((item) => {
      const options = [item.color, item.size].filter(Boolean).join(" / ");
      const optionText = options ? ` (${options})` : "";
      const priceText = item.lineTotal ? ` - Rs. ${item.lineTotal.toLocaleString("en-PK")}` : "";
      return `<li><strong>${item.productName}</strong>${optionText} x ${item.quantity}${priceText}</li>`;
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

    // Prepare recipients list: Always send to ADMIN_EMAIL, and to customerEmail if valid
    const recipients: string[] = [ADMIN_EMAIL];
    if (data.customerEmail && isValidEmail(data.customerEmail)) {
      recipients.push(data.customerEmail);
    }

    const isPlaced = data.actionType === "Placed";
    const subject = isPlaced
      ? `Order Confirmation #${data.orderId} — Sawera Collection`
      : `[ORDER UPDATE - ${data.actionType.toUpperCase()}] #${data.orderId}`;

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${SMTP_USER}>`,
      to: recipients.join(", "),
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #222; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #eaeaea; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-family: Georgia, serif; font-size: 28px; margin: 0; color: #1a1a1a;">Sawera Collection</h1>
            <p style="color: #999; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">Made for Her. Inspired by Grace</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          
          <div style="background-color: #fcf9f8; padding: 16px 20px; border-radius: 6px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0; color: #8c5356;">${isPlaced ? "Thank you for your order!" : `Order Action: ${data.actionType}`}</h3>
            <p style="margin: 0; font-size: 14px; color: #555;">Dear <strong>${data.customerName}</strong>, your order <strong>#${data.orderId}</strong> has been received and is currently being processed by our team.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #777;">Order Number:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right;">#${data.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777;">Order Date:</td>
              <td style="padding: 6px 0; text-align: right;">${data.dateTime}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777;">Payment Method:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 500;">Cash on Delivery (COD)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #777;">Contact Phone:</td>
              <td style="padding: 6px 0; text-align: right;">${data.customerPhone}</td>
            </tr>
          </table>

          <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #8c5356;">Shipping Address</h4>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #444;">${data.shippingAddress}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #8c5356;">Order Summary</h4>
            <ul style="padding-left: 20px; line-height: 2; margin: 0; font-size: 14px;">
              ${formatOrderProducts(data)}
            </ul>
          </div>

          <div style="border-top: 2px solid #1a1a1a; padding-top: 16px; margin-top: 24px; text-align: right;">
            <span style="font-size: 14px; color: #666; margin-right: 12px;">Grand Total:</span>
            <span style="font-size: 22px; font-weight: bold; color: #8c5356;">Rs. ${data.totalAmount.toLocaleString("en-PK")}</span>
          </div>

          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0 16px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">If you have any questions, reply to this email or contact us on WhatsApp: <strong>+92 306 6378857</strong></p>
          <p style="color: #bbb; font-size: 11px; text-align: center; margin-top: 6px;">Sawera Collection · support@saweracollection.com</p>
        </div>
      `,
    });
    return { ok: true, message: "Order notification email sent to customer and admin." };
  } catch (error) {
    console.error("Order email notification failed:", error);
    return { ok: false, message: "Order saved, but email dispatch encountered an error." };
  }
}

export async function sendOrderStatusUpdateNotification(params: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  status: string;
}): Promise<EmailSendResult> {
  if (!SMTP_USER || !SMTP_PASS) {
    return { ok: false, message: "SMTP not configured" };
  }

  try {
    const transporter = createTransporter();
    const recipients: string[] = [ADMIN_EMAIL];
    if (params.customerEmail && isValidEmail(params.customerEmail)) {
      recipients.push(params.customerEmail);
    }

    const statusText = params.status.toUpperCase();
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${SMTP_USER}>`,
      to: recipients.join(", "),
      subject: `Order #${params.orderId} Status Update: ${statusText} — Sawera Collection`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 28px 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="font-family: Georgia, serif; margin-bottom: 4px;">Sawera Collection</h2>
          <p style="color: #888; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Order Status Update</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0" />
          
          <p>Dear <strong>${params.customerName}</strong>,</p>
          <p>Your order <strong>#${params.orderId}</strong> status has been updated to:</p>
          
          <div style="background: #fdf6f5; border-left: 4px solid #8c5356; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
            <span style="font-size: 18px; font-weight: bold; color: #8c5356; text-transform: uppercase;">${params.status}</span>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #555;">
            ${
              params.status.toLowerCase() === "shipped"
                ? "Your parcel has been dispatched and is on its way to your delivery address via courier!"
                : params.status.toLowerCase() === "delivered"
                ? "Your order has been successfully delivered. Thank you for shopping with Sawera Collection!"
                : params.status.toLowerCase() === "cancelled"
                ? "Your order has been cancelled. If you have any questions, please contact our support."
                : "Your order is being processed by our fulfillment team."
            }
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0" />
          <p style="color: #888; font-size: 12px; text-align: center;">Help & Support: WhatsApp +92 306 6378857 | support@saweracollection.com</p>
        </div>
      `,
    });

    return { ok: true, message: "Status update email sent successfully." };
  } catch (error) {
    console.error("Status update email failed:", error);
    return { ok: false, message: "Failed to send status update email." };
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
