/**
 * Branded HTML email templates for Sawera Collection.
 * Supports:
 * - Order Confirmation & Lifecycle Updates (From: order@saweracollection.com)
 * - Customer Support & Contact Inquiries (From: support@saweracollection.com)
 * - Owner Event Alerts (To: raowaqar127@gmail.com)
 * - Visitor Session Summaries (To: raowaqar127@gmail.com)
 */

export interface OrderItemSummary {
  productName: string;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
  size?: string;
  color?: string;
}

export interface SessionSummaryData {
  sessionId: string;
  userId?: string | null;
  startedAt: string;
  lastActivityAt: string;
  durationFormatted: string;
  trafficSource: string;
  referrer?: string | null;
  utmCampaign?: string | null;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  screenSize: string;
  location: string;
  landingPage: string;
  exitPage: string;
  pagesVisited: string[];
  productsViewed: string[];
  eventsCount: number;
  hadCartActivity: boolean;
  hadCheckout: boolean;
  hadPurchase: boolean;
}

const BRAND_HEADER = `
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="font-family: Georgia, serif; font-size: 26px; margin: 0; color: #1a1a1a; letter-spacing: 2px;">SAWERA COLLECTION</h1>
    <p style="color: #8c5356; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; font-weight: 600;">Made for Her. Inspired by Grace</p>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
`;

const BRAND_FOOTER = `
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 16px 0;" />
  <div style="text-align: center; font-size: 11px; color: #999; line-height: 1.6;">
    <p style="margin: 0;">Sawera Collection • Lahore, Punjab, Pakistan</p>
    <p style="margin: 4px 0 0 0;">WhatsApp: <a href="https://wa.me/923066378857" style="color: #8c5356; text-decoration: none;">+92 306 6378857</a> | <a href="https://saweracollection.com" style="color: #8c5356; text-decoration: none;">saweracollection.com</a></p>
  </div>
`;

/**
 * 1. Order Confirmation / Lifecycle Email Template
 */
export function buildOrderLifecycleTemplate(params: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  items: OrderItemSummary[];
  totalAmount: number;
  dateTime: string;
  status: "Placed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
}): { subject: string; html: string } {
  const isPlaced = params.status === "Placed";
  const subject = isPlaced
    ? `🛍️ Order Confirmation #${params.orderId} — Sawera Collection`
    : `📦 Order #${params.orderId} Update: ${params.status.toUpperCase()} — Sawera Collection`;

  const statusColor =
    params.status === "Delivered"
      ? "#16a34a"
      : params.status === "Cancelled"
      ? "#dc2626"
      : "#8c5356";

  const itemsHtml = params.items
    .map((item) => {
      const variant = [item.color, item.size].filter(Boolean).join(" / ");
      const variantText = variant ? ` <span style="color:#777;font-size:12px;">(${variant})</span>` : "";
      const priceText = item.lineTotal ? ` — Rs. ${item.lineTotal.toLocaleString("en-PK")}` : "";
      return `<li style="margin-bottom: 8px;"><strong>${item.productName}</strong>${variantText} × ${item.quantity}${priceText}</li>`;
    })
    .join("");

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #222; max-width: 600px; margin: 0 auto; padding: 28px 20px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
      ${BRAND_HEADER}
      
      <div style="background: #fdf8f7; border-left: 4px solid ${statusColor}; padding: 16px 20px; border-radius: 6px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 6px 0; color: ${statusColor}; font-size: 17px;">
          ${isPlaced ? "Order Confirmed!" : `Status Update: ${params.status}`}
        </h3>
        <p style="margin: 0; font-size: 14px; color: #444;">
          Dear <strong>${params.customerName}</strong>, ${
            isPlaced
              ? "thank you for shopping with Sawera Collection. Your order has been placed successfully and is being processed."
              : `your order #${params.orderId} is currently ${params.status.toLowerCase()}.`
          }
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #777;">Order Number:</td>
          <td style="padding: 6px 0; font-weight: bold; text-align: right;">#${params.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #777;">Date & Time:</td>
          <td style="padding: 6px 0; text-align: right;">${params.dateTime}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #777;">Payment Method:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 500;">Cash on Delivery (COD)</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #777;">Contact Number:</td>
          <td style="padding: 6px 0; text-align: right;">${params.customerPhone}</td>
        </tr>
      </table>

      <div style="margin-bottom: 20px; padding: 14px; background: #fafafa; border-radius: 6px;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8c5356;">Shipping Destination</h4>
        <p style="margin: 0; font-size: 13px; color: #444; line-height: 1.5;">${params.shippingAddress}</p>
      </div>

      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8c5356;">Ordered Items</h4>
        <ul style="padding-left: 20px; margin: 0; font-size: 13px; line-height: 1.8;">
          ${itemsHtml}
        </ul>
      </div>

      <div style="border-top: 2px solid #1a1a1a; padding-top: 14px; text-align: right;">
        <span style="font-size: 13px; color: #666; margin-right: 12px;">Grand Total (COD):</span>
        <span style="font-size: 20px; font-weight: bold; color: #8c5356;">Rs. ${params.totalAmount.toLocaleString("en-PK")}</span>
      </div>

      ${BRAND_FOOTER}
    </div>
  `;

  return { subject, html };
}

/**
 * 2. Visitor Session Summary Email Template (Sent to raowaqar127@gmail.com)
 */
export function buildSessionSummaryTemplate(data: SessionSummaryData): { subject: string; html: string } {
  const subject = `🟣 Visitor Session Ended — Sawera Collection — ${data.location || "Pakistan"} [${data.durationFormatted}]`;

  const pagesList = data.pagesVisited.length > 0
    ? data.pagesVisited.map((p) => `<li style="padding: 2px 0;"><code>${p}</code></li>`).join("")
    : "<li>Home</li>";

  const productsList = data.productsViewed.length > 0
    ? data.productsViewed.map((p) => `<li style="padding: 2px 0;"><strong>${p}</strong></li>`).join("")
    : "<li>None</li>";

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; max-width: 620px; margin: 0 auto; padding: 24px 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="border-bottom: 2px solid #8c5356; padding-bottom: 14px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 style="margin: 0; font-family: Georgia, serif; font-size: 20px; color: #0f172a;">Visitor Session Summary</h2>
          <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; color: #475569;">${data.sessionId}</span>
        </div>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Sawera Collection Visitor Intelligence</p>
      </div>

      <!-- Quick Metrics Grid -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <tr style="background: #f8fafc;">
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b;">Duration:</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${data.durationFormatted}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b;">Traffic Source:</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #8c5356;">${data.trafficSource}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b;">Device & OS:</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${data.deviceType} (${data.operatingSystem})</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b;">Browser & Screen:</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${data.browser} • ${data.screenSize}</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b;">Approx. Location:</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 500;">${data.location || "Pakistan"}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #64748b;">Total Events:</td>
          <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold;">${data.eventsCount}</td>
        </tr>
      </table>

      <!-- Funnel Milestones -->
      <div style="background: #fdf8f7; border: 1px solid #f2dfdf; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8c5356;">Funnel Actions</h4>
        <div style="display: flex; gap: 12px; font-size: 13px;">
          <span style="padding: 4px 8px; border-radius: 4px; background: ${data.hadCartActivity ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #94a3b8;'} font-weight: 600;">
            ${data.hadCartActivity ? "✓ Added to Bag" : "✗ No Cart"}
          </span>
          <span style="padding: 4px 8px; border-radius: 4px; background: ${data.hadCheckout ? '#dbeafe; color: #1d4ed8;' : '#f1f5f9; color: #94a3b8;'} font-weight: 600;">
            ${data.hadCheckout ? "✓ Checkout Started" : "✗ No Checkout"}
          </span>
          <span style="padding: 4px 8px; border-radius: 4px; background: ${data.hadPurchase ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #94a3b8;'} font-weight: 600;">
            ${data.hadPurchase ? "🎉 PURCHASE COMPLETED" : "✗ No Purchase"}
          </span>
        </div>
      </div>

      <!-- Navigation & Products Journey -->
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #64748b;">Pages Visited:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.6;">
          ${pagesList}
        </ul>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #64748b;">Products Viewed:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.6;">
          ${productsList}
        </ul>
      </div>

      <table style="width: 100%; font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        <tr>
          <td><strong>Landing Page:</strong> ${data.landingPage || "/"}</td>
          <td style="text-align: right;"><strong>Exit Page:</strong> ${data.exitPage || "/"}</td>
        </tr>
        <tr>
          <td><strong>Started:</strong> ${data.startedAt}</td>
          <td style="text-align: right;"><strong>Ended:</strong> ${data.lastActivityAt}</td>
        </tr>
      </table>
    </div>
  `;

  return { subject, html };
}

