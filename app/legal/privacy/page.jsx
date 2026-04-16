'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="bg-black text-white w-full min-h-[100dvh] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <i className="ph-bold ph-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-bold">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">1. Introduction</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information when you use our application.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">2. Information We Collect</h2>
          <p className="text-white/70 text-sm leading-relaxed font-semibold mb-2">We may collect information from you in the following ways:</p>
          <ul className="text-white/70 text-sm leading-relaxed space-y-2 list-disc list-inside">
            <li><span className="font-semibold">Directly from you:</span> Such as your name, email address, and profile information</li>
            <li><span className="font-semibold">Automatically:</span> Such as your IP address, device type, and browsing activity</li>
            <li><span className="font-semibold">From third parties:</span> Such as authentication providers and analytics services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">3. How We Use Your Information</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="text-white/70 text-sm leading-relaxed mt-3 space-y-2 list-disc list-inside">
            <li>Provide and improve our services</li>
            <li>Personalize your experience</li>
            <li>Communicate with you about updates and offers</li>
            <li>Protect against fraud and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">4. Data Security</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">5. Cookies and Tracking</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            We may use cookies, web beacons, and similar tracking technologies to track activity in our application and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">6. Third-Party Links</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Our application may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">7. Your Rights</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data. To exercise these rights, please contact us using the information provided below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">8. Children's Privacy</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Our application is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently received such information, we will take steps to delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">9. Changes to This Policy</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our application and updating the effective date below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">10. Contact Us</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us through the Contact Us option in your account settings.
          </p>
        </section>

        <section className="pb-4">
          <p className="text-white/50 text-xs">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
