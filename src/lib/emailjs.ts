/**
 * Backward compatibility proxy for existing email references.
 * Routes all traffic through src/lib/email/mailer.ts
 */

import {
  sendOrderEmail,
  sendSupportEmail,
} from "@/lib/email/mailer";
import {
  ContactNotificationData,
  EmailSendResult,
  OrderActionType,
  OrderNotificationData,
} from "@/types/email";

export async function sendOrderNotification(data: OrderNotificationData): Promise<EmailSendResult> {
  const res = await sendOrderEmail({
    orderId: data.orderId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    shippingAddress: data.shippingAddress,
    items: data.products.map((p) => ({
      productName: p.productName,
      quantity: p.quantity,
      size: p.size,
      color: p.color,
      unitPrice: p.unitPrice,
      lineTotal: p.lineTotal,
    })),
    totalAmount: data.totalAmount,
    dateTime: data.dateTime || new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
    status: data.actionType || "Placed",
  });

  return {
    ok: res.ok,
    message: res.message,
  };
}

export async function sendOrderStatusUpdateNotification(params: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  status: OrderActionType | string;
}): Promise<EmailSendResult> {
  const res = await sendOrderEmail({
    orderId: params.orderId,
    customerName: params.customerName,
    customerPhone: "",
    customerEmail: params.customerEmail,
    shippingAddress: "",
    items: [],
    totalAmount: 0,
    dateTime: new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
    status: (params.status as OrderActionType) || "Processing",
  });

  return {
    ok: res.ok,
    message: res.message,
  };
}

export async function sendContactNotification(data: ContactNotificationData): Promise<EmailSendResult> {
  const res = await sendSupportEmail({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    dateTime: data.dateTime || new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
  });

  return {
    ok: res.ok,
    message: res.message,
  };
}
