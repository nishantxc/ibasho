import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </div>
    </div>
  );
};

export default AppLayout; 