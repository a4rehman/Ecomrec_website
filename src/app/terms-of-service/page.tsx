import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsOfServicePage() {
  return (
    <div className="container-lux py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Terms of Service</h1>
        <div className="space-y-6 text-muted leading-relaxed">
          <p>
            Welcome to Sawera Collection. By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. General Conditions</h2>
          <p>
            We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Products and Pricing</h2>
          <p>
            Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Accuracy of Billing and Account Information</h2>
          <p>
            We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Intellectual Property</h2>
          <p>
            All content on this site, including text, graphics, logos, images, and software, is the property of Sawera Collection and is protected by international copyright laws.
          </p>
        </div>
      </div>
    </div>
  );
}
