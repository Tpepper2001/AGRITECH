import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePaystackPayment } from 'react-paystack';
import { 
  ShoppingCart, Leaf, User, Trash2, Plus, LogOut, Search, 
  MapPin, Loader2, ShieldCheck, Truck, Menu, X, AlertCircle, Info 
} from 'lucide-react';

// --- CONSTANTS & CONFIG ---
// ⚠️ REPLACE WITH YOUR REAL KEYS ⚠️
const supabaseUrl = 'https://aeieldsxmgnvcspzaxux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlaWVsZHN4bWdudmNzcHpheHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDA1NTEsImV4cCI6MjA4MzM3NjU1MX0.MNUVBK9xBsK2jmzjLPksLDfUNE0u4Pgboh-BDZ8LGTA'; 
const PAYSTACK_PUBLIC_KEY = 'pk_test_your_paystack_key'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const NIGERIAN_STATES = ["Lagos", "Abuja", "Oyo", "Kano", "Rivers", "Enugu", "Ogun", "Kaduna"];

// --- UTILS ---
const formatCurrency = (amount) => `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

const calculateFees = (subtotal) => {
  const paystackFee = (subtotal * 0.015) + 100; // 1.5% + N100
  const platformFee = subtotal * 0.18; // 18% Commission
  return {
    subtotal,
    paystackFee,
    platformFee,
    total: subtotal + paystackFee + platformFee
  };
};

const validatePassword = (pwd) => {
  // Min 8 chars, 1 uppercase, 1 number, 1 special char
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return regex.test(pwd);
};

// --- COMPONENTS ---

// 1. Loading Skeleton
const SkeletonCard = () => (
  <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '15px', height: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ background: '#f1f5f9', height: '180px', borderRadius: '12px', width: '100%' }} className="animate-pulse"></div>
    <div style={{ background: '#f1f5f9', height: '20px', width: '70%', borderRadius: '4px' }}></div>
    <div style={{ background: '#f1f5f9', height: '20px', width: '40%', borderRadius: '4px' }}></div>
  </div>
);

// 2. Optimized Image
const LazyImage = ({ src, alt, style }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {!loaded && <div style={{ position: 'absolute', inset: 0, background: '#f1f5f9' }} />}
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }} 
      />
    </div>
  );
};

// 3. Error Banner
const ErrorBanner = ({ message, onClose }) => (
  message ? (
    <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={18} />
        <span style={{ fontSize: '14px' }}>{message}</span>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} color="#b91c1c" /></button>
    </div>
  ) : null
);

// --- MAIN APP ---
const App = () => {
  // Global State
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Auth State
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '', phone: '', address: '' });
  const [authLoading, setAuthLoading] = useState(false);

  // Admin State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Tubers', location: 'Lagos', image: '', stock_quantity: 10 });

  // Session Timeout Logic (1 Hour)
  const logoutTimer = useRef(null);

  const resetTimer = () => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (user) {
      logoutTimer.current = setTimeout(() => {
        handleLogout();
        alert("Session timed out due to inactivity.");
      }, 3600000); // 1 hour
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [user]);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoading(true);
    await fetchProducts();
    // Check active session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await fetchUserProfile(session.user.id);
    setLoading(false);
  };

  const fetchProducts = async () => {
    try {
      // Indexing on category/location makes this fast
      const { data, error } = await supabase.from('agri_products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError("Failed to load products. Please check your connection.");
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from('agri_users').select('*').eq('id', userId).single();
      if (error) throw error;
      setUser(data);
    } catch (err) {
      console.error(err);
      // Fallback if user exists in auth but not DB (shouldn't happen with proper flow)
      await supabase.auth.signOut();
    }
  };

  // --- AUTH HANDLERS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!authForm.email.includes('@')) return setError("Invalid email address");
    if (authMode === 'register') {
      if (!validatePassword(authForm.password)) return setError("Password must be 8+ chars, with Uppercase, Number, and Special char.");
      if (authForm.phone.length < 10) return setError("Invalid phone number");
      if (authForm.fullName.length < 3) return setError("Full name too short");
    }

    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
        });
        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from('agri_users').insert([{
            id: authData.user.id,
            email: authForm.email,
            full_name: authForm.fullName,
            phone: authForm.phone,
            address: authForm.address,
            role: 'customer' // Default
          }]);
          if (profileError) throw profileError;
          alert("Account created! Please verify your email or log in.");
          setAuthMode('login');
        }
      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });
        if (authError) throw authError;
        await fetchUserProfile(authData.user.id);
        setView('home');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('login');
    setCart([]);
  };

  // --- CART & PAYMENT ---
  const addToCart = (product) => {
    if (product.stock_quantity < 1) return alert("Item out of stock");
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock_quantity) return alert("Max stock reached");
      setCart(cart.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // Paystack Hook Wrapper
  const PayButton = ({ amount, email, onSuccess }) => {
    const config = {
      reference: (new Date()).getTime().toString(),
      email: email,
      amount: Math.round(amount * 100), // Kobo
      publicKey: PAYSTACK_PUBLIC_KEY,
    };

    const initializePayment = usePaystackPayment(config);

    return (
      <button 
        style={s.btnPrimary} 
        onClick={() => initializePayment(onSuccess, () => alert("Payment cancelled"))}
      >
        Pay {formatCurrency(amount)}
      </button>
    );
  };

  const handlePaymentSuccess = async (reference) => {
    if (!user) return;
    setLoading(true);
    
    const fees = calculateFees(cart.reduce((a, b) => a + (b.price * b.qty), 0));
    
    // Prepare items for DB
    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      qty: item.qty,
      price: item.price
    }));

    try {
      // Call Supabase RPC for atomic transaction
      const { data, error } = await supabase.rpc('create_order_transaction', {
        p_user_id: user.id,
        p_total: fees.total,
        p_subtotal: fees.subtotal,
        p_fees: fees.paystackFee + fees.platformFee,
        p_address: user.address,
        p_payment_ref: reference.reference,
        p_items: orderItems
      });

      if (error) throw error;

      alert(`Order Placed Successfully! Order ID: #${data.order_id}`);
      setCart([]);
      fetchProducts(); // Update stock locally
      setView('orders');
    } catch (err) {
      console.error(err);
      setError("Payment successful but order creation failed. Contact support with Ref: " + reference.reference);
    } finally {
      setLoading(false);
    }
  };

  // --- ADMIN FUNCTIONS ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (user?.role !== 'farmer' && user?.role !== 'admin') return;
    
    // Sanitization
    const sanitizedName = newProduct.name.replace(/[^\w\s-]/gi, '');
    if (sanitizedName.length < 3) return alert("Invalid product name");
    
    setLoading(true);
    try {
      const { error } = await supabase.from('agri_products').insert([{
        farmer_id: user.id,
        name: sanitizedName,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        location: newProduct.location,
        image: newProduct.image || 'https://images.unsplash.com/photo-1595855709915-393ae2536fb1?w=400',
        stock_quantity: parseInt(newProduct.stock_quantity)
      }]);
      if (error) throw error;
      alert("Product listed successfully!");
      setNewProduct({ name: '', price: '', category: 'Tubers', location: 'Lagos', image: '', stock_quantity: 10 });
      fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const colors = { primary: '#166534', secondary: '#f97316', light: '#f0fdf4', white: '#fff', dark: '#1e293b', border: '#e2e8f0', danger: '#dc2626' };
  
  const s = {
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', background: colors.white, borderBottom: `1px solid ${colors.border}`, position: 'fixed', width: '90%', top: 0, zIndex: 1000, height: '60px' },
    container: { maxWidth: '1200px', margin: '80px auto 40px', padding: '0 20px', minHeight: '80vh' },
    btnPrimary: { background: colors.secondary, color: colors.white, border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', width: '100%', transition: '0.2s' },
    btnGreen: { background: colors.primary, color: colors.white, border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '15px' },
    card: { background: colors.white, borderRadius: '16px', border: `1px solid ${colors.border}`, padding: '15px', display: 'flex', flexDirection: 'column', height: '100%' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' },
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const cartFees = calculateFees(cart.reduce((a, b) => a + (b.price * b.qty), 0));

  if (loading && !products.length) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}><Loader2 className="animate-spin" size={48} color={colors.primary}/></div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: colors.dark }}>
      
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setView('home')}>
          <div style={{ background: colors.primary, padding: '6px', borderRadius: '8px' }}><Leaf color="white" size={18}/></div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: colors.primary }}>FARM<span style={{ color: colors.secondary }}>DIRECT</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
           {/* Simple css needed for media query, using inline style hack for demo */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setView('shop')}>Marketplace</button>
          
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setView('cart')}>
            <ShoppingCart size={24} color={colors.primary} />
            {cart.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: colors.secondary, color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
          </div>

          {(user?.role === 'admin' || user?.role === 'farmer') && (
             <button onClick={() => setView('dashboard')} style={{...s.btnGreen, padding: '8px 16px', fontSize: '13px'}}>Dashboard</button>
          )}

          {user ? (
            <div style={{display:'flex', gap: '10px', alignItems:'center'}}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{user.full_name.split(' ')[0]}</span>
              <button onClick={() => setView('orders')} title="My Orders"><Truck size={20} color={colors.dark}/></button>
              <button onClick={handleLogout} title="Logout"><LogOut size={20} color={colors.danger}/></button>
            </div>
          ) : (
            <button style={s.btnGreen} onClick={() => setView('login')}>Login</button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div style={s.container}>
        <ErrorBanner message={error} onClose={() => setError('')} />

        {/* HOME VIEW */}
        {view === 'home' && (
          <div>
            <div style={{ background: colors.primary, color: 'white', padding: '60px 20px', borderRadius: '24px', textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: '15px' }}>Fresh From The Farm.</h1>
              <p style={{ maxWidth: '600px', margin: '0 auto 30px', opacity: 0.9 }}>Secure payments, quality assured produce, and direct logistics.</p>
              <button style={{ ...s.btnPrimary, width: 'auto', background: colors.secondary }} onClick={() => setView('shop')}>Start Shopping</button>
            </div>
            
            <h2 style={{ marginBottom: '20px' }}>Featured Produce</h2>
            <div style={s.grid}>
              {products.slice(0, 4).map(p => (
                <div key={p.id} style={s.card}>
                   <LazyImage src={p.image} alt={p.name} style={{ height: '180px', borderRadius: '12px', marginBottom: '15px' }} />
                   <h3 style={{ margin: '0 0 5px' }}>{p.name}</h3>
                   <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span style={{ fontWeight: 'bold', color: colors.primary }}>{formatCurrency(p.price)}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{p.location}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHOP VIEW */}
        {view === 'shop' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '30px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '300px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input placeholder="Search yam, rice..." style={{ ...s.input, paddingLeft: '40px', marginBottom: 0 }} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={{ ...s.input, width: '150px', marginBottom: 0 }} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="Tubers">Tubers</option>
                  <option value="Grains">Grains</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                </select>
              </div>
            </div>

            <div style={s.grid}>
              {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i}/>) : filteredProducts.map(product => (
                <div key={product.id} style={s.card}>
                  <LazyImage src={product.image} alt={product.name} style={{ height: '180px', borderRadius: '12px', marginBottom: '15px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ background: colors.light, color: colors.primary, fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{product.category}</span>
                    <span style={{ fontSize: '12px', color: product.stock_quantity > 0 ? colors.primary : colors.danger }}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '17px', margin: '5px 0' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800' }}>{formatCurrency(product.price)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.stock_quantity === 0}
                      style={{ background: product.stock_quantity > 0 ? colors.primary : '#cbd5e1', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: product.stock_quantity > 0 ? 'pointer' : 'not-allowed' }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CART VIEW */}
        {view === 'cart' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
             <h2 style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '15px', marginBottom: '20px' }}>Shopping Cart ({cart.length})</h2>
             {cart.length === 0 ? <div style={{textAlign:'center', padding:'50px'}}>Your cart is empty.</div> : (
               <>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px' }}>{item.name}</h4>
                      <small>Unit: {formatCurrency(item.price)} x {item.qty}</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                       <span style={{ fontWeight: 'bold' }}>{formatCurrency(item.price * item.qty)}</span>
                       <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} style={{ color: colors.danger, background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
                
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginTop: '30px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                     <span>Subtotal</span><span>{formatCurrency(cartFees.subtotal)}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', color: '#64748b' }}>
                     <span>Platform & Payment Fees</span><span>{formatCurrency(cartFees.paystackFee + cartFees.platformFee)}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', borderTop: '1px dashed #cbd5e1', paddingTop: '15px', fontWeight: '900', fontSize: '18px' }}>
                     <span>Total</span><span>{formatCurrency(cartFees.total)}</span>
                   </div>
                   
                   <div style={{ marginTop: '20px' }}>
                     {!user ? (
                       <button style={s.btnPrimary} onClick={() => setView('login')}>Login to Checkout</button>
                     ) : (
                       <PayButton amount={cartFees.total} email={user.email} onSuccess={handlePaymentSuccess} />
                     )}
                   </div>
                </div>
               </>
             )}
          </div>
        )}

        {/* ORDER HISTORY */}
        {view === 'orders' && (
           <div style={{ maxWidth: '800px', margin: '0 auto' }}>
             <h2>Order History</h2>
             <OrderHistoryList user={user} />
           </div>
        )}

        {/* AUTH VIEW */}
        {view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '40px auto', background: colors.white, padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <form onSubmit={handleAuth}>
              {authMode === 'register' && (
                <>
                  <input required minLength={3} placeholder="Full Name" style={s.input} value={authForm.fullName} onChange={e => setAuthForm({...authForm, fullName: e.target.value})} />
                  <input required placeholder="Phone (e.g. 08012345678)" style={s.input} value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} />
                  <input required placeholder="Delivery Address" style={s.input} value={authForm.address} onChange={e => setAuthForm({...authForm, address: e.target.value})} />
                </>
              )}
              <input required type="email" placeholder="Email Address" style={s.input} value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
              <div style={{marginBottom:'15px'}}>
                 <input required type="password" placeholder="Password" style={{...s.input, marginBottom:'5px'}} value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                 {authMode === 'register' && <small style={{fontSize:'11px', color:'#64748b'}}>8+ chars, Uppercase, Number, Special char.</small>}
              </div>

              {authMode === 'register' && (
                <div style={{display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'20px', fontSize:'12px'}}>
                  <input type="checkbox" required />
                  <span>I agree to the <button type="button" onClick={() => setShowTerms(true)} style={{border:'none', background:'none', color:colors.primary, textDecoration:'underline', cursor:'pointer'}}>Terms of Service</button> and Privacy Policy.</span>
                </div>
              )}

              <button type="submit" disabled={authLoading} style={{...s.btnPrimary, opacity: authLoading ? 0.7 : 1}}>
                {authLoading ? 'Processing...' : (authMode === 'login' ? 'Log In' : 'Register')}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', cursor: 'pointer', color: colors.primary }} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "New user? Create account" : "Have an account? Log in"}
            </p>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {view === 'dashboard' && (
           <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <h2>Farmer/Admin Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                
                {/* Add Product */}
                <div style={s.card}>
                   <h3>Add New Produce</h3>
                   <form onSubmit={handleAddProduct}>
                     <input required placeholder="Product Name" style={s.input} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                     <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                       <input required type="number" placeholder="Price (NGN)" style={s.input} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                       <input required type="number" placeholder="Stock Qty" style={s.input} value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
                     </div>
                     <select style={s.input} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                       {['Tubers', 'Grains', 'Vegetables', 'Fruits', 'Spices'].map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <select style={s.input} value={newProduct.location} onChange={e => setNewProduct({...newProduct, location: e.target.value})}>
                       {NIGERIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                     </select>
                     <button type="submit" disabled={loading} style={s.btnGreen}>{loading ? 'Saving...' : 'List Product'}</button>
                   </form>
                </div>

                {/* Status Panel */}
                <div style={s.card}>
                   <h3>Platform Status</h3>
                   <div style={{ marginTop: '10px', fontSize: '14px' }}>
                      <p><strong>Logged in as:</strong> {user?.full_name} ({user?.role})</p>
                      <p><strong>Verification:</strong> {user?.verified ? <span style={{color: colors.primary}}>Verified Farmer</span> : <span style={{color: colors.danger}}>Pending Verification</span>}</p>
                      {!user?.verified && <button style={{marginTop:'10px', fontSize:'12px', padding:'5px 10px'}}>Request Verification</button>}
                   </div>
                </div>
              </div>
           </div>
        )}

        {/* MODALS */}
        {showTerms && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000}}>
             <div style={{background:'white', padding:'30px', borderRadius:'16px', maxWidth:'500px', maxHeight:'80vh', overflowY:'auto'}}>
                <h3>Terms & NDPR Compliance</h3>
                <div style={{fontSize:'13px', lineHeight:'1.5', color:'#475569'}}>
                   <p><strong>1. Data Privacy (NDPR):</strong> We collect your data solely for order fulfillment. Your data is stored securely on Supabase servers. You have the right to request deletion.</p>
                   <p><strong>2. Payments:</strong> Processed securely via Paystack. We do not store card details.</p>
                   <p><strong>3. Returns:</strong> Quality disputes must be reported within 24 hours of delivery.</p>
                </div>
                <button onClick={() => setShowTerms(false)} style={{...s.btnPrimary, marginTop:'20px'}}>I Understand</button>
             </div>
          </div>
        )}

      </div>
      
      <footer style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px', borderTop: `1px solid ${colors.border}` }}>
        <p>&copy; 2025 FarmDirect Agritech Nigeria. RC: 123456</p>
        <div style={{ marginTop: '10px' }}>
           <span style={{ cursor:'pointer', margin:'0 10px' }} onClick={() => setShowTerms(true)}>Privacy Policy</span>
           <span style={{ cursor:'pointer', margin:'0 10px' }} onClick={() => setShowTerms(true)}>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
};

// Sub-component for Order History to keep main code clean
const OrderHistoryList = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  if (loading) return <div>Loading history...</div>;
  if (!orders.length) return <div>No past orders found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
       {orders.map(order => (
         <div key={order.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
               <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
               <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase' }}>{order.status}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
               Date: {new Date(order.created_at).toLocaleDateString()}
            </div>
            <div style={{ marginBottom: '15px' }}>
               {order.order_items.length} Items | Total: {formatCurrency(order.total_amount)}
            </div>
         </div>
       ))}
    </div>
  );
};

export default App;