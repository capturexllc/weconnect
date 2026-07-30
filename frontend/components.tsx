import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, MessageSquare, Search, Star, MapPin, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuthStore } from './store';
import { Trade } from './types';

// --- UI Components ---

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }> = ({ label, error, className = '', ...props }) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input 
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'blue' | 'green' | 'gray' }> = ({ children, variant = 'gray' }) => {
  const variants = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
};

// --- Layout Components ---

const Navbar = () => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600 tracking-tight">WeConnect</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/search" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary-500 text-sm font-medium">Find Contractors</Link>
              <Link to="/how-it-works" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">How it Works</Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-primary-600">Dashboard</Link>
                <div className="relative flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {user?.firstName[0]}
                  </div>
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">Log in</Link>
                <Link to="/login"><Button>Sign up</Button></Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/search" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300">Find Contractors</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300">Log in / Sign up</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <span className="text-2xl font-bold text-white tracking-tight">WeConnect</span>
        <p className="mt-4 text-gray-400 text-sm">Connecting property owners with trusted, nationwide independent contractors.</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider">For Homeowners</h3>
        <ul className="mt-4 space-y-2 text-sm text-gray-400">
          <li><Link to="/search" className="hover:text-white">Find a Pro</Link></li>
          <li><Link to="#" className="hover:text-white">How it Works</Link></li>
          <li><Link to="#" className="hover:text-white">Trust & Safety</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider">For Contractors</h3>
        <ul className="mt-4 space-y-2 text-sm text-gray-400">
          <li><Link to="#" className="hover:text-white">Join as a Pro</Link></li>
          <li><Link to="#" className="hover:text-white">Pro Resources</Link></li>
          <li><Link to="#" className="hover:text-white">Success Stories</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
        <ul className="mt-4 space-y-2 text-sm text-gray-400">
          <li><Link to="#" className="hover:text-white">Help Center</Link></li>
          <li><Link to="#" className="hover:text-white">Contact Us</Link></li>
        </ul>
      </div>
    </div>
  </footer>
);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96 mb-4 flex flex-col overflow-hidden">
          <div className="bg-primary-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-medium">WeConnect Assistant</h3>
            <button onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>
          <div className="flex-grow p-4 bg-gray-50 overflow-y-auto">
            <div className="bg-white p-3 rounded-lg shadow-sm text-sm text-gray-700 mb-2 inline-block max-w-[85%]">
              Hi! I'm the WeConnect bot. Need help finding a contractor or booking an appointment?
            </div>
          </div>
          <div className="p-3 border-t border-gray-200 bg-white flex">
            <input type="text" placeholder="Type a message..." className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm" />
            <button className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700">Send</button>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform hover:scale-105 flex items-center justify-center float-right"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <main className="flex-grow flex flex-col">{children}</main>
    <Footer />
    <ChatWidget />
  </>
);
