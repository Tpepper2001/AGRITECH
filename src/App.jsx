import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Leaf, User, Trash2, Plus, LogOut, Search, 
  MapPin, Loader2, ShieldCheck, Truck, Menu, X, AlertCircle, 
  Info, Minus, Star, Package, TrendingUp, Users, DollarSign,
  Edit, Check, ChevronRight, Heart, ShoppingBag, Filter
} from 'lucide-react';

// --- CONSTANTS & MOCK DATA ---
const NIGERIAN_STATES = ["Lagos", "Abuja", "Oyo", "Kano", "Rivers", "Enugu", "Ogun", "Kaduna", "Benue", "Edo", "Anambra", "Plateau", "Kwara"];
const CATEGORIES = ['All', 'Tubers', 'Grains', 'Vegetables', 'Fruits', 'Proteins', 'Oils', 'Spices'];

const GENERATE_PRODUCTS = () => {
  const base = [
    { name: "Premium Yam Tubers", cat: "Tubers", loc: "Benue", img: "photo-1595855709915-393ae2536fb1", price: 4500 },
    { name: "Abakaliki Local Rice", cat: "Grains", loc: "Anambra", img: "photo-1586201375761-83865001e31c", price: 52000 },
    { name: "Red Habanero Peppers", cat: "Vegetables", loc: "Oyo", img: "photo-1584270354949-c26b0d5b4a0c", price: 1200 },
    { name: "Yellow Garri (Bag)", cat: "Grains", loc: "Edo", img: "photo-1627310537600-090680376249", price: 15000 },
    { name: "Fresh Tomatoes (Basket)", cat: "Vegetables", loc: "Kaduna", img: "photo-1546470427-e26264be0b0d", price: 18500 },
    { name: "Sweet Plantains", cat: "Fruits", loc: "Osun", img: "photo-1571771894821-ce9b6c11b08e", price: 3500 },
    { name: "Smoked Catfish", cat: "Proteins", loc: "Lagos", img: "photo-1599058917765-a780eda07a3e", price: 8000 },
    { name: "Organic Honey (1L)", cat: "Spices", loc: "Kogi", img: "photo-1587049352846-4a222e784d38", price: 4500 },
    { name: "Pure Red Palm Oil", cat: "Oils", loc: "Delta", img: "photo-1621996346565-e3dbc646d9a9", price: 2200 },
    { name: "Brown Beans (Oloyin)", cat: "Grains", loc: "Kano", img: "photo-1551462147-37885acc3c91", price: 12000 },
    { name: "Fresh Onions (Bag)", cat: "Vegetables", loc: "Kano", img: "photo-1508747703725-719777637510", price: 25000 },
    { name: "Oat Ginger Cookies", cat: "Spices", loc: "Lagos", img: "photo-1499636136210-6f4ee915583e", price: 2500 },
    { name: "Local Eggs (Crate)", cat: "Proteins", loc: "Ogun", img: "photo-1506084868730-342b1f852e0d", price: 4200 },
    { name: "Scent Leaves", cat: "Vegetables", loc: "Enugu", img: "photo-1563117512-162391629863", price: 500 },
    { name: "Unripe Plantain Flour", cat: "Grains", loc: "Edo", img: "photo-1627310537600-090680376249", price: 6500 },
    { name: "Large Titus Fish", cat: "Proteins", loc: "Rivers", img: "photo-1615141982883-c7ad0e69fd62", price: 12000 },
    { name: "Ugu Leaves (Bunch)", cat: "Vegetables", loc: "Imo", img: "photo-1592417817098-8f3b893a988a", price: 800 },
    { name: "Crayfish (Measure)", cat: "Proteins", loc: "Akwa Ibom", img: "photo-1553649033-255d677d2427", price: 3500 },
    { name: "Ginger Powder", cat: "Spices", loc: "Kaduna", img: "photo-1599202860130-f600f4948364", price: 1500 },
    { name: "Cashew Nuts (Roasted)", cat: "Fruits", loc: "Kwara", img: "photo-1600189020840-e9918c25269d", price: 5500 },
  ];

  const products = [];
  for (let i = 0; i < 50; i++) {
    const item = base[i % base.length];
    products.push({
      id: i + 1,
      name: `${item.name} ${Math.floor(i/base.length) > 0 ? `(Batch ${Math.floor(i/base.length) + 1})` : ''}`,
      price: item.price + (Math.random() * 500 - 250),
      category: item.cat,
      location: item.loc,
      image: `https://images.unsplash.com/${item.img}?w=500&auto=format&fit=crop`,
      stock_quantity: Math.floor(Math.random() * 100) + 5,
      rating: (4 + Math.random()).toFixed(1),
      reviews: Math.floor(Math.random() * 50),
      farmer: ["Global Farms", "Eco Harvest", "Green Valleys", "Oma & Sons", "Northern Grains"][i % 5],
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    });
  }
  return products;
};

