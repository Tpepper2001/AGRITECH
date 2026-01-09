import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingCart, Leaf, User, Trash2, Plus, LogOut, Search, MapPin, Loader2, ShieldCheck, Lock } from 'lucide-react';

// --- CONFIGURATION ---
const supabaseUrl = 'https://aeieldsxmgnvcspzaxux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlaWVsZHN4bWdudmNzcHpheHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDA1NTEsImV4cCI6MjA4MzM3NjU1MX0.MNUVBK9xBsK2jmzjLPksLDfUNE0u4Pgboh-BDZ8LGTA'; 
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  // --- STATES ---
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null); 
  const [cart, setCart] = useState([]);
  
  // Data States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Form States
  const [authMode, setAuthMode] = useState('login'); 
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  
  // Admin Form State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', location: '', image: '' });

  // --- STYLING ---
  const colors = {
    primary: '#166534', 
    secondary: '#f97316', 
    light: '#f0fdf4',
    white: '#ffffff',
    dark: '#1e293b',
    border: '#e2e8f0'
  };

  const s = {
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', background: colors.white, borderBottom: `1px solid ${colors.border}`, position: 'fixed', width: '90%', top: 0, zIndex: 1000 },
    container: { maxWidth: '1200px', margin: '100px auto 0', padding: '0 20px' },
    hero: { background: `linear-gradient(rgba(22,101,52,0.9), rgba(22,101,52,0.9)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200')`, padding: '100px 20px', textAlign: 'center', borderRadius: '24px', color: colors.white, marginBottom: '40px' },
    btnPrimary: { background: colors.secondary, color: colors.white, border: 'none', padding: '12px 28px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
    btnGreen: { background: colors.primary, color: colors.white, border: 'none', padding: '12px 28px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
    card: { background: colors.white, borderRadius: '16px', border: `1px solid ${colors.border}`, padding: '15px', position: 'relative', overflow: 'hidden' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px', marginBottom: '50px' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' },
    badge: { background: '#ffedd5', color: '#9a3412', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    footer: { textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '14px' }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- LOGIC ---
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('agri_products').select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!authForm.email || !authForm.password) return alert("Please enter credentials");

    // --- HARDCODED ADMIN BACKDOOR ---
    // This allows quick login without checking Supabase Auth
    if (authForm.email === 'Agritech' && authForm.password === 'Agritech') {
      setUser({
        id: 'mock-admin-id',
        email: 'admin@agritech.local',
        full_name: 'Default Agritech Admin',
        phone: '080-AGRITECH',
        role: 'admin' // Force Admin Role
      });
      setView('home');
      return;
    }
    // -------------------------------

    setLoading(true);
    try {
      if (authMode === 'register') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
        });
        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from('agri_users').insert([
            {
              id: authData.user.id,
              email: authForm.email,
              full_name: authForm.fullName,
              phone: authForm.phone,
              role: 'customer'
            }
          ]);
          if (profileError) throw profileError;
          
          alert("Registration Successful! Please log in.");
          setAuthMode('login');
        }

      } else {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });
        if (authError) throw authError;

        const { data: profileData, error: profileError } = await supabase
          .from('agri_users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          setUser({ email: authData.user.email, role: 'customer' });
        } else {
          setUser(profileData);
        }
        
        setView('home');
      }
    } catch (err) {
      alert("Auth Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (user?.role !== 'admin') return alert("Unauthorized");

    setLoading(true);
    try {
      const { error } = await supabase.from('agri_products').insert([
        {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          location: newProduct.location,
          image: newProduct.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'
        }
      ]);
      if (error) throw error;
      alert("Item added to agri_products!");
      setNewProduct({ name: '', price: '', category: '', location: '', image: '' });
      fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    alert(`Processing payment of ₦${cart.reduce((a, b) => a + parseFloat(b.price), 0)}...`);
    setCart([]);
    setView('home');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setView('home')}>
          <div style={{ background: colors.primary, padding: '8px', borderRadius: '10px' }}><Leaf color="white" size={20}/></div>
          <span style={{ fontSize: '22px', fontWeight: '900', color: colors.primary }}>FARM<span style={{ color: colors.secondary }}>DIRECT</span></span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }} onClick={() => setView('shop')}>Shop</button>
          
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setView('cart')}>
            <ShoppingCart size={24} color={colors.primary} />
            {cart.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: colors.secondary, color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
          </div>

          {user?.role === 'admin' && (
            <button style={{ border: `1px solid ${colors.secondary}`, color: colors.secondary, padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold' }} onClick={() => setView('admin')}>Admin</button>
          )}

          {user ? (
            <div style={{display:'flex', gap: '10px', alignItems:'center'}}>
               <div style={{textAlign: 'right', lineHeight: '1.2'}}>
                  <span style={{display: 'block', fontSize:'12px', fontWeight:'bold'}}>{user.full_name || 'User'}</span>
                  <span style={{display: 'block', fontSize:'10px', color: colors.secondary}}>{user.role === 'admin' ? 'Administrator' : 'Customer'}</span>
               </div>
               <button style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => {setUser(null); setView('home');}}><LogOut size={20}/></button>
            </div>
          ) : (
            <button style={s.btnGreen} onClick={() => setView('login')}>Login</button>
          )}
        </div>
      </nav>

      <div style={s.container}>
        
        {/* Home / Hero */}
        {view === 'home' && (
          <>
            <div style={s.hero}>
              <h1 style={{ fontSize: '48px', marginBottom: '15px' }}>Freshness Delivered.</h1>
              <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '30px' }}>Connecting Nigeria's hard-working farmers directly to your urban doorstep.</p>
              <button style={s.btnPrimary} onClick={() => setView('shop')}>Shop Latest Harvest</button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
              <h2 style={{ fontSize: '28px', color: colors.primary }}>Marketplace</h2>
              <div style={{ display: 'flex', background: 'white', padding: '10px', borderRadius: '10px', border: `1px solid ${colors.border}`, width: '300px' }}>
                <Search size={20} color="#94a3b8" style={{ marginRight: '10px' }}/>
                <input 
                  placeholder="Search produce..." 
                  style={{ border: 'none', outline: 'none', width: '100%' }}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Shop View */}
        {(view === 'shop' || view === 'home') && (
          <div style={s.grid}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                 <Loader2 className="animate-spin" size={40} color={colors.primary} />
                 <p>Loading agri_products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <p>No products found in <strong>agri_products</strong>.</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} style={s.card}>
                  <img src={product.image || 'https://via.placeholder.com/400x200?text=Agri+Product'} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={s.badge}>{product.category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                      <MapPin size={12} style={{ marginRight: '3px' }}/> {product.location}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: colors.primary }}>₦{parseInt(product.price).toLocaleString()}</span>
                    <button 
                      style={{ background: colors.light, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                      onClick={() => { setCart([...cart, product]); alert("Added to basket!"); }}
                    >
                      <Plus size={20} color={colors.primary} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Cart View */}
        {view === 'cart' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Shopping Basket</h2>
            {cart.length === 0 ? <p>Your basket is empty.</p> : (
              <>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{item.name}</h4>
                      <small style={{ color: colors.primary, fontWeight: 'bold' }}>₦{parseInt(item.price).toLocaleString()}</small>
                    </div>
                    <button style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => setCart(cart.filter((_, idx) => idx !== i))}>
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
                <div style={{ marginTop: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: '900', marginBottom: '20px' }}>
                    <span>Total:</span>
                    <span>₦{cart.reduce((a, b) => a + parseFloat(b.price), 0).toLocaleString()}</span>
                  </div>
                  <button style={{ ...s.btnPrimary, width: '100%', padding: '18px' }} onClick={handlePayment}>Pay with Paystack</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Login / Register View */}
        {view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '50px auto', background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            <h2>{authMode === 'login' ? 'Welcome Back' : 'Join FarmDirect'}</h2>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>
              {authMode === 'login' ? 'Log in to your agri_users account' : 'Create a new agri_users profile'}
            </p>
            
            {authMode === 'register' && (
              <>
                <input 
                  placeholder="Full Name (Saved to agri_users)" 
                  style={s.input} 
                  onChange={e => setAuthForm({...authForm, fullName: e.target.value})} 
                />
                <input 
                  placeholder="Phone Number" 
                  style={s.input} 
                  onChange={e => setAuthForm({...authForm, phone: e.target.value})} 
                />
              </>
            )}

            <input 
              placeholder={authMode === 'login' ? "Email (Try: Agritech)" : "Email Address"} 
              style={s.input} 
              onChange={e => setAuthForm({...authForm, email: e.target.value})} 
            />
            <input 
              placeholder={authMode === 'login' ? "Password (Try: Agritech)" : "Password"}
              type={authMode === 'login' && authForm.email === 'Agritech' ? "text" : "password"} 
              style={s.input} 
              onChange={e => setAuthForm({...authForm, password: e.target.value})} 
            />
            
            <button style={{ ...s.btnGreen, width: '100%', marginBottom: '15px' }} onClick={handleAuth}>
              {loading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Register')}
            </button>

            <p style={{ fontSize: '14px', cursor: 'pointer', color: colors.primary, textDecoration: 'underline' }} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "New here? Create agri_users account" : "Have an account? Login"}
            </p>
          </div>
        )}

        {/* Admin Dashboard */}
        {view === 'admin' && (
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px'}}>
               <h2 style={{ margin:0 }}>Admin Dashboard</h2>
               <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                 <ShieldCheck color={colors.primary} />
                 <span style={{background:'#1e293b', color:'white', padding:'5px 10px', borderRadius:'5px', fontSize:'12px'}}>
                    {user?.id === 'mock-admin-id' ? 'DEMO MODE' : 'AUTHENTICATED'}
                 </span>
               </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Add Product Form */}
              <div style={{ padding: '20px', background: colors.light, borderRadius: '15px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Plus size={20} /> Add to agri_products
                </h3>
                <input 
                  placeholder="Product Name" 
                  style={s.input} 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
                <input 
                  placeholder="Price (NGN)" 
                  type="number"
                  style={s.input} 
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                   <input 
                    placeholder="Category" 
                    style={s.input} 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  />
                   <input 
                    placeholder="Location" 
                    style={s.input} 
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                  />
                </div>
                <input 
                  placeholder="Image URL" 
                  style={s.input} 
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                />
                <button style={s.btnGreen} onClick={handleAddProduct}>
                  {loading ? 'Saving...' : 'Save to DB'}
                </button>
              </div>

              <div style={{ padding: '20px', border: `1px solid ${colors.border}`, borderRadius: '15px' }}>
                <h3>Database Status</h3>
                <div style={{ marginTop: '20px' }}>
                  <div style={{ marginBottom: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '8px' }}>
                    <strong>Table: agri_products</strong><br/>
                    Items Count: {products.length}
                  </div>
                  <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '8px' }}>
                    <strong>User Session</strong><br/>
                    Role: {user?.role.toUpperCase()}<br/>
                    ID: {user?.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <footer style={s.footer}>
        <p>© 2025 FarmDirect Agritech Nigeria.</p>
      </footer>
    </div>
  );
};

export default App;