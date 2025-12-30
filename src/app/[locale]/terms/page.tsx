"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50 dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-[#242424]">
      {/* Header */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <nav className="glass-card px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
              <img src="/images/icons/magic-wand.png" alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">FairyTaleAI</span>
          </Link>
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            ← Back to Home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Terms of Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Effective Date: December 25, 2025</p>

          <div className="glass-card p-6 sm:p-8 space-y-6 text-gray-700 dark:text-gray-300">
            <p>
              These Terms of Use (&quot;Terms&quot;) govern the use of the website https://www.fairytaleaitech.com/ (&quot;Website&quot;)
              and AI-based content generation services (&quot;Services&quot;) provided by FairyTale AI Tech (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p>
              By using our Website, registering an account, or subscribing, you (&quot;User&quot;, &quot;Client&quot;, or &quot;You&quot;) agree to comply
              with these Terms. If you do not agree with any provision, you must not use our service.
            </p>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">1. About the Service</h2>
              <p>
                FairyTale AI Tech is a platform that uses artificial intelligence (AI) technologies to create personalized
                children&apos;s fairy tales, therapeutic stories, audio materials, and illustrations based on data provided by parents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">2. Account and Access</h2>
              <p className="mb-2">
                <strong>2.1. Age Requirement:</strong> The service is intended for use by persons over 18 years of age
                (parents, guardians, educators). You may not create an account if you are under 18 years old.
              </p>
              <p className="mb-2">
                <strong>2.2. Parental Responsibility:</strong> If you use the service to create content for a child,
                you bear full responsibility for reviewing generated materials before showing them to the child.
              </p>
              <p>
                <strong>2.3. Security:</strong> You are obligated to keep your account password confidential. Any actions
                taken from your account are considered to have been performed by you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">3. Use of Artificial Intelligence (AI)</h2>
              <p className="mb-2">
                <strong>3.1. Nature of Content:</strong> You understand and agree that fairy tales and images are generated
                by AI algorithms. AI may make factual errors, logical inconsistencies, or create fictional situations (&quot;hallucinations&quot;).
              </p>
              <p className="mb-2">
                <strong>3.2. Filtering:</strong> We use security systems to prevent the generation of harmful content.
                However, given the nature of AI, we cannot guarantee 100% absence of unwanted elements.
              </p>
              <p className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-amber-800 dark:text-amber-300">
                <strong>3.3. Mandatory Moderation:</strong> You commit to independently reading and evaluating the fairy tale
                for age-appropriateness and sensitivity for your child before reading or showing it to them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">4. Subscription and Payments</h2>
              <p className="mb-2">
                <strong>4.1. Tariffs:</strong> Access to services is provided on a paid basis (e.g., monthly subscription).
                Current prices are listed on the Website.
              </p>
              <p className="mb-2">
                <strong>4.2. Auto-renewal:</strong> Subscription renews automatically at the end of the billing period.
                Funds are charged from the linked payment method. You can cancel auto-renewal at any time in your profile settings.
              </p>
              <p className="mb-2">
                <strong>4.3. Refund Policy:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We do not refund for an already paid subscription period if services (access to generation) were properly provided.</li>
                <li>We do not refund if a generated fairy tale simply &quot;didn&apos;t appeal to you&quot; for subjective reasons, as this is a creative AI process.</li>
                <li>Refund is possible only in case of a technical failure that prevented the service from being rendered (contact support@fairytaleaitech.com).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">5. Intellectual Property</h2>
              <p className="mb-2">
                <strong>5.1. Company Rights:</strong> Website design, software code, prompts (AI instructions), logos,
                and databases belong to the Company.
              </p>
              <p className="mb-2">
                <strong>5.2. Your Rights to Fairy Tales:</strong>
              </p>
              <p className="mb-2">
                Subject to full subscription payment, the Company grants you a non-exclusive, perpetual, worldwide license
                to use generated fairy tales, texts, and images for personal non-commercial purposes.
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li><strong>Allowed:</strong> Read to your child, print as a book for home library, share on personal social media, use in homeschooling.</li>
                <li><strong>Not allowed (without separate agreement):</strong> Sell generated fairy tales as books, use them for mass production of goods, resell audio files.</li>
              </ul>
              <p>
                <strong>5.3. User Content:</strong> By uploading data or story ideas, you guarantee that they do not violate
                third-party copyrights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">6. Prohibited Use</h2>
              <p className="mb-2">You are prohibited from:</p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li>Using the service to generate content containing violence, hatred, sexual undertones, or discrimination.</li>
                <li>Attempting to hack the site, use bots or scrapers to collect content.</li>
                <li>Using the service to create political propaganda or fake news.</li>
                <li>Reselling access to your account to third parties.</li>
              </ul>
              <p className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-800 dark:text-red-300">
                In case of violation of these rules, we reserve the right to immediately block your account without a refund.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">7. Disclaimer of Liability (Important)</h2>
              <p className="mb-2">
                <strong>7.1. Not Medicine:</strong> Our &quot;therapeutic fairy tales&quot; are a pedagogical support and entertainment tool.
                The service does not provide medical, psychological, or psychiatric services. Fairy tales cannot replace
                professional consultation with a psychologist.
              </p>
              <p>
                <strong>7.2. &quot;As Is&quot;:</strong> Services are provided on an &quot;as is&quot; basis. We do not guarantee that the service
                will meet your expectations or operate without interruption.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, the Company shall not be liable for any indirect damages, lost profits,
                or moral harm arising from the use or inability to use the service. The Company&apos;s total liability is limited
                to the amount you paid for using the service during the last month.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">9. Changes to Terms</h2>
              <p>
                We may update these Terms as the service develops. We will notify you of significant changes by email or
                through a notification on the site. Continued use of the site after changes means your agreement to the new version.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">10. Applicable Law and Dispute Resolution</h2>
              <p className="mb-2">
                <strong>10.1.</strong> These Terms are governed by applicable law.
              </p>
              <p>
                <strong>10.2.</strong> All disputes are first resolved through negotiations via the support service.
                If settlement is not possible, disputes are referred to the court at the Company&apos;s location.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">11. Contact Information</h2>
              <p className="mb-2">For questions related to these Terms, please contact us:</p>
              <ul className="list-none space-y-1">
                <li><strong>Company:</strong> FairyTale AI Tech</li>
                <li><strong>Email:</strong>{" "}
                  <a href="mailto:support@fairytaleaitech.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@fairytaleaitech.com
                  </a>
                </li>
                <li><strong>Website:</strong>{" "}
                  <a href="https://www.fairytaleaitech.com/" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    https://www.fairytaleaitech.com/
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 FairyTaleAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