// --- UTILS ---
const formatCurrency = (amount) => `₦${Math.ceil(amount).toLocaleString('en-NG')}`;

const calculateFees = (subtotal) => {
  if (subtotal === 0) return { subtotal: 0, deliveryFee: 0, service: 0, total: 0 };
  const deliveryFee = subtotal > 40000 ? 0 : 2500;
  const service = Math.ceil(subtotal * 0.02);
  return { subtotal, deliveryFee, service, total: subtotal + deliveryFee + service };
};

const App = () => {
  // --- STATE ---
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // Filters
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [locFilter, setLocFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Auth
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '', phone: '', address: '', state: 'Lagos' });

  // Dashboard
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Tubers', location: 'Lagos', image: '', stock_quantity: 10 });

  // --- INIT ---
  useEffect(() => {
    const savedProducts = localStorage.getItem('fd_products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else {
      const initial = GENERATE_PRODUCTS();
      setProducts(initial);
      localStorage.setItem('fd_products', JSON.stringify(initial));
    }

    const savedUser = localStorage.getItem('fd_session');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedOrders = localStorage.getItem('fd_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`fd_cart_${user.id}`);
      if (savedCart) setCart(JSON.parse(savedCart));
    } else {
      setCart([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem(`fd_cart_${user.id}`, JSON.stringify(cart));
  }, [cart]);

  const showAlert = (text, type = 'success') => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  // --- HANDLERS ---
  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'register') {
      const newUser = { ...authForm, id: Date.now(), role: authForm.email.includes('farmer') ? 'farmer' : 'customer' };
      localStorage.setItem('fd_session', JSON.stringify(newUser));
      setUser(newUser);
      showAlert("Account created successfully!");
    } else {
      const mockUser = { ...authForm, id: '123', fullName: 'Demo User', role: authForm.email.includes('farmer') ? 'farmer' : 'customer' };
      localStorage.setItem('fd_session', JSON.stringify(mockUser));
      setUser(mockUser);
      showAlert("Welcome back!");
    }
    setView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('fd_session');
    setUser(null);
    setView('home');
    showAlert("Logged out safely");
  };

  const addToCart = (p) => {
    if (!user) return setView('login');
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      setCart(cart.map(item => item.id === p.id ? {...item, qty: item.qty + 1} : item));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
    showAlert(`${p.name} added to cart!`);
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  };

  const checkout = () => {
    const fees = calculateFees(cart.reduce((a, b) => a + (b.price * b.qty), 0));
    const newOrder = {
      id: `FD-${Math.floor(Math.random() * 900000)}`,
      items: cart,
      total: fees.total,
      date: new Date().toISOString(),
      status: 'In Transit'
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('fd_orders', JSON.stringify(updated));
    setCart([]);
    setView('orders');
    showAlert("Order placed successfully! Delivery in 48 hours.");
  };

  const addProduct = (e) => {
    e.preventDefault();
    const p = { ...newProduct, id: Date.now(), price: Number(newProduct.price), rating: "5.0", reviews: 0, farmer: user.fullName };
    const updated = [p, ...products];
    setProducts(updated);
    localStorage.setItem('fd_products', JSON.stringify(updated));
    setNewProduct({ name: '', price: '', category: 'Tubers', location: 'Lagos', image: '', stock_quantity: 10 });
    showAlert("Product listed on Marketplace!");
  };

  // --- FILTERED DATA ---
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.farmer.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'All' || p.category === catFilter;
      const matchLoc = locFilter === 'All' || p.location === locFilter;
      return matchSearch && matchCat && matchLoc;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [products, search, catFilter, locFilter, sortBy]);

  const cartFees = calculateFees(cart.reduce((a, b) => a + (b.price * b.qty), 0));

  // --- STYLES ---
  const colors = { primary: '#15803d', secondary: '#f97316', bg: '#f8fafc', white: '#ffffff', text: '#1e293b', border: '#e2e8f0' };
  
  const s = {
    btn: { padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', border: 'none', transition: '0.2s' },
    input: { padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, width: '100%', outline: 'none' },
    card: { background: colors.white, borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }
  };

  if (loading) return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:colors.bg}}>
      <Loader2 className="animate-spin" size={48} color={colors.primary}/>
      <p style={{marginTop: '20px', color: colors.text, fontWeight: '500'}}>Harvesting Data...</p>
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: colors.bg, minHeight: '100vh', color: colors.text }}>
      
      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setView('home')}>
            <div style={{ background: colors.primary, padding: '8px', borderRadius: '10px' }}>
              <Leaf color="white" size={20} />
            </div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: colors.primary, letterSpacing: '-0.5px' }}>FARMDIRECT</h1>
          </div>

          <nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <button onClick={() => setView('shop')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Marketplace</button>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setView('cart')}>
              <ShoppingBag size={24} />
              {cart.length > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: colors.secondary, color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{cart.length}</span>}
            </div>
            {user ? (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {user.role === 'farmer' && <button onClick={() => setView('dashboard')} style={{ ...s.btn, background: colors.primary, color: 'white', padding: '8px 15px' }}>Dashboard</button>}
                <button onClick={() => setView('orders')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Truck size={22} /></button>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><LogOut size={22} /></button>
              </div>
            ) : (
              <button onClick={() => setView('login')} style={{ ...s.btn, background: colors.primary, color: 'white' }}>Login</button>
            )}
          </nav>
        </div>
      </header>

      {/* ALERTS */}
      {msg.text && (
        <div style={{ position: 'fixed', top: '85px', right: '20px', zIndex: 200, background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b', padding: '15px 25px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid currentColor' }}>
          {msg.type === 'success' ? <Check size={20}/> : <AlertCircle size={20}/>}
          <span style={{fontWeight: '600'}}>{msg.text}</span>
        </div>
      )}

      {/* CONTENT PAGES */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* HOME PAGE */}
        {view === 'home' && (
          <div>
            <div style={{ background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200)`, height: '450px', borderRadius: '24px', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '20px' }}>
              <h2 style={{ fontSize: '56px', fontWeight: '800', margin: '0 0 20px' }}>Freshness Delivered <br/>From Farm to Table</h2>
              <p style={{ fontSize: '20px', maxWidth: '600px', opacity: 0.9, marginBottom: '30px' }}>Direct access to over 500+ verified Nigerian farmers. No middlemen, just quality produce at the best prices.</p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setView('shop')} style={{ ...s.btn, background: colors.secondary, color: 'white', fontSize: '18px', padding: '15px 40px' }}>Shop Now</button>
                <button onClick={() => setView('login')} style={{ ...s.btn, background: 'white', color: colors.text, fontSize: '18px', padding: '15px 40px' }}>Join as Farmer</button>
              </div>
            </div>

            <div style={{ marginTop: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '28px', margin: 0 }}>Trending This Week</h3>
                <button onClick={() => setView('shop')} style={{ background: 'none', border: 'none', color: colors.primary, fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>View All Marketplace <ChevronRight size={18}/></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                {products.slice(0, 4).map(p => (
                   <ProductCard key={p.id} p={p} onAdd={() => addToCart(p)} colors={colors} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SHOP PAGE */}
        {view === 'shop' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }}>
            <aside>
              <div style={{ position: 'sticky', top: '100px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '22px' }}>Filters</h3>
                
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} size={18}/>
                    <input style={{ ...s.input, paddingLeft: '35px' }} placeholder="Yam, Rice, Farmer..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>Category</label>
                  {CATEGORIES.map(c => (
                    <div key={c} onClick={() => setCatFilter(c)} style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', background: catFilter === c ? colors.primary : 'transparent', color: catFilter === c ? 'white' : colors.text, marginBottom: '4px', fontSize: '14px' }}>{c}</div>
                  ))}
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px' }}>Location</label>
                  <select style={s.input} value={locFilter} onChange={e => setLocFilter(e.target.value)}>
                    <option value="All">All Locations</option>
                    {NIGERIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>
            </aside>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <p style={{ color: '#64748b' }}>Showing <b>{filtered.length}</b> products</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px' }}>Sort by:</span>
                  <select style={{ ...s.input, width: '160px', padding: '8px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {filtered.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                  {filtered.map(p => (
                    <ProductCard key={p.id} p={p} onAdd={() => addToCart(p)} colors={colors} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                  <Search size={64} style={{ color: colors.border, marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '24px' }}>No products found</h3>
                  <p>Try adjusting your filters or search term.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* CART PAGE */}
        {view === 'cart' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>Your Shopping Basket</h2>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: `2px dashed ${colors.border}` }}>
                <ShoppingBag size={64} style={{ color: colors.border, marginBottom: '20px' }} />
                <p style={{ fontSize: '18px', color: '#64748b' }}>Your basket is currently empty.</p>
                <button onClick={() => setView('shop')} style={{ ...s.btn, background: colors.primary, color: 'white', marginTop: '20px' }}>Browse Marketplace</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px' }}>
                <div>
                  {cart.map(item => (
                    <div key={item.id} style={{ ...s.card, display: 'flex', padding: '15px', gap: '20px', marginBottom: '15px', alignItems: 'center' }}>
                      <img src={item.image} style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px', fontSize: '18px' }}>{item.name}</h4>
                        <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#64748b' }}>Sold by: {item.farmer}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${colors.border}`, borderRadius: '6px' }}>
                            <button onClick={() => updateQty(item.id, -1)} style={{ padding: '5px 10px', border: 'none', background: 'none', cursor: 'pointer' }}><Minus size={14}/></button>
                            <span style={{ padding: '0 10px', fontWeight: 'bold' }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} style={{ padding: '5px 10px', border: 'none', background: 'none', cursor: 'pointer' }}><Plus size={14}/></button>
                          </div>
                          <span style={{ fontWeight: '800', color: colors.primary }}>{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      </div>
                      <button onClick={() => updateQty(item.id, -item.qty)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2/></button>
                    </div>
                  ))}
                </div>

                <div style={{ height: 'fit-content', background: 'white', padding: '25px', borderRadius: '16px', border: `1px solid ${colors.border}`, position: 'sticky', top: '100px' }}>
                  <h3 style={{ margin: '0 0 20px' }}>Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{formatCurrency(cartFees.subtotal)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery</span><span>{cartFees.deliveryFee === 0 ? 'FREE' : formatCurrency(cartFees.deliveryFee)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Service Fee</span><span>{formatCurrency(cartFees.service)}</span></div>
                    <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: '10px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800' }}>
                      <span>Total</span>
                      <span style={{ color: colors.primary }}>{formatCurrency(cartFees.total)}</span>
                    </div>
                  </div>
                  <button onClick={checkout} style={{ ...s.btn, background: colors.secondary, color: 'white', width: '100%', marginTop: '30px', fontSize: '16px' }}>Secure Checkout</button>
                  <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '15px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><ShieldCheck size={14}/> 100% Secure via Paystack</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS PAGE */}
        {view === 'orders' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>Purchase History</h2>
            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>No orders found.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} style={{ ...s.card, marginBottom: '20px', padding: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Order ID: {order.id}</p>
                      <h4 style={{ margin: '5px 0 0' }}>Placed on {new Date(order.date).toLocaleDateString()}</h4>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>{order.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px' }}>
                    {order.items.map((it, idx) => (
                      <img key={idx} src={it.image} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    ))}
                  </div>
                  <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>{order.items.length} items</span>
                    <span style={{ fontWeight: '800', fontSize: '18px' }}>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* FARMER DASHBOARD */}
        {view === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', margin: 0 }}>Farmer Console</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ background: 'white', padding: '10px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Wallet Balance</p>
                  <p style={{ margin: 0, fontWeight: '800', fontSize: '18px' }}>₦840,200</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={{ ...s.card, padding: '20px', textAlign: 'center' }}>
                <TrendingUp color={colors.primary} style={{ marginBottom: '10px' }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Total Sales</p>
                <h3 style={{ margin: '5px 0 0', fontSize: '24px' }}>124</h3>
              </div>
              <div style={{ ...s.card, padding: '20px', textAlign: 'center' }}>
                <Package color={colors.secondary} style={{ marginBottom: '10px' }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Active Listings</p>
                <h3 style={{ margin: '5px 0 0', fontSize: '24px' }}>{products.filter(p => p.farmer === user.fullName).length}</h3>
              </div>
              <div style={{ ...s.card, padding: '20px', textAlign: 'center' }}>
                <Star color="#eab308" style={{ marginBottom: '10px' }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Farmer Rating</p>
                <h3 style={{ margin: '5px 0 0', fontSize: '24px' }}>4.9/5</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
              <div style={{ ...s.card }}>
                <div style={{ padding: '20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>Inventory</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: colors.bg }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '15px' }}>Product</th>
                      <th style={{ textAlign: 'left', padding: '15px' }}>Price</th>
                      <th style={{ textAlign: 'left', padding: '15px' }}>Stock</th>
                      <th style={{ textAlign: 'left', padding: '15px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(p => p.farmer === user.fullName).map(p => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={p.image} style={{ width: '35px', height: '35px', borderRadius: '4px', objectFit: 'cover' }} />
                          {p.name}
                        </td>
                        <td style={{ padding: '15px' }}>{formatCurrency(p.price)}</td>
                        <td style={{ padding: '15px' }}>{p.stock_quantity}</td>
                        <td style={{ padding: '15px' }}>
                          <button style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', marginRight: '10px' }}><Edit size={16}/></button>
                          <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ ...s.card, padding: '25px', height: 'fit-content' }}>
                <h3 style={{ margin: '0 0 20px' }}>List New Product</h3>
                <form onSubmit={addProduct}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Product Title</label>
                    <input style={s.input} required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g Fresh Ginger" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Price (₦)</label>
                      <input type="number" style={s.input} required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Stock</label>
                      <input type="number" style={s.input} required value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Category</label>
                    <select style={s.input} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '5px' }}>Image URL</label>
                    <input style={s.input} value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://unsplash..." />
                  </div>
                  <button type="submit" style={{ ...s.btn, background: colors.primary, color: 'white', width: '100%' }}>Post to Marketplace</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* LOGIN PAGE */}
        {view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '60px auto' }}>
            <div style={{ ...s.card, padding: '40px', textAlign: 'center' }}>
              <div style={{ background: colors.primary, width: '50px', height: '50px', borderRadius: '12px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf color="white" />
              </div>
              <h2 style={{ fontSize: '28px', margin: '0 0 10px' }}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p style={{ color: '#64748b', marginBottom: '30px' }}>Join the direct agriculture revolution.</p>
              
              <form onSubmit={handleAuth}>
                {authMode === 'register' && (
                   <input style={{ ...s.input, marginBottom: '15px' }} placeholder="Full Name" required onChange={e => setAuthForm({...authForm, fullName: e.target.value})} />
                )}
                <input style={{ ...s.input, marginBottom: '15px' }} type="email" placeholder="Email Address" required onChange={e => setAuthForm({...authForm, email: e.target.value})} />
                <input style={{ ...s.input, marginBottom: '20px' }} type="password" placeholder="Password" required onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                <button type="submit" style={{ ...s.btn, background: colors.primary, color: 'white', width: '100%', fontSize: '16px' }}>{authMode === 'login' ? 'Login' : 'Sign Up'}</button>
              </form>

              <p style={{ marginTop: '20px', fontSize: '14px' }}>
                {authMode === 'login' ? "New to FarmDirect?" : "Already have an account?"} 
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ border: 'none', background: 'none', color: colors.primary, fontWeight: '700', cursor: 'pointer', marginLeft: '5px' }}>{authMode === 'login' ? 'Create Account' : 'Login'}</button>
              </p>
              <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b', padding: '10px', background: '#f1f5f9', borderRadius: '8px' }}>
                💡 <b>Farmer Tip:</b> Use an email containing the word "farmer" to sign up as a seller!
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ background: 'white', borderTop: `1px solid ${colors.border}`, padding: '60px 0 30px', marginTop: '100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ background: colors.primary, padding: '5px', borderRadius: '6px' }}><Leaf color="white" size={16} /></div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.primary }}>FARMDIRECT</h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>Nigeria's premier marketplace for sustainable, direct farm-to-door delivery. Empowing local farmers, feeding the nation.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, color: '#64748b', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>About Us</li>
              <li>How it Works</li>
              <li>Verified Farmers</li>
              <li>Logistics Partners</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, color: '#64748b', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Help Center</li>
              <li>Safety & Security</li>
              <li>Return Policy</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '20px' }}>Newsletter</h4>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>Get weekly harvest updates and discounts.</p>
            <div style={{ display: 'flex' }}>
              <input style={{ ...s.input, borderRadius: '8px 0 0 8px', borderRight: 'none' }} placeholder="Email" />
              <button style={{ ...s.btn, background: colors.primary, color: 'white', borderRadius: '0 8px 8px 0', padding: '10px' }}>Join</button>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '30px', borderTop: `1px solid ${colors.border}`, color: '#94a3b8', fontSize: '13px' }}>
          © 2024 FarmDirect Nigeria Limited. All Rights Reserved. Built for Agriculture.
        </div>
      </footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const ProductCard = ({ p, onAdd, colors }) => (
  <div key={p.id} style={{ background: 'white', borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
    <div style={{ position: 'relative' }}>
      <img src={p.image} style={{ width: '100%', height: '220px', objectFit: 'cover' }} alt={p.name} />
      <button style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <Heart size={18} color="#94a3b8" />
      </button>
    </div>
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: colors.primary }}>
        <span>{p.category}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#eab308' }}>
          <Star size={12} fill="#eab308"/> {p.rating}
        </div>
      </div>
      <h4 style={{ margin: '0 0 8px', fontSize: '17px' }}>{p.name}</h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
        <MapPin size={14} /> {p.location}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color: colors.text }}>{formatCurrency(p.price)}</span>
        <button onClick={onAdd} style={{ background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={22} />
        </button>
      </div>
    </div>
  </div>
);

export default App;