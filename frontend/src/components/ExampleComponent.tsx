import React from 'react';

interface ExampleComponentProps {
  title: string;
  data?: any; // Optional data prop for conditional rendering
}

export default function ExampleComponent({ title, data }: ExampleComponentProps) {
  return (
    <section className="space-y-4 p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-semibold">{title}</h2>
      
      <div className="bg-white p-4 rounded border">
        <p className="text-gray-700">This is a simple, reusable component.</p>
        <p className="text-gray-500 text-sm">It receives its title via props.</p>
      </div>

      {/* This section demonstrates the conditional rendering tested in the example test file. */}
      {data && (
        <div className="bg-gray-50 p-4 rounded border border-gray-200 mt-4">
          <h3 className="text-lg font-medium mb-2">Conditional Data:</h3>
          <pre className="bg-white p-3 rounded border text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}