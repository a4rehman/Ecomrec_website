import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Exchange",
  description:
    "Shop worry-free at Sawera Collection — our easy return and exchange policy for women's suits, dresses and festive wear in Pakistan.",
  alternates: { canonical: "https://www.saweracollection.com/return-exchange" },
  openGraph: {
    title: "Return & Exchange | Sawera Collection",
    description: "Easy returns and exchanges on all Sawera Collection orders.",
    url: "https://www.saweracollection.com/return-exchange"
  }
};

export default function ReturnExchangePage() {
  return (
    <div className="container-lux py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Return & Exchange</h1>
        <div className="space-y-6 text-muted leading-relaxed">
          <p>
            At Sawera Collection, we strive to ensure that you are completely satisfied with your purchase. If for any reason you are not, we offer a straightforward return and exchange process.
          </p>
          <div className="my-8 border-l-4 border-accent pl-6 italic">
            <p className="mb-2">
              In accordance with Islamic principles of trade, accommodating returns and exchanges (Iqala) is highly encouraged and permissible (Jaiz). 
            </p>
            <p>
              Furthermore, Islam strictly forbids deceit or dishonesty in any transaction. We kindly ask that all items be returned honestly in their original, pristine condition—exactly as they were provided to you—without any intentional damage or concealed flaws.
            </p>
          </div>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Eligibility for Returns & Exchanges</h2>
          <p>
            Items must be returned within 14 days of delivery. They must be unworn, unwashed, and in their original condition with all tags attached. Customized or made-to-measure items are not eligible for returns or exchanges unless there is a manufacturing defect.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Process</h2>
          <p>
            To initiate a return or exchange, please contact our customer care team with your order number and reason for return. We will provide you with the return shipping address and instructions.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Shipping Costs</h2>
          <p>
            Customers are responsible for return shipping costs unless the item received was damaged, defective, or incorrect.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Exchange Timelines</h2>
          <p>
            Once we receive your returned item, exchanges will be processed within 5-7 business days, subject to inventory availability.
          </p>
        </div>
      </div>
    </div>
  );
}
