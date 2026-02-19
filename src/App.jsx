import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, ShoppingBag, User, Heart, PlusCircle, X, Camera, ChevronRight, 
  Trash2, ArrowRight, Tag, Check, Edit3, Lock, CheckCircle, Clock, 
  AlertCircle, LogOut, Settings, Image as ImageIcon, Users, ThumbsUp, 
  UserPlus, UserCheck, ChevronLeft, ChevronRight as ChevronRightIcon, 
  Info, Download, MessageCircle, Send, DollarSign, Crop, Move, 
  Maximize2, Minimize2, Ban, MessageSquare, Bell, Phone, FileText, 
  CreditCard, Wallet, ZoomIn, Share, HelpCircle, Laptop, Smartphone,
  Layers, Filter
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, 
  query, where, orderBy, onSnapshot, Timestamp, setDoc, increment, 
  arrayUnion, arrayRemove, getDoc 
} from 'firebase/firestore';
import Cropper from 'react-easy-crop';

// --- Configuración de Firebase ---
// Se utiliza la configuración proporcionada por el entorno para evitar errores de clave de API
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mas-roma-official-v2';

// --- Configuración y Constantes ---
const COMISION = 0.19; 
const ADMIN_EMAILS = ["admin1@example.com", "admin2@example.com", "romina@roma.com"]; 
const TRANSFER_DATA = {
  alias: "show.masroma",
  cbu: "4530000800015997551907",
  titular: "Romina Mariela Arena",
  banco: "Naranja X",
  descuento: 0.05
};

