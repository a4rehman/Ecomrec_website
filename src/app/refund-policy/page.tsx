import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPolicyPage() {
  return (
    <div className="container-lux py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Refund Policy</h1>
        <div className="space-y-6 text-muted leading-relaxed">
          <p>
            Our refund policy is designed to give you peace of mind when shopping with Sawera Collection. Please review the terms below to understand how refunds are processed.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Eligibility</h2>
          <p>
            Refunds are only applicable to prepaid orders that have been successfully returned according to our Return & Exchange policy, or orders cancelled within the allowed 24-hour window. Cash on Delivery (COD) orders are not eligible for refunds; they can only be exchanged for store credit or other items.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Processing Time</h2>
          <p>
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-10 business days.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Late or Missing Refunds</h2>
          <p>
            If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted. If you’ve done all of this and you still have not received your refund, please contact our support team.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Sale Items</h2>
          <p>
            Only regular-priced items may be refunded. Unfortunately, sale or clearance items cannot be refunded and are considered final sale.
          </p>
        </div>
      </div>
    </div>
  );
}
