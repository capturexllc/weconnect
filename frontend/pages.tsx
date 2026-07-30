import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Star, ShieldCheck, Briefcase, FileText, CreditCard, Camera } from 'lucide-react';
import { Button, Input, Card, Badge } from './components';
import { authService, contractorService, quoteService } from './services';
import { useAuthStore } from './store';
import { Trade, Role } from './types';

// --- Home Page ---
export const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="bg-primary-700 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Find the Right Pro for Your Next Project
          </h1>
          <p className="text-xl text-primary-100 mb-10">
            Connect with top-rated, verified contractors nationwide. From landscaping to full remodels.
          </p>
          
          <form onSubmit={handleSearch} className="bg-white p-2 rounded-lg shadow-lg flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-grow flex items-center px-3 bg-gray-50 rounded-md border border-gray-200">
              <Search className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="What service do you need?" 
                className="w-full py-3 bg-transparent focus:outline-none text-gray-900"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex-grow flex items-center px-3 bg-gray-50 rounded-md border border-gray-200">
              <MapPin className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="Zip code or city" 
                className="w-full py-3 bg-transparent focus:outline-none text-gray-900"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button type="submit" className="py-3 px-8 text-lg w-full sm:w-auto">Search</Button>
          </form>
        </div>
      </div>

      {/* Popular Trades */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.values(Trade).map((trade) => (
            <Link key={trade} to={`/search?trade=${encodeURIComponent(trade)}`} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow hover:border-primary-300 group">
              <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                <Briefcase size={24} />
              </div>
              <h3 className="font-medium text-gray-900 text-sm">{trade}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Search Page ---
export const SearchPage = () => {
  const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const query = searchParams.get('query') || '';
  const location = searchParams.get('location') || '';
  const trade = searchParams.get('trade') as Trade | null;

  const { data: contractors, isLoading } = useQuery({
    queryKey: ['contractors', { query, location, trade }],
    queryFn: () => contractorService.searchContractors({ query, location, trade: trade || undefined })
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <Card className="p-4 sticky top-24">
          <h3 className="font-bold text-lg mb-4">Filters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Input defaultValue={location} placeholder="City or Zip" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trade</label>
              <div className="space-y-2">
                {Object.values(Trade).map(t => (
                  <label key={t} className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked={t === trade} />
                    <span className="ml-2 text-sm text-gray-600">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button className="w-full mt-4">Apply Filters</Button>
          </div>
        </Card>
      </div>

      {/* Results List */}
      <div className="flex-grow">
        <h2 className="text-2xl font-bold mb-6">
          {isLoading ? 'Searching...' : `${contractors?.length || 0} Contractors Found`}
        </h2>
        
        <div className="space-y-6">
          {contractors?.map(contractor => (
            <Card key={contractor.id} className="flex flex-col sm:flex-row hover:shadow-md transition-shadow">
              <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                <img src={contractor.imageUrl} alt={contractor.businessName} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/contractor/${contractor.id}`} className="text-xl font-bold text-primary-600 hover:underline">
                        {contractor.businessName}
                      </Link>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <MapPin size={14} className="mr-1" /> {contractor.serviceArea}
                      </div>
                    </div>
                    {contractor.verified && (
                      <Badge variant="green"><ShieldCheck size={12} className="mr-1"/> Verified</Badge>
                    )}
                  </div>
                  <p className="mt-3 text-gray-600 text-sm line-clamp-2">{contractor.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contractor.trades.map(t => <Badge key={t} variant="blue">{t}</Badge>)}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-yellow-500">
                    <Star size={16} className="fill-current" />
                    <span className="ml-1 font-medium text-gray-900">{contractor.rating}</span>
                    <span className="ml-1 text-gray-500 text-sm">({contractor.reviewCount} reviews)</span>
                  </div>
                  <Link to={`/contractor/${contractor.id}`}>
                    <Button variant="outline" className="text-sm py-1.5">View Profile</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          {!isLoading && contractors?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No contractors found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Contractor Profile Page ---
export const ContractorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['contractor', id],
    queryFn: () => contractorService.getProfile(id!)
  });

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center">Contractor not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="h-48 bg-gray-200 relative">
          <img src={profile.imageUrl} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-6 text-white">
            <h1 className="text-3xl font-bold flex items-center">
              {profile.businessName}
              {profile.verified && <ShieldCheck className="ml-2 text-green-400" size={24} />}
            </h1>
            <div className="flex items-center mt-2 text-sm">
              <MapPin size={16} className="mr-1" /> {profile.serviceArea}
              <span className="mx-3">•</span>
              <Star size={16} className="text-yellow-400 fill-current mr-1" /> {profile.rating} ({profile.reviewCount} reviews)
            </div>
          </div>
        </div>
        <div className="p-6 flex justify-between items-center bg-white">
          <div className="flex gap-2">
            {profile.trades.map(t => <Badge key={t} variant="blue">{t}</Badge>)}
          </div>
          <Button onClick={() => isAuthenticated ? navigate('/dashboard') : navigate('/login')}>
            Request a Quote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">About Us</h2>
            <p className="text-gray-700 whitespace-pre-line">{profile.description}</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Reviews</h2>
            <div className="space-y-4">
              {/* Mock Reviews */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center mb-1">
                  <div className="flex text-yellow-400"><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/><Star size={14} className="fill-current"/></div>
                  <span className="ml-2 font-medium text-sm">Great work!</span>
                </div>
                <p className="text-sm text-gray-600">They did an amazing job on our patio. Highly recommend.</p>
                <span className="text-xs text-gray-400 mt-1 block">- Sarah M.</span>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold mb-4">Business Info</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center"><MapPin size={16} className="mr-2 text-gray-400"/> Serves {profile.serviceArea}</li>
              <li className="flex items-center"><Briefcase size={16} className="mr-2 text-gray-400"/> {profile.trades.join(', ')}</li>
              {profile.verified && <li className="flex items-center text-green-600"><ShieldCheck size={16} className="mr-2"/> Background Checked</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard (Protected) ---
export const Dashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'quotes' | 'invoices' | 'contacts'>('quotes');

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes', user?.id],
    queryFn: () => quoteService.listQuotesForUser(user!.id, user!.role),
    enabled: !!user
  });

  if (!user) return <div className="p-8 text-center">Please log in.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <Card className="overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200 text-center">
            <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
              {user.firstName[0]}
            </div>
            <h2 className="font-bold text-lg">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-gray-500">{user.role === Role.CUSTOMER ? 'Homeowner' : 'Contractor'}</p>
          </div>
          <nav className="flex flex-col p-2">
            <button onClick={() => setActiveTab('quotes')} className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${activeTab === 'quotes' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <FileText size={18} className="mr-3" /> Quotes & Jobs
            </button>
            <button onClick={() => setActiveTab('invoices')} className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${activeTab === 'invoices' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <CreditCard size={18} className="mr-3" /> Payments
            </button>
            {user.role !== Role.CUSTOMER && (
              <button onClick={() => setActiveTab('contacts')} className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${activeTab === 'contacts' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Camera size={18} className="mr-3" /> Scan Business Card
              </button>
            )}
          </nav>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-grow">
        <h1 className="text-2xl font-bold mb-6 capitalize">{activeTab.replace('-', ' ')}</h1>
        
        {activeTab === 'quotes' && (
          <Card>
            {isLoading ? <div className="p-6 text-center">Loading...</div> : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes?.map(quote => (
                    <tr key={quote.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(quote.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${quote.totalAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={quote.status === 'ACCEPTED' ? 'green' : quote.status === 'SENT' ? 'blue' : 'gray'}>{quote.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900">View</button>
                      </td>
                    </tr>
                  ))}
                  {quotes?.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No quotes found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {activeTab === 'invoices' && (
          <Card className="p-12 text-center">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No pending payments</h3>
            <p className="mt-1 text-gray-500">When you have invoices to pay or receive, they will appear here.</p>
          </Card>
        )}

        {activeTab === 'contacts' && (
          <Card className="p-8 text-center border-dashed border-2 border-gray-300">
            <Camera size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Upload Business Card</h3>
            <p className="mt-1 text-gray-500 mb-6">Our AI will extract the contact details automatically.</p>
            <Button>Select Image</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

// --- Login Page ---
export const Login = () => {
  const [email, setEmail] = useState('customer@test.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { user, token } = await authService.login(email, password);
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    try {
      const { user, token } = await authService.loginWithProvider(provider);
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `Login with ${provider} failed`);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in</h2>
          <p className="mt-2 text-sm text-gray-600">
            Demo accounts: <br/>
            <code className="bg-gray-100 px-1 rounded">customer@test.com</code> or <code className="bg-gray-100 px-1 rounded">contractor@test.com</code>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
          <Input label="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          <Button type="submit" className="w-full">Sign in</Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={() => handleSocialLogin('google')} className="w-full flex justify-center items-center bg-white hover:bg-gray-50">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button type="button" variant="outline" onClick={() => handleSocialLogin('facebook')} className="w-full flex justify-center items-center bg-white hover:bg-gray-50">
              <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
