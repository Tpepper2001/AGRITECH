import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingCart, Leaf, User, ShieldCheck, Trash2, Plus, LogOut, Search, MapPin, X } from 'lucide-react';

// --- CONFIGURATION (Replace with your keys) ---
const supabaseUrl = 'https://aeieldsxmgnvcspzaxux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlaWVsZHN4bWdudmNzcHpheHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MDA1NTEsImV4cCI6MjA4MzM3NjU1MX0.MNUVBK9xBsK2jmzjLPksLDfUNE0u4Pgboh-BDZ8LGTA'; const supabase = createClient(supabaseUrl, supabaseKey);

// --- 50 FICTIONAL PRODUCTS DATA ---
const MOCK_PRODUCTS = [
  { id: 1, name: "Ogbomosho Yam (Large)", price: 4500, category: "Tubers", location: "Oyo State", image: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=400" },
  { id: 2, name: "Abakaliki Rice (50kg)", price: 65000, category: "Grains", location: "Ebonyi State", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
  { id: 3, name: "Fresh Plum Tomatoes (Basket)", price: 12000, category: "Vegetables", location: "Jos, Plateau", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" },
  { id: 4, name: "Benue Oranges (Bag)", price: 8500, category: "Fruits", location: "Benue State", image: "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400" },
  { id: 5, name: "Habanero Pepper (Atarodo)", price: 2500, category: "Vegetables", location: "Kano State", image: "https://images.unsplash.com/photo-1566311103631-f925f560e70a?w=400" },
  { id: 6, name: "Sweet Potatoes", price: 3500, category: "Tubers", location: "Kwara State", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400" },
  { id: 7, name: "Organic Honey (1L)", price: 5500, category: "Natural", location: "Kogi State", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400" },
  { id: 8, name: "Red Onions (Sack)", price: 22000, category: "Vegetables", location: "Sokoto State", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400" },
  { id: 9, name: "Smoked Catfish (Pack of 4)", price: 7000, category: "Protein", location: "Ogun State", image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400" },
  { id: 10, name: "Cassava Flour (Garri - 5kg)", price: 3200, category: "Grains", location: "Edo State", image: "https://images.unsplash.com/photo-1621505345757-0a86d4791e84?w=400" },
  // ... adding more for the count of 50
  ...Array.from({ length: 40 }).map((_, i) => ({
    id: i + 11,
    name: ["Plantain Bunch", "Cocoa Powder", "Palm Oil (5L)", "Local Eggs", "Fresh Ginger", "Garlic Bulbs", "Yellow Maize", "Green Peas", "Carrots", "Spinach (Ugwu)"][i % 10] + " " + (i + 1),
    price: Math.floor(Math.random() * 15000) + 1000,
    category: ["Fruits", "Grains", "Oil", "Vegetables", "Spices"][i % 5],
    location: ["Lagos", "Ibadan", "Ondo", "Enugu", "Kaduna"][i % 5],
    image: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&sig=${i}`
  }))
];

const App = () => {
  // --- STATES ---
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState('');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // --- STYLING OBJECTS (In-code CSS) ---
  const colors = {
    primary: '#166534', // Forest Green
    secondary: '#f97316', // Nigerian Orange
    light: '#f0fdf4',
    white: '#ffffff',
    dark: '#1e293b',
    border: '#e2e8f0'
  };

  const s = {
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%;', background: colors.white, borderBottom: `1px solid ${colors.border}`, sticky: 'top', position: 'fixed', width: '90%', top: 0, zIndex: 1000 },
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

  // --- LOGIC ---
  const handlePayment = () => {
    if (!user) return setView('login');
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    
    const handler = window.PaystackPop.setup({
      key: 'pk_test_your_key_here',
      email: user.email,
      amount: total * 100,
      currency: 'NGN',
      callback: (res) => {
        alert("Transaction Successful: " + res.reference);
        setCart([]);
        setView('home');
      }
    });
    handler.openIframe();
  };

  const login = (role) => {
    if (!authForm.email || !authForm.password) return alert("Enter credentials");
    setUser({ email: authForm.email });
    setIsAdmin(role === 'admin');
    setView('home');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
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
          <button style={{ background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }} onClick={() => setView('shop')}>Shop Produce</button>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setView('cart')}>
            <ShoppingCart size={24} color={colors.primary} />
            {cart.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: colors.secondary, color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
          </div>
          {isAdmin && <button style={{ border: `1px solid ${colors.secondary}`, color: colors.secondary, padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold' }} onClick={() => setView('admin')}>Admin</button>}
          {user ? (
            <button style={{ border: 'none', background: 'none' }} onClick={() => setUser(null)}><LogOut size={20}/></button>
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
              <h2 style={{ fontSize: '28px', color: colors.primary }}>Recommended for You</h2>
              <div style={{ display: 'flex', background: 'white', padding: '10px', borderRadius: '10px', border: `1px solid ${colors.border}`, width: '300px' }}>
                <Search size={20} color="#94a3b8" style={{ marginRight: '10px' }}/>
                <input 
                  placeholder="Search tomatoes, yam..." 
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
            {filteredProducts.map(product => (
              <div key={product.id} style={s.card}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '180px', objectCover: 'cover', borderRadius: '12px', marginBottom: '12px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={s.badge}>{product.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                    <MapPin size={12} style={{ marginRight: '3px' }}/> {product.location}
                  </div>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>{product.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: colors.primary }}>₦{product.price.toLocaleString()}</span>
                  <button 
                    style={{ background: colors.light, border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    onClick={() => { setCart([...cart, product]); alert("Added to basket!"); }}
                  >
                    <Plus size={20} color={colors.primary} />
                  </button>
                </div>
              </div>
            ))}
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
                      <small style={{ color: colors.primary, fontWeight: 'bold' }}>₦{item.price.toLocaleString()}</small>
                    </div>
                    <button style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => setCart(cart.filter((_, idx) => idx !== i))}>
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))}
                <div style={{ marginTop: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: '900', marginBottom: '20px' }}>
                    <span>Total:</span>
                    <span>₦{cart.reduce((a, b) => a + b.price, 0).toLocaleString()}</span>
                  </div>
                  <button style={{ ...s.btnPrimary, width: '100%', padding: '18px' }} onClick={handlePayment}>Pay with Paystack</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Login View */}
        {view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '50px auto', background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            <h2>Welcome Back</h2>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>Access your farm-to-table account</p>
            <input placeholder="Email Address" style={s.input} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            <input placeholder="Password" type="password" style={s.input} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ ...s.btnGreen, flex: 1 }} onClick={() => login('customer')}>Customer Login</button>
              <button style={{ ...s.btnPrimary, flex: 1, background: colors.dark }} onClick={() => login('admin')}>Admin Login</button>
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {view === 'admin' && (
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px' }}>
            <h2 style={{ marginBottom: '20px' }}>Farmer / Admin Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '20px', background: colors.light, borderRadius: '15px' }}>
                <h3>Add New Produce</h3>
                <input placeholder="Product Name" style={s.input} />
                <input placeholder="Price" style={s.input} />
                <input placeholder="Location" style={s.input} />
                <button style={s.btnGreen}>List Product</button>
              </div>
              <div style={{ padding: '20px', border: `1px solid ${colors.border}`, borderRadius: '15px' }}>
                <h3>Recent Orders</h3>
                <p style={{ color: '#64748b' }}>No recent orders to show today.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      <footer style={s.footer}>
        <p>© 2025 FarmDirect Agritech Nigeria. Connecting rural farmers to urban kitchens.</p>
      </footer>
    </div>
  );
};

export default App;
