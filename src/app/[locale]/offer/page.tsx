"use client";

import Link from "next/link";

export default function OfferPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
      {/* Header */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <nav className="glass-card px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
              <img src="/images/icons/magic-wand.png" alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold text-gray-800">FairyTaleAI</span>
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to Home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Public Offer (User Agreement)</h1>
          <h2 className="text-xl text-gray-700 mb-4">FairyTale AI Tech</h2>
          <p className="text-gray-600 mb-8">Last Updated: December 25, 2025</p>

          <div className="glass-card p-6 sm:p-8 space-y-6 text-gray-700">
            <p>
              This document is an official proposal (public offer) from FairyTale AI Tech (hereinafter referred to as
              &quot;Service Provider&quot; or &quot;Platform&quot;), addressed to any individual (hereinafter referred to as &quot;User&quot;),
              to enter into a service agreement on the terms set forth below.
            </p>
            <p>
              Registration on the website https://www.fairytaleaitech.com/, payment for services, or use of the Platform&apos;s
              functionality constitutes full and unconditional acceptance of the terms of this Offer.
            </p>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Subject of the Agreement</h2>
              <p className="mb-2">
                <strong>1.1.</strong> The Service Provider grants the User access to software (SaaS) powered by Artificial
                Intelligence (AI) that enables the generation of personalized children&apos;s fairy tales, images, and audio
                materials (hereinafter referred to as &quot;Services&quot;).
              </p>
              <p>
                <strong>1.2.</strong> Services are provided on a paid basis according to the tariffs published on the Website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Account and Security</h2>
              <p className="mb-2">
                <strong>2.1.</strong> To use the service, the User must complete the registration process.
              </p>
              <p className="mb-2">
                <strong>2.2.</strong> <strong>Age Restrictions:</strong> By registering on the Website, the User guarantees
                that they are at least 18 years old. The service is intended for use by parents/guardians in the interest
                of children. Independent account creation by children is prohibited.
              </p>
              <p>
                <strong>2.3.</strong> The User bears full responsibility for the security of their credentials (login and password).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Subscription and Payment Terms</h2>
              <p className="mb-2">
                <strong>3.1.</strong> Access to content generation is provided on a subscription basis or through one-time package purchases.
              </p>
              <p className="mb-2">
                <strong>3.2.</strong> <strong>Cost:</strong> The current subscription cost is listed on the Website (e.g., $29/month).
                The Service Provider has the right to change tariffs unilaterally, while the cost of an already paid period remains unchanged.
              </p>
              <p className="mb-2">
                <strong>3.3.</strong> <strong>Automatic Renewal:</strong> If the User has subscribed, payment for the next period
                will be automatically charged to the linked card until the User cancels the subscription in the Personal Account settings.
              </p>
              <p className="mb-2">
                <strong>3.4.</strong> <strong>Refunds:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>In case of technical failures that prevented the use of the Service, a refund is made upon request to technical support.</li>
                <li>Refunds for properly rendered services (generated content) are not provided, as digital content is considered consumed at the moment of its generation.</li>
                <li>The User can cancel the subscription at any time; access will be retained until the end of the paid period.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Intellectual Property</h2>
              <p className="mb-2">
                <strong>4.1.</strong> <strong>Platform Content:</strong> The website design, logo, software code, and algorithms
                belong to the Service Provider.
              </p>
              <p className="mb-2">
                <strong>4.2.</strong> <strong>Generated Content (Fairy Tales and Illustrations):</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li>The Service Provider grants the User a non-exclusive, worldwide, perpetual license to use generated
                fairy tales and images for personal non-commercial purposes (reading to a child, printing for home use,
                posting on personal social media).</li>
                <li>Commercial use of generated fairy tales (selling books, audio recordings) requires a separate agreement
                or selection of an appropriate business tariff (if available).</li>
              </ul>
              <p className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                <strong>4.3. AI Disclaimer:</strong> The User acknowledges that the content is created by Artificial Intelligence.
                Due to the specifics of copyright legislation in different countries, AI-generated content may not be protected
                by copyright as a unique work.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Disclaimer of Liability (Important Section)</h2>
              <p className="mb-2">
                <strong>5.1.</strong> <strong>Therapeutic Nature:</strong> Fairy tales generated by the Platform are for
                entertainment and general developmental purposes. The Platform&apos;s services are not medical, psychological,
                or psychotherapeutic assistance.
              </p>
              <p className="mb-2">
                <strong>5.2.</strong> The Service Provider is not responsible for the effectiveness of the &quot;therapeutic&quot;
                impact of fairy tales on a child. In case of serious psychological problems in a child, the User should
                consult a professional doctor.
              </p>
              <p className="mb-2">
                <strong>5.3.</strong> <strong>AI Operation:</strong> The User understands that AI may (rarely) make mistakes,
                generate illogical text, or fabricated facts (&quot;hallucinations&quot;). The Service Provider takes content filtering
                measures but does not guarantee complete error-free generation.
              </p>
              <p>
                <strong>5.4.</strong> The website is provided on an &quot;as is&quot; basis. The Service Provider does not guarantee
                uninterrupted operation of the Website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. User Content and Rules of Conduct</h2>
              <p className="mb-2">
                <strong>6.1.</strong> When entering data for fairy tale generation (names, plots), it is prohibited to use:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li>Profanity, insults, calls for violence.</li>
                <li>Information that violates the rights of third parties.</li>
              </ul>
              <p>
                <strong>6.2.</strong> The Service Provider has the right to block the User&apos;s account without a refund if these rules are violated.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Term and Termination</h2>
              <p className="mb-2">
                <strong>7.1.</strong> The agreement comes into force upon acceptance of the Offer and remains valid until
                the User&apos;s account is deleted by the User or the Service Provider.
              </p>
              <p>
                <strong>7.2.</strong> The User may terminate the agreement at any time by deleting their account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Dispute Resolution and Applicable Law</h2>
              <p className="mb-2">
                <strong>8.1.</strong> All disputes are resolved through negotiations via support service.
              </p>
              <p>
                <strong>8.2.</strong> If a dispute cannot be resolved, it shall be considered in court at the location of
                the Service Provider, in accordance with applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Service Provider Details</h2>
              <ul className="list-none space-y-1">
                <li><strong>Company Name:</strong> FairyTale AI Tech</li>
                <li><strong>Contact Email:</strong>{" "}
                  <a href="mailto:support@fairytaleaitech.com" className="text-blue-600 hover:underline">
                    support@fairytaleaitech.com
                  </a>
                </li>
                <li><strong>Website:</strong>{" "}
                  <a href="https://www.fairytaleaitech.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    https://www.fairytaleaitech.com/
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; 2025 FairyTaleAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
