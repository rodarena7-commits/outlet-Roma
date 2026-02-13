import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  MessageCircle, 
  PlusCircle, 
  X, 
  Camera, 
  Bell, 
  UserPlus, 
  Check, 
  Filter, 
  Tag
} from 'lucide-react';

// --- Configuración de Datos ---
const CATEGORIES = [
  { id: 'remeras', name: 'Remeras', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200' },
  { id: 'camisas', name: 'Camisas', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200' },
  { id: 'buzos', name: 'Buzos', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=200' },
  { id: 'jeans', name: 'Jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=200' },
  { id: 'pantalones', name: 'Pantalones', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=200' },
  { id: 'camperas', name: 'Camperas', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200' },
  { id: 'calzado', name: 'Calzado', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200' },
  { id: 'short', name: 'Short', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=200' },
  { id: 'ropa-interior', name: 'Ropa interior', image: 'https://images.unsplash.com/photo-1582533075177-a0d33089146e?auto=format&fit=crop&q=80&w=200' },
  { id: 'mayas', name: 'Mayas y Biquinis', image: 'https://images.unsplash.com/photo-1583392015942-70b88c7f070c?auto=format&fit=crop&q=80&w=200' },
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    user: { name: "Roma_Ventas", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roma" },
    image: "https://images.unsplash.com/photo-1539109132314-347752418b30?auto=format&fit=crop&q=80&w=400",
    title: "Vestido Gala Seda - Outlet Roma",
    price: 85000,
    size: "S",
    category: "mayas",
    condition: "Ropa nueva con etiqueta",
    gender: "Femenino",
    likes: 12,
  },
  {
    id: 2,
    user: { name: "Nico_Boutique", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nico" },
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=400",
    title: "Remera Algodón Premium",
    price: 12000,
    size: "L",
    category: "remeras",
    condition: "Ropa usada",
    gender: "Masculino",
    likes: 5,
  }
];

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGender, setSelectedGender] = useState("Todo");

  const [newProduct, setNewProduct] = useState({
    title: "", price: "", size: "M", image: "", condition: "Ropa usada", 
    category: "remeras", gender: "Femenino"
  });

  // CARGA DE ESTILOS DE EMERGENCIA (Si Tailwind falla, esto lo arregla)
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement("script");
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();
    const productToAdd = {
      id: Date.now(),
      user: { name: "MiUsuario", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Me" },
      image: newProduct.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400",
      ...newProduct,
      price: parseInt(newProduct.price),
      likes: 0,
    };
    setProducts([productToAdd, ...products]);
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    const matchesGender = selectedGender === "Todo" || p.gender === selectedGender;
    return matchesSearch && matchesCat && matchesGender;
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans text-gray-900 pb-20">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; animation: marquee 30s linear infinite; white-space: nowrap; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .font-serif { font-family: 'Playfair Display', serif !important; }
      `}</style>

      {/* Banner */}
      <div className="bg-[#1a1a1a] text-[#d4af37] py-2 overflow-hidden border-b border-[#d4af37]/20">
        <div className="animate-marquee gap-10 text-[10px] font-bold uppercase tracking-widest">
          <span>✨ BIENVENIDOS A +ROMA ~ OUTLET & SHOWROOM ✨</span>
          <span>🚚 ENVÍOS A TODO EL PAÍS ~ 💎 CALIDAD SELECCIONADA ✨</span>
          <span>✨ BIENVENIDOS A +ROMA ~ OUTLET & SHOWROOM ✨</span>
          <span>🚚 ENVÍOS A TODO EL PAÍS ~ 💎 CALIDAD SELECCIONADA ✨</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm flex items-center justify-between px-4 md:px-10 h-20">
        <div className="flex flex-col cursor-pointer" onClick={() => {setSelectedCategory(null); setSelectedGender("Todo");}}>
          <span className="text-2xl md:text-3xl font-serif tracking-[0.2em] font-light uppercase text-black">+ROMA</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#d4af37] mt-1">Showroom & Outlet</span>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input 
            type="text" 
            placeholder="¿Qué prenda buscas?" 
            className="w-full bg-gray-100 rounded-full py-2.5 px-12 text-sm outline-none border border-transparent focus:border-[#d4af37] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsModalOpen(true)} className="bg-black text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#d4af37] flex items-center gap-2 shadow-lg transition-all">
            <PlusCircle size={14} />
            <span className="hidden sm:inline">Vender</span>
          </button>
          <User className="text-gray-600 w-5 h-5 cursor-pointer hover:text-black" />
        </div>
      </header>

      {/* Filtros de Género */}
      <div className="bg-white border-b sticky top-20 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-full">
            {["Masculino", "Femenino", "Todo"].map(g => (
              <button 
                key={g} 
                onClick={() => setSelectedGender(g)} 
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${selectedGender === g ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categorías Visuales */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 justify-start md:justify-center">
          {CATEGORIES.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)} 
              className={`group flex-shrink-0 cursor-pointer flex flex-col items-center transition-all ${selectedCategory === cat.id ? 'scale-105 opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 transition-all ${selectedCategory === cat.id ? 'border-[#d4af37] ring-4 ring-[#d4af37]/10' : 'border-transparent'}`}>
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className={`mt-3 text-[9px] font-black uppercase tracking-widest ${selectedCategory === cat.id ? 'text-[#d4af37]' : 'text-gray-500'}`}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Catálogo de 5 Columnas */}
      <main className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 group hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="p-3 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <img src={product.user.avatar} className="w-6 h-6 rounded-full" alt="" />
                  <span className="text-[9px] font-bold text-gray-700 truncate max-w-[80px]">{product.user.name}</span>
                </div>
              </div>
              
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[11px] font-medium text-gray-500 mb-1 truncate uppercase tracking-tight">{product.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-black tracking-tighter text-black">${product.price.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-gray-300">TALLE {product.size}</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-black text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#d4af37] transition-all">
                  Detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal de Publicación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-8 text-black tracking-tighter text-center">+Roma Vender</h2>
            <form onSubmit={handleUpload} className="space-y-5">
              <input type="text" placeholder="¿Qué vendes?" className="w-full border-b border-gray-200 py-3 text-sm outline-none focus:border-[#d4af37]" onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} required />
              <input type="number" placeholder="Precio $" className="w-full border-b border-gray-200 py-3 text-sm outline-none focus:border-[#d4af37]" onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
              <button type="submit" className="w-full bg-black text-white py-4 rounded-full font-black uppercase text-[10px] hover:bg-[#d4af37] transition-all">Publicar ahora</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-400 text-[9px] font-bold uppercase mt-2">Cerrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
