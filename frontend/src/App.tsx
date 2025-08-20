import React from 'react';
import ExampleComponent from './components/ExampleComponent';
import { useFetch } from './hooks/useFetch';

export default function App() {
  const { data: health, loading, error } = useFetch<{ status: string }>('/api/health');

  return (
    <div className="font-sans p-6 max-w-4xl mx-auto space-y-8">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold">Frontend Boilerplate</h1>
        <p className="text-gray-600 mt-1">A clean starting point for React projects.</p>
      </header>

      <main className="space-y-8">
        {/* SECTION 1: Demonstrates a basic component with tests */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3">
            Example Component
          </h2>
          <div className="space-y-4">
            <ExampleComponent title="Component without Optional Data" />
            <ExampleComponent 
              title="Component with Optional Data" 
              data={{ user: 'test-user', timestamp: new Date().toISOString() }}
            />
          </div>
        </div>

        {/* SECTION 2: Demonstrates the useFetch hook for API calls */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-l-4 border-green-500 pl-3">
            API Connection Test (useFetch hook)
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {loading && <p className="text-gray-600">Loading API status...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}
            {health && (
              <div>
                <h3 className="text-lg font-medium mb-2">Health Check Response:</h3>
                <pre className="bg-white p-3 rounded border text-sm overflow-auto">
                  {JSON.stringify(health, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}