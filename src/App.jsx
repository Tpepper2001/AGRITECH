import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingCart, Leaf, User, ShieldCheck, Trash2, Plus, LogOut, Search } from 'lucide-react';

// --- CONFIGURATION ---
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('home'); // home, shop, admin, cart, login
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchProducts();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
      // In a real app, check a 'profiles' table for role === 'admin'
      setIsAdmin(data.user.email.includes('admin')); 
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  // --- AUTH LOGIC ---
  const handleLogin = async (role) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else {
      setUser(data.user);
      setIsAdmin(role === 'admin');
      setView('home');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setView('home');
  };

  // --- CART LOGIC ---
  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.name} added to basket!`);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);

  // --- PAYSTACK INTEGRATION ---
  const handlePayment = () => {
    if (!user) return setView('login');

    const handler = window.PaystackPop.setup({
      key: 'YOUR_PAYSTACK_PUBLIC_KEY', // Replace with your public key
      email: user.email,
      amount: cartTotal * 100, // Paystack is in Kobo
      currency: 'NGN',
      callback: (response) => {
        alert('Payment Successful! Ref: ' + response.reference);
        setCart([]);
        setView('home');
      },
      onClose: () => alert('Transaction cancelled.'),
    });
    handler.openIframe();
  };

  // --- STYLES (Nigeria Market Aesthetic) ---
  const styles = {
    nav: "flex justify-between items-center p-4 bg-white border-b sticky top-0 z-50",
    btnPrimary: "bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition",
    btnSecondary: "border-2 border-green-600 text-green-600 px-6 py-2 rounded-full font-bold",
    card: "bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition",
    input: "w-full p-3 border rounded-xl mb-4 bg-gray-50",
    badge: "bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold uppercase"
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-green-600 p-2 rounded-lg"><Leaf size={24} color="white" /></div>
          <h1 className="text-2xl font-black tracking-tight text-green-800">FARM<span className="text-orange-500">DIRECT</span></h1>
        </div>

        <div className="flex gap-6 items-center">
          <button onClick={() => setView('shop')} className="hidden md:block font-medium">Browse Farm</button>
          {isAdmin && <button onClick={() => setView('admin')} className="text-orange-600 font-bold flex items-center gap-1"><ShieldCheck size={18}/> Admin</button>}
          
          <div className="flex items-center gap-4">
            <button onClick={() => setView('cart')} className="relative p-2">
              <ShoppingCart size={24} />
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>}
            </button>
            {user ? (
              <button onClick={handleLogout} className="p-2 text-gray-500"><LogOut size={24}/></button>
            ) : (
              <button onClick={() => setView('login')} className={styles.btnPrimary}>Login</button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {view === 'home' && (
        <main>
          <div className="bg-green-800 text-white py-20 px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-4">Fresh from the Farm <br/>to your Lagos Kitchen.</h2>
            <p className="text-green-100 mb-8 text-lg">Skip the market crowd. Buy affordable, organic produce directly from rural farmers.</p>
            <button onClick={() => setView('shop')} className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full text-xl font-bold transition transform hover:scale-105">
              Start Shopping Now
            </button>
          </div>
          
          <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-3 gap-8 text-center">
             <div className="p-6">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">🇳🇬</div>
                <h3 className="font-bold text-xl mb-2">100% Nigerian</h3>
                <p className="text-gray-600">Supporting local farmers across the 36 states.</p>
             </div>
             <div className="p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">⚡</div>
                <h3 className="font-bold text-xl mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Same day delivery for urban centers in Lagos and Abuja.</p>
             </div>
             <div className="p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">💎</div>
                <h3 className="font-bold text-xl mb-2">Best Prices</h3>
                <p className="text-gray-600">No middle-men, just pure farm-to-table savings.</p>
             </div>
          </div>
        </main>
      )}

      {/* Shop / Product Listing */}
      {(view === 'shop' || view === 'home') && (
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black">Today's Harvest</h2>
            <div className="flex bg-white border rounded-full px-4 py-2 w-1/3">
              <Search className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search Tomatoes, Yam, Garri..." className="outline-none w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className={styles.card}>
                <img src={product.image_url || 'https://via.placeholder.com/300x200?text=Produce'} className="w-full h-48 object-cover rounded-xl mb-4" />
                <span className={styles.badge}>{product.category}</span>
                <h3 className="font-bold text-xl mt-2">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{product.location}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-green-700">₦{product.price.toLocaleString()}</span>
                  <button onClick={() => addToCart(product)} className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-700 hover:text-white transition">
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Login Section */}
      {view === 'login' && (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl">
          <h2 className="text-3xl font-black mb-6 text-center">Welcome Back</h2>
          <input type="email" placeholder="Email Address" className={styles.input} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className={styles.input} onChange={(e) => setPassword(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleLogin('customer')} className={styles.btnPrimary}>User Login</button>
            <button onClick={() => handleLogin('admin')} className={styles.btnSecondary}>Admin Login</button>
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">Rural farmers connecting to urban demand.</p>
        </div>
      )}

      {/* Cart Section */}
      {view === 'cart' && (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-3xl shadow-lg">
          <h2 className="text-3xl font-black mb-8">Your Basket</h2>
          {cart.length === 0 ? (
            <p className="text-center py-10 text-gray-400">Your basket is empty. Start shopping!</p>
          ) : (
            <>
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center mb-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <img src={item.image_url} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-green-600 font-bold">₦{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => setCart(cart.filter((_, i) => i !== idx))}><Trash2 size={20} className="text-red-400"/></button>
                </div>
              ))}
              <div className="mt-8 pt-4 border-t-2 border-dashed">
                <div className="flex justify-between text-2xl font-black mb-6">
                  <span>Total:</span>
                  <span>₦{cartTotal.toLocaleString()}</span>
                </div>
                <button onClick={handlePayment} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg shadow-green-200">
                  Pay with Paystack
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Admin Dashboard */}
      {view === 'admin' && (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-3xl border shadow-sm">
          <h2 className="text-3xl font-black mb-6">Farmer Dashboard</h2>
          <div className="bg-yellow-50 p-4 rounded-xl mb-8 border border-yellow-200 text-yellow-800">
             Hello Admin! You can list new produce for the urban market here.
          </div>
          <form className="grid grid-cols-2 gap-4" onSubmit={(e) => {
            e.preventDefault();
            alert("This would call: supabase.from('products').insert(...)");
          }}>
            <input placeholder="Produce Name (e.g. Ogbomosho Yam)" className={styles.input} />
            <input placeholder="Price (NGN)" type="number" className={styles.input} />
            <input placeholder="Category (Tubers, Veggies, Grains)" className={styles.input} />
            <input placeholder="Image URL" className={styles.input} />
            <button className="col-span-2 bg-green-800 text-white p-4 rounded-xl font-bold">List Product for Sale</button>
          </form>
        </div>
      )}

      <footer className="mt-20 p-10 bg-gray-900 text-white text-center">
        <p>© 2023 FarmDirect Nigeria. Empowering rural farmers, feeding cities.</p>
      </footer>
    </div>
  );
};

export default App;
