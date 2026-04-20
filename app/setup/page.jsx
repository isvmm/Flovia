'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/apiUrl';

export default function SetupPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const setupDatabase = async () => {
    setLoading(true);
    setStatus('Setting up database tables...');
    try {
      const response = await fetch(apiUrl(`/setup-db`), {
        method: 'POST'
      });
      const data = await response.json();
      setStatus(`✅ Setup: ${data.message}`);
    } catch (error) {
      setStatus(`❌ Setup Error: ${error.message}`);
    }
    setLoading(false);
  };

  const seedDatabase = async () => {
    setLoading(true);
    setStatus('Seeding database with sample data...');
    try {
      const response = await fetch(apiUrl(`/seed-db`), {
        method: 'POST'
      });
      const data = await response.json();
      setStatus(`✅ Seed: ${data.message} - Users: ${data.stats?.users}, Posts: ${data.stats?.posts}, Comments: ${data.stats?.comments}`);
    } catch (error) {
      setStatus(`❌ Seed Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-4xl font-bold">Database Setup</h1>
      <div className="bg-white/10 p-8 rounded-2xl max-w-md w-full">
        <button
          onClick={setupDatabase}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold mb-4"
        >
          {loading ? 'Processing...' : 'Create Tables'}
        </button>
        <button
          onClick={seedDatabase}
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-semibold"
        >
          {loading ? 'Processing...' : 'Seed Sample Data'}
        </button>
      </div>
      {status && (
        <div className="bg-white/20 p-4 rounded-lg max-w-md w-full text-center">
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}
