"use client";

import { CopyGenerator } from "~/components/copy-generator/CopyGenerator";

const Dashboard: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <CopyGenerator />
      </div>
    </main>
  );
};

export default Dashboard;