/**
 * 3. Important Event Real-Time Alert Email Template (Sent to raowaqar127@gmail.com)
 */
export function buildImportantEventAlertTemplate(params: {
  eventTitle: string;
  eventType: "CHECKOUT_STARTED" | "HIGH_VALUE_CART" | "ADD_TO_CART" | "PURCHASE" | "SYSTEM_ALERT";
  details: Record<string, string | number | undefined | null>;
  sessionId?: string;
}): { subject: string; html: string } {
  const subject = `⚡ [ALERT] ${params.eventTitle} — Sawera Collection`;

  const detailsRows = Object.entries(params.details)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `
      <tr>
        <td style="padding: 6px 12px; border: 1px solid #e2e8f0; color: #64748b; text-transform: capitalize; font-size: 13px;">${k.replace(/([A-Z])/g, ' $1')}:</td>
        <td style="padding: 6px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a; font-size: 13px;">${v}</td>
      </tr>
    `)
    .join("");

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; max-width: 540px; margin: 0 auto; padding: 24px 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h3 style="margin: 0 0 6px 0; color: #8c5356; font-size: 18px;">⚡ ${params.eventTitle}</h3>
      <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b;">
        Timestamp: ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })} ${params.sessionId ? `• Session: ${params.sessionId}` : ""}
      </p>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        ${detailsRows}
      </table>

      <p style="margin: 0; font-size: 11px; color: #94a3b8; text-align: center;">
        Sawera Collection Real-Time Monitoring
      </p>
    </div>
  `;

  return { subject, html };
}

/**
 * 4. Customer Support / Contact Form Email Template
 */
export function buildContactNotificationTemplate(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  dateTime: string;
}): { subject: string; html: string } {
  const subject = `💬 [Support Inquiry] Message from ${data.name} — Sawera Collection`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; max-width: 540px; margin: 0 auto; padding: 28px 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      ${BRAND_HEADER}
      <h3 style="margin: 0 0 12px 0; color: #8c5356;">Customer Support Inquiry</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #8c5356;">${data.email}</a></p>
      <p><strong>Phone:</strong> ${data.phone ?? "Not provided"}</p>
      <p><strong>Received At:</strong> ${data.dateTime}</p>
      
      <div style="background: #fdf8f7; border-left: 3px solid #8c5356; padding: 14px 18px; border-radius: 4px; line-height: 1.6; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #8c5356;">Message:</p>
        <p style="margin: 0; color: #333; font-size: 14px;">${data.message}</p>
      </div>

      ${BRAND_FOOTER}
    </div>
  `;

  return { subject, html };
}
