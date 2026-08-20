export type OrderActionType = "Placed" | "Cancelled" | "Replacement" | "Return";

export type OrderNotificationItem = {
  productName: string;
  quantity: number;
  size?: string;
  color?: string;
  unitPrice?: number;
  lineTotal?: number;
};

export type OrderNotificationData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  products: OrderNotificationItem[];
  totalAmount: number;
  shippingAddress: string;
  dateTime: string;
  actionType: OrderActionType;
};

export type ContactNotificationData = {
  name: string;
  email: string;
  message: string;
  phone?: string;
  dateTime: string;
};

export type EmailSendResult = {
  ok: boolean;
  message: string;
};
