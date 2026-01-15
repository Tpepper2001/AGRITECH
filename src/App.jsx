import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Leaf, User, Trash2, Plus, LogOut, Search, 
  MapPin, Loader2, ShieldCheck, Truck, Menu, X, AlertCircle, 
  Info, Minus, Star, Package, TrendingUp, Users, DollarSign,
  Edit, Check, ChevronDown, Filter, Heart
} from 'lucide-react';

// --- MOCK INITIAL DATA ---
const INITIAL_PRODUCTS = [
  { id: 1, name: "Premium Yam Tubers (Large)", price: 4500, category: 'Tubers', location: 'Benue', image: 'https://images.unsplash.com/photo-1595855709915-393ae2536fb1?w=400', stock_quantity: 50, rating: 4.5, reviews: 23, farmer: 'John Farms' },
  { id: 2, name: "Stone-free Local Rice 50kg", price: 52000, category: 'Grains', location: 'Abakaliki', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', stock_quantity: 20, rating: 4.8, reviews: 45, farmer: 'Rice Valley Co.' },
  { id: 3, name: "Fresh Habanero Peppers", price: 1200, category: 'Vegetables', location: 'Oyo', image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400', stock_quantity: 100, rating: 4.3, reviews: 12, farmer: 'Green Fields' },
  { id: 4, name: "Yellow Garri (Bag)", price: 15000, category: 'Grains', location: 'Edo', image: 'https://images.unsplash.com/photo-1627310537600-090680376249?w=400', stock_quantity: 15, rating: 4.6, reviews: 34, farmer: 'Edo Farms Ltd' },
  { id: 5, name: "Fresh Tomatoes (Basket)", price: 8500, category: 'Vegetables', location: 'Kaduna', image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400', stock_quantity: 40, rating: 4.4, reviews: 18, farmer: 'Tomato King' },
  { id: 6, name: "Sweet Plantain (Bunch)", price: 3200, category: 'Fruits', location: 'Osun', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', stock_quantity: 60, rating: 4.7, reviews: 28, farmer: 'Plantain Grove' },
];

const NIGERIAN_STATES = ["Lagos", "Abuja", "Oyo", "Kano", "Rivers", "Enugu", "Ogun", "Kaduna", "Benue", "Edo", "Abakaliki", "Osun"];
const CATEGORIES = ['All', 'Tubers', 'Grains', 'Vegetables', 'Fruits'];
const PAYSTACK_PUBLIC_KEY = 'pk_test_demo_key'; 

// --- UTILS ---
const formatCurrency = (amount) => `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

const calculateFees = (subtotal) => {
  const deliveryFee = subtotal > 50000 ? 0 : 2500;
  const paystackFee = Math.ceil((subtotal * 0.015) + 100);
  const platformFee = Math.ceil(subtotal * 0.02);
  return {
    subtotal,
    deliveryFee,
    paystackFee,
    platformFee,
    total: subtotal + deliveryFee + paystackFee + platformFee
  };
};

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '', phone: '', address: '', state: 'Lagos' });
  const [authLoading, setAuthLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({ 
    name: '', price: '', category: 'Tubers', location: 'Lagos', 
    image: '', stock_quantity: 10, description: '' 
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // --- INITIALIZE APP ---
  useEffect(() => {
    const initApp = () => {
      setLoading(true);
      
      const savedProducts = localStorage.getItem('farm_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('farm_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      const savedOrders = localStorage.getItem('farm_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedFavorites = localStorage.getItem('farm_favorites');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

      const savedUser = localStorage.getItem('farm_session');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        const savedCart = localStorage.getItem(`farm_cart_${parsedUser.id}`);
        if (savedCart) setCart(JSON.parse(savedCart));
      }

      setTimeout(() => setLoading(false), 600);
    };
    initApp();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`farm_cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  useEffect(() => {
    if (error || successMsg) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMsg]);

  const saveProductsToLocal = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem('farm_products', JSON.stringify(updatedProducts));
  };

  // --- AUTH HANDLERS ---
  const handleAuth = (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    
    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem('farm_users') || '[]');

      if (authMode === 'register') {
        const existingUser = storedUsers.find(u => u.email === authForm.email);
        if (existingUser) {
          setError("Email already registered");
          setAuthLoading(false);
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          ...authForm,
          role: authForm.email.toLowerCase().includes('farmer') ? 'farmer' : 'customer',
          verified: true,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('farm_users', JSON.stringify([...storedUsers, newUser]));
        setSuccessMsg("Account created! Please log in.");
        setAuthMode('login');
        setAuthForm({ email: '', password: '', fullName: '', phone: '', address: '', state: 'Lagos' });
      } else {
        const foundUser = storedUsers.find(u => u.email === authForm.email && u.password === authForm.password);
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('farm_session', JSON.stringify(foundUser));
          setSuccessMsg(`Welcome back, ${foundUser.fullName}!`);
          setView('home');
        } else {
          setError("Invalid email or password");
        }
      }
      setAuthLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('farm_session');
    if (user) {
      localStorage.removeItem(`farm_cart_${user.id}`);
    }
    setUser(null);
    setView('home');
    setCart([]);
    setSuccessMsg("Logged out successfully");
  };

  // --- CART HANDLERS ---
  const addToCart = (product) => {
    if (!user) {
      setError("Please login to add items to cart");
      setView('login');
      return;
    }

    if (product.stock_quantity < 1) {
      setError("Item out of stock");
      return;
    }

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock_quantity) {
        setError("Maximum stock reached");
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? {...item, qty: item.qty + 1} : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setSuccessMsg("Added to cart!");
  };

  const updateCartQty = (productId, delta) => {
    const item = cart.find(c => c.id === productId);
    const product = products.find(p => p.id === productId);
    
    const newQty = item.qty + delta;
    if (newQty < 1) {
      setCart(cart.filter(c => c.id !== productId));
    } else if (newQty <= product.stock_quantity) {
      setCart(cart.map(c => c.id === productId ? {...c, qty: newQty} : c));
    } else {
      setError("Maximum stock reached");
    }
  };

  const toggleFavorite = (productId) => {
    if (!user) {
      setError("Please login to save favorites");
      return;
    }
    
    const isFav = favorites.includes(productId);
    const updated = isFav 
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(updated);
    localStorage.setItem('farm_favorites', JSON.stringify(updated));
    setSuccessMsg(isFav ? "Removed from favorites" : "Added to favorites");
  };

  // --- PAYMENT HANDLER ---
  const handleCheckout = () => {
    const fees = calculateFees(cart.reduce((a, b) => a + (b.price * b.qty), 0));
    
    const newOrder = {
      id: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: user.id,
      items: [...cart],
      total_amount: fees.total,
      status: 'Processing',
      created_at: new Date().toISOString(),
      reference: `REF-${Date.now()}`,
      delivery_address: user.address,
      delivery_state: user.state
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('farm_orders', JSON.stringify(updatedOrders));

    const updatedProducts = products.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      if (cartItem) return { ...p, stock_quantity: p.stock_quantity - cartItem.qty };
      return p;
    });
    saveProductsToLocal(updatedProducts);

    setSuccessMsg(`Order placed! Order ID: ${newOrder.id}`);
    setCart([]);
    setView('orders');
  };

  // --- PRODUCT HANDLERS ---
  const handleAddProduct = (e) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price || newProduct.price <= 0) {
      setError("Please fill all required fields");
      return;
    }

    const product = {
      ...newProduct,
      id: Date.now(),
      price: parseFloat(newProduct.price),
      stock_quantity: parseInt(newProduct.stock_quantity),
      image: newProduct.image || 'https://images.unsplash.com/photo-1595855709915-393ae2536fb1?w=400',
      farmer: user.fullName,
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString()
    };
    
    const updated = [product, ...products];
    saveProductsToLocal(updated);
    setSuccessMsg("Product added successfully!");
    setNewProduct({ name: '', price: '', category: 'Tubers', location: 'Lagos', image: '', stock_quantity: 10, description: '' });
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    
    const updated = products.map(p => 
      p.id === editingProduct.id ? {...editingProduct} : p
    );
    saveProductsToLocal(updated);
    setSuccessMsg("Product updated!");
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter(p => p.id !== productId);
      saveProductsToLocal(updated);
      setSuccessMsg("Product deleted");
    }
  };

  // --- FILTERING & SORTING ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.farmer?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesLocation = locationFilter === 'All' || p.location === locationFilter;
    return matchesSearch && matchesCategory && matchesLocation;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'newest': return (b.createdAt || b.id) > (a.createdAt || a.id) ? 1 : -1;
      default: return 0;
    }
  });

  const cartFees = calculateFees(cart.reduce((a, b) => a + (b.price * b.qty), 0));
  const userOrders = orders.filter(o => o.user_id === user?.id);
  const farmerProducts = products.filter(p => p.farmer === user?.fullName);

  // --- STYLES ---
  const colors = { 
    primary: '#166534', 
    primaryLight: '#dcfce7',
    secondary: '#f97316', 
    secondaryLight: '#fed7aa',
    light: '#f0fdf4', 
    white: '#fff', 
    dark: '#1e293b', 
    border: '#e2e8f0', 
    danger: '#dc2626',
    gray: '#64748b',
    success: '#16a34a'
  };
  
  const s = {
    navbar: { 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '15px 5%', background: colors.white, 
      borderBottom: `2px solid ${colors.border}`, position: 'sticky', 
      width: '90%', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    container: { maxWidth: '1200px', margin: '20px auto 40px', padding: '0 20px', minHeight: '80vh' },
    btnPrimary: { 
      background: colors.secondary, color: colors.white, border: 'none', 
      padding: '14px 28px', borderRadius: '10px', fontWeight: '600', 
      cursor: 'pointer', fontSize: '15px', width: '100%', transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
    },
    btnGreen: { 
      background: colors.primary, color: colors.white, border: 'none', 
      padding: '10px 20px', borderRadius: '8px', fontWeight: '600', 
      cursor: 'pointer', transition: 'all 0.2s'
    },
    btnOutline: {
      background: 'transparent', color: colors.primary, 
      border: `2px solid ${colors.primary}`, padding: '10px 20px', 
      borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
    },
    input: { 
      width: '100%', padding: '12px 16px', marginBottom: '15px', 
      borderRadius: '8px', border: `2px solid ${colors.border}`, 
      fontSize: '15px', boxSizing: 'border-box', transition: 'border 0.2s'
    },
    card: { 
      background: colors.white, borderRadius: '16px', 
      border: `1px solid ${colors.border}`, padding: '0', 
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      cursor: 'pointer'
    },
    grid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '24px' 
    },
  };

  if (loading) {
    return (
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', gap:'20px'}}>
        <Loader2 className="animate-spin" size={48} color={colors.primary}/>
        <p style={{color: colors.gray}}>Loading FarmDirect...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: colors.dark }}>
      
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setView('home')}>
          <div style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.success})`, padding: '8px', borderRadius: '10px' }}>
            <Leaf color="white" size={20}/>
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', color: colors.primary }}>
            FARM<span style={{ color: colors.secondary }}>DIRECT</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', color: colors.dark, fontSize:'15px' }} onClick={() => setView('shop')}>
            Marketplace
          </button>
          
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setView('cart')}>
            <ShoppingCart size={24} color={colors.primary} />
            {cart.length > 0 && (
              <span style={{ 
                position: 'absolute', top: '-8px', right: '-8px', 
                background: colors.secondary, color: 'white', fontSize: '11px', 
                fontWeight: 'bold', minWidth: '20px', height: '20px', 
                borderRadius: '10px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', padding: '0 6px'
              }}>
                {cart.length}
              </span>
            )}
          </div>

          {user?.role === 'farmer' && (
            <button onClick={() => setView('dashboard')} style={{...s.btnGreen, padding: '8px 18px', fontSize: '14px'}}>
              Dashboard
            </button>
          )}

          {user ? (
            <div style={{display:'flex', gap: '15px', alignItems:'center'}}>
              <button onClick={() => setView('orders')} title="My Orders" style={{background:'none', border:'none', cursor:'pointer', color:colors.dark}}>
                <Truck size={23}/>
              </button>
              <div style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}} onClick={() => setView('profile')}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:colors.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', color:colors.primary}}>
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button onClick={handleLogout} style={{background:'none', border:'none', cursor:'pointer', color:colors.danger}} title="Logout">
                <LogOut size={22}/>
              </button>
            </div>
          ) : (
            <button style={s.btnGreen} onClick={() => setView('login')}>Login</button>
          )}
        </div>
      </nav>

      {/* Alerts */}
      <div style={{position:'fixed', top:'80px', right:'20px', zIndex:2000, maxWidth:'400px'}}>
        {error && (
          <div style={{background:'#fee2e2', color:'#b91c1c', padding:'15px 20px', borderRadius:'10px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
            <AlertCircle size={20}/>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div style={{background:'#d1fae5', color:'#065f46', padding:'15px 20px', borderRadius:'10px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
            <Check size={20}/>
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={s.container}>
        
        {/* HOME VIEW */}
        {view === 'home' && (
          <div>
            <div style={{ 
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.success})`, 
              color: 'white', padding: '70px 30px', borderRadius: '24px', 
              textAlign: 'center', marginBottom: '50px', boxShadow: '0 8px 24px rgba(22, 101, 52, 0.2)'
            }}>
              <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: '800' }}>
                Fresh From The Farm
              </h1>
              <p style={{ maxWidth: '700px', margin: '0 auto 35px', fontSize: '18px', opacity: 0.95, lineHeight: '1.6' }}>
                Connect directly with Nigerian farmers. Get quality produce, secure payments, and reliable delivery across Nigeria.
              </p>
              <div style={{display:'flex', gap:'15px', justifyContent:'center', flexWrap:'wrap'}}>
                <button style={{ ...s.btnPrimary, width: 'auto', background: colors.white, color:colors.primary, padding:'16px 40px', fontSize:'16px' }} onClick={() => setView('shop')}>
                  Browse Products
                </button>
                {!user && (
                  <button style={{ ...s.btnOutline, background:'rgba(255,255,255,0.1)', color:'white', borderColor:'white', padding:'16px 40px', fontSize:'16px' }} onClick={() => setView('login')}>
                    Join FarmDirect
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'50px'}}>
              <div style={{background:colors.white, padding:'25px', borderRadius:'16px', textAlign:'center', border:`1px solid ${colors.border}`}}>
                <Package size={32} color={colors.primary} style={{margin:'0 auto 10px'}}/>
                <h3 style={{fontSize:'28px', margin:'5px 0', color:colors.primary}}>{products.length}+</h3>
                <p style={{margin:0, color:colors.gray}}>Fresh Products</p>
              </div>
              <div style={{background:colors.white, padding:'25px', borderRadius:'16px', textAlign:'center', border:`1px solid ${colors.border}`}}>
                <Users size={32} color={colors.secondary} style={{margin:'0 auto 10px'}}/>
                <h3 style={{fontSize:'28px', margin:'5px 0', color:colors.secondary}}>500+</h3>
                <p style={{margin:0, color:colors.gray}}>Happy Farmers</p>
              </div>
              <div style={{background:colors.white, padding:'25px', borderRadius:'16px', textAlign:'center', border:`1px solid ${colors.border}`}}>
                <ShieldCheck size={32} color={colors.success} style={{margin:'0 auto 10px'}}/>
                <h3 style={{fontSize:'28px', margin:'5px 0', color:colors.success}}>100%</h3>
                <p style={{margin:0, color:colors.gray}}>Secure Payments</p>
              </div>
            </div>

            <h2 style={{ marginBottom: '25px', fontSize:'28px' }}>Latest Harvest</h2>
            <div style={s.grid}>
              {products.slice(0, 6).map(p => (
                <div key={p.id} style={s.card} onClick={() => {setView('shop'); window.scrollTo(0,0);}}>
                  <div style={{position:'relative'}}>
                    <img src={p.image} style={{height:'200px', width:'100%', objectFit:'cover'}} alt={p.name} />
                    {p.stock_quantity < 10 && (
                      <span style={{position:'absolute', top:'10px', right:'10px', background:colors.danger, color:'white', padding:'4px 10px', borderRadius:'6px', fontSize:'12px', fontWeight:'600'}}>
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div style={{padding:'15px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'8px', color:colors.gray}}>
                      <span style={{color:colors.primary, fontWeight:'600'}}>{p.category}</span>
                      <div style={{display:'flex', alignItems:'center', gap:'3px'}}>
                        <Star size={14} fill={colors.secondary} color={colors.secondary}/>
                        <span>{p.rating || '4.5'}</span>
                      </div>
                    </div>
                    <h3 style={{ fontSize: '17px', margin: '0 0 8px', fontWeight:'600' }}>{p.name}</h3>
                    <p style={{fontSize:'13px', color:colors.gray, margin:'0 0 10px'}}><MapPin size={14} style={{display:'inline', marginRight:'4px'}}/>{p.location}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px', fontWeight: '700', color:colors.primary }}>{formatCurrency(p.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHOP VIEW */}
        {view === 'shop' && (
          <div>
            <h2 style={{marginBottom:'25px', fontSize:'32px'}}>Marketplace</h2>
            
            {/* Filters */}
            <div style={{background:colors.white, padding:'20px', borderRadius:'16px', marginBottom:'30px', border:`1px solid ${colors.border}`}}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div style={{position:'relative'}}>
                  <Search size={18} style={{position:'absolute', left:'12px', top:'12px', color:colors.gray}}/>
                  <input 
                    placeholder="Search products or farmers..." 
                    style={{ ...s.input, marginBottom: 0, paddingLeft:'40px' }} 
                    value={search}
                    onChange={e => setSearch(e.target.value)} 
                  />
                </div>
                <select style={{ ...s.input, marginBottom: 0 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select style={{ ...s.input, marginBottom: 0 }} value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                  <option value="All">All Locations</option>
                  {NIGERIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
                <select style={{ ...s.input, marginBottom: 0 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">
<option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{textAlign:'center', padding:'100px 20px', background:colors.white, borderRadius:'16px'}}>
                <Search size={48} color={colors.gray} style={{marginBottom:'15px', opacity:0.3}}/>
                <h3>No products found</h3>
                <p style={{color:colors.gray}}>Try adjusting your search or filters</p>
                <button 
                  style={{...s.btnOutline, marginTop:'15px'}} 
                  onClick={() => {setSearch(''); setCategoryFilter('All'); setLocationFilter('All');}}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div style={s.grid}>
                {filteredProducts.map(p => (
                  <div key={p.id} style={s.card}>
                    <div style={{position:'relative'}}>
                      <img src={p.image} style={{height:'220px', width:'100%', objectFit:'cover'}} alt={p.name} />
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                        style={{position:'absolute', top:'12px', right:'12px', background:colors.white, border:'none', borderRadius:'50%', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 6px rgba(0,0,0,0.1)'}}
                      >
                        <Heart size={18} fill={favorites.includes(p.id) ? colors.danger : 'none'} color={favorites.includes(p.id) ? colors.danger : colors.gray} />
                      </button>
                    </div>
                    <div style={{padding:'20px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'8px'}}>
                        <span style={{color:colors.primary, fontWeight:'700', textTransform:'uppercase'}}>{p.category}</span>
                        <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                          <Star size={14} fill={colors.secondary} color={colors.secondary}/>
                          <span style={{fontWeight:'600'}}>{p.rating || '4.5'}</span>
                          <span style={{color:colors.gray}}>({p.reviews || 0})</span>
                        </div>
                      </div>
                      <h3 style={{ fontSize: '18px', margin: '0 0 10px', fontWeight:'700' }}>{p.name}</h3>
                      <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'15px', fontSize:'13px', color:colors.gray}}>
                        <div style={{display:'flex', alignItems:'center', gap:'4px'}}><MapPin size={14}/> {p.location}</div>
                        <div style={{display:'flex', alignItems:'center', gap:'4px'}}><User size={14}/> {p.farmer}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '22px', fontWeight: '800', color:colors.primary }}>{formatCurrency(p.price)}</span>
                          <p style={{margin:0, fontSize:'12px', color: p.stock_quantity > 0 ? colors.success : colors.danger}}>
                            {p.stock_quantity > 0 ? `${p.stock_quantity} units left` : 'Out of Stock'}
                          </p>
                        </div>
                        <button 
                          style={{...s.btnGreen, padding:'10px'}} 
                          onClick={() => addToCart(p)}
                          disabled={p.stock_quantity < 1}
                        >
                          <Plus size={20}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CART VIEW */}
        {view === 'cart' && (
          <div style={{maxWidth:'900px', margin:'0 auto'}}>
            <h2 style={{marginBottom:'30px', fontSize:'32px'}}>Your Shopping Cart</h2>
            {cart.length === 0 ? (
              <div style={{textAlign:'center', padding:'60px', background:colors.white, borderRadius:'20px', border:`2px dashed ${colors.border}`}}>
                <ShoppingCart size={64} color={colors.border} style={{marginBottom:'20px'}}/>
                <p style={{fontSize:'18px', color:colors.gray, marginBottom:'25px'}}>Your cart is as empty as a farm in harmattan.</p>
                <button style={{...s.btnGreen, width:'auto'}} onClick={() => setView('shop')}>Start Shopping</button>
              </div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:'30px'}}>
                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                  {cart.map(item => (
                    <div key={item.id} style={{...s.card, flexDirection:'row', padding:'15px', alignItems:'center', gap:'20px'}}>
                      <img src={item.image} style={{width:'100px', height:'100px', borderRadius:'12px', objectFit:'cover'}} alt={item.name} />
                      <div style={{flex: 1}}>
                        <h4 style={{margin:'0 0 5px', fontSize:'17px'}}>{item.name}</h4>
                        <p style={{margin:'0 0 10px', color:colors.primary, fontWeight:'700'}}>{formatCurrency(item.price)}</p>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                          <button style={{background:colors.light, border:'none', borderRadius:'6px', padding:'4px'}} onClick={() => updateCartQty(item.id, -1)}><Minus size={16}/></button>
                          <span style={{fontWeight:'bold'}}>{item.qty}</span>
                          <button style={{background:colors.light, border:'none', borderRadius:'6px', padding:'4px'}} onClick={() => updateCartQty(item.id, 1)}><Plus size={16}/></button>
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <p style={{margin:'0 0 10px', fontWeight:'800', fontSize:'18px'}}>{formatCurrency(item.price * item.qty)}</p>
                        <button style={{background:'none', border:'none', color:colors.danger, cursor:'pointer'}} onClick={() => updateCartQty(item.id, -item.qty)}>
                          <Trash2 size={20}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{background:colors.white, padding:'25px', borderRadius:'20px', height:'fit-content', border:`1px solid ${colors.border}`, position:'sticky', top:'100px'}}>
                  <h3 style={{marginTop:0, marginBottom:'20px'}}>Order Summary</h3>
                  <div style={{display:'flex', flexDirection:'column', gap:'12px', fontSize:'15px', color:colors.gray}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span>Subtotal</span>
                      <span style={{color:colors.dark}}>{formatCurrency(cartFees.subtotal)}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span>Delivery Fee</span>
                      <span style={{color:colors.dark}}>{cartFees.deliveryFee === 0 ? 'FREE' : formatCurrency(cartFees.deliveryFee)}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span>Service Charge</span>
                      <span style={{color:colors.dark}}>{formatCurrency(cartFees.platformFee + cartFees.paystackFee)}</span>
                    </div>
                    <div style={{height:'1px', background:colors.border, margin:'10px 0'}}></div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'20px', fontWeight:'800', color:colors.dark}}>
                      <span>Total</span>
                      <span>{formatCurrency(cartFees.total)}</span>
                    </div>
                  </div>
                  <button style={{...s.btnPrimary, marginTop:'25px'}} onClick={handleCheckout}>
                    Checkout Now
                  </button>
                  <p style={{fontSize:'12px', textAlign:'center', color:colors.gray, marginTop:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}>
                    <ShieldCheck size={14} color={colors.success}/> Secure Paystack Encryption
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS VIEW */}
        {view === 'orders' && (
          <div style={{maxWidth:'800px', margin:'0 auto'}}>
            <h2 style={{marginBottom:'30px', fontSize:'32px'}}>My Orders</h2>
            {userOrders.length === 0 ? (
              <div style={{textAlign:'center', padding:'60px', background:colors.white, borderRadius:'20px'}}>
                <Package size={48} color={colors.border} style={{marginBottom:'15px'}}/>
                <p>You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                {userOrders.map(order => (
                  <div key={order.id} style={{...s.card, padding:'25px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'flex-start'}}>
                      <div>
                        <span style={{fontSize:'12px', color:colors.gray, fontWeight:'600', textTransform:'uppercase'}}>Order ID: {order.id}</span>
                        <h4 style={{margin:'5px 0 0', color:colors.primary}}>Placed on {new Date(order.created_at).toLocaleDateString()}</h4>
                      </div>
                      <span style={{background:colors.primaryLight, color:colors.primary, padding:'6px 15px', borderRadius:'20px', fontSize:'14px', fontWeight:'600'}}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'10px'}}>
                      {order.items.map((item, idx) => (
                        <img key={idx} src={item.image} style={{width:'60px', height:'60px', borderRadius:'8px', objectFit:'cover', border:`1px solid ${colors.border}`}} title={item.name}/>
                      ))}
                    </div>
                    <div style={{marginTop:'15px', paddingTop:'15px', borderTop:`1px solid ${colors.border}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span style={{color:colors.gray}}>{order.items.length} Items</span>
                      <span style={{fontSize:'18px', fontWeight:'800'}}>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUTH VIEW */}
        {view === 'login' && (
          <div style={{maxWidth:'450px', margin:'60px auto'}}>
            <div style={{background:colors.white, padding:'40px', borderRadius:'24px', boxShadow:'0 10px 25px rgba(0,0,0,0.05)', border:`1px solid ${colors.border}`}}>
              <div style={{textAlign:'center', marginBottom:'30px'}}>
                <Leaf size={40} color={colors.primary} style={{marginBottom:'15px'}}/>
                <h2 style={{margin:'0 0 10px', fontSize:'28px'}}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                <p style={{color:colors.gray}}>{authMode === 'login' ? 'Log in to continue shopping' : 'Join our farm-to-table community'}</p>
              </div>

              <form onSubmit={handleAuth}>
                {authMode === 'register' && (
                  <>
                    <label style={{fontSize:'14px', fontWeight:'600', display:'block', marginBottom:'8px'}}>Full Name</label>
                    <input style={s.input} required placeholder="John Doe" value={authForm.fullName} onChange={e => setAuthForm({...authForm, fullName: e.target.value})}/>
                    
                    <label style={{fontSize:'14px', fontWeight:'600', display:'block', marginBottom:'8px'}}>Phone Number</label>
                    <input style={s.input} required placeholder="08012345678" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})}/>
                  </>
                )}

                <label style={{fontSize:'14px', fontWeight:'600', display:'block', marginBottom:'8px'}}>Email Address</label>
                <input style={s.input} type="email" required placeholder="name@example.com" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})}/>
                
                <label style={{fontSize:'14px', fontWeight:'600', display:'block', marginBottom:'8px'}}>Password</label>
                <input style={s.input} type="password" required placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})}/>

                {authMode === 'register' && (
                  <>
                    <label style={{fontSize:'14px', fontWeight:'600', display:'block', marginBottom:'8px'}}>Delivery State</label>
                    <select style={s.input} value={authForm.state} onChange={e => setAuthForm({...authForm, state: e.target.value})}>
                      {NIGERIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                    <label style={{fontSize:'14px', fontWeight:'600', display:'block', marginBottom:'8px'}}>Full Delivery Address</label>
                    <input style={s.input} required placeholder="Street, City" value={authForm.address} onChange={e => setAuthForm({...authForm, address: e.target.value})}/>
                    
                    <div style={{background:colors.primaryLight, padding:'12px', borderRadius:'10px', marginBottom:'20px', fontSize:'13px', color:colors.primary}}>
                      <strong>Farmer Hint:</strong> Use an email containing 'farmer' to register as a seller!
                    </div>
                  </>
                )}

                <button style={s.btnPrimary} type="submit" disabled={authLoading}>
                  {authLoading ? <Loader2 className="animate-spin" style={{margin:'0 auto'}}/> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div style={{textAlign:'center', marginTop:'25px'}}>
                <button 
                  style={{background:'none', border:'none', color:colors.primary, fontWeight:'600', cursor:'pointer'}}
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                >
                  {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FARMER DASHBOARD */}
        {view === 'dashboard' && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
              <h2 style={{fontSize:'32px', margin:0}}>Farmer Dashboard</h2>
              <div style={{display:'flex', gap:'10px'}}>
                <button style={s.btnGreen} onClick={() => setEditingProduct(null)}>
                  <Plus size={18} style={{marginRight:'8px', display:'inline'}}/> Add New Product
                </button>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'20px', marginBottom:'40px'}}>
              <div style={{background:colors.white, padding:'25px', borderRadius:'16px', border:`1px solid ${colors.border}`}}>
                <TrendingUp size={24} color={colors.primary} style={{marginBottom:'10px'}}/>
                <p style={{margin:0, color:colors.gray}}>Active Products</p>
                <h3 style={{fontSize:'28px', margin:'5px 0'}}>{farmerProducts.length}</h3>
              </div>
              <div style={{background:colors.white, padding:'25px', borderRadius:'16px', border:`1px solid ${colors.border}`}}>
                <DollarSign size={24} color={colors.secondary} style={{marginBottom:'10px'}}/>
                <p style={{margin:0, color:colors.gray}}>Total Earnings</p>
                <h3 style={{fontSize:'28px', margin:'5px 0'}}>₦142,500</h3>
              </div>
              <div style={{background:colors.white, padding:'25px', borderRadius:'16px', border:`1px solid ${colors.border}`}}>
                <Package size={24} color={colors.success} style={{marginBottom:'10px'}}/>
                <p style={{margin:0, color:colors.gray}}>Items Sold</p>
                <h3 style={{fontSize:'28px', margin:'5px 0'}}>38</h3>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 380px', gap:'30px'}}>
              <div style={{background:colors.white, borderRadius:'20px', border:`1px solid ${colors.border}`, overflow:'hidden'}}>
                <div style={{padding:'20px', borderBottom:`1px solid ${colors.border}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <h3 style={{margin:0}}>My Inventory</h3>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead style={{background:colors.light}}>
                      <tr>
                        <th style={{padding:'15px', textAlign:'left', fontSize:'13px', color:colors.gray}}>Product</th>
                        <th style={{padding:'15px', textAlign:'left', fontSize:'13px', color:colors.gray}}>Price</th>
                        <th style={{padding:'15px', textAlign:'left', fontSize:'13px', color:colors.gray}}>Stock</th>
                        <th style={{padding:'15px', textAlign:'center', fontSize:'13px', color:colors.gray}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerProducts.map(p => (
                        <tr key={p.id} style={{borderBottom:`1px solid ${colors.border}`}}>
                          <td style={{padding:'15px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                              <img src={p.image} style={{width:'40px', height:'40px', borderRadius:'8px', objectFit:'cover'}}/>
                              <span style={{fontWeight:'600'}}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{padding:'15px'}}>{formatCurrency(p.price)}</td>
                          <td style={{padding:'15px'}}>
                            <span style={{color: p.stock_quantity < 10 ? colors.danger : colors.dark}}>{p.stock_quantity} units</span>
                          </td>
                          <td style={{padding:'15px', textAlign:'center'}}>
                            <button onClick={() => setEditingProduct(p)} style={{background:'none', border:'none', color:colors.primary, cursor:'pointer', marginRight:'10px'}}><Edit size={18}/></button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{background:'none', border:'none', color:colors.danger, cursor:'pointer'}}><Trash2 size={18}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{background:colors.white, padding:'30px', borderRadius:'24px', border:`1px solid ${colors.border}`, height:'fit-content'}}>
                <h3 style={{marginTop:0}}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                  <label style={{fontSize:'13px', fontWeight:'700', display:'block', marginBottom:'6px'}}>Product Name</label>
                  <input 
                    style={s.input} 
                    required 
                    value={editingProduct ? editingProduct.name : newProduct.name} 
                    onChange={e => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})}
                  />
                  
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                    <div>
                      <label style={{fontSize:'13px', fontWeight:'700', display:'block', marginBottom:'6px'}}>Price (₦)</label>
                      <input 
                        style={s.input} 
                        type="number" 
                        required 
                        value={editingProduct ? editingProduct.price : newProduct.price} 
                        onChange={e => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{fontSize:'13px', fontWeight:'700', display:'block', marginBottom:'6px'}}>Stock Qty</label>
                      <input 
                        style={s.input} 
                        type="number" 
                        required 
                        value={editingProduct ? editingProduct.stock_quantity : newProduct.stock_quantity} 
                        onChange={e => editingProduct ? setEditingProduct({...editingProduct, stock_quantity: e.target.value}) : setNewProduct({...newProduct, stock_quantity: e.target.value})}
                      />
                    </div>
                  </div>

                  <label style={{fontSize:'13px', fontWeight:'700', display:'block', marginBottom:'6px'}}>Category</label>
                  <select 
                    style={s.input} 
                    value={editingProduct ? editingProduct.category : newProduct.category} 
                    onChange={e => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <label style={{fontSize:'13px', fontWeight:'700', display:'block', marginBottom:'6px'}}>Image URL</label>
                  <input 
                    style={s.input} 
                    placeholder="https://..." 
                    value={editingProduct ? editingProduct.image : newProduct.image} 
                    onChange={e => editingProduct ? setEditingProduct({...editingProduct, image: e.target.value}) : setNewProduct({...newProduct, image: e.target.value})}
                  />

                  <button style={s.btnPrimary} type="submit">
                    {editingProduct ? 'Update Product' : 'List Product'}
                  </button>
                  {editingProduct && (
                    <button 
                      type="button" 
                      style={{...s.btnOutline, width:'100%', marginTop:'10px'}} 
                      onClick={() => setEditingProduct(null)}
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{background:colors.white, borderTop:`1px solid ${colors.border}`, padding:'60px 5% 40px', marginTop:'60px'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'40px', maxWidth:'1200px', margin:'0 auto'}}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom:'20px' }}>
              <div style={{ background: colors.primary, padding: '6px', borderRadius: '8px' }}>
                <Leaf color="white" size={16}/>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '800', color: colors.primary }}>
                FARMDIRECT
              </span>
            </div>
            <p style={{color:colors.gray, fontSize:'14px', lineHeight:'1.6'}}>Nigeria's leading farm-to-table marketplace connecting farmers directly with consumers.</p>
          </div>
          <div>
            <h4 style={{marginBottom:'20px'}}>Marketplace</h4>
            <ul style={{listStyle:'none', padding:0, fontSize:'14px', color:colors.gray, display:'flex', flexDirection:'column', gap:'10px'}}>
              <li style={{cursor:'pointer'}} onClick={() => setView('shop')}>Browse Products</li>
              <li style={{cursor:'pointer'}}>Verified Farmers</li>
              <li style={{cursor:'pointer'}}>Logistics Partners</li>
            </ul>
          </div>
          <div>
            <h4 style={{marginBottom:'20px'}}>Support</h4>
            <ul style={{listStyle:'none', padding:0, fontSize:'14px', color:colors.gray, display:'flex', flexDirection:'column', gap:'10px'}}>
              <li style={{cursor:'pointer'}}>Help Center</li>
              <li style={{cursor:'pointer'}}>Safety Tips</li>
              <li style={{cursor:'pointer'}}>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4 style={{marginBottom:'20px'}}>Join Us</h4>
            <p style={{color:colors.gray, fontSize:'14px', marginBottom:'15px'}}>Are you a farmer? Reach thousands of customers.</p>
            <button style={{...s.btnGreen, fontSize:'13px'}} onClick={() => {setAuthMode('register'); setView('login');}}>Start Selling</button>
          </div>
        </div>
        <div style={{textAlign:'center', marginTop:'50px', paddingTop:'25px', borderTop:`1px solid ${colors.border}`, color:colors.gray, fontSize:'13px'}}>
          © 2024 FarmDirect Nigeria. All rights reserved. Built for Nigerian Agriculture.
        </div>
      </footer>
    </div>
  );
};

export default App;