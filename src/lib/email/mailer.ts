import nodemailer from "nodemailer";
import {
  buildOrderLifecycleTemplate,
  buildSessionSummaryTemplate,
  buildImportantEventAlertTemplate,
  buildContactNotificationTemplate,
  OrderItemSummary,
  SessionSummaryData,
} from "./templates";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "order@saweracollection.com";
const SMTP_PASS = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "";

export const ORDERS_EMAIL = process.env.ORDERS_EMAIL || "order@saweracollection.com";
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@saweracollection.com";
export const ANALYTICS_ALERT_EMAIL = process.env.ANALYTICS_ALERT_EMAIL || "raowaqar127@gmail.com";
const FROM_NAME = "Sawera Collection";

/**
 * Creates a reusable server-side Nodemailer transporter with connection pooling.
 */
function getTransporter() {
  if (!SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes("example.com");
}

/**
 * 1. Send Order Lifecycle Email (Confirmation, Status Updates)
 * Sent FROM order@saweracollection.com to Customer + Owner BCC
 */
export async function sendOrderEmail(params: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  items: OrderItemSummary[];
  totalAmount: number;
  dateTime: string;
  status: "Placed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
}): Promise<{ ok: boolean; message: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP credentials not configured. Order email skipped.");
    return { ok: false, message: "SMTP credentials not configured" };
  }

  try {
    const { subject, html } = buildOrderLifecycleTemplate(params);

    const recipients: string[] = [ANALYTICS_ALERT_EMAIL];
    if (params.customerEmail && isValidEmail(params.customerEmail)) {
      recipients.push(params.customerEmail);
    }

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${ORDERS_EMAIL}>`,
      to: recipients.join(", "),
      replyTo: ORDERS_EMAIL,
      subject,
      html,
    });

    console.info(`[email] Order notification sent successfully for #${params.orderId}`);
    return { ok: true, message: "Order email sent successfully." };
  } catch (err: any) {
    console.error("[email] Failed to send order email:", err?.message || err);
    return { ok: false, message: "Failed to send order email." };
  }
}

/**
 * 2. Send Visitor Session Summary Email
 * Sent TO raowaqar127@gmail.com
 */
export async function sendSessionSummaryEmail(
  data: SessionSummaryData
): Promise<{ ok: boolean; message: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured. Session summary email skipped.");
    return { ok: false, message: "SMTP not configured" };
  }

  try {
    const { subject, html } = buildSessionSummaryTemplate(data);

    await transporter.sendMail({
      from: `"${FROM_NAME} Intelligence" <${ORDERS_EMAIL}>`,
      to: ANALYTICS_ALERT_EMAIL,
      subject,
      html,
    });

    console.info(`[email] Session summary email sent for session: ${data.sessionId}`);
    return { ok: true, message: "Session summary email dispatched." };
  } catch (err: any) {
    console.error("[email] Failed to send session summary email:", err?.message || err);
    return { ok: false, message: "Failed to send session summary email." };
  }
}

/**
 * 3. Send Important Event Real-Time Alert Email
 * Sent TO raowaqar127@gmail.com for critical milestones (Purchase, Checkout start, High-value Cart)
 */
export async function sendImportantEventAlert(params: {
  eventTitle: string;
  eventType: "CHECKOUT_STARTED" | "HIGH_VALUE_CART" | "ADD_TO_CART" | "PURCHASE" | "SYSTEM_ALERT";
  details: Record<string, string | number | undefined | null>;
  sessionId?: string;
}): Promise<{ ok: boolean; message: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { ok: false, message: "SMTP not configured" };
  }

  try {
    const { subject, html } = buildImportantEventAlertTemplate(params);

    await transporter.sendMail({
      from: `"${FROM_NAME} Alerts" <${ORDERS_EMAIL}>`,
      to: ANALYTICS_ALERT_EMAIL,
      subject,
      html,
    });

    console.info(`[email] Event alert sent: ${params.eventTitle}`);
    return { ok: true, message: "Event alert sent." };
  } catch (err: any) {
    console.error("[email] Failed to send event alert email:", err?.message || err);
    return { ok: false, message: "Failed to send event alert email." };
  }
}

/**
 * 4. Send Customer Support Inquiry Email
 * Sent FROM/TO support@saweracollection.com + copy to raowaqar127@gmail.com
 */
export async function sendSupportEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  dateTime: string;
}): Promise<{ ok: boolean; message: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { ok: false, message: "SMTP not configured" };
  }

  try {
    const { subject, html } = buildContactNotificationTemplate(data);

    await transporter.sendMail({
      from: `"${FROM_NAME} Support" <${SUPPORT_EMAIL}>`,
      to: `${SUPPORT_EMAIL}, ${ANALYTICS_ALERT_EMAIL}`,
      replyTo: data.email,
      subject,
      html,
    });

    console.info(`[email] Support inquiry email sent from ${data.name}`);
    return { ok: true, message: "Support inquiry sent successfully." };
  } catch (err: any) {
    console.error("[email] Failed to send support email:", err?.message || err);
    return { ok: false, message: "Failed to send support email." };
  }
}
