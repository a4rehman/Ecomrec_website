import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Cancellation",
};

export default function OrderCancellationPage() {
  return (
    <div className="container-lux py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Order Cancellation</h1>
        <div className="space-y-6 text-muted leading-relaxed">
          <p>
            We understand that circumstances may change after you have placed an order. Our cancellation policy is designed to be as accommodating as possible while ensuring operational efficiency.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Cancellation Window</h2>
          <p>
            Orders can be cancelled within 24 hours of placement without any penalty. If you wish to cancel an order, please reach out to our customer support team immediately.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Post-Dispatch Cancellation</h2>
          <p>
            Once an order has been dispatched from our warehouse, it cannot be cancelled. You will need to wait for the delivery and follow our standard return process if you no longer wish to keep the item.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Custom Orders</h2>
          <p>
            Customized or stitched-to-measure orders cannot be cancelled once the tailoring process has begun (typically within 24 hours of order placement).
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Refunds for Cancellations</h2>
          <p>
            For prepaid orders cancelled within the allowed window, refunds will be processed to the original payment method within 5-10 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
