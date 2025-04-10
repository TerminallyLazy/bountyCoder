import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

const App = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Qwen 32B Coder API Admin Dashboard</h1>
      <p className="mt-2">Welcome to the admin dashboard for the Qwen 32B Coder API service.</p>
      <div className="mt-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">Login</button>
        <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Register</button>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
