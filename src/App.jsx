import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query,
  orderBy
} from 'firebase/firestore';
import { 
  Search, ShoppingBag, User, Heart, 
  PlusCircle, X, Camera, ChevronRight, 
  Trash2, ArrowRight, Tag, Check, Edit3, Lock, LogIn, UserPlus, UserCheck, Upload
} from 'lucide-react';

// --- Configuración Real de Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyDm0yBRVNmZWrfSSL_-ueXC0S0f771ofjU",
  authDomain: "showroom-7a0a5.firebaseapp.com",
  projectId: "showroom-7a0a5",
  storageBucket: "showroom-7a0a5.firebasestorage.app",
  messagingSenderId: "1088867111350",
  appId: "1:1088867111350:web:f7d557749f8037021b7117",
  measurementId: "G-R8FYLYS8FK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Constantes de Categorías ---
const CATEGORIES = [
  { id: 'remeras', name: 'Remeras', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200' },
  { id: 'camisas', name: 'Camisas', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200' },
  { id: 'buzos', name: 'Buzos', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=200' },
  { id: 'vestidos', name: 'Vestidos', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200' },
  { id: 'jeans', name: 'Jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=200' },
  { id: 'pantalones', name: 'Pantalones', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=200' },
  { id: 'camperas', name: 'Camperas', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200' },
  { id: 'calzado', name: 'Calzado', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200' },
  { id: 'short', name: 'Short', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=200' },
  { id: 'gorras', name: 'Gorras', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=200' },
];

const CONDITIONS = ["Ropa nueva con etiqueta", "Ropa nueva sin etiqueta", "Ropa como nueva", "Ropa usada"];
const AGE_GROUPS = ["Bebés", "Kids", "Juvenil", "Adulto", "Mayor"];
const GENDERS = ["Masculino", "Femenino", "Unisex"];
const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "Único"];

export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [userPrefs, setUserPrefs] = useState({ likes: [], following: [] });
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGender, setSelectedGender] = useState("Todo");
  const [selectedAge, setSelectedAge] = useState("Todo");

  // New Product Data
  const [newProduct, setNewProduct] = useState({
    title: "", price: "", offerPrice: "", size: "M", image: "", 
    condition: "Ropa usada", category: "remeras", gender: "Femenino", 
    ageGroup: "Adulto", description: ""
  });

  // SALE Config
  const [saleConfig, setSaleConfig] = useState({ 
    title: "¡TEMPORADA DE LIQUIDACIÓN!", 
    active: true, 
    discount: "30% OFF", 
    vigencia: "Hasta 28 Feb" 
  });
  const [saleClickCount, setSaleClickCount] = useState(0);
  const [pinInput, setPinInput] = useState("");

  // --- Firebase Effects ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Listen to Global Products
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      const pData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(pData);
    });

    // Listen to Sale Config
    const saleRef = doc(db, 'artifacts', appId, 'public', 'data', 'saleConfig');
    const unsubSale = onSnapshot(saleRef, (doc) => {
      if (doc.exists()) setSaleConfig(doc.data());
    });

    if (user) {
      const prefsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'prefs', 'data');
      const unsubPrefs = onSnapshot(prefsRef, (doc) => {
        if (doc.exists()) setUserPrefs(doc.data());
      });
      return () => { unsubProducts(); unsubPrefs(); unsubSale(); };
    }

    return () => { unsubProducts(); unsubSale(); };
  }, [user]);

  // --- Handlers ---
  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, provider); } catch (e) { console.error(e); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) return handleGoogleLogin();
    
    const productData = {
      ...newProduct,
      price: parseInt(newProduct.price) || 0,
      offerPrice: parseInt(newProduct.offerPrice) || null,
      createdAt: Date.now(),
      sellerId: user.uid,
      sellerName: user.displayName,
      sellerAvatar: user.photoURL
    };

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), productData);
    setIsModalOpen(false);
    setImagePreview(null);
    setNewProduct({ title: "", price: "", offerPrice: "", size: "M", image: "", condition: "Ropa usada", category: "remeras", gender: "Femenino", ageGroup: "Adulto", description: "" });
  };

  const toggleLike = async (id) => {
    if (!user) return handleGoogleLogin();
    const likes = userPrefs.likes.includes(id) ? userPrefs.likes.filter(p => p !== id) : [...userPrefs.likes, id];
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'prefs', 'data'), { ...userPrefs, likes });
  };

  const toggleFollow = async (sellerId) => {
    if (!user || user.uid === sellerId) return handleGoogleLogin();
    const following = userPrefs.following.includes(sellerId) ? userPrefs.following.filter(p => p !== sellerId) : [...userPrefs.following, sellerId];
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'prefs', 'data'), { ...userPrefs, following });
  };

  const handleSaleConfigUpdate = async () => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'saleConfig'), saleConfig);
    setIsAdminModalOpen(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = !selectedCategory || p.category === selectedCategory;
      const matchesGender = selectedGender === "Todo" || p.gender === selectedGender;
      const matchesAge = selectedAge === "Todo" || p.ageGroup === selectedAge;
      return matchesSearch && matchesCat && matchesGender && matchesAge;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [products, searchTerm, selectedCategory, selectedGender, selectedAge]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans pb-32 overflow-x-hidden">
      
      {/* --- Navegación --- */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <span className="text-2xl md:text-3xl font-serif tracking-[0.2em] font-light uppercase">+Roma</span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#d4af37]">Showroom & Outlet</span>
          </div>

          <div className="hidden lg:flex flex-1 max-w-md mx-12 relative group">
            <input type="text" placeholder="Buscar prenda..." className="w-full bg-slate-50 rounded-full py-2.5 px-10 text-xs outline-none border border-transparent focus:bg-white focus:border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute left-4 top-2.5 text-slate-400" size={16} />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-black text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm active:scale-95">
              <PlusCircle size={14} /> <span className="hidden sm:inline">Vender</span>
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-slate-600">
              <ShoppingBag size={22} />
              {cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
            </button>
            <div onClick={user ? () => signOut(auth) : handleGoogleLogin} className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 cursor-pointer overflow-hidden flex items-center justify-center">
              {user ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <User size={18} className="text-slate-400" />}
            </div>
          </div>
        </div>
      </header>

      {/* --- Filtros --- */}
      <div className="bg-white border-b sticky top-20 z-40 shadow-sm py-4 space-y-4">
        <div className="container mx-auto px-4">
          {/* Fila 1: Género */}
          <div className="flex justify-center items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Género:</span>
            <div className="flex bg-slate-100 p-1 rounded-full">
              {["Todo", ...GENDERS].map(g => (
                <button key={g} onClick={() => setSelectedGender(g)} className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${selectedGender === g ? 'bg-black text-white shadow-md' : 'text-slate-400'}`}>{g}</button>
              ))}
            </div>
          </div>
          {/* Fila 2: Edad */}
          <div className="flex justify-center items-center gap-3 overflow-x-auto no-scrollbar mt-4">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Edad:</span>
            <div className="flex gap-2">
              {["Todo", ...AGE_GROUPS].map(age => (
                <button key={age} onClick={() => setSelectedAge(age)} className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase border whitespace-nowrap ${selectedAge === age ? 'bg-[#d4af37] border-[#d4af37] text-white shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}>{age}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- SALE! Banner --- */}
      {saleConfig.active && (
        <section className="bg-red-600 text-white py-4 text-center cursor-default select-none relative overflow-hidden" 
          onClick={() => { setSaleClickCount(c => c+1); if(saleClickCount >= 6) setShowPinInput(true); }}>
           <h2 className="text-2xl font-black italic tracking-tighter animate-pulse uppercase">SALE! {saleConfig.title}</h2>
           <div className="flex justify-center gap-4 mt-1">
             <span className="text-[10px] font-black uppercase bg-white text-red-600 px-3 py-0.5 rounded-full">{saleConfig.discount}</span>
             <span className="text-[10px] font-bold uppercase opacity-80">{saleConfig.vigencia}</span>
           </div>
        </section>
      )}

      {/* --- Categorías --- */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <div key={cat.id} onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)} className={`flex-shrink-0 cursor-pointer flex flex-col items-center transition-all ${selectedCategory === cat.id ? 'scale-105 opacity-100' : 'opacity-60'}`}>
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all ${selectedCategory === cat.id ? 'border-[#d4af37] shadow-lg' : 'border-transparent'}`}>
                <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
              </div>
              <span className={`mt-2 text-[8px] font-black uppercase tracking-widest ${selectedCategory === cat.id ? 'text-[#d4af37]' : 'text-slate-500'}`}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- Catálogo (3 Col Móvil / 4 Col Desktop) --- */}
      <main className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-xl transition-all">
              {/* Seller Header */}
              <div className="p-2 md:p-3 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <img src={product.sellerAvatar} className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-slate-100" alt="" />
                  <span className="text-[7px] md:text-[9px] font-bold truncate">{product.sellerName}</span>
                </div>
                {user && user.uid !== product.sellerId && (
                  <button onClick={() => toggleFollow(product.sellerId)} className="p-1">
                    {userPrefs.following.includes(product.sellerId) ? <UserCheck size={14} className="text-[#d4af37]" /> : <UserPlus size={14} className="text-slate-200" />}
                  </button>
                )}
              </div>

              {/* Product Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 right-2">
                   <span className="bg-white/95 px-2 py-0.5 rounded-full text-[6px] md:text-[8px] font-black uppercase shadow-sm">Talle {product.size}</span>
                </div>
                {product.offerPrice && <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full">SALE</div>}
              </div>

              {/* Product Info */}
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="text-[8px] md:text-xs font-serif font-bold line-clamp-1 mb-1">{product.title}</h3>
                <div className="mt-auto flex items-end justify-between pt-2 border-t border-slate-50">
                  <div className="flex flex-col">
                    {product.offerPrice ? (
                      <>
                        <span className="text-red-600 text-[10px] md:text-lg font-black">${product.offerPrice.toLocaleString()}</span>
                        <span className="text-[7px] md:text-[9px] text-slate-400 line-through">${product.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-[10px] md:text-lg font-black text-slate-900">${product.price.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleLike(product.id)} className="p-1">
                      <Heart size={14} className={userPrefs.likes.includes(product.id) ? "fill-red-500 text-red-500" : "text-slate-200"} />
                    </button>
                    <button className="text-[8px] md:text-[10px] font-black uppercase border-b border-black pb-0.5">Comprar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- Modal Publicar Prenda --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 my-8 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-300 hover:text-black"><X size={28} /></button>
            <h2 className="text-2xl font-serif italic mb-8">Publicar en +Roma</h2>
            
            <form onSubmit={handleUpload} className="space-y-6">
              {/* Foto Upload */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Foto de la prenda</label>
                <div 
                  className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all relative overflow-hidden"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload size={32} className="text-slate-200 mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Click para importar foto</span>
                    </>
                  )}
                </div>
                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Título de la prenda" className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none" onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} required />
                <select className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none" onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Precio ($)" className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none" onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
                <input type="number" placeholder="Precio Oferta (opcional)" className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none" onChange={(e) => setNewProduct({...newProduct, offerPrice: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="w-full bg-slate-50 rounded-xl p-3 text-sm" onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="w-full bg-slate-50 rounded-xl p-3 text-sm" onChange={(e) => setNewProduct({...newProduct, ageGroup: e.target.value})}>
                  {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <textarea placeholder="Descripción (opcional)" className="w-full bg-slate-50 rounded-2xl p-4 text-sm outline-none h-24 resize-none" onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}></textarea>

              <button type="submit" className="w-full bg-black text-white py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#d4af37] transition-all">Publicar Artículo</button>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal PIN Admin --- */}
      {showPinInput && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl w-full max-w-xs text-center shadow-2xl">
            <Lock className="mx-auto mb-4 text-[#d4af37]" size={32} />
            <h3 className="font-serif italic mb-4">Acceso Editor</h3>
            <input type="password" placeholder="PIN" className="w-full bg-slate-50 rounded-xl py-3 px-5 text-center text-xl tracking-widest mb-6 outline-none" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value)} />
            <button onClick={() => { if(pinInput==="0505") { setIsAdminModalOpen(true); setShowPinInput(false); } else { alert("PIN Incorrecto"); } setPinInput(""); }} className="w-full bg-black text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">Entrar</button>
          </div>
        </div>
      )}

      {/* --- Modal Editor SALE! --- */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold italic uppercase tracking-tighter">Editor de SALE!</h2>
              <button onClick={() => setIsAdminModalOpen(false)}><X size={24}/></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Título Promo" className="w-full bg-slate-50 p-4 rounded-xl text-sm" value={saleConfig.title} onChange={(e) => setSaleConfig({...saleConfig, title: e.target.value})} />
              <input type="text" placeholder="Descuento (ej: 40% OFF)" className="w-full bg-slate-50 p-4 rounded-xl text-sm" value={saleConfig.discount} onChange={(e) => setSaleConfig({...saleConfig, discount: e.target.value})} />
              <input type="text" placeholder="Vigencia" className="w-full bg-slate-50 p-4 rounded-xl text-sm" value={saleConfig.vigencia} onChange={(e) => setSaleConfig({...saleConfig, vigencia: e.target.value})} />
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" checked={saleConfig.active} onChange={(e) => setSaleConfig({...saleConfig, active: e.target.checked})} className="w-5 h-5 accent-black" />
                <span className="text-xs font-bold uppercase tracking-widest">Banner Visible</span>
              </div>
              <button onClick={handleSaleConfigUpdate} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[10px] mt-4 tracking-widest">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Nav Móvil --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 h-16 flex items-center justify-around z-50 px-6 shadow-2xl">
        <button className="text-black p-2" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}><Search size={22} /></button>
        <button className="text-slate-400 p-2" onClick={() => setIsCartOpen(true)}><ShoppingBag size={22} /></button>
        <button onClick={() => setIsModalOpen(true)} className="bg-black text-white p-4 rounded-full shadow-2xl -translate-y-5 border-4 border-[#FDFCFB]"><PlusCircle size={26} /></button>
        <button className="text-slate-400 p-2"><Heart size={22} /></button>
        <button onClick={user ? () => signOut(auth) : handleGoogleLogin} className="text-slate-400 p-2">
          {user ? <img src={user.photoURL} className="w-7 h-7 rounded-full object-cover" /> : <User size={22} />}
        </button>
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        body { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          background: #FDFCFB;
          margin: 0;
          padding: 0;
        }
        
        .font-serif { font-family: 'Playfair Display', serif; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