const CATEGORIES = [
  { id: 'remeras', name: 'Remeras', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200' },
  { id: 'camisas', name: 'Camisas', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200' },
  { id: 'buzos', name: 'Buzos', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=200' },
  { id: 'vestidos', name: 'Vestidos', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=200' },
  { id: 'jeans', name: 'Jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=200' },
  { id: 'pantalones', name: 'Pantalones', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=200' },
  { id: 'camperas', name: 'Camperas', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200' },
  { id: 'calzado', name: 'Calzado', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200' },
  { id: 'short', name: 'Short', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=200' },
  { id: 'gorras', name: 'Gorras', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=200' },
  { id: 'accesorios', name: 'Accesorios', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=200' },
  { id: 'ropa-interior', name: 'Ropa interior', image: 'corpino.png' },
  { id: 'maquillajes', name: 'Maquillajes', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=200' },
  { id: 'tecnologia', name: 'Tecnología', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=200' },
  { id: 'electrodomesticos', name: 'Electrodomésticos', image: 'elecro.png' },
];

const CONDITIONS = ["Ropa nueva con etiqueta", "Ropa nueva sin etiqueta", "Ropa como nueva", "Ropa usada"];
const AGE_GROUPS = ["Baby", "Kids", "Joven", "Adulto", "Mayor"];
const GENDERS = ["Masculino", "Femenino", "Unisex"];
const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "Único"];
const SHOE_SIZES = Array.from({ length: 31 }, (_, i) => (i + 20).toString());

export default function App() {
  // --- Rutas Críticas (Rule 1) ---
  const getPath = (coll) => `/artifacts/${appId}/public/data/${coll}`;
  const getUserPath = (uid, coll) => `/artifacts/${appId}/users/${uid}/${coll}`;

  // --- Estados principales ---
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState({});
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [followersMap, setFollowersMap] = useState({});
  const [followingMap, setFollowingMap] = useState({});
  
  // --- Estados de UI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReceiptZoomOpen, setIsReceiptZoomOpen] = useState(false);
  const [showIphoneTutorial, setShowIphoneTutorial] = useState(false);
  const [showPublishTutorial, setShowPublishTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  // --- Estados de selección y admin ---
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [selectedTab, setSelectedTab] = useState('publicaciones');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [zoomedReceipt, setZoomedReceipt] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [saleClicks, setSaleClicks] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [saleConfig, setSaleConfig] = useState({
    title: "¡GRAN LIQUIDACIÓN DE TEMPORADA!",
    promo: "50% OFF",
    vigencia: "Válido hasta agotar stock",
    active: true
  });

  // --- Estados para los filtros ---
  const [showOutletFilters, setShowOutletFilters] = useState(false);
  const [showShowroomFilters, setShowShowroomFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGender, setSelectedGender] = useState("Todo");
  const [selectedAge, setSelectedAge] = useState("Todo");
  const [selectedConditionGroup, setSelectedConditionGroup] = useState("Todas");

  // --- Estados para recorte de imagen ---
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropType, setCropType] = useState(null);

  // --- Nuevo Producto State ---
  const [newProduct, setNewProduct] = useState({
    title: "", description: "", price: "", size: "M", shoeSize: "",
    images: [], condition: "Ropa usada", category: "remeras",
    gender: "Femenino", ageGroup: "Adulto", cuotas: "", whatsappNumber: "",
    shoulderToShoulder: "", armpitToArmpit: "", length: "",
    waist: "", hip: "", inseam: "", outseam: ""
  });

  const [profileData, setProfileData] = useState({
    name: "", bio: "", avatar: "", coverImage: "", whatsappNumber: ""
  });

  // --- Firebase Auth (Rule 3) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Error de autenticación:", err); }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const uRef = doc(db, getPath('users'), fbUser.uid);
        const uSnap = await getDoc(uRef);
        
        if (uSnap.exists()) {
          const data = uSnap.data();
          setUser(data);
          setProfileData({
            name: data.name, bio: data.bio || "",
            avatar: data.avatar || fbUser.photoURL,
            coverImage: data.coverImage || "",
            whatsappNumber: data.whatsappNumber || ""
          });
        } else {
          const newUser = {
            uid: fbUser.uid,
            name: fbUser.displayName || "Invitado Roma",
            email: fbUser.email || "anon@roma.com",
            avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
            isAdmin: ADMIN_EMAILS.includes(fbUser.email),
            totalEarned: 0, createdAt: Timestamp.now()
          };
          await setDoc(uRef, newUser);
          setUser(newUser);
          setProfileData({ name: newUser.name, bio: "", avatar: newUser.avatar, coverImage: "", whatsappNumber: "" });
          setShowPublishTutorial(true); 
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Listeners de Firestore (Rule 2) ---
  useEffect(() => {
    if (!user) return;

    // Productos
    const unsubProducts = onSnapshot(collection(db, getPath('products')), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Usuarios
    const unsubUsers = onSnapshot(collection(db, getPath('users')), (snap) => {
      const map = {}; snap.docs.forEach(d => map[d.id] = d.data());
      setUsers(map);
    });

    // Chats
    const unsubChats = onSnapshot(query(collection(db, getPath('chats')), where("participants", "array-contains", user.uid)), (snap) => {
      setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.lastMessageAt?.seconds - a.lastMessageAt?.seconds));
    });

    // Notificaciones
    const unsubNotifs = onSnapshot(query(collection(db, getPath('notifications')), where("userId", "==", user.uid)), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(list.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds));
      setUnreadNotifications(list.filter(n => !n.read).length);
    });

    // Seguidores / Siguiendo
    const unsubFollowers = onSnapshot(collection(db, getPath('followers')), (snap) => {
      const map = {}; snap.docs.forEach(d => {
        const data = d.data();
        if(!map[data.userId]) map[data.userId] = [];
        map[data.userId].push(data.followerId);
      });
      setFollowersMap(map);
    });

    const unsubFollowing = onSnapshot(collection(db, getPath('following')), (snap) => {
      const map = {}; snap.docs.forEach(d => {
        const data = d.data();
        if(!map[data.userId]) map[data.userId] = [];
        map[data.userId].push(data.followingId);
      });
      setFollowingMap(map);
    });

    // Preguntas
    const unsubQuestions = onSnapshot(collection(db, getPath('questions')), (snap) => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Transacciones (Solo Admin)
    if (user.isAdmin) {
      const unsubTrans = onSnapshot(collection(db, getPath('transactions')), (snap) => {
        setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds));
      });
      return () => { unsubProducts(); unsubUsers(); unsubChats(); unsubNotifs(); unsubTrans(); unsubFollowers(); unsubFollowing(); unsubQuestions(); };
    }

    return () => { unsubProducts(); unsubUsers(); unsubChats(); unsubNotifs(); unsubFollowers(); unsubFollowing(); unsubQuestions(); };
  }, [user]);

  // --- Funciones de Negocio ---

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (newProduct.images.length === 0) return alert("Sube al menos una imagen");

    try {
      const precio = parseInt(newProduct.price);
      const productData = {
        ...newProduct,
        userId: user.uid,
        user: { name: user.name, avatar: user.avatar },
        price: precio,
        montoNeto: precio * (1 - COMISION),
        comisionMonto: precio * COMISION,
        likes: 0, likedBy: [], sold: false,
        status: { iniciada: true, verificada: false, aprobada: false, publicada: false },
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, getPath('products')), productData);
      
      const adminId = Object.keys(users).find(k => users[k].isAdmin) || user.uid;
      await addDoc(collection(db, getPath('chats')), {
        productId: docRef.id,
        productTitle: productData.title,
        productImage: productData.images[0],
        participants: [user.uid, adminId],
        lastMessage: "Publicación enviada para revisión.",
        lastMessageAt: Timestamp.now(),
        unreadCount: { [adminId]: 1, [user.uid]: 0 }
      });

      setIsModalOpen(false);
      setNewProduct({
        title: "", description: "", price: "", size: "M", shoeSize: "",
        images: [], condition: "Ropa usada", category: "remeras",
        gender: "Femenino", ageGroup: "Adulto", cuotas: "", whatsappNumber: "",
        shoulderToShoulder: "", armpitToArmpit: "", length: "", waist: "", hip: "", inseam: "", outseam: ""
      });
      alert("¡Enviado! El administrador revisará tu prenda pronto.");
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleMarkAsSold = async (product, buyerId, method, receipt = null) => {
    const pRef = doc(db, getPath('products'), product.id);
    await updateDoc(pRef, { sold: true, buyerId, soldAt: Timestamp.now(), paymentMethod: method });
    
    if (receipt) {
      await addDoc(collection(db, getPath('transactions')), {
        productId: product.id, productTitle: product.title,
        buyerId, buyerName: user.name, amount: product.price * (paymentMethod === 'transferencia' ? 0.95 : 1),
        receipt, method, createdAt: Timestamp.now()
      });
    }

    const adminId = Object.keys(users).find(k => users[k].isAdmin);
    if (adminId) await startChat(adminId, product, "Coordinación de entrega de compra.");
  };

  const startChat = async (targetUserId, product, initialMsg = "¡Hola! Me gustaría coordinar sobre esta prenda.") => {
    if (!user) return;
    const existing = chats.find(c => c.participants.includes(targetUserId) && c.productId === product.id);
    if (existing) {
      setSelectedChat(existing);
      setIsChatOpen(true);
      return;
    }

    const newChat = {
      productId: product.id, productTitle: product.title, productImage: product.images[0],
      participants: [user.uid, targetUserId], lastMessage: initialMsg,
      lastMessageAt: Timestamp.now(), unreadCount: { [targetUserId]: 1, [user.uid]: 0 }
    };
    const docRef = await addDoc(collection(db, getPath('chats')), newChat);
    setSelectedChat({ id: docRef.id, ...newChat });
    setIsChatOpen(true);
  };

  const handlePayment = async () => {
    if (paymentMethod === 'mercadopago') {
      const total = cart.reduce((s, i) => s + i.price, 0);
      window.open(`https://link.mercadopago.com.ar/masroma?amount=${total}`, "_blank");
      for (let item of cart) { await handleMarkAsSold(item, user.uid, 'MercadoPago'); }
      setCart([]); setIsCartOpen(false);
      alert("¡Redirigiendo! Coordina la entrega por el chat privado una vez abonado.");
    } else {
      setIsTransferModalOpen(true);
    }
  };

  const confirmTransfer = async () => {
    if (!receiptImage) return alert("Sube el comprobante.");
    for (let item of cart) { await handleMarkAsSold(item, user.uid, 'Transferencia', receiptImage); }
    setCart([]); setIsTransferModalOpen(false); setIsCartOpen(false);
    alert("¡Comprobante enviado! El staff te contactará pronto.");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const msg = {
      senderId: user.uid, senderName: user.name, senderAvatar: user.avatar,
      text: newMessage, timestamp: Timestamp.now(), read: false
    };
    await addDoc(collection(db, `${getPath('chats')}/${selectedChat.id}/messages`), msg);
    await updateDoc(doc(db, getPath('chats'), selectedChat.id), {
      lastMessage: newMessage, lastMessageAt: Timestamp.now()
    });
    setNewMessage("");
  };

  const handleProductImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(f => {
      const r = new FileReader();
      r.onload = () => setNewProduct(prev => ({...prev, images: [...prev.images, r.result].slice(0, 5)}));
      r.readAsDataURL(f);
    });
  };

  const removeImage = (index) => {
    setNewProduct(prev => ({...prev, images: prev.images.filter((_, i) => i !== index)}));
  };

  const handleAnswerQuestion = async (qId, answer) => {
    await updateDoc(doc(db, getPath('questions'), qId), { answer, answeredAt: Timestamp.now() });
  };

  // --- Filtros UI ---
  const activeProducts = useMemo(() => products.filter(p => p.status?.publicada), [products]);
  
  const filteredProducts = useMemo(() => {
    return activeProducts.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = !selectedCategory || p.category === selectedCategory;
      const matchGender = selectedGender === "Todo" || p.gender === selectedGender;
      const matchAge = selectedAge === "Todo" || p.ageGroup === selectedAge;
      
      let matchCondition = true;
      if (selectedConditionGroup === "Ropa nueva con etiqueta" || selectedConditionGroup === "Ropa nueva sin etiqueta") {
        matchCondition = p.condition === selectedConditionGroup;
      } else if (selectedConditionGroup === "Ropa como nueva" || selectedConditionGroup === "Ropa usada") {
        matchCondition = p.condition === selectedConditionGroup;
      }
      
      return matchSearch && matchCat && matchGender && matchAge && matchCondition;
    });
  }, [activeProducts, searchTerm, selectedCategory, selectedGender, selectedAge, selectedConditionGroup]);

  // --- Tutoriales ---
  const PublishTutorial = () => (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl relative">
        <div className="flex justify-center mb-6 text-yellow-600"><HelpCircle size={64}/></div>
        <h3 className="text-2xl font-serif font-bold mb-4">{tutorialStep === 0 ? "¡Vende en +Roma!" : tutorialStep === 1 ? "Usa el (+)" : "Moderación"}</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {tutorialStep === 0 ? "Ganar dinero con tu ropa de marca es muy simple. Sigue estos pasos." : 
           tutorialStep === 1 ? "Haz clic en el botón (+) de la barra inferior para completar los datos de tu prenda." : 
           "Una vez enviada, nuestro staff la revisará. Si hay cambios, te escribiremos por el chat interno."}
        </p>
        <button 
          onClick={() => tutorialStep < 2 ? setTutorialStep(tutorialStep + 1) : setShowPublishTutorial(false)}
          className="w-full bg-black text-white py-5 rounded-[2rem] font-bold uppercase tracking-widest shadow-lg"
        >
          {tutorialStep === 2 ? "¡Entendido!" : "Siguiente"}
        </button>
      </div>
    </div>
  );

  const IphoneTutorial = () => (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative">
        <button onClick={() => setShowIphoneTutorial(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full"><X size={20}/></button>
        <div className="text-center mb-8">
          <img src="/masroma.png" className="h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-serif font-bold italic">+Roma en tu iPhone</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Instalación rápida</p>
        </div>
        <div className="space-y-6 text-sm">
          <div className="flex gap-4 items-start"><div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div> <p className="text-slate-600">Abre esta web en el navegador <b>Safari</b>.</p></div>
          <div className="flex gap-4 items-start"><div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div> <p className="text-slate-600">Toca el botón <b>Compartir</b> <Share size={16} className="inline mx-1 text-blue-500"/> abajo en la barra.</p></div>
          <div className="flex gap-4 items-start"><div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div> <p className="text-slate-600">Selecciona la opción <b>"Añadir a pantalla de inicio"</b>.</p></div>
        </div>
        <button onClick={() => setShowIphoneTutorial(false)} className="w-full mt-10 bg-black text-white py-5 rounded-[2rem] font-bold uppercase text-xs tracking-widest shadow-lg">Finalizar</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 pb-24 selection:bg-yellow-100 font-sans">
      {showPublishTutorial && <PublishTutorial />}
      {showIphoneTutorial && <IphoneTutorial />}

      {/* Banner SALE Administrable */}
      {saleConfig.active && (
        <div className="bg-red-600 text-white py-2 text-center text-[10px] font-bold tracking-widest uppercase animate-pulse">
          {saleConfig.title} — {saleConfig.promo} — {saleConfig.vigencia}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => {
          const count = saleClicks + 1; setSaleClicks(count);
          if (count >= 7) { setShowPinModal(true); setSaleClicks(0); }
        }}>
          <img src="/masroma.png" alt="+Roma" className="h-8 md:h-12 group-hover:scale-105 transition-transform" />
          <h1 className="text-xl md:text-2xl font-serif tracking-widest uppercase">+Roma</h1>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="¿Qué buscas hoy?..." 
              className="w-full bg-slate-50 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-yellow-600 transition-all border border-transparent focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsModalOpen(true)} className="bg-black text-white p-2.5 rounded-full hover:bg-yellow-600 shadow-lg active:scale-95 transition-all"><PlusCircle size={20} /></button>
          <button onClick={() => setIsNotificationsOpen(true)} className="relative p-2 text-slate-600 hover:text-black transition-colors"><Bell size={20} />{unreadNotifications > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">{unreadNotifications}</span>}</button>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-slate-600 hover:text-black transition-colors"><ShoppingBag size={20} />{cart.length > 0 && <span className="absolute top-0 right-0 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">{cart.length}</span>}</button>
          {user && (
            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden cursor-pointer shadow-sm hover:scale-110 transition-transform" onClick={() => { setSelectedUserProfile(user.uid); setSelectedTab('publicaciones'); }}>
              <img src={user.avatar} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </header>

      {/* Atajos de Filtros Visuales (Outlet / Showroom) */}
      <div className="p-4 flex gap-4 overflow-x-auto no-scrollbar border-b bg-white relative z-40">
        {/* Filtro Outlet */}
        <div className="flex flex-col items-center gap-1">
          <div onClick={() => { setShowOutletFilters(!showOutletFilters); setShowShowroomFilters(false); setSelectedConditionGroup("Todas"); }} className={`w-16 h-16 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${showOutletFilters ? "border-yellow-600 shadow-lg" : "border-slate-100 opacity-60"}`}>
            <img src="outlet.png" className="w-full h-full object-cover" onError={(e) => e.target.src='https://via.placeholder.com/150'}/>
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">Outlet</span>
          {showOutletFilters && (
            <div className="absolute top-[100%] left-4 bg-white shadow-2xl rounded-2xl p-2 border border-slate-50 flex flex-col gap-1 min-w-[160px] animate-slide-up">
              <button onClick={() => { setSelectedConditionGroup("Ropa nueva con etiqueta"); setShowOutletFilters(false); }} className="text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-yellow-50 rounded-xl transition-colors">Nueva con etiqueta</button>
              <button onClick={() => { setSelectedConditionGroup("Ropa nueva sin etiqueta"); setShowOutletFilters(false); }} className="text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-yellow-50 rounded-xl transition-colors">Nueva sin etiqueta</button>
            </div>
          )}
        </div>

        {/* Filtro Showroom */}
        <div className="flex flex-col items-center gap-1">
          <div onClick={() => { setShowShowroomFilters(!showShowroomFilters); setShowOutletFilters(false); setSelectedConditionGroup("Todas"); }} className={`w-16 h-16 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${showShowroomFilters ? "border-yellow-600 shadow-lg" : "border-slate-100 opacity-60"}`}>
            <img src="showroom.png" className="w-full h-full object-cover" onError={(e) => e.target.src='https://via.placeholder.com/150'}/>
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">Showroom</span>
          {showShowroomFilters && (
            <div className="absolute top-[100%] left-24 bg-white shadow-2xl rounded-2xl p-2 border border-slate-50 flex flex-col gap-1 min-w-[160px] animate-slide-up">
              <button onClick={() => { setSelectedConditionGroup("Ropa como nueva"); setShowShowroomFilters(false); }} className="text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-yellow-50 rounded-xl transition-colors">Usada como nueva</button>
              <button onClick={() => { setSelectedConditionGroup("Ropa usada"); setShowShowroomFilters(false); }} className="text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-yellow-50 rounded-xl transition-colors">Usada</button>
            </div>
          )}
        </div>

        <div className="w-[1px] bg-slate-100 mx-2 h-16 self-center"></div>

        {/* Categorías Scrolleables */}
        {CATEGORIES.map(cat => (
          <div key={cat.id} onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)} className={`flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer transition-all ${selectedCategory === cat.id ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-100'}`}>
            <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-sm ${selectedCategory === cat.id ? 'border-yellow-600' : 'border-transparent'}`}><img src={cat.image} className="w-full h-full object-cover" onError={(e) => e.target.src='https://via.placeholder.com/150'}/></div>
            <span className="text-[9px] font-bold uppercase tracking-tighter">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Filtros Secundarios */}
      <div className="p-4 flex flex-col gap-3 bg-white/50 border-b border-slate-100 shadow-sm">
        <div className="flex gap-2 justify-center">
          {["Todo", ...GENDERS].map(g => (
            <button key={g} onClick={() => setSelectedGender(g)} className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all ${selectedGender === g ? 'bg-black text-white shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:text-black'}`}>{g}</button>
          ))}
          <button onClick={() => { setSelectedConditionGroup("Todas"); setSelectedCategory(null); setSelectedGender("Todo"); setSelectedAge("Todo"); }} className="px-3 text-[10px] font-black uppercase text-red-500 hover:scale-105 transition-all">Limpiar</button>
        </div>
        <div className="flex gap-2 justify-center overflow-x-auto no-scrollbar pb-1">
          {["Todo", ...AGE_GROUPS].map(a => (
            <button key={a} onClick={() => setSelectedAge(a)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all whitespace-nowrap ${selectedAge === a ? 'bg-yellow-600 text-white shadow-md border-yellow-600' : 'bg-white text-slate-400 border-slate-100 hover:text-yellow-600'}`}>{a}</button>
          ))}
        </div>
      </div>

      {/* Catálogo con etiquetas de vendido */}
      <main className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group cursor-pointer hover:shadow-2xl transition-all" onClick={() => setSelectedProduct(product)}>
            <div className="relative aspect-[3/4] bg-slate-50">
              <img src={product.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg uppercase tracking-tighter">Talle {product.size || product.shoeSize}</div>
              {product.sold && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="bg-red-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest -rotate-12 border-2 border-white shadow-2xl animate-pulse">Vendido</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-1 mb-2.5 opacity-60">
                <img src={product.user.avatar} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{product.user.name}</span>
              </div>
              <h3 className="text-xs md:text-sm font-serif font-bold line-clamp-1 h-8 leading-tight">{product.title}</h3>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-black text-slate-900">${product.price.toLocaleString()}</span>
                {!product.sold && (
                  <button className="p-2.5 bg-slate-50 rounded-full hover:bg-yellow-600 hover:text-white transition-all shadow-sm active:scale-90" onClick={(e) => { e.stopPropagation(); if(product.userId !== user?.uid) { setCart([...cart, product]); setIsCartOpen(true); } else { alert("Tu producto"); } }}>
                    <ShoppingBag size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Modal Detalle Producto */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh] shadow-2xl">
            <div className="md:w-1/2 relative bg-slate-100 flex items-center"><img src={selectedProduct.images[currentImageIndex]} className="w-full h-full object-cover" /></div>
            <div className="md:w-1/2 p-8 overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedUserProfile(selectedProduct.userId); setSelectedProduct(null); }}>
                  <img src={selectedProduct.user.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-slate-50" />
                  <div>
                    <span className="block font-bold text-sm leading-none">{selectedProduct.user.name}</span>
                    <span className="text-[9px] font-black text-yellow-600 uppercase">Ver Perfil</span>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)}><X /></button>
              </div>
              <h2 className="text-2xl font-serif font-bold mb-4">{selectedProduct.title}</h2>
              <div className="bg-slate-50 p-6 rounded-3xl mb-8">
                 <span className="text-3xl font-black text-slate-900">${selectedProduct.price.toLocaleString()}</span>
                 <p className="text-xs text-slate-400 mt-1">{selectedProduct.cuotas || "Pago al contado"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div className="bg-white border p-4 rounded-2xl"><span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Talle</span><p className="font-bold">{selectedProduct.size || selectedProduct.shoeSize}</p></div>
                <div className="bg-white border p-4 rounded-2xl"><span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Estado</span><p className="font-bold">{selectedProduct.condition}</p></div>
              </div>
              {!selectedProduct.sold && user?.uid !== selectedProduct.userId && (
                <button onClick={() => { setCart([...cart, selectedProduct]); setSelectedProduct(null); setIsCartOpen(true); }} className="w-full bg-black text-white py-5 rounded-[2rem] font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all">Añadir al carrito</button>
              )}
              {selectedProduct.sold && <div className="bg-red-50 text-red-600 p-5 rounded-[2rem] text-center font-bold uppercase tracking-widest border border-red-100 shadow-inner">Prenda Vendida</div>}
              <button onClick={() => handleAskQuestion(selectedProduct.id)} className="w-full mt-4 text-[10px] font-black uppercase text-slate-400 hover:text-black">Preguntar al vendedor</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-8 animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <div><h2 className="text-2xl font-serif font-bold italic">Tu Carrito</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{cart.length} prendas curadas</p></div>
              <button onClick={() => setIsCartOpen(false)} className="p-3 bg-slate-50 rounded-full transition-all hover:bg-slate-100"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 p-2 bg-slate-50 rounded-2xl group relative">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0"><img src={item.images[0]} className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                    <span className="font-black text-lg block mt-1">${item.price.toLocaleString()}</span>
                  </div>
                  <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-red-500 mr-2"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="border-t pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={() => setPaymentMethod('mercadopago')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-slate-100 opacity-60'}`}><CreditCard size={20}/><span className="text-[10px] font-bold uppercase">MercadoPago</span></button>
                  <button onClick={() => setPaymentMethod('transferencia')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'transferencia' ? 'border-emerald-500 bg-emerald-50 shadow-inner' : 'border-slate-100 opacity-60'}`}><Wallet size={20}/><span className="text-[10px] font-bold uppercase">Transferencia</span></button>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-2 shadow-inner">
                   <div className="flex justify-between text-sm font-bold text-slate-500"><span>Subtotal</span><span>${cartTotal.toLocaleString()}</span></div>
                   {paymentMethod === 'transferencia' && <div className="flex justify-between text-emerald-600 text-sm font-black pt-1 border-t border-white"><span>5% Off Transfer</span><span>-${(cartTotal*0.05).toLocaleString()}</span></div>}
                   <div className="flex justify-between text-3xl font-black pt-2 border-t-2 border-white text-slate-900"><span>Total</span><span>${(paymentMethod === 'transferencia' ? transferTotal : cartTotal).toLocaleString()}</span></div>
                </div>
                <button onClick={handlePayment} className="w-full bg-black text-white py-5 rounded-[2.5rem] font-bold uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Finalizar Compra</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Perfil del Usuario / Panel Administrativo */}
      {(showAdminModal || selectedUserProfile) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => { setShowAdminModal(false); setSelectedUserProfile(null); }}></div>
          <div className="relative bg-white w-full max-w-5xl rounded-[3rem] p-8 md:p-12 max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl animate-slide-up">
            
            {/* Header Perfil */}
            {!showAdminModal && (
              <div className="w-full mb-10">
                <div className="h-48 rounded-[3rem] bg-slate-100 overflow-hidden mb-6 relative group shadow-inner">
                  <img src={users[selectedUserProfile]?.coverImage || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1200"} className="w-full h-full object-cover"/>
                  <button onClick={() => { setShowAdminModal(false); setSelectedUserProfile(null); }} className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"><X size={24}/></button>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-end -mt-24 px-8 relative z-10">
                  <img src={users[selectedUserProfile]?.avatar} className="w-36 h-36 rounded-[3.5rem] border-8 border-white object-cover shadow-xl" />
                  <div className="flex-1 text-center md:text-left pb-2">
                    <h2 className="text-4xl font-serif font-bold italic leading-none">{users[selectedUserProfile]?.name}</h2>
                    <p className="text-slate-500 text-sm mt-3 max-w-lg leading-relaxed">{users[selectedUserProfile]?.bio || "Bienvenido a mi vestidor en +Roma."}</p>
                    {user?.uid !== selectedUserProfile && (
                      <button onClick={() => handleFollow(selectedUserProfile)} className="mt-4 bg-[#d4af37] text-white px-8 py-2.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-black transition-all">Seguir Usuario</button>
                    )}
                  </div>
                  <div className="flex gap-8 border-l border-slate-100 pl-8 h-12 items-center">
                    <div className="text-center"><p className="font-black text-xl leading-none">{followersMap[selectedUserProfile]?.length || 0}</p><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seguidores</span></div>
                    <div className="text-center"><p className="font-black text-xl leading-none text-emerald-600">${netEarnings.toLocaleString()}</p><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neto (81%)</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Header Admin */}
            {showAdminModal && (
              <div className="flex justify-between items-center mb-10">
                <div><h2 className="text-3xl font-serif font-bold italic leading-none">Panel Admin Staff</h2><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Control total de +Roma</p></div>
                <button onClick={() => setShowAdminModal(false)} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-all"><X size={24}/></button>
              </div>
            )}

            {/* Pestañas */}
            <div className="flex gap-8 border-b border-slate-100 mb-8 overflow-x-auto no-scrollbar">
              {showAdminModal ? 
                ['pendientes', 'publicadas', 'compradores', 'banner'].map(tab => (
                  <button key={tab} onClick={() => setSelectedTab(tab)} className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all ${selectedTab === tab ? 'text-black border-b-2 border-black' : 'text-slate-300 hover:text-slate-500'}`}>{tab}</button>
                )) : 
                ['publicaciones', 'pendientes', 'vendidos', 'chats', 'preguntas'].map(tab => (
                  <button key={tab} onClick={() => setSelectedTab(tab)} className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all ${selectedTab === tab ? 'text-black border-b-2 border-black' : 'text-slate-300 hover:text-slate-500'}`}>{tab}</button>
                ))
              }
            </div>

            {/* Contenido Pestañas */}
            <div className="min-h-[400px]">
              {selectedTab === 'pendientes' && showAdminModal && (
                <div className="space-y-6 animate-slide-up">
                  {pendingProducts.map(p => (
                    <div key={p.id} className="flex flex-col md:flex-row gap-8 p-8 bg-slate-50 rounded-[3rem] shadow-sm border border-white group">
                      <img src={p.images[0]} className="w-32 h-32 rounded-[2rem] object-cover shadow-md group-hover:scale-105 transition-transform" />
                      <div className="flex-1">
                        <h4 className="font-bold text-2xl uppercase tracking-tight">{p.title}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          <img src={p.user.avatar} className="w-8 h-8 rounded-full object-cover" />
                          <span className="text-xs font-black uppercase text-slate-400 tracking-widest">${p.price.toLocaleString()} — {p.user.name}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-4 italic">"{p.description}"</p>
                      </div>
                      <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                        <button onClick={() => updateDoc(doc(db, getPath('products'), p.id), { 'status.publicada': true })} className="bg-black text-white px-8 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-yellow-600 transition-all shadow-lg">Aprobar Prenda</button>
                        <button onClick={() => startChat(p.userId, p)} className="border-2 border-black py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all">Chatear Vendedor</button>
                        <button onClick={() => deleteDoc(doc(db, getPath('products'), p.id))} className="text-red-500 text-[9px] font-black uppercase mt-2 opacity-50 hover:opacity-100 transition-all">Eliminar</button>
                      </div>
                    </div>
                  ))}
                  {pendingProducts.length === 0 && <div className="text-center py-20 opacity-20"><Clock size={80} className="mx-auto mb-4" /><p className="font-serif italic text-2xl">Bandeja de entrada limpia.</p></div>}
                </div>
              )}

              {selectedTab === 'compradores' && showAdminModal && (
                <div className="space-y-4 animate-slide-up">
                  {transactions.map(t => (
                    <div key={t.id} className="p-8 bg-slate-50 rounded-[3rem] border border-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600 border border-slate-100"><FileText size={32} /></div>
                        <div>
                          <h4 className="font-black text-lg uppercase leading-tight">{t.buyerName}</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{t.productTitle} — <span className="text-emerald-600">${t.amount.toLocaleString()}</span></p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{t.createdAt?.toDate().toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {t.receipt && (
                          <button onClick={() => { setZoomedReceipt(t.receipt); setIsReceiptZoomOpen(true); }} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl"><ZoomIn size={16}/> Comprobante</button>
                        )}
                        <button onClick={() => startChat(t.buyerId, {id: t.productId, title: t.productTitle, images: ['/masroma.png']})} className="bg-black text-white px-6 py-3 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Coordinar</button>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <div className="text-center py-20 opacity-20"><Layers size={80} className="mx-auto mb-4" /><p className="font-serif italic text-2xl">Aún no hay transacciones.</p></div>}
                </div>
              )}

              {selectedTab === 'publicaciones' && !showAdminModal && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up">
                  {products.filter(p => p.userId === selectedUserProfile && !p.sold && p.status?.publicada).map(p => (
                    <div key={p.id} className="bg-slate-50 rounded-[2rem] overflow-hidden shadow-sm relative group cursor-pointer border border-white" onClick={() => setSelectedProduct(p)}>
                      <img src={p.images[0]} className="w-full aspect-square object-cover transition-transform group-hover:scale-110" />
                      <div className="p-5">
                        <h4 className="font-black text-[10px] uppercase line-clamp-1 text-slate-800 tracking-tighter">{p.title}</h4>
                        <p className="text-xs font-black mt-1 text-slate-900">${p.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTab === 'pendientes' && !showAdminModal && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up">
                  {products.filter(p => p.userId === selectedUserProfile && !p.status?.publicada).map(p => (
                    <div key={p.id} className="bg-slate-50 rounded-[2rem] overflow-hidden shadow-sm relative group cursor-pointer border border-white opacity-70" onClick={() => setSelectedProduct(p)}>
                      <img src={p.images[0]} className="w-full aspect-square object-cover" />
                      <div className="p-5">
                        <h4 className="font-black text-[10px] uppercase line-clamp-1">{p.title}</h4>
                        <span className="bg-yellow-500 text-white text-[8px] font-black px-2 py-1 rounded-full mt-2 inline-block">EN REVISIÓN</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTab === 'chats' && !showAdminModal && (
                <div className="space-y-4 animate-slide-up">
                   {chats.map(chat => (
                     <div key={chat.id} onClick={() => { setSelectedChat(chat); setIsChatOpen(true); }} className="p-8 bg-slate-50 rounded-[2.5rem] flex items-center gap-8 cursor-pointer border border-white hover:bg-yellow-50 transition-all group shadow-sm">
                       <img src={chat.productImage} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-md group-hover:scale-110 transition-transform" />
                       <div className="flex-1">
                         <h4 className="font-black text-xs uppercase tracking-widest text-slate-800">{chat.productTitle}</h4>
                         <p className="text-sm text-slate-400 line-clamp-1 mt-2 font-medium italic">"{chat.lastMessage}"</p>
                       </div>
                       <ChevronRight className="text-slate-200 group-hover:text-yellow-600 transition-colors" />
                     </div>
                   ))}
                   {chats.length === 0 && <div className="text-center py-20 opacity-20 font-serif italic text-2xl">No hay chats activos.</div>}
                </div>
              )}

              {selectedTab === 'preguntas' && !showAdminModal && (
                <div className="space-y-4 animate-slide-up">
                   {questions.filter(q => {
                     const p = products.find(prod => prod.id === q.productId);
                     return p?.userId === selectedUserProfile;
                   }).map(q => (
                     <div key={q.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-white shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <img src={q.userAvatar} className="w-8 h-8 rounded-full object-cover" />
                          <p className="text-[10px] font-black uppercase text-slate-400">Pregunta de {q.userName}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-800">"¿{q.question}?"</p>
                        {q.answer ? (
                          <div className="mt-4 p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-800 font-medium leading-relaxed border border-emerald-100">
                             <b>Respuesta:</b> {q.answer}
                          </div>
                        ) : (
                          user?.uid === selectedUserProfile && (
                            <button onClick={() => { const res = prompt("Escribe tu respuesta:"); if(res) handleAnswerQuestion(q.id, res); }} className="mt-4 bg-black text-white px-6 py-2 rounded-xl font-bold uppercase text-[10px] tracking-widest active:scale-95">Responder ahora</button>
                          )
                        )}
                     </div>
                   ))}
                </div>
              )}

              {selectedTab === 'banner' && showAdminModal && (
                <div className="p-10 bg-slate-50 rounded-[3.5rem] border border-white animate-slide-up">
                   <h4 className="text-xl font-serif font-bold italic mb-8">Gestión de Banner Promocional</h4>
                   <div className="space-y-6">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Título Banner</label><input className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 outline-none focus:border-red-500 font-bold" value={saleConfig.title} onChange={(e) => setSaleConfig({...saleConfig, title: e.target.value})} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Vigencia</label><input className="w-full bg-white border-2 border-slate-100 rounded-2xl p-5 outline-none" value={saleConfig.vigencia} onChange={(e) => setSaleConfig({...saleConfig, vigencia: e.target.value})} /></div>
                      <div className="flex items-center gap-4 py-4 px-4 bg-white rounded-2xl border border-slate-100"><input type="checkbox" checked={saleConfig.active} onChange={(e) => setSaleConfig({...saleConfig, active: e.target.checked})} className="w-6 h-6 accent-red-600"/><p className="font-black uppercase text-xs">Banner Visible para Usuarios</p></div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Flotante Privado */}
      {selectedChat && (
        <div className="fixed bottom-24 right-4 md:right-8 z-[250] w-[92vw] md:w-96 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col h-[550px] overflow-hidden animate-slide-up">
          <div className="bg-black text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-white/20"><img src={selectedChat.productImage} className="w-full h-full object-cover" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] line-clamp-1">{selectedChat.productTitle}</p>
                <p className="text-[9px] text-yellow-500 font-black uppercase mt-0.5 tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Roma Chat</p>
              </div>
            </div>
            <button onClick={() => setSelectedChat(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50 shadow-inner">
             <div className="text-center py-2"><span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-full shadow-sm">Chat Seguro +Roma</span></div>
             <div className="flex flex-col items-start gap-1">
               <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm text-xs max-w-[85%] leading-relaxed border border-slate-100">
                  ¡Hola! Me contacto del Staff de <b>+Roma</b>. ¿En qué podemos ayudarte respecto a esta prenda?
               </div>
               <span className="text-[8px] font-black text-slate-300 ml-2 uppercase tracking-widest mt-1">Soporte Roma</span>
             </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-50 flex gap-3 shadow-2xl relative z-10">
            <input 
              type="text" 
              placeholder="Responder..." 
              className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 text-xs outline-none focus:ring-1 focus:ring-yellow-600 shadow-inner"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="bg-black text-white p-4 rounded-2xl hover:bg-yellow-600 shadow-lg active:scale-90 transition-all"><Send size={20}/></button>
          </div>
        </div>
      )}

      {/* Modal Zoom Comprobante Admin */}
      {isReceiptZoomOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/95 backdrop-blur-lg">
          <div className="absolute inset-0" onClick={() => setIsReceiptZoomOpen(false)}></div>
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center animate-slide-up">
            <div className="bg-white p-2 rounded-[3.5rem] shadow-[0_0_80px_rgba(255,255,255,0.15)] mb-10 overflow-hidden">
              <img src={zoomedReceipt} className="max-w-full max-h-[72vh] object-contain rounded-[2.5rem]" />
            </div>
            <div className="flex gap-6">
              <button onClick={() => { const a = document.createElement('a'); a.href = zoomedReceipt; a.download = "roma_comprobante.png"; a.click(); }} className="bg-white text-black px-12 py-5 rounded-full font-black uppercase text-[11px] tracking-widest flex items-center gap-3 shadow-2xl hover:bg-slate-50 transition-all"><Download size={24}/> Descargar Pago</button>
              <button onClick={() => setIsReceiptZoomOpen(false)} className="bg-red-600 text-white px-12 py-5 rounded-full font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-red-700 transition-all">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos adicionales */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-in-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-in-right { animation: slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
