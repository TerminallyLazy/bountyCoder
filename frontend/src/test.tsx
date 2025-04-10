import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Qwen 32B Coder API Admin Dashboard</h1>
      <p className="mt-2">Welcome to the admin dashboard for the Qwen 32B Coder API service.</p>
      <div className="mt-4">
        <button className="btn-primary mr-2">Login</button>
        <button className="btn-secondary">Register</button>
      </div>
    </div>
  );
};

export default TestComponent;
