"use client";

import Link from "next/link";

export default function PolicyPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Privacy Policy FairyTale AI Tech</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Effective Date: December 25, 2025</p>

          <div className="glass-card p-6 sm:p-8 space-y-6 text-gray-700 dark:text-gray-300">
            <p>
              Your privacy and the security of your family&apos;s data are of paramount importance to us. FairyTale AI Tech
              (&quot;we&quot;, &quot;our&quot;, or &quot;Platform&quot;) is committed to respecting your privacy and complying with all applicable
              laws and regulations regarding any personal information we may collect about you and your children on our
              website https://www.fairytaleaitech.com/.
            </p>
            <p>
              By using our service to create personalized fairy tales and developmental content, you entrust us with
              personal information. We value this trust and are committed to protecting this data.
            </p>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                We collect information that you voluntarily provide to us for the service to function, as well as
                technical data collected automatically.
              </p>

              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">A. Information Provided by You (Parent/Guardian)</h3>
              <p className="mb-2">To create an account and generate fairy tales, we may request:</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li><strong>Parent data:</strong> Name, email address, payment information (processed by third-party payment processors).</li>
                <li><strong>Content generation data (Child Data):</strong> Since our service is personalized, you may enter the child&apos;s name, age, gender, interests, fears, or behavioral characteristics (for therapeutic purposes).</li>
              </ul>
              <p className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-amber-800 dark:text-amber-300">
                <strong>Important:</strong> We collect this data only with the consent of a parent or legal guardian. This data is used
                exclusively for content generation (fairy tale text, audio, or images) and is not used to create marketing profiles of children.
              </p>

              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 mt-4">B. Information Collected Automatically</h3>
              <p className="mb-2">When using the site, our servers and third-party analytics tools may automatically log:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address and device type.</li>
                <li>Browser type and operating system.</li>
                <li>Site actions (which fairy tales were created, usage time).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">2. How We Use Your Information</h2>
              <p className="mb-2">We use the collected data for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Service provision:</strong> Generating personalized fairy tales, illustrations, and audio materials using Artificial Intelligence (AI) technologies.</li>
                <li><strong>Quality improvement:</strong> Analyzing which storylines users like for fine-tuning and adjusting our models (in anonymized form).</li>
                <li><strong>Account management:</strong> Processing payments, subscriptions, and sending notifications about content readiness.</li>
                <li><strong>Support:</strong> Responding to your inquiries and resolving technical issues.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">3. Use of Artificial Intelligence (AI) Technologies</h2>
              <p className="mb-2">Our platform uses advanced AI models (LLM) to generate text and images.</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Text prompts containing parameters you enter (e.g., &quot;a fairy tale about a boy Pete who is afraid of the dark&quot;) are transmitted to our AI partners through secure APIs.</li>
                <li>We take measures to ensure that data is not used by AI providers to train their global models in a way that would identify a child.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">4. Children&apos;s Privacy (COPPA and GDPR-K)</h2>
              <p className="mb-3 font-semibold text-gray-800 dark:text-gray-200">This is a key section of our policy. We take the protection of minors&apos; data seriously.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Parental control:</strong> Our service is intended for use by parents or under their supervision. Account registration is only permitted for persons over 18 years of age.</li>
                <li><strong>Consent:</strong> By entering data about a child (name, age, habits) to create a fairy tale, you, as a parent or legal guardian, give explicit consent to the processing of this data for the purpose of providing the service.</li>
                <li><strong>Data minimization:</strong> We do not require more information about the child than is necessary to create a quality story. You can use pseudonyms instead of children&apos;s real names.</li>
                <li><strong>No sale:</strong> We never sell children&apos;s personal information to third parties and do not use children&apos;s data for targeted advertising.</li>
              </ul>
              <p className="mt-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-blue-800 dark:text-blue-300">
                If you believe that we have collected information from a child without parental consent, please contact us at{" "}
                <a href="mailto:support@fairytaleaitech.com" className="underline">support@fairytaleaitech.com</a>, and we will immediately delete this data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">5. Disclosure of Information to Third Parties</h2>
              <p className="mb-2">We may share data with trusted third-party services that help us manage our site and provide services:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>AI service providers:</strong> For text and image generation.</li>
                <li><strong>Payment systems:</strong> For processing subscription payments (we do not store full card data on our servers).</li>
                <li><strong>Analytics and hosting:</strong> Google Analytics, cloud providers (for data storage).</li>
              </ul>
              <p className="mt-2">All third parties are required to maintain the confidentiality of your data in accordance with the law.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">6. Data Security</h2>
              <p>
                We apply generally accepted commercial protection methods (encryption, access restrictions) to prevent loss,
                theft, and unauthorized access to data. However, no method of transmission over the Internet is 100% secure.
                You are responsible for keeping your password safe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">7. Data Retention</h2>
              <p>
                We store your personal information and the history of created fairy tales as long as your account is active
                or as necessary to provide services. You can delete individual stories or your entire account at any time
                through your profile settings. When an account is deleted, personal data is deleted or fully anonymized.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">8. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Request access to personal data we hold about you and your child.</li>
                <li>Correct inaccurate data.</li>
                <li>Request deletion of your data (&quot;right to be forgotten&quot;).</li>
                <li>Withdraw consent to data processing.</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact us by email.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">9. Cookies</h2>
              <p>
                We use cookies to improve website performance and analyze traffic. You can disable cookies in your browser
                settings, but this may affect the functionality of some site features (e.g., autofill or session saving).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">10. Changes to Privacy Policy</h2>
              <p>
                We may update this policy as our service develops. When making significant changes, we will notify you by
                email or through an announcement on the site. Continued use of the site after changes are made means your
                consent to the new policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">11. Contact Us</h2>
              <p>
                If you have questions about our privacy policy or how we handle children&apos;s data, please contact us:
              </p>
              <ul className="list-none mt-2 space-y-1">
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
