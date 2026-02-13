import React, { useState } from 'react';
import { 
  Search, ShoppingBag, User, Heart, MessageCircle, 
  PlusCircle, X, Camera, Bell, UserPlus, Check, Filter, Tag 
} from 'lucide-react';

// --- Configuración de Categorías y Marcas ---
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

const BRANDS = [
  "Nike", "Adidas", "Puma", "Calvin Klein", "Zara", "H&M", "Primark", "Forever 21",
  "Gucci", "Prada", "Louis Vuitton", "Chanel", "Versace", "Tommy Hilfiger", "Lacoste", 
  "Ralph Lauren", "Levi's", "Diesel", "The North Face", "Patagonia", "Under Armour", 
  "Reebok", "New Balance", "Vans", "Converse", "Victoria's Secret", "Mango", "Bershka"
].map(name => ({
  name,
  logo: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s/g, '').replace("'", "")}.com`
}));

const CONDITIONS = ["Ropa nueva con etiqueta", "Ropa nueva sin etiqueta", "Ropa como nueva", "Ropa usada"];
const AGE_GROUPS = ["Bebés", "Kids", "Juvenil", "Adulto", "Mayor"];
const GENDERS = ["Masculino", "Femenino", "Todo"];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    user: { name: "Roma_Ventas", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roma", following: false },
    image: "https://images.unsplash.com/photo-1539109132314-347752418b30?auto=format&fit=crop&q=80&w=400",
    title: "Vestido Gala Seda",
    price: 85000,
    size: "S",
    category: "mayas",
    condition: "Ropa nueva con etiqueta",
    gender: "Femenino",
    ageGroup: "Adulto",
    likes: 12,
  },
  {
    id: 2,
    user: { name: "Nico_Boutique", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nico", following: false },
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=400",
    title: "Remera Algodón Premium",
    price: 12000,
    size: "L",
    category: "remeras",
    condition: "Ropa usada",
    gender: "Masculino",
    ageGroup: "Juvenil",
    likes: 5,
  }
];

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGender, setSelectedGender] = useState("Todo");
  const [selectedAge, setSelectedAge] = useState("Todo");
  const [selectedCondition, setSelectedCondition] = useState("Todas");

  const [newProduct, setNewProduct] = useState({
    title: "", price: "", size: "M", image: "", condition: "Ropa usada", 
    category: "remeras", gender: "Femenino", ageGroup: "Adulto"
  });

  const handleUpload = (e) => {
    e.preventDefault();
    const productToAdd = {
      id: Date.now(),
      user: { name: "MiUsuario", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Me", following: false },
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
    const matchesAge = selectedAge === "Todo" || p.ageGroup === selectedAge;
    const matchesCond = selectedCondition === "Todas" || p.condition === selectedCondition;
    return matchesSearch && matchesCat && matchesGender && matchesAge && matchesCond;
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans text-gray-900 pb-20">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex flex-col cursor-pointer" onClick={() => {setSelectedCategory(null); setSelectedGender("Todo"); setSelectedAge("Todo");}}>
            <span className="text-3xl font-serif tracking-[0.2em] font-light">+ROMA</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">Showroom & Outlet</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input 
              type="text" 
              placeholder="¿Qué estás buscando?" 
              className="w-full bg-gray-100 rounded-full py-2.5 px-12 text-sm focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37] transition-all flex items-center gap-2 shadow-lg"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Vender</span>
            </button>
            <User className="text-gray-600 cursor-pointer" />
          </div>
        </div>
      </header>

      <div className="bg-white border-b sticky top-20 z-30">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-full">
            {GENDERS.map(g => (
              <button key={g} onClick={() => setSelectedGender(g)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${selectedGender === g ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}>
                {g}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full">
            {["Todo", ...AGE_GROUPS].map(age => (
              <button key={age} onClick={() => setSelectedAge(age)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap border transition-all ${selectedAge === age ? 'bg-[#d4af37] border-[#d4af37] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}>
                {age}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-10 overflow-hidden">
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
          {CATEGORIES.map(cat => (
            <div key={cat.id} onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)} className={`group flex-shrink-0 cursor-pointer flex flex-col items-center transition-all ${selectedCategory === cat.id ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}>
              <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 transition-all ${selectedCategory === cat.id ? 'border-[#d4af37] ring-4 ring-[#d4af37]/10' : 'border-transparent'}`}>
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110" />
              </div>
              <span className={`mt-3 text-[9px] font-black uppercase tracking-widest ${selectedCategory === cat.id ? 'text-[#d4af37]' : 'text-gray-500'}`}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-8 border-y border-gray-100 mb-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {BRANDS.map((brand, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="w-8 h-8 bg-white rounded-lg p-1 shadow-sm border border-gray-100 flex items-center justify-center group-hover:border-[#d4af37]">
                  <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 mb-10 flex flex-wrap justify-center gap-3">
        {["Todas", ...CONDITIONS].map(cond => (
          <button key={cond} onClick={() => setSelectedCondition(cond)} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition-all ${selectedCondition === cond ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}>
            {cond}
          </button>
        ))}
      </div>

      <main className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 group hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={product.user.avatar} className="w-7 h-7 rounded-full" alt="" />
                  <span className="text-[9px] font-bold text-gray-800">{product.user.name}</span>
                </div>
                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${product.condition.includes("nueva") ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {product.condition.split(' ').slice(-1)}
                </span>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1 truncate">{product.title}</h3>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-black tracking-tighter">${product.price.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-gray-300">TALLE {product.size}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Subir Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-6">+Roma Vender</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <input type="text" placeholder="Título" className="w-full border-b py-2 text-sm focus:outline-none" onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} required />
              <input type="number" placeholder="Precio" className="w-full border-b py-2 text-sm focus:outline-none" onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
              <button type="submit" className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-[#d4af37]">Publicar</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

