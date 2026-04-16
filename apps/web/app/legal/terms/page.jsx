'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';

export default function TermsPage() {
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
          <h1 className="text-lg font-bold">Terms of Service</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">1. Acceptance of Terms</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">2. Use License</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Permission is granted to temporarily download one copy of the materials (information or software) on our application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="text-white/70 text-sm leading-relaxed mt-3 space-y-2 list-disc list-inside">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the application</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">3. Disclaimer</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            The materials on our application are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">4. Limitations</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our application, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">5. Accuracy of Materials</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            The materials appearing on our application could include technical, typographical, or photographic errors. We do not warrant that any of the materials in our application are accurate, complete, or current. We may make changes to the materials contained on our application at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">6. Links</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">7. Modifications</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            We may revise these terms of service for our application at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-fuchsia-400">8. Governing Law</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which the company is located, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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
