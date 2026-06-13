import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-lux py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Privacy Policy</h1>
        <div className="space-y-6 text-muted leading-relaxed">
          <p>
            At Sawera Collection, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your data when you visit our website or make a purchase.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p>
            When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, when you make a purchase, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the order information that we collect generally to fulfill any orders placed through the site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this order information to communicate with you and screen our orders for potential risk or fraud.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Data Retention</h2>
          <p>
            When you place an order through the site, we will maintain your order information for our records unless and until you ask us to delete this information.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Changes</h2>
          <p>
            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
          </p>
        </div>
      </div>
    </div>
  );
}
