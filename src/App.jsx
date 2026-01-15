import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Leaf, User, Trash2, Plus, LogOut, Search, 
  MapPin, Loader2, ShieldCheck, Truck, Menu, X, AlertCircle, Info 
} from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';

// --- MOCK INITIAL DATA ---
const INITIAL_PRODUCTS = [
  { id: 1, name: "Premium Yam Tubers (Large)", price: 4500, category: 'Tubers', location: 'Benue', image: 'https://images.unsplash.com/photo-1595855709915-393ae2536fb1?w=400', stock_quantity: 50 },
  { id: 2, name: "Stone-free Local Rice 50kg", price: 52000, category: 'Grains', location: 'Abakaliki', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', stock_quantity: 20 },
  { id: 3, name: "Fresh Habanero Peppers", price: 1200, category: 'Vegetables', location: 'Oyo', image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400', stock_quantity: 100 },
  { id: 4, name: "Yellow Garri (Bag)", price: 15000, category: 'Grains', location: 'Edo', image: 'https://images.unsplash.com/photo-1627310537600-090680376249?w=400', stock_quantity: 15 },
];

const NIGERIAN_STATES = ["Lagos", "Abuja", "Oyo", "Kano", "Rivers", "Enugu", "Ogun", "Kaduna"];
const PAYSTACK_PUBLIC_KEY = 'pk_test_your_paystack_key'; 

// --- UTILS ---
const formatCurrency = (amount) => `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

const calculateFees = (subtotal) => {
  const paystackFee = (subtotal * 0.015) + 100;
  const platformFee = subtotal * 0.18;
  return {
    subtotal,
    paystackFee,
    platformFee,
    total: subtotal + paystackFee + platformFee
  };
};

// --- MAIN APP ---
const App = () => {
  // Global State
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  // --- LOCAL PERSISTENCE LOGIC (MOCK BACKEND) ---
  useEffect(() => {
    const initApp = () => {
      setLoading(true);
      
      // Load Products
      const savedProducts = localStorage.getItem('farm_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('farm_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      // Load Orders
      const savedOrders = localStorage.getItem('farm_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      // Load Session
      const savedUser = localStorage.getItem('farm_session');
      if (savedUser) setUser(JSON.parse(savedUser));

      setTimeout(() => setLoading(false), 800); // Simulate network
    };
    initApp();
  }, []);

  const saveProductsToLocal = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem('farm_products', JSON.stringify(updatedProducts));
  };

  // --- AUTH HANDLERS ---
  const handleAuth = (e) => {
    e.preventDefault();
    setAuthLoading(true);
    
    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem('farm_users') || '[]');

      if (authMode === 'register') {
        const newUser = {
          id: Date.now().toString(),
          ...authForm,
          role: authForm.email.includes('farmer') ? 'farmer' : 'customer', // Simple logic for demo
          verified: true
        };
        localStorage.setItem('farm_users', JSON.stringify([...storedUsers, newUser]));
        alert("Account created successfully! You can now log in.");
        setAuthMode('login');
      } else {
        const foundUser = storedUsers.find(u => u.email === authForm.email && u.password === authForm.password);
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('farm_session', JSON.stringify(foundUser));
          setView('home');
        } else {
          setError("Invalid email or password");
        }
      }
      setAuthLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('farm_session');
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

  const handlePaymentSuccess = (reference) => {
    const fees = calculateFees(cart.reduce((a, b) => a + (b.price * b.qty), 0));
    
    // Create new order
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: user.id,
      items: [...cart],
      total_amount: fees.total,
      status: 'Processing',
      created_at: new Date().toISOString(),
      reference: reference.reference
    };

    // Update global and local orders
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('farm_orders', JSON.stringify(updatedOrders));

    // Deduct Stock
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      if (cartItem) return { ...p, stock_quantity: p.stock_quantity - cartItem.qty };
      return p;
    });
    saveProductsToLocal(updatedProducts);

    alert(`Order Placed Successfully! Ref: ${reference.reference}`);
    setCart([]);
    setView('orders');
  };

  const PayButton = ({ amount, email, onSuccess }) => {
    const config = {
      reference: (new Date()).getTime().toString(),
      email: email,
      amount: Math.round(amount * 100),
      publicKey: PAYSTACK_PUBLIC_KEY,
    };
    const initializePayment = usePaystackPayment(config);
    return (
      <button style={s.btnPrimary} onClick={() => initializePayment(onSuccess, () => alert("Payment cancelled"))}>
        Pay {formatCurrency(amount)}
      </button>
    );
  };

  // --- ADMIN FUNCTIONS ---
  const handleAddProduct = (e) => {
    e.preventDefault();
    const product = {
      ...newProduct,
      id: Date.now(),
      price: parseFloat(newProduct.price),
      stock_quantity: parseInt(newProduct.stock_quantity),
      image: newProduct.image || 'https://images.unsplash.com/photo-1595855709915-393ae2536fb1?w=400'
    };
    
    const updated = [product, ...products];
    saveProductsToLocal(updated);
    alert("Product added to marketplace!");
    setNewProduct({ name: '', price: '', category: 'Tubers', location: 'Lagos', image: '', stock_quantity: 10 });
  };

  // --- STYLES ---
  const colors = { primary: '#166534', secondary: '#f97316', light: '#f0fdf4', white: '#fff', dark: '#1e293b', border: '#e2e8f0', danger: '#dc2626' };
  
  const s = {
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', background: colors.white, borderBottom: `1px solid ${colors.border}`, position: 'fixed', width: '90%', top: 0, zIndex: 1000, height: '60px' },
    container: { maxWidth: '1200px', margin: '80px auto 40px', padding: '0 20px', minHeight: '80vh' },
    btnPrimary: { background: colors.secondary, color: colors.white, border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', width: '100%' },
    btnGreen: { background: colors.primary, color: colors.white, border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '15px', boxSizing: 'border-box' },
    card: { background: colors.white, borderRadius: '16px', border: `1px solid ${colors.border}`, padding: '15px', display: 'flex', flexDirection: 'column' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' },
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const cartFees = calculateFees(cart.reduce((a, b) => a + (b.price * b.qty), 0));

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}><Loader2 className="animate-spin" size={48} color={colors.primary}/></div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: colors.dark }}>
      
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setView('home')}>
          <div style={{ background: colors.primary, padding: '6px', borderRadius: '8px' }}><Leaf color="white" size={18}/></div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: colors.primary }}>FARM<span style={{ color: colors.secondary }}>DIRECT</span></span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }} onClick={() => setView('shop')}>Marketplace</button>
          
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setView('cart')}>
            <ShoppingCart size={24} color={colors.primary} />
            {cart.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: colors.secondary, color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
          </div>

          {(user?.role === 'farmer') && (
             <button onClick={() => setView('dashboard')} style={{...s.btnGreen, padding: '8px 16px', fontSize: '13px'}}>Dashboard</button>
          )}

          {user ? (
            <div style={{display:'flex', gap: '15px', alignItems:'center'}}>
              <button onClick={() => setView('orders')} title="My Orders" style={{background:'none', border:'none', cursor:'pointer'}}><Truck size={22}/></button>
              <button onClick={handleLogout} style={{background:'none', border:'none', cursor:'pointer', color:colors.danger}}><LogOut size={22}/></button>
            </div>
          ) : (
            <button style={s.btnGreen} onClick={() => setView('login')}>Login</button>
          )}
        </div>
      </nav>

      {/* Content */}
      <div style={s.container}>
        {error && <div style={{background:'#fee2e2', color:'#b91c1c', padding:'10px', borderRadius:'8px', marginBottom:'20px'}}>{error}</div>}

        {view === 'home' && (
          <div>
            <div style={{ background: colors.primary, color: 'white', padding: '60px 20px', borderRadius: '24px', textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '40px', marginBottom: '15px' }}>Fresh From The Farm.</h1>
              <p style={{ maxWidth: '600px', margin: '0 auto 30px', opacity: 0.9 }}>Secure payments, quality assured produce, and direct logistics for Nigeria.</p>
              <button style={{ ...s.btnPrimary, width: 'auto', background: colors.secondary, padding:'15px 40px' }} onClick={() => setView('shop')}>Start Shopping</button>
            </div>
            <h2 style={{ marginBottom: '20px' }}>Latest Harvest</h2>
            <div style={s.grid}>
              {products.slice(0, 4).map(p => (
                <div key={p.id} style={s.card}>
                   <img src={p.image} style={{height:'180px', objectFit:'cover', borderRadius:'12px', marginBottom:'10px'}} alt={p.name} />
                   <h3 style={{ margin: '0 0 5px' }}>{p.name}</h3>
                   <span style={{ fontWeight: 'bold', color: colors.primary }}>{formatCurrency(p.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'shop' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              <input placeholder="Search products..." style={{ ...s.input, marginBottom: 0 }} onChange={e => setSearch(e.target.value)} />
              <select style={{ ...s.input, width: '200px', marginBottom: 0 }} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Tubers">Tubers</option>
                <option value="Grains">Grains</option>
                <option value="Vegetables">Vegetables</option>
              </select>
            </div>
            <div style={s.grid}>
              {filteredProducts.map(product => (
                <div key={product.id} style={s.card}>
                  <img src={product.image} style={{height:'180px', objectFit:'cover', borderRadius:'12px', marginBottom:'10px'}} alt={product.name} />
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'5px'}}>
                    <span style={{color:colors.primary, fontWeight:'bold'}}>{product.category}</span>
                    <span>{product.stock_quantity} left</span>
                  </div>
                  <h3 style={{ fontSize: '17px', margin: '5px 0' }}>{product.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '800' }}>{formatCurrency(product.price)}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      style={{ background: colors.primary, color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'cart' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
             <h2>Your Cart</h2>
             {cart.length === 0 ? <p>Cart is empty</p> : (
               <>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <h4 style={{margin:0}}>{item.name}</h4>
                      <small>{formatCurrency(item.price)} x {item.qty}</small>
                    </div>
                    <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} style={{ color: colors.danger, background:'none', border:'none', cursor:'pointer' }}><Trash2 size={18}/></button>
                  </div>
                ))}
                <div style={{marginTop:'20px', background:'#f1f5f9', padding:'20px', borderRadius:'12px'}}>
                   <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'18px'}}>
                     <span>Total (inc. fees)</span>
                     <span>{formatCurrency(cartFees.total)}</span>
                   </div>
                   <div style={{marginTop:'20px'}}>
                     {user ? <PayButton amount={cartFees.total} email={user.email} onSuccess={handlePaymentSuccess} /> : <button style={s.btnPrimary} onClick={() => setView('login')}>Login to Checkout</button>}
                   </div>
                </div>
               </>
             )}
          </div>
        )}

        {view === 'orders' && (
           <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2>Order History</h2>
              {orders.filter(o => o.user_id === user?.id).map(order => (
                <div key={order.id} style={{background:'white', padding:'15px', borderRadius:'12px', marginBottom:'10px', border:`1px solid ${colors.border}`}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <strong>{order.id}</strong>
                    <span style={{color:colors.primary}}>{order.status}</span>
                  </div>
                  <div style={{fontSize:'13px', marginTop:'5px'}}>Total: {formatCurrency(order.total_amount)}</div>
                  <div style={{fontSize:'11px', color:'#64748b'}}>{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
              ))}
           </div>
        )}

        {view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '16px' }}>
            <h2 style={{ textAlign: 'center' }}>{authMode === 'login' ? 'Login' : 'Join as Farmer/Buyer'}</h2>
            <form onSubmit={handleAuth}>
              {authMode === 'register' && (
                <>
                  <input required placeholder="Full Name" style={s.input} onChange={e => setAuthForm({...authForm, fullName: e.target.value})} />
                  <input required placeholder="Address" style={s.input} onChange={e => setAuthForm({...authForm, address: e.target.value})} />
                </>
              )}
              <input required type="email" placeholder="Email" style={s.input} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
              <input required type="password" placeholder="Password" style={s.input} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              <button style={s.btnPrimary} disabled={authLoading}>{authLoading ? '...' : (authMode === 'login' ? 'Login' : 'Register')}</button>
            </form>
            <p onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{textAlign:'center', marginTop:'15px', cursor:'pointer', color:colors.primary}}>
              {authMode === 'login' ? "Create account" : "Back to login"}
            </p>
          </div>
        )}

        {view === 'dashboard' && (
           <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2>Farmer Dashboard</h2>
              <div style={s.card}>
                 <h3>List New Product</h3>
                 <form onSubmit={handleAddProduct}>
                   <input required placeholder="Product Name" style={s.input} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                   <div style={{display:'flex', gap:'10px'}}>
                    <input required type="number" placeholder="Price" style={s.input} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <input required type="number" placeholder="Stock" style={s.input} value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
                   </div>
                   <select style={s.input} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                     <option>Tubers</option><option>Grains</option><option>Vegetables</option>
                   </select>
                   <button style={s.btnGreen}>Upload to Marketplace</button>
                 </form>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;