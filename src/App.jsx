import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, KanbanSquare, Package, BookOpen, AlertTriangle, CheckCircle, 
  TrendingUp, FileText, PenTool, Printer, Truck, Store, Users, Search, X, 
  Image as ImageIcon, Upload, Receipt, Plus, DollarSign, Paperclip, Mail, 
  Megaphone, Settings, RefreshCw, Share2, Download, Edit, Phone, Menu, Trash2, 
  Settings2, UserPlus, Send, UserCog, Info, StickyNote, History, Clock,
  ShoppingCart, MapPin, CheckSquare, MessageCircle, Gift, ArrowLeftRight,
  Percent, ArrowRight
} from 'lucide-react';

// ==========================================
// 1. הגדרות מסד נתונים - Firebase
// ==========================================
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBACO6rv7KvdmWyPBPp1RzaeVUyQorQpVI",
  authDomain: "yhydeshboard.firebaseapp.com",
  projectId: "yhydeshboard",
  storageBucket: "yhydeshboard.firebasestorage.app",
  messagingSenderId: "498271801335",
  appId: "1:498271801335:web:1609f07e024ac66709e8f2",
  measurementId: "G-GHK9P9E47J"
};

const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
let db = app ? getFirestore(app) : null;
const appId = 'publisher_erp_v1'; 
const getCollRef = (collName) => collection(db, 'erp', appId, collName);
const getDocRef = (collName, docId) => doc(db, 'erp', appId, collName, docId);

// ==========================================
// 2. הגדרות שליחת מיילים - EmailJS
// ==========================================
const EMAILJS_SERVICE_ID = "service_65ojtol";
const EMAILJS_TEMPLATE_ID = "template_ye1ep37";
const EMAILJS_PUBLIC_KEY = "7Xb1V_hTF9rs61RxX";

// ==========================================
// 3. נתוני הדגמה התחלתיים
// ==========================================
const initialStatsData = {
  monthly: { inProduction: '12', completed: '145', sold: '3,240', revenue: '142,500', trend: '+18.5%', alerts: '3' },
  yearly: { inProduction: '12', completed: '34', sold: '38,500', revenue: '1,750,000', trend: '+42.3%', alerts: '3' }
};

const kanbanColumns = [
  { id: 'in_progress', title: 'ספרים בעבודה', icon: PenTool, color: 'border-blue-200 bg-blue-50' },
  { id: 'published', title: 'ספרים שיצאו', icon: BookOpen, color: 'border-emerald-200 bg-emerald-50' }
];

const initialTasksFlat = [
  { status: 'in_progress', title: 'כלכלת המחר', author: 'פרופ׳ יצחק לוי', date: '10/11/2026', coverFile: 'cover_draft_v2.jpg', bookFile: 'כלכלת_המחר_סופי.pdf', dedicationFile: null, invoices: [{ id: 3, desc: 'עריכה לשונית', amount: 2200, receiptFile: null }, { id: 4, desc: 'עיצוב כריכה', amount: 1800, receiptFile: null }] },
];

const initialSuppliers = [
  { name: 'מחסן ראשי - ישיבת ירוחם', type: 'מחסן לוגיסטי', contact: 'מנהל הפצה', phone: '050-0000000', email: 'office@yhy.co.il', status: 'פעיל - יש הסכם' },
  { name: 'דברי שיר', type: 'רשת קמעונאית', contact: 'נציג רשת', phone: '052-0000000', email: 'info@dshir.co.il', status: 'פעיל - יש הסכם' }
];

const getStatusColor = (status) => {
  switch(status) {
    case 'פעיל - יש הסכם': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ללא הסכם מכירה': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ממתין לספרים': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'אין שיתוף פעולה': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const initialCampaigns = [];
const initialPrCopies = [];

const initialIntegrations = [
  { id: 'morning', name: 'Morning (חשבונית ירוקה)', type: 'הנהלת חשבונות ומסמכים', connected: true, lastSync: 'לפני 15 דקות', logo: 'M' },
  { id: 'shopify', name: 'WooCommerce (אתר ההוצאה)', type: 'פלטפורמת מסחר / חנות אונליין', connected: true, lastSync: 'לפני שעתיים', logo: 'W' }
];

// מחירון ומלאי מעודכן לפי קובץ האקסל
const initialInventory = [
  { id: '1', title: "אותך אבקש - שערים לימי התשובה", author: "הרב חיים וולפסון", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 59, supplier: 29, yeshiva: 59 }, productionCost: 10.03, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '2', title: "ונהר יוצא מעדן - חגי תשרי", author: "הרב אוריאל עיטם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 60, supplier: 30, yeshiva: 60 }, productionCost: 14.04, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '3', title: "ונהר יוצא מעדן - מועדי חורף", author: "הרב אוריאל עיטם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 60, supplier: 30, yeshiva: 60 }, productionCost: 14.04, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '4', title: "ונהר יוצא מעדן - חגי האביב", author: "הרב אוריאל עיטם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 60, supplier: 30, yeshiva: 60 }, productionCost: 14.04, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '5', title: "ונהר יוצא מעדן סט", author: "הרב אוריאל עיטם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 160, supplier: 90, yeshiva: 160 }, productionCost: 42.13, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '6', title: "ונהר יוצא מעדן - אכילה ומצוותיה", author: "הרב אוריאל עיטם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 69, supplier: 32, yeshiva: 69 }, productionCost: 16.52, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '7', title: "להשקות את הגן - סנהדרין", author: "הרב חיים וולפסון", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 69, supplier: 30, yeshiva: 69 }, productionCost: 17.84, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '8', title: "להשקות את הגן - סוכה", author: "הרב חיים וולפסון", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 59, supplier: 28, yeshiva: 59 }, productionCost: 12.50, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '9', title: "שערים למשנתו של מניטו", author: "הרב אוריאל עיטם / ישיבת ירוחם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 83, supplier: 42, yeshiva: 83 }, productionCost: 12.66, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '10', title: "והתהלכתי בתוככם א", author: "ישיבת ירוחם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 65, supplier: 35, yeshiva: 65 }, productionCost: 0, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '11', title: "והתהלכתי בתוככם ב", author: "ישיבת ירוחם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 65, supplier: 35, yeshiva: 65 }, productionCost: 0, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '12', title: "והתהלכתי בתוככם סט", author: "ישיבת ירוחם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 120, supplier: 68, yeshiva: 120 }, productionCost: 0, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '13', title: "חוברת שובו אליי - הרב בלומנצווייג", author: "הרב בלומנצווייג", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 29, supplier: 19, yeshiva: 29 }, productionCost: 0, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '14', title: "חוברת כעץ שתול - תפילה", author: "ישיבת ירוחם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 20, supplier: 16, yeshiva: 20 }, productionCost: 0, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '15', title: "חוברת כעץ שתול - עיון", author: "ישיבת ירוחם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 20, supplier: 16, yeshiva: 20 }, productionCost: 0, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '16', title: "חוברת כעץ שתול - אמונה", author: "ישיבת ירוחם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 20, supplier: 16, yeshiva: 20 }, productionCost: 0, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: '17', title: "שמיטה", author: "ישיבת ירוחם", isbn: "", threshold: 30, publisherStock: 0, prices: { general: 0, supplier: 23, yeshiva: 0 }, productionCost: 0, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() }
];

const initialValidUsers = [
  { username: 'admin', password: 'admin2026', role: 'admin', name: 'מנהל ראשי' },
  { username: 'view', password: 'view2026', role: 'viewer', name: 'צופה' }
];

const initialNotes = [
  { id: '1', text: 'לבדוק מלאי חסר בצומת ספרים.', color: 'bg-yellow-100', date: '03/11/2026' }
];

const initialOrders = [
  { 
    id: '1', orderId: '#12345', customerName: 'ישראל ישראלי', 
    address: 'רחוב הרצל 15, תל אביב', shippingMethod: 'שליח עד הבית', 
    total: '120.00', date: '03/11/2026', time: '14:30',
    items: [{ name: 'שערים למשנתו של מניטו', quantity: 1 }],
    status: 'pending'
  }
];

const yhyCatalog = [
  { title: "שערים למשנתו של הרב יהודא ליאון אשכנזי (מניטו)", price: 98, author: "הרב אוריאל עיטם / ישיבת ירוחם" },
  { title: "והתהלכתי בתוככם - סט", price: 120, author: "ישיבת ירוחם" },
  { title: "אותך אבקש - שערים חסידיים לימי התשובה", price: 59, author: "הרב חיים וולפסון" },
  { title: "ונהר יוצא מעדן - האכילה ומצוותיה", price: 69, author: "הרב אוריאל עיטם" },
  { title: "ונהר יוצא מעדן (סט - ג' כרכים)", price: 160, author: "הרב אוריאל עיטם" },
  { title: "ונהר יוצא מעדן - מועדי החורף", price: 60, author: "הרב אוריאל עיטם" },
  { title: "להשקות את הגן | סוגיות במסכת סוכה", price: 59, author: "הרב חיים וולפסון" },
  { title: "להשקות את הגן | יסודות מסכת סנהדרין", price: 69, author: "הרב חיים וולפסון" },
  { title: "שובו אלי", price: 29, author: "ישיבת ירוחם" },
  { title: "כעץ שתול", price: 40, author: "ישיבת ירוחם" },
  { title: "ונהר יוצא מעדן - חגי האביב", price: 60, author: "הרב אוריאל עיטם" },
  { title: "ונהר יוצא מעדן - חגי תשרי", price: 60, author: "הרב אוריאל עיטם" }
];

export default function PublisherApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState(null); 
  const [currentUserName, setCurrentUserName] = useState(''); 
  const [dashboardPeriod, setDashboardPeriod] = useState('monthly'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Sorting States ---
  const [inventorySort, setInventorySort] = useState('alphabetical');
  const [suppliersSort, setSuppliersSort] = useState('alphabetical');

  // --- UI System States (Toasts & Confirms) ---
  const [toastMessage, setToastMessage] = useState({ text: '', type: '' });
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage({ text: '', type: '' }), 3500);
  };

  // --- Firebase & Database States ---
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false);

  // --- Auth & Users States ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [usersList, setUsersList] = useState(initialValidUsers);
  const [isUserManageModalOpen, setIsUserManageModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'viewer', email: '' });

  // --- Dashboard Editing States ---
  const [statsData, setStatsData] = useState(initialStatsData);
  const [isEditStatsModalOpen, setIsEditStatsModalOpen] = useState(false);
  const [editingStats, setEditingStats] = useState(null);

  // --- Suppliers States ---
  const [suppliersList, setSuppliersList] = useState(initialSuppliers.map((s, i) => ({ id: i.toString(), ...s })));
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', type: 'רשת קמעונאית', contact: '', phone: '', email: '', status: 'פעיל - יש הסכם' });
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplierForStock, setSelectedSupplierForStock] = useState(null);

  // --- Supplier Invoices / Orders State ---
  const [isSupplierInvoiceModalOpen, setIsSupplierInvoiceModalOpen] = useState(false);
  const [invoiceSupplier, setInvoiceSupplier] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [deductFromWarehouse, setDeductFromWarehouse] = useState(true);

  // --- Consignment (Sales & Returns) State ---
  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);
  const [consignmentSupplier, setConsignmentSupplier] = useState(null);
  const [consignmentForm, setConsignmentForm] = useState({ type: 'sale', bookId: '', amount: 1, note: '' });

  // --- Gifts / Donors Distribution State ---
  const [giftLogs, setGiftLogs] = useState([]);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isGiftHistoryOpen, setIsGiftHistoryOpen] = useState(false);
  const [giftForm, setGiftForm] = useState({ bookId: '', amount: 1, recipient: '', category: 'תורם', note: '' });

  // --- Print Document (Packing Slip / Delivery Note) State ---
  const [printDoc, setPrintDoc] = useState(null);

  // --- Marketing & PR States ---
  const [campaignsList, setCampaignsList] = useState(initialCampaigns.map((c, i) => ({ id: i.toString(), ...c })));
  const [isEditCampaignModalOpen, setIsEditCampaignModalOpen] = useState(false);
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [newCampaign, setNewCampaign] = useState({ name: '', book: '', budget: '', spent: '', roas: '' });

  const [prCopies, setPrCopies] = useState(initialPrCopies.map((p, i) => ({ id: i.toString(), ...p })));
  const [isEditPrModalOpen, setIsEditPrModalOpen] = useState(false);
  const [isAddPrModalOpen, setIsAddPrModalOpen] = useState(false);
  const [editingPr, setEditingPr] = useState(null);
  const [newPr, setNewPr] = useState({ recipient: '', book: '', date: '', status: 'במשלוח' });

  // --- Inventory States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryList, setInventoryList] = useState(initialInventory);
  
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [stockUpdateForm, setStockUpdateForm] = useState({ bookId: '', amount: 0 });

  const initialBookFormState = {
    title: '', author: '', isbn: '', threshold: 50,
    editions: [{ name: 'מהדורה 1', printRun: 1000 }],
    publisherStock: 0,
    prices: { general: 0, supplier: 0, yeshiva: 0 },
    productionCost: 0,
    breakdown: []
  };

  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [newBookForm, setNewBookForm] = useState(initialBookFormState);

  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // --- Kanban State ---
  const [tasksList, setTasksList] = useState(initialTasksFlat.map((t, i) => ({ id: i.toString(), ...t })));
  const [selectedTask, setSelectedTask] = useState(null);
  const [newInvoice, setNewInvoice] = useState({ desc: '', amount: '' });
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', author: '', date: '' });

  // --- Notes & Supplier History State ---
  const [notesList, setNotesList] = useState(initialNotes);
  const [newNote, setNewNote] = useState({ text: '', color: 'bg-yellow-100' });
  const [supplierLogs, setSupplierLogs] = useState([]);
  const [isSupplierHistoryModalOpen, setIsSupplierHistoryModalOpen] = useState(false);
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState(null);

  // --- Orders State ---
  const [ordersList, setOrdersList] = useState(initialOrders);
  const [orderViewTab, setOrderViewTab] = useState('pending');

  const tasks = {
    in_progress: tasksList.filter(t => t.status === 'in_progress'),
    published: tasksList.filter(t => t.status === 'published')
  };

  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [isSyncing, setIsSyncing] = useState(null);

  // בדיקה אוטומטית אם המשתמש הגיע דרך קישור במייל (עם פרמטר user=)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      setUsername(userParam);
    }
  }, []);

  // --- Background Email Sender ---
  const sendEmailBackground = async (toEmail, subject, body) => {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      showToast("שגיאה: חסרים מפתחות EmailJS. לא ניתן לשלוח מייל.", "error");
      return;
    }

    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: { to_email: toEmail, subject: subject, message: body }
        })
      });

      if (response.ok) {
        showToast("האימייל נשלח בהצלחה ליעדו!", "success");
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      showToast("שגיאה בשליחת המייל. נסה שנית.", "error");
    }
  };

  // --- FIREBASE EFFECTS ---
  useEffect(() => {
    if (!auth) {
      setIsDbReady(true);
      return;
    }
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.warn("Auth error (Cloud disconnected):", error.message);
        db = null; // מנתק את הענן במקרה של שגיאת הרשאות ועובר לעבודה מקומית
        setIsDbReady(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      if (u) setIsDbReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !isDbReady || !firebaseUser) return;
    const unsubs = [];
    const seedDatabase = async () => {
      try {
        const snap = await getDocs(getCollRef('inventory'));
        if (snap.empty) {
          console.log("Seeding initial mock data to Database...");
          await setDoc(getDocRef('globals', 'stats'), initialStatsData);
          for (const item of initialInventory) await setDoc(doc(db, 'erp', appId, 'inventory', item.id), item);
          for (const item of initialSuppliers) await addDoc(getCollRef('suppliers'), item);
          for (const item of initialCampaigns) await addDoc(getCollRef('campaigns'), item);
          for (const item of initialPrCopies) await addDoc(getCollRef('prCopies'), item);
          for (const item of initialTasksFlat) await addDoc(getCollRef('tasks'), item);
          for (const item of initialValidUsers) await addDoc(getCollRef('users'), item);
          for (const item of initialNotes) await addDoc(getCollRef('notes'), item);
          for (const item of initialOrders) await addDoc(getCollRef('orders'), item);
        }
        return true;
      } catch (e) {
        console.warn("Firebase fallback. Local state mode.", e);
        return false;
      }
    };

    seedDatabase().then((success) => {
      if (!success) {
        db = null; 
        return;
      }
      const handleDbError = (err) => {
        console.warn("Firebase sync error, disabling cloud sync.", err);
        db = null;
      };
      try {
        unsubs.push(onSnapshot(getCollRef('inventory'), snap => setInventoryList(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('suppliers'), snap => setSuppliersList(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('campaigns'), snap => setCampaignsList(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('prCopies'), snap => setPrCopies(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('tasks'), snap => setTasksList(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('notes'), snap => setNotesList(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('orders'), snap => setOrdersList(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('supplier_logs'), snap => setSupplierLogs(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('gift_logs'), snap => setGiftLogs(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('users'), snap => {
          if (!snap.empty) setUsersList(snap.docs.map(d => ({id: d.id, ...d.data()})));
        }, handleDbError));
        unsubs.push(onSnapshot(getDocRef('globals', 'stats'), snap => {
          if (snap.exists()) setStatsData(snap.data());
        }, handleDbError));
      } catch (e) {
        handleDbError(e);
      }
    });

    return () => unsubs.forEach(unsub => unsub());
  }, [isDbReady, firebaseUser]);


  // --- Handlers ---
  const handleLogin = (e) => {
    e.preventDefault();
    
    // חותך רווחים מיותרים שהמשתמש אולי הדביק בטעות מהמייל
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // מחפש תחילה במסד הנתונים בענן, ואם לא קיים שם - מאפשר כניסה עם משתמש ברירת המחדל כמנגנון גיבוי
    const user = usersList.find(u => u.username === cleanUsername && u.password === cleanPassword) || 
                 initialValidUsers.find(u => u.username === cleanUsername && u.password === cleanPassword);
    
    if (user) {
      setUserRole(user.role);
      setCurrentUserName(user.name);
      setUsername(cleanUsername);
      setLoginError('');
      showToast(`ברוך הבא, ${user.name}`);
    } else {
      setLoginError('שם משתמש או סיסמה שגויים. נסה שוב.');
    }
  };

  // User Management
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (username !== 'admin') {
      showToast("שגיאת הרשאות: רק מנהל ראשי מורשה להוסיף משתמשים.", "error");
      return;
    }

    if (!newUser.username || !newUser.password || !newUser.name) return;
    
    const userObj = {
      username: newUser.username.trim(), 
      password: newUser.password.trim(), 
      role: newUser.role, 
      name: newUser.name, 
      email: newUser.email ? newUser.email.trim() : ''
    };

    if (db) {
      await addDoc(getCollRef('users'), userObj);
    } else {
      setUsersList([...usersList, userObj]);
    }

    if (newUser.email) {
      const subject = "פרטי התחברות למערכת ניהול הוצאה לאור";
      const appUrl = `${window.location.origin}/?user=${userObj.username}`; 
      
      const body = `שלום ${newUser.name},\n\nנוצר עבורך משתמש חדש למערכת הניהול.\n\nשם משתמש: ${userObj.username}\nסיסמה: ${userObj.password}\n\nלכניסה למערכת לחץ על הקישור הבא (שם המשתמש כבר יוזן עבורך):\n${appUrl}\n\nבברכה,\nצוות המערכת`;
      
      showToast("מקים משתמש ושולח מייל ברקע...", "info");
      sendEmailBackground(newUser.email, subject, body);
    } else {
      showToast("משתמש נוצר בהצלחה במערכת", "success");
    }

    setNewUser({ name: '', username: '', password: '', role: 'viewer', email: '' });
    setIsUserManageModalOpen(false);
  };

  const handleRemoveUser = (usernameToRemove) => {
    if (username !== 'admin') {
      showToast("שגיאת הרשאות: רק מנהל ראשי מורשה למחוק משתמשים.", "error");
      return;
    }

    if(usernameToRemove === 'admin') {
      showToast("לא ניתן למחוק את משתמש המנהל הראשי.", "error");
      return;
    }

    setConfirmDialog({
      message: `האם אתה בטוח שברצונך למחוק את המשתמש ${usernameToRemove}?`,
      onConfirm: async () => {
        const userToDelete = usersList.find(u => u.username === usernameToRemove);
        if (db && userToDelete && userToDelete.id) {
          await deleteDoc(getDocRef('users', userToDelete.id));
        } else {
          setUsersList(usersList.filter(u => u.username !== usernameToRemove));
        }
        showToast("המשתמש הוסר מהמערכת", "info");
      }
    });
  };

  // --- Notes & Tasks Handlers ---
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.text.trim()) return;
    
    const noteObj = {
      text: newNote.text.trim(),
      color: newNote.color,
      date: new Date().toLocaleDateString('he-IL')
    };

    if (db) {
      await addDoc(getCollRef('notes'), noteObj);
    } else {
      setNotesList([{ ...noteObj, id: Date.now().toString() }, ...notesList]);
    }
    
    setNewNote({ text: '', color: 'bg-yellow-100' });
    showToast("הפתק נשמר בהצלחה", "success");
  };

  const handleDeleteNote = (id) => {
    setConfirmDialog({
      title: "מחיקת פתק",
      message: "האם אתה בטוח שברצונך למחוק את הפתק הזה?",
      confirmText: "מחק פתק",
      icon: <Trash2 className="w-6 h-6" />,
      iconStyle: "bg-red-100 text-red-600",
      onConfirm: async () => {
        // עדכון אופטימי מיידי למחיקה חלקה
        setNotesList(prev => prev.filter(n => n.id !== id));
        
        if (db) {
          try {
            await deleteDoc(getDocRef('notes', id));
          } catch (e) {
            console.error("שגיאה במחיקת פתק מהשרת:", e);
          }
        }
        showToast("הפתק נמחק", "info");
      }
    });
  };

  // Orders Handlers
  const handleMarkOrderPacked = (id) => {
    setConfirmDialog({
      title: "אישור משלוח",
      message: "האם ארזת את ההזמנה והיא מוכנה למשלוח? ההזמנה תעבור ללשונית 'הזמנות שנשלחו'.",
      confirmText: "אשר וסמן כנשלח",
      confirmStyle: "bg-emerald-600 hover:bg-emerald-700",
      icon: <CheckCircle className="w-6 h-6" />,
      iconStyle: "bg-emerald-100 text-emerald-600",
      onConfirm: async () => {
        // עדכון מיידי בממשק (Optimistic Update) כדי שהאפליקציה תגיב מייד
        setOrdersList(prev => prev.map(o => o.id === id ? { ...o, status: 'shipped' } : o));
        
        if (db) {
          try {
            await updateDoc(getDocRef('orders', id), { status: 'shipped' });
          } catch (e) {
            console.error("שגיאה בעדכון הסטטוס מול השרת:", e);
          }
        }
        showToast("ההזמנה סומנה כנשלחה!", "success");
      }
    });
  };

  // Stock Calc
  const calculateTotalStock = (book) => {
    const suppliersTotal = (book.breakdown || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return Number(book.publisherStock || 0) + suppliersTotal;
  };

  // Export CSV המורחב 
  const handleExportCSV = () => {
    const headers = ['שם הספר', 'מחבר', 'דאנאק (ISBN)', 'מחיר צרכן (₪)', 'מחיר ספק (₪)', 'מחיר מיוחד (₪)', 'במחסן ההוצאה', 'פיזור אצל ספקים', 'סה"כ זמין במלאי'];
    
    const rows = inventoryList.map(b => {
      const breakdownText = (b.breakdown || []).map(sup => `${sup.supplier}: ${sup.amount}`).join(' | ');
      return [
        `"${b.title}"`,
        `"${b.author}"`,
        `"${b.isbn}"`,
        b.prices?.general || 0,
        b.prices?.supplier || 0,
        b.prices?.yeshiva || 0,
        b.publisherStock || 0,
        `"${breakdownText || 'ללא'}"`,
        calculateTotalStock(b)
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_report_detailed.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("הדוח המלא יוצא לאקסל", "success");
  };

  // Dashboard Edit
  const openEditStats = () => {
    setEditingStats({ ...statsData[dashboardPeriod] });
    setIsEditStatsModalOpen(true);
  };

  const handleEditStatsSubmit = async (e) => {
    e.preventDefault();
    const newData = { ...statsData, [dashboardPeriod]: editingStats };
    if (db) await setDoc(getDocRef('globals', 'stats'), newData);
    else setStatsData(newData);
    setIsEditStatsModalOpen(false);
    showToast("נתוני הדאשבורד עודכנו בהצלחה", "success");
  };

  // Suppliers
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    const supplierData = { ...newSupplier, updatedAt: Date.now() };
    if (db) await addDoc(getCollRef('suppliers'), supplierData);
    else setSuppliersList([...suppliersList, { ...supplierData, id: Date.now().toString() }]);
    setIsAddSupplierModalOpen(false);
    setNewSupplier({ name: '', type: 'רשת קמעונאית', contact: '', phone: '', email: '', status: 'פעיל - יש הסכם' });
    showToast("ספק חדש נוסף למערכת", "success");
  };

  const handleEditSupplierSubmit = async (e) => {
    e.preventDefault();
    const supplierData = { ...editingSupplier, updatedAt: Date.now() };
    if (db) await updateDoc(getDocRef('suppliers', supplierData.id), supplierData);
    else setSuppliersList(suppliersList.map(s => s.id === supplierData.id ? supplierData : s));
    setIsEditSupplierModalOpen(false);
    showToast("פרטי הספק עודכנו", "success");
  };

  // Invoices & Emails
  const openSupplierInvoice = (supplier) => {
    setInvoiceSupplier(supplier);
    setInvoiceItems([{ bookId: '', amount: 1, price: 0 }]);
    setDeductFromWarehouse(true);
    setIsSupplierInvoiceModalOpen(true);
  };

  const handleInvoiceItemChange = (index, field, value) => {
    const newItems = [...invoiceItems];
    if (field === 'bookId') {
      newItems[index].bookId = value;
      const book = inventoryList.find(b => b.id === value);
      if (book) newItems[index].price = book?.prices?.supplier || 0;
    } else {
      newItems[index][field] = Number(value);
    }
    setInvoiceItems(newItems);
  };

  const addInvoiceItemRow = () => setInvoiceItems([...invoiceItems, { bookId: '', amount: 1, price: 0 }]);
  const removeInvoiceItemRow = (index) => setInvoiceItems(invoiceItems.filter((_, i) => i !== index));

  // המרת מספר טלפון ישראלי לפורמט בינלאומי לוואטסאפ
  const formatWhatsAppPhone = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('0')) return '972' + digits.slice(1);
    return digits;
  };

  // פונקציה מרכזית לעיבוד הזמנת ספק: מעדכנת מלאי אצל הספק (ואופציונלית מורידה מהמחסן הראשי), מתעדת בהיסטוריה ושולחת מייל/וואטסאפ
  const handleProcessSupplierOrder = async (mode = 'email') => {
    if (!invoiceSupplier) return;

    const validItems = invoiceItems.filter(item => item.bookId && Number(item.amount) > 0);
    if (validItems.length === 0) {
      showToast("אנא בחר לפחות ספר אחד עם כמות גדולה מ-0.", "warning");
      return;
    }

    if (mode === 'email' && !invoiceSupplier.email) {
      showToast("לספק זה לא מוגדרת כתובת דוא״ל במערכת.", "error");
      return;
    }

    if (mode === 'whatsapp' && !formatWhatsAppPhone(invoiceSupplier.phone)) {
      showToast("לספק זה לא מוגדר מספר טלפון תקין לוואטסאפ.", "error");
      return;
    }

    // 1. איחוד כמויות לפי ספר (למקרה שאותו ספר נבחר ביותר משורה אחת)
    const qtyByBookId = {};
    validItems.forEach(item => {
      qtyByBookId[item.bookId] = (qtyByBookId[item.bookId] || 0) + Number(item.amount);
    });

    // 2. עדכון המלאי של הספק (וההוצאה) במערכת ובמסד הנתונים
    const updatedBooksMap = {};
    const updatedInventoryList = inventoryList.map(book => {
      const addedQty = qtyByBookId[book.id];
      if (!addedQty) return book;

      const currentBreakdown = (book.breakdown || []).map(b => ({ ...b }));
      const existingSupplierIdx = currentBreakdown.findIndex(b => b.supplier === invoiceSupplier.name);

      if (existingSupplierIdx > -1) {
        currentBreakdown[existingSupplierIdx].amount = Number(currentBreakdown[existingSupplierIdx].amount || 0) + addedQty;
      } else {
        currentBreakdown.push({ supplier: invoiceSupplier.name, amount: addedQty });
      }

      const newPublisherStock = deductFromWarehouse
        ? Math.max(0, Number(book.publisherStock || 0) - addedQty)
        : Number(book.publisherStock || 0);

      const updatedBook = {
        ...book,
        breakdown: currentBreakdown,
        publisherStock: newPublisherStock,
        updatedAt: Date.now()
      };
      updatedBooksMap[book.id] = updatedBook;
      return updatedBook;
    });

    // עדכון אופטימי מיידי בממשק
    setInventoryList(updatedInventoryList);

    // שמירה בענן (Firebase)
    if (db) {
      try {
        await Promise.all(
          Object.values(updatedBooksMap).map(updatedBook =>
            updateDoc(getDocRef('inventory', updatedBook.id), {
              breakdown: updatedBook.breakdown,
              publisherStock: updatedBook.publisherStock,
              updatedAt: updatedBook.updatedAt
            })
          )
        );
      } catch (err) {
        console.error("שגיאה בעדכון מלאי הספק בענן:", err);
        showToast("שגיאה בשמירת עדכון המלאי בענן.", "error");
      }
    }

    // 3. הכנת טקסט הפירוט למייל, וואטסאפ ולהיסטוריה
    let totalOrderPrice = 0;
    let itemsText = validItems.map((item, index) => {
      const book = inventoryList.find(b => b.id === item.bookId);
      if (!book) return '';
      const lineTotal = item.amount * item.price;
      totalOrderPrice += lineTotal;
      return `${index + 1}. ${book.title}\n   כמות: ${item.amount} יח' | מחיר ליחידה: ₪${item.price.toLocaleString()} | סה"כ: ₪${lineTotal.toLocaleString()}`;
    }).filter(Boolean).join('\n\n');

    const body = `לכבוד ${invoiceSupplier.name},\nשלום ${invoiceSupplier.contact},\n\nמצ"ב סיכום הזמנת ספרים / תעודת משלוח מטעם הוצאת ספרי ישיבת ירוחם.\n\nפירוט ההזמנה:\n--------------------------------------------------\n${itemsText}\n--------------------------------------------------\n\nסה"כ לתשלום / לחיוב: ₪${totalOrderPrice.toLocaleString()}\n\nנודה לאישור קבלת ההזמנה.\n\nבברכה,\nהוצאת ספרי ישיבת ירוחם.`;

    if (mode === 'email') {
      const subject = `הזמנת ספרים חדשה - הוצאת ספרי ישיבת ירוחם (${new Date().toLocaleDateString('he-IL')})`;
      showToast("מלאי הספק עודכן! שולח מייל ברקע...", "info");
      sendEmailBackground(invoiceSupplier.email, subject, body);
    } else if (mode === 'whatsapp') {
      const waPhone = formatWhatsAppPhone(invoiceSupplier.phone);
      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(body)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      showToast(`מלאי הספק "${invoiceSupplier.name}" עודכן והודעת הוואטסאפ נפתחה!`, "success");
    } else {
      showToast(`מלאי הספק "${invoiceSupplier.name}" עודכן בהצלחה!`, "success");
    }

    // 4. תיעוד הפעולה בהיסטוריית הספק
    const actionLabel = mode === 'email'
      ? 'הפקת הזמנה, עדכון מלאי ומייל'
      : mode === 'whatsapp'
      ? 'הפקת הזמנה, עדכון מלאי ווואטסאפ'
      : 'הפקת הזמנה ועדכון מלאי';

    const logObj = {
      supplierName: invoiceSupplier.name,
      action: actionLabel,
      type: 'order',
      user: currentUserName || username,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now(),
      totalAmount: totalOrderPrice,
      details: itemsText
    };
    if (db) addDoc(getCollRef('supplier_logs'), logObj);
    else setSupplierLogs([{ ...logObj, id: Date.now().toString() }, ...supplierLogs]);

    setIsSupplierInvoiceModalOpen(false);
  };

  // --- התחשבנות קונסיגנציה: דיווח מכירה או החזרת ספרים מספק ---
  const openConsignmentModal = (supplier) => {
    setConsignmentSupplier(supplier);
    setConsignmentForm({ type: 'sale', bookId: '', amount: 1, note: '' });
    setIsConsignmentModalOpen(true);
  };

  const handleConsignmentSubmit = async (e) => {
    e.preventDefault();
    if (!consignmentSupplier || !consignmentForm.bookId) return;

    const book = inventoryList.find(b => b.id === consignmentForm.bookId);
    if (!book) return;

    const qty = Number(consignmentForm.amount);
    if (isNaN(qty) || qty <= 0) {
      showToast("אנא הזן כמות תקינה גדולה מ-0.", "warning");
      return;
    }

    const currentBreakdown = (book.breakdown || []).map(b => ({ ...b }));
    const supplierIdx = currentBreakdown.findIndex(b => b.supplier === consignmentSupplier.name);
    const currentSupplierQty = supplierIdx > -1 ? Number(currentBreakdown[supplierIdx].amount || 0) : 0;

    if (qty > currentSupplierQty) {
      showToast(`אצל הספק יש רק ${currentSupplierQty} עותקים מספר זה.`, "error");
      return;
    }

    const remainingQty = currentSupplierQty - qty;
    if (remainingQty > 0) {
      currentBreakdown[supplierIdx].amount = remainingQty;
    } else {
      currentBreakdown.splice(supplierIdx, 1);
    }

    const isReturn = consignmentForm.type === 'return';
    const newPublisherStock = isReturn
      ? Number(book.publisherStock || 0) + qty
      : Number(book.publisherStock || 0);

    const updatedBook = {
      ...book,
      breakdown: currentBreakdown,
      publisherStock: newPublisherStock,
      updatedAt: Date.now()
    };

    setInventoryList(prev => prev.map(b => b.id === book.id ? updatedBook : b));

    if (db) {
      try {
        await updateDoc(getDocRef('inventory', book.id), {
          breakdown: updatedBook.breakdown,
          publisherStock: updatedBook.publisherStock,
          updatedAt: updatedBook.updatedAt
        });
      } catch (err) {
        console.error("שגיאה בעדכון התחשבנות ספק:", err);
      }
    }

    const unitPrice = Number(book.prices?.supplier || 0);
    const totalAmount = isReturn ? 0 : qty * unitPrice;
    const details = isReturn
      ? `הוחזרו למחסן הראשי: ${qty} עותקים מהספר "${book.title}".${consignmentForm.note ? `\nהערה: ${consignmentForm.note}` : ''}`
      : `דווחה מכירה של ${qty} עותקים מהספר "${book.title}" (₪${unitPrice} לעותק).${consignmentForm.note ? `\nהערה: ${consignmentForm.note}` : ''}`;

    const logObj = {
      supplierName: consignmentSupplier.name,
      action: isReturn ? 'החזרת ספרים למחסן' : 'דיווח מכירת קונסיגנציה',
      type: consignmentForm.type,
      user: currentUserName || username,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now(),
      totalAmount,
      details
    };

    if (db) addDoc(getCollRef('supplier_logs'), logObj);
    else setSupplierLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]);

    showToast(isReturn ? `${qty} עותקים הוחזרו למחסן הראשי!` : `נרשמה מכירה ע"ס ₪${totalAmount.toLocaleString()}!`, "success");
    setIsConsignmentModalOpen(false);
  };

  // --- חלוקה לתורמים / בוגרים / רבנים (עותקי מתנה) ---
  const handleGiftSubmit = async (e) => {
    e.preventDefault();
    const book = inventoryList.find(b => b.id === giftForm.bookId);
    const qty = Number(giftForm.amount);
    if (!book || isNaN(qty) || qty <= 0) return;

    const newPublisherStock = Math.max(0, Number(book.publisherStock || 0) - qty);
    const updatedAt = Date.now();

    setInventoryList(prev => prev.map(b => b.id === book.id ? { ...b, publisherStock: newPublisherStock, updatedAt } : b));
    if (db) {
      await updateDoc(getDocRef('inventory', book.id), { publisherStock: newPublisherStock, updatedAt });
    }

    const logObj = {
      bookTitle: book.title,
      amount: qty,
      recipient: giftForm.recipient.trim(),
      category: giftForm.category,
      note: giftForm.note.trim(),
      user: currentUserName || username,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now()
    };

    if (db) await addDoc(getCollRef('gift_logs'), logObj);
    else setGiftLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]);

    setGiftForm({ bookId: '', amount: 1, recipient: '', category: 'תורם', note: '' });
    setIsGiftModalOpen(false);
    showToast(`נרשמה חלוקה של ${qty} עותקים ל${logObj.recipient} והמלאי עודכן`, "success");
  };

  // --- הדפסת תעודת משלוח / דף אריזה ---
  const handleOpenPrintStoreOrder = (order) => {
    setPrintDoc({
      type: 'store_order',
      docTitle: 'דף אריזה ותעודת משלוח - הזמנת אתר',
      orderId: order.orderId,
      date: `${order.date} ${order.time || ''}`,
      recipient: order.customerName,
      address: order.address,
      shippingMethod: order.shippingMethod,
      items: (order.items || []).map(item => ({ name: item.name, quantity: item.quantity })),
      total: order.total
    });
  };

  const handleOpenPrintSupplierDelivery = () => {
    if (!invoiceSupplier) return;
    const validItems = invoiceItems.filter(item => item.bookId && Number(item.amount) > 0);
    if (validItems.length === 0) {
      showToast("בחר לפחות ספר אחד כדי להפיק תעודת משלוח להדפסה.", "warning");
      return;
    }
    const items = validItems.map(item => {
      const book = inventoryList.find(b => b.id === item.bookId);
      return {
        name: book?.title || 'ספר',
        quantity: item.amount,
        price: item.price,
        lineTotal: item.amount * item.price
      };
    });
    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);
    setPrintDoc({
      type: 'supplier_delivery',
      docTitle: 'תעודת משלוח / סיכום הזמנה לספק',
      orderId: `SUP-${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleDateString('he-IL'),
      recipient: `${invoiceSupplier.name} (${invoiceSupplier.contact})`,
      address: `טלפון: ${invoiceSupplier.phone || '-'} | דוא"ל: ${invoiceSupplier.email || '-'}`,
      shippingMethod: invoiceSupplier.type,
      items,
      total
    });
  };

  // --- הפקת ספרים (קנבן): הוספה, שינוי סטטוס והעברה למלאי ---
  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    const taskObj = {
      status: 'in_progress',
      title: newTaskForm.title.trim(),
      author: newTaskForm.author.trim() || 'ישיבת ירוחם',
      date: newTaskForm.date || new Date().toLocaleDateString('he-IL'),
      coverFile: null,
      bookFile: null,
      dedicationFile: null,
      invoices: [],
      addedToInventory: false
    };
    if (db) await addDoc(getCollRef('tasks'), taskObj);
    else setTasksList(prev => [...prev, { ...taskObj, id: Date.now().toString() }]);
    setNewTaskForm({ title: '', author: '', date: '' });
    setIsAddTaskModalOpen(false);
    showToast("פרויקט הפקה חדש נוסף ללוח!", "success");
  };

  const handleUpdateTaskStatus = async (task, newStatus) => {
    setTasksList(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    setSelectedTask(prev => prev && prev.id === task.id ? { ...prev, status: newStatus } : prev);
    if (db) await updateDoc(getDocRef('tasks', task.id), { status: newStatus });
    showToast(newStatus === 'published' ? "הספר עבר לסטטוס 'ספרים שיצאו'!" : "הספר הוחזר ל'ספרים בעבודה'", "success");
  };

  const handleTransferTaskToInventory = async (task) => {
    const totalProductionCost = (task.invoices || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const newBook = {
      title: task.title,
      author: task.author || 'ישיבת ירוחם',
      isbn: '',
      threshold: 30,
      publisherStock: 0,
      prices: { general: 0, supplier: 0, yeshiva: 0 },
      productionCost: totalProductionCost,
      editions: [{ name: 'מהדורה 1', printRun: 0 }],
      breakdown: [],
      updatedAt: Date.now()
    };

    if (db) {
      await addDoc(getCollRef('inventory'), newBook);
      await updateDoc(getDocRef('tasks', task.id), { addedToInventory: true, status: 'published' });
    } else {
      setInventoryList(prev => [...prev, { ...newBook, id: Date.now().toString() }]);
      setTasksList(prev => prev.map(t => t.id === task.id ? { ...t, addedToInventory: true, status: 'published' } : t));
    }
    setSelectedTask(prev => prev && prev.id === task.id ? { ...prev, addedToInventory: true, status: 'published' } : prev);
    showToast(`הספר "${task.title}" הועבר לניהול המלאי עם עלות הפקה של ₪${totalProductionCost.toLocaleString()}!`, "success");
  };

  // Campaigns & PR
  const handleAddCampaignSubmit = async (e) => {
    e.preventDefault();
    if (db) await addDoc(getCollRef('campaigns'), newCampaign);
    else setCampaignsList([...campaignsList, { ...newCampaign, id: Date.now().toString() }]);
    setIsAddCampaignModalOpen(false);
    setNewCampaign({ name: '', book: '', budget: '', spent: '', roas: '' });
    showToast("קמפיין שיווק חדש נוצר", "success");
  };

  const handleEditCampaignSubmit = async (e) => {
    e.preventDefault();
    if (db) await updateDoc(getDocRef('campaigns', editingCampaign.id), editingCampaign);
    else setCampaignsList(campaignsList.map(camp => camp.id === editingCampaign.id ? editingCampaign : camp));
    setIsEditCampaignModalOpen(false);
    showToast("נתוני הקמפיין עודכנו", "success");
  };

  const handleAddPrSubmit = async (e) => {
    e.preventDefault();
    if (db) await addDoc(getCollRef('prCopies'), newPr);
    else setPrCopies([...prCopies, { ...newPr, id: Date.now().toString() }]);
    setIsAddPrModalOpen(false);
    setNewPr({ recipient: '', book: '', date: '', status: 'במשלוח' });
    showToast("פריט יח״צ נוסף", "success");
  };

  const handleEditPrSubmit = async (e) => {
    e.preventDefault();
    if (db) await updateDoc(getDocRef('prCopies', editingPr.id), editingPr);
    else setPrCopies(prCopies.map(pr => pr.id === editingPr.id ? editingPr : pr));
    setIsEditPrModalOpen(false);
    showToast("סטטוס יח״צ עודכן", "success");
  };

  // Books
  const handleAddEdition = (formSetter, formState) => {
    formSetter({ ...formState, editions: [...formState.editions, { name: `מהדורה ${formState.editions.length + 1}`, printRun: 0 }] });
  };
  const handleUpdateEdition = (formSetter, formState, index, field, value) => {
    const updatedEditions = [...formState.editions];
    updatedEditions[index][field] = field === 'printRun' ? Number(value) : value;
    formSetter({ ...formState, editions: updatedEditions });
  };
  const handleRemoveEdition = (formSetter, formState, index) => {
    const updatedEditions = formState.editions.filter((_, i) => i !== index);
    formSetter({ ...formState, editions: updatedEditions });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    const bookData = { ...newBookForm, updatedAt: Date.now() };
    if (db) await addDoc(getCollRef('inventory'), bookData);
    else setInventoryList([...inventoryList, { ...bookData, id: Date.now().toString() }]);
    setIsAddBookModalOpen(false);
    setNewBookForm(initialBookFormState);
    showToast("ספר חדש התווסף בהצלחה למלאי", "success");
  };

  const handleAddBookBreakdownRow = () => setNewBookForm({ ...newBookForm, breakdown: [...newBookForm.breakdown, { supplier: '', amount: 0 }] });
  const handleUpdateBookBreakdownRow = (index, field, value) => {
    const updatedBreakdown = [...newBookForm.breakdown];
    updatedBreakdown[index][field] = field === 'amount' ? Number(value) : value;
    setNewBookForm({ ...newBookForm, breakdown: updatedBreakdown });
  };
  const handleRemoveBookBreakdownRow = (index) => setNewBookForm({ ...newBookForm, breakdown: newBookForm.breakdown.filter((_, i) => i !== index) });

  const openEditBook = (book) => {
    setEditingBook(JSON.parse(JSON.stringify(book))); 
    setIsEditBookModalOpen(true);
  };

  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    const bookData = { ...editingBook, updatedAt: Date.now() };
    if (db) await updateDoc(getDocRef('inventory', bookData.id), bookData);
    else setInventoryList(inventoryList.map(b => b.id === bookData.id ? bookData : b));
    setIsEditBookModalOpen(false);
    setEditingBook(null);
    showToast("פרטי הספר ומלאי המהדורות עודכנו", "success");
  };

  const handleEditBookBreakdownRow = () => setEditingBook({ ...editingBook, breakdown: [...editingBook.breakdown, { supplier: '', amount: 0 }] });
  const handleUpdateEditBookBreakdownRow = (index, field, value) => {
    const updatedBreakdown = [...editingBook.breakdown];
    updatedBreakdown[index][field] = field === 'amount' ? Number(value) : value;
    setEditingBook({ ...editingBook, breakdown: updatedBreakdown });
  };
  const handleRemoveEditBookBreakdownRow = (index) => setEditingBook({ ...editingBook, breakdown: editingBook.breakdown.filter((_, i) => i !== index) });

  const handleDeleteBook = async (id) => {
    setConfirmDialog({
      message: "האם אתה בטוח שברצונך למחוק ספר זה מהמלאי לצמיתות?",
      onConfirm: async () => {
        if (db) await deleteDoc(getDocRef('inventory', id));
        else setInventoryList(inventoryList.filter(book => book.id !== id));
        showToast("הספר נמחק מהמלאי", "info");
      }
    });
  };

  // פונקציית הקסם - ייבוא קטלוג
  const handleImportYhyCatalog = async () => {
    showToast("סורק ומעדכן מחירים מהאתר (שומר על נתונים קיימים)...", "info");
    try {
      let updatedCount = 0;
      let addedCount = 0;

      if (!db) {
        setInventoryList(prev => {
          const next = [...prev];
          for (const catalogBook of initialInventory) {
            const idx = next.findIndex(b => b.title === catalogBook.title);
            if (idx > -1) {
              next[idx] = {
                ...next[idx],
                prices: catalogBook.prices,
                productionCost: catalogBook.productionCost,
                updatedAt: Date.now()
              };
              updatedCount++;
            } else {
              next.push({ ...catalogBook, id: Date.now().toString() + Math.random(), updatedAt: Date.now() });
              addedCount++;
            }
          }
          return next;
        });
        showToast(`סנכרון מחירון הושלם! ${updatedCount} עודכנו, ${addedCount} חדשים.`, "success");
        return;
      }

      for (const catalogBook of initialInventory) {
        const existingBook = inventoryList.find(b => b.title === catalogBook.title);
        
        if (existingBook) {
          // עדכון מחירים ועלות הפקה בלבד, ללא דריסת המלאי או המהדורות
          await updateDoc(getDocRef('inventory', existingBook.id), {
            prices: catalogBook.prices,
            productionCost: catalogBook.productionCost,
            updatedAt: Date.now()
          });
          updatedCount++;
        } else {
          // הוספת ספר שחסר לגמרי במערכת
          await addDoc(getCollRef('inventory'), {
            ...catalogBook,
            updatedAt: Date.now()
          });
          addedCount++;
        }
      }
      
      showToast(`סנכרון מחירון הושלם! ${updatedCount} עודכנו, ${addedCount} חדשים.`, "success");
    } catch (error) {
      console.error(error);
      showToast("שגיאה בעדכון הספרים", "error");
    }
  };

  const handleManualStockUpdate = async (e) => {
    e.preventDefault();
    const amount = Number(stockUpdateForm.amount);
    if (!stockUpdateForm.bookId || isNaN(amount)) return;
    
    if (db) {
      const book = inventoryList.find(b => b.id === stockUpdateForm.bookId);
      if (book) await updateDoc(getDocRef('inventory', book.id), { publisherStock: Math.max(0, Number(book.publisherStock) + amount), updatedAt: Date.now() });
    } else {
      setInventoryList(inventoryList.map(book => 
        book.id === stockUpdateForm.bookId ? { ...book, publisherStock: Math.max(0, Number(book.publisherStock) + amount), updatedAt: Date.now() } : book
      ));
    }
    
    setIsUpdateStockModalOpen(false);
    setStockUpdateForm({ bookId: '', amount: 0 });
    showToast("הוספת מלאי ידנית הושלמה", "success");
  };

  const handleToggleIntegration = (id) => {
    if (userRole !== 'admin') return;
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, connected: !int.connected, lastSync: !int.connected ? 'כרגע' : int.lastSync } : int
    ));
    showToast("סטטוס חיבור לאינטגרציה עודכן", "success");
  };

  const handleSync = (id) => {
    if (userRole !== 'admin') return;
    setIsSyncing(id);
    setTimeout(() => {
      setIntegrations(integrations.map(int => 
        int.id === id ? { ...int, lastSync: 'לפני מספר שניות' } : int
      ));
      setIsSyncing(null);
      showToast("סנכרון נתונים למערכת חיצונית הושלם", "success");
    }, 1500);
  };

  const handleDeleteTask = (id) => {
    setConfirmDialog({
      message: "האם אתה בטוח שברצונך למחוק פרויקט הפקה זה לצמיתות?",
      onConfirm: async () => {
        if (db) await deleteDoc(getDocRef('tasks', id));
        else setTasksList(tasksList.filter(t => t.id !== id));
        setSelectedTask(null);
        showToast("הפרויקט נמחק בהצלחה", "info");
      }
    });
  };

  const getSupplierStock = (supplierName) => {
    return inventoryList.reduce((acc, book) => {
      const found = (book.breakdown || []).find(b => b.supplier === supplierName);
      if (found && found.amount > 0) {
        acc.push({ title: book.title, author: book.author, amount: found.amount, isbn: book.isbn });
      }
      return acc;
    }, []);
  };

  const filteredInventory = inventoryList.filter(book =>
    book.title.includes(searchQuery) ||
    book.author.includes(searchQuery) ||
    book.isbn.includes(searchQuery)
  );

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (inventorySort === 'alphabetical') return a.title.localeCompare(b.title, 'he');
    if (inventorySort === 'date') return (b.updatedAt || 0) - (a.updatedAt || 0);
    return 0;
  });

  const sortedSuppliers = [...suppliersList].sort((a, b) => {
    if (suppliersSort === 'alphabetical') return a.name.localeCompare(b.name, 'he');
    if (suppliersSort === 'date') return (b.updatedAt || 0) - (a.updatedAt || 0);
    return 0;
  });

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoice.desc || !newInvoice.amount) return;
    const updatedInvoices = [...(selectedTask.invoices || []), { id: Date.now(), desc: newInvoice.desc, amount: Number(newInvoice.amount), receiptFile: null }];
    if (db) await updateDoc(getDocRef('tasks', selectedTask.id), { invoices: updatedInvoices });
    else setTasksList(tasksList.map(t => t.id === selectedTask.id ? { ...t, invoices: updatedInvoices } : t));
    setSelectedTask({ ...selectedTask, invoices: updatedInvoices });
    setNewInvoice({ desc: '', amount: '' });
    showToast("שורת תמחור/הוצאה נוספה לפרויקט", "success");
  };

  const handleInvoiceReceiptUpload = async (invoiceId) => {
    const updatedInvoices = selectedTask.invoices.map(inv => inv.id === invoiceId ? { ...inv, receiptFile: 'אסמכתא_הועלתה.pdf' } : inv);
    if (db) await updateDoc(getDocRef('tasks', selectedTask.id), { invoices: updatedInvoices });
    else setTasksList(tasksList.map(t => t.id === selectedTask.id ? { ...t, invoices: updatedInvoices } : t));
    setSelectedTask({ ...selectedTask, invoices: updatedInvoices });
    showToast("אסמכתת תשלום הועלתה בהצלחה", "success");
  };

  const handleFileUpload = async (type) => {
    let fileName = type === 'coverFile' ? 'new_cover_uploaded.jpg' : type === 'bookFile' ? 'book_manuscript_v2.pdf' : 'dedications_list.docx';
    if (db) await updateDoc(getDocRef('tasks', selectedTask.id), { [type]: fileName });
    else setTasksList(tasksList.map(t => t.id === selectedTask.id ? { ...t, [type]: fileName } : t));
    setSelectedTask({ ...selectedTask, [type]: fileName });
    showToast("קובץ מקור התעדכן", "success");
  };

  const handleImportContact = async () => {
    try {
      const supported = ('contacts' in navigator && 'ContactsManager' in window);
      if (!supported) {
         showToast("הדפדפן שלך אינו תומך בייבוא אנשי קשר אוטומטי.", "warning");
         return;
      }
      const props = ['name', 'tel', 'email'];
      const contacts = await navigator.contacts.select(props, { multiple: false });
      if (contacts && contacts.length > 0) {
         const c = contacts[0];
         setNewSupplier(prev => ({
           ...prev,
           name: c.name && c.name.length > 0 ? c.name[0] : prev.name,
           contact: c.name && c.name.length > 0 ? c.name[0] : prev.contact,
           phone: c.tel && c.tel.length > 0 ? c.tel[0] : prev.phone,
           email: c.email && c.email.length > 0 ? c.email[0] : prev.email
         }));
         showToast("איש הקשר יובא בהצלחה", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("הייבוא בוטל או נכשל.", "error");
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'דאשבורד', icon: LayoutDashboard },
    { id: 'orders', label: 'הזמנות חנות (אתר)', icon: ShoppingCart },
    { id: 'inventory', label: 'ניהול מלאי', icon: Package },
    { id: 'suppliers', label: 'ספקים והפצה', icon: Truck },
    { id: 'production', label: 'הפקת ספרים', icon: KanbanSquare },
    { id: 'marketing', label: 'שיווק ויח״צ', icon: Megaphone },
    { id: 'integrations', label: 'אוטומציה', icon: Settings },
    { id: 'notes', label: 'פתקים ומשימות', icon: StickyNote },
  ];

  if (!userRole) {
    return (
      <div dir="rtl" className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans p-4 relative pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {toastMessage.text && (
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-lg shadow-lg font-medium text-sm animate-in slide-in-from-top-4 fade-in duration-300 ${toastMessage.type === 'error' ? 'bg-red-500 text-white' : toastMessage.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
            {toastMessage.text}
          </div>
        )}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-100 animate-in fade-in zoom-in duration-300">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-indigo-600 w-8 h-8" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">מערכת ניהול הוצאה לאור</h1>
          <p className="text-slate-500 mb-6 text-sm md:text-base">הזן פרטי התחברות כדי לגשת למערכת</p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">שם משתמש</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white text-sm" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white text-sm" dir="ltr" />
            </div>
            {loginError && <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg text-center font-medium">{loginError}</div>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-medium transition-colors shadow-sm mt-2">התחבר למערכת</button>
          </form>
        </div>
      </div>
    );
  }

  // --- Dynamic Dashboard Stats ---
  const dynamicInProduction = tasksList.filter(t => t.status === 'in_progress').length;
  const dynamicCompleted = tasksList.filter(t => t.status === 'published').length;
  const lowStockBooks = inventoryList.filter(book => calculateTotalStock(book) <= Number(book.threshold || 0));
  const totalWarehouseCopies = inventoryList.reduce((sum, b) => sum + Number(b.publisherStock || 0), 0);
  const totalSupplierCopies = inventoryList.reduce((sum, b) => sum + (b.breakdown || []).reduce((s, item) => s + Number(item.amount || 0), 0), 0);
  const totalInventoryCostValue = inventoryList.reduce((sum, b) => sum + (calculateTotalStock(b) * Number(b.productionCost || 0)), 0);
  const totalInventoryRetailValue = inventoryList.reduce((sum, b) => sum + (calculateTotalStock(b) * Number(b.prices?.general || 0)), 0);
  const liveStoreRevenue = ordersList.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const liveSupplierRevenue = supplierLogs.filter(l => l.type !== 'return').reduce((sum, l) => sum + Number(l.totalAmount || 0), 0);
  
  const currentStats = statsData[dashboardPeriod] || initialStatsData.monthly;
  const dashboardStatsArray = [
    { id: 1, title: 'ספרים בהפקה (אוטומטי)', value: dynamicInProduction, icon: PenTool, color: 'text-blue-600', bgColor: 'bg-blue-100', onClick: () => setActiveTab('production') },
    { id: 2, title: 'ספרים שהושלמו (אוטומטי)', value: dynamicCompleted, icon: BookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-100', onClick: () => setActiveTab('production') },
    { id: 3, title: dashboardPeriod === 'monthly' ? 'נמכרו החודש (עותקים)' : 'נמכרו השנה (עותקים)', value: currentStats.sold, icon: Package, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { id: 4, title: dashboardPeriod === 'monthly' ? 'רווח מכירות חודשי (₪)' : 'רווח מכירות שנתי (₪)', value: `₪${currentStats.revenue}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 5, title: dashboardPeriod === 'monthly' ? 'מגמת מכירות (חודשי)' : 'גידול שנתי במכירות', value: currentStats.trend, icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { id: 6, title: 'התראות מלאי נמוך (אוטומטי)', value: lowStockBooks.length, icon: AlertTriangle, color: lowStockBooks.length > 0 ? 'text-red-600' : 'text-emerald-600', bgColor: lowStockBooks.length > 0 ? 'bg-red-100' : 'bg-emerald-100', onClick: () => setActiveTab('inventory') }
  ];

  return (
    <div dir="rtl" className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden relative pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      
      {/* --- Dedicated Print Sheet (visible only when printing a delivery note / packing slip) --- */}
      {printDoc && (
        <div className="hidden print:block fixed inset-0 bg-white z-[200] p-8 text-slate-900" dir="rtl">
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">הוצאת ספרי ישיבת ירוחם</h1>
              <p className="text-sm text-slate-600 mt-1">{printDoc.docTitle}</p>
            </div>
            <div className="text-left text-sm">
              <p className="font-bold">מספר אסמכתא: {printDoc.orderId}</p>
              <p>תאריך: {printDoc.date}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-6 text-sm space-y-1">
            <p><span className="font-bold">לכבוד:</span> {printDoc.recipient}</p>
            {printDoc.address && <p><span className="font-bold">כתובת / פרטי קשר:</span> {printDoc.address}</p>}
            {printDoc.shippingMethod && <p><span className="font-bold">אופן משלוח / סוג:</span> {printDoc.shippingMethod}</p>}
          </div>

          <table className="w-full text-right border-collapse border border-slate-300 text-sm mb-6">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2">#</th>
                <th className="border border-slate-300 p-2">שם הספר</th>
                <th className="border border-slate-300 p-2 text-center">כמות</th>
                {printDoc.type === 'supplier_delivery' && <th className="border border-slate-300 p-2 text-center">מחיר יח'</th>}
                {printDoc.type === 'supplier_delivery' && <th className="border border-slate-300 p-2 text-center">סה"כ</th>}
              </tr>
            </thead>
            <tbody>
              {printDoc.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-300 p-2">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 font-medium">{item.name}</td>
                  <td className="border border-slate-300 p-2 text-center font-bold">{item.quantity}</td>
                  {printDoc.type === 'supplier_delivery' && <td className="border border-slate-300 p-2 text-center">₪{Number(item.price || 0).toLocaleString()}</td>}
                  {printDoc.type === 'supplier_delivery' && <td className="border border-slate-300 p-2 text-center font-bold">₪{Number(item.lineTotal || 0).toLocaleString()}</td>}
                </tr>
              ))}
            </tbody>
          </table>

          {printDoc.total !== undefined && (
            <div className="text-left text-lg font-bold mb-10">
              סה"כ לתשלום / שווי הזמנה: ₪{Number(printDoc.total || 0).toLocaleString()}
            </div>
          )}

          <div className="grid grid-cols-2 gap-12 pt-12 mt-12 border-t border-slate-300 text-sm">
            <div>
              <p className="mb-8 font-medium">חתימת נציג ההוצאה:</p>
              <div className="border-b border-slate-400 w-48"></div>
            </div>
            <div>
              <p className="mb-8 font-medium">חתימת המקבל ואישור קבלה:</p>
              <div className="border-b border-slate-400 w-48"></div>
            </div>
          </div>
        </div>
      )}

      {/* --- Global Toast Notifications --- */}
      {toastMessage.text && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-lg shadow-lg font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300 ${toastMessage.type === 'error' ? 'bg-red-500 text-white' : toastMessage.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
          {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : toastMessage.type === 'warning' ? <Info className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toastMessage.text}
        </div>
      )}

      {/* --- Global Confirm Dialog --- */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmDialog.iconStyle || 'bg-red-100 text-red-600'}`}>
                {confirmDialog.icon || <AlertTriangle className="w-6 h-6" />}
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">{confirmDialog.title || 'אישור פעולה'}</h3>
              <p className="text-slate-600 mb-6 text-sm">{confirmDialog.message}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">ביטול</button>
                <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${confirmDialog.confirmStyle || 'bg-red-600 hover:bg-red-700'}`}>
                  {confirmDialog.confirmText || 'אשר ומחק'}
                </button>
              </div>
           </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-slate-200 flex flex-col shadow-2xl transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} print:hidden`}>
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg"><BookOpen className="text-white w-5 h-5 md:w-6 md:h-6" /></div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">הוצאה לאור</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-md"><X className="w-5 h-5" /></button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />{item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className={`flex-1 flex flex-col h-full overflow-hidden w-full relative ${printDoc ? 'print:hidden' : ''}`}>
        <header className="bg-white p-3 md:p-6 shadow-sm border-b border-slate-200 flex justify-between items-center z-10 print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"><Menu className="w-6 h-6" /></button>
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 truncate">{navItems.find(item => item.id === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:block text-sm text-slate-500">שלום, <span className="font-semibold text-slate-700">{currentUserName}</span></div>
            {username === 'admin' && (
              <button onClick={() => setIsUserManageModalOpen(true)} className="text-xs md:text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg transition-colors border border-transparent flex items-center gap-1.5">
                <UserCog className="w-4 h-4" /> ניהול משתמשים
              </button>
            )}
            <button onClick={() => { setUserRole(null); setCurrentUserName(''); setUsername(''); setPassword(''); setLoginError(''); }} className="text-xs md:text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg transition-colors border border-transparent">התנתק</button>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${userRole === 'admin' ? 'bg-indigo-100 border-2 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-2 border-slate-200 text-slate-600'}`}>{userRole === 'admin' ? 'מ' : 'צ'}</div>
          </div>
        </header>

        <div className="flex-1 p-3 md:p-8 overflow-y-auto w-full max-w-full">
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">סיכום נתונים</h3>
                  {userRole === 'admin' && (
                    <button onClick={openEditStats} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors" title="ערוך נתוני דאשבורד">
                      <Settings2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="bg-slate-200/60 p-1 rounded-xl flex items-center border border-slate-200 w-full sm:w-auto">
                  <button onClick={() => setDashboardPeriod('monthly')} className={`flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 text-center ${dashboardPeriod === 'monthly' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>סיכום חודשי</button>
                  <button onClick={() => setDashboardPeriod('yearly')} className={`flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 text-center ${dashboardPeriod === 'yearly' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>סיכום שנתי</button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {dashboardStatsArray.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.id} onClick={stat.onClick} className={`bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 transition-transform hover:-translate-y-1 ${stat.onClick ? 'cursor-pointer hover:border-indigo-200' : ''}`}>
                      <div className={`p-2.5 md:p-4 rounded-xl ${stat.bgColor} ${stat.color} self-start md:self-auto`}><Icon className="w-5 h-5 md:w-6 md:h-6" /></div>
                      <div>
                        <p className="text-[10px] md:text-sm font-medium text-slate-500 mb-0.5 md:mb-1">{stat.title}</p>
                        <h3 className="text-base md:text-2xl font-bold text-slate-800">{stat.value}</h3>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* --- תמונת מצב כלכלית ומלאי בזמן אמת --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" /> שווי מלאי והכנסות בזמן אמת
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500">שווי מלאי (עלות הדפסה)</p>
                      <p className="text-lg md:text-xl font-bold text-slate-800 mt-1">₪{Math.round(totalInventoryCostValue).toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-700">שווי מלאי (מחיר צרכן)</p>
                      <p className="text-lg md:text-xl font-bold text-emerald-700 mt-1">₪{Math.round(totalInventoryRetailValue).toLocaleString()}</p>
                    </div>
                    <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
                      <p className="text-xs text-indigo-700">סה"כ עותקים במערכת</p>
                      <p className="text-base md:text-lg font-bold text-indigo-800 mt-1">{(totalWarehouseCopies + totalSupplierCopies).toLocaleString()}</p>
                      <p className="text-[11px] text-indigo-500 mt-0.5">מחסן: {totalWarehouseCopies.toLocaleString()} | ספקים: {totalSupplierCopies.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                      <p className="text-xs text-purple-700">הכנסות מתועדות (אתר + ספקים)</p>
                      <p className="text-base md:text-lg font-bold text-purple-800 mt-1">₪{Math.round(liveStoreRevenue + liveSupplierRevenue).toLocaleString()}</p>
                      <p className="text-[11px] text-purple-500 mt-0.5">אתר: ₪{Math.round(liveStoreRevenue).toLocaleString()} | ספקים: ₪{Math.round(liveSupplierRevenue).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" /> ספרים מתחת לרף ההתראה ({lowStockBooks.length})
                    </h4>
                    <button onClick={() => setActiveTab('inventory')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">לניהול המלאי ←</button>
                  </div>
                  {lowStockBooks.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {lowStockBooks.map(book => (
                        <div key={book.id} className="flex justify-between items-center bg-red-50/60 border border-red-100 px-3 py-2 rounded-lg text-sm">
                          <span className="font-medium text-slate-800 truncate">{book.title}</span>
                          <span className="text-xs font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-red-200 shrink-0">
                            נותרו {calculateTotalStock(book)} (רף: {book.threshold})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-emerald-600 py-6">
                      <CheckCircle className="w-10 h-10 mb-2 opacity-80" />
                      <p className="text-sm font-medium">כל הספרים במלאי תקין!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STORE ORDERS VIEW */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">הזמנות מהחנות האינטרנטית</h3>
                  <p className="text-slate-500 text-xs md:text-sm mt-1">הזמנות שמגיעות אוטומטית מאתר WooCommerce ברגע שלקוח משלם</p>
                </div>
                <div className="bg-slate-200/60 p-1 rounded-xl flex items-center border border-slate-200 w-full sm:w-auto">
                  <button onClick={() => setOrderViewTab('pending')} className={`flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 text-center ${orderViewTab === 'pending' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>הזמנות פתוחות</button>
                  <button onClick={() => setOrderViewTab('shipped')} className={`flex-1 sm:flex-none px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 text-center ${orderViewTab === 'shipped' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>הזמנות שנשלחו</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-10 overflow-y-auto">
                {ordersList.filter(o => (o.status || 'pending') === orderViewTab).sort((a, b) => (String(b.orderId).replace(/\D/g,'') || 0) - (String(a.orderId).replace(/\D/g,'') || 0)).map((order) => (
                  <div key={order.id} className={`bg-white p-5 rounded-2xl shadow-sm border flex flex-col relative group transition-all hover:shadow-md ${orderViewTab === 'shipped' ? 'border-emerald-100 opacity-80' : 'border-indigo-100'}`}>
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                      <div>
                        <span className={`${orderViewTab === 'shipped' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'} text-[10px] md:text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block`}>הזמנה #{String(order.orderId).replace(/^#/, '')}</span>
                        <h4 className="font-bold text-base md:text-lg text-slate-800">{order.customerName}</h4>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {order.date} בשעה {order.time}</div>
                      </div>
                      <div className="text-left">
                        <span className="text-emerald-600 font-bold text-sm md:text-base">₪{order.total}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6 flex-1">
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> ספרים בהזמנה:</p>
                        <ul className="text-sm text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {order.items?.map((item, i) => (
                            <li key={i} className="flex justify-between border-b border-slate-200/50 last:border-0 pb-1 last:pb-0">
                              <span className="font-semibold">{item.name}</span>
                              <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded text-xs">x{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 items-start bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-amber-800 font-bold">{order.shippingMethod}</p>
                          <p className="text-sm text-slate-700 mt-0.5">{order.address}</p>
                        </div>
                      </div>
                    </div>

                    {orderViewTab === 'pending' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleMarkOrderPacked(order.id)}
                            className="flex-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 transition-colors py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 group-hover:shadow-sm"
                          >
                            <CheckSquare className="w-4 h-4" /> סמן כנארז ונשלח
                          </button>
                          <button
                            onClick={() => handleOpenPrintStoreOrder(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
                            title="הדפס דף אריזה / מדבקת משלוח"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                          <div className="flex-1 bg-slate-50 text-slate-500 border border-slate-200 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" /> ההזמנה נשלחה בהצלחה
                          </div>
                          <button
                            onClick={() => handleOpenPrintStoreOrder(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
                            title="הדפס דף אריזה"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                    )}
                  </div>
                ))}

                {ordersList.filter(o => (o.status || 'pending') === orderViewTab).length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <ShoppingCart className="w-12 h-12 mb-3 opacity-40" />
                    <p className="font-medium text-sm">{orderViewTab === 'pending' ? 'אין כרגע הזמנות פתוחות מהאתר.' : 'עדיין לא נרשמו הזמנות שנשלחו.'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INVENTORY VIEW */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חיפוש לפי שם ספר, מחבר או דאנאק..."
                      className="w-full pr-9 pl-3 py-2 md:py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                    />
                  </div>
                  <select
                    value={inventorySort}
                    onChange={(e) => setInventorySort(e.target.value)}
                    className="p-2 md:p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                  >
                    <option value="alphabetical">מיון: אלף-בית</option>
                    <option value="date">מיון: עודכן לאחרונה</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap gap-2 w-full lg:w-auto print:hidden">
                  <button onClick={() => window.print()} className="bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap"><Printer className="w-3.5 h-3.5 md:w-4 md:h-4" /> הדפס</button>
                  <button onClick={handleExportCSV} className="bg-slate-100 hover:bg-slate-200 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap"><Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> ייצוא</button>
                  <button onClick={() => setIsGiftHistoryOpen(true)} className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap font-medium"><History className="w-3.5 h-3.5 md:w-4 md:h-4" /> מעקב מתנות ({giftLogs.length})</button>
                  {userRole === 'admin' && (
                    <>
                      <button onClick={() => setIsGiftModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap font-medium shadow-sm"><Gift className="w-3.5 h-3.5 md:w-4 md:h-4" /> חלוקה לתורמים</button>
                      <button onClick={handleImportYhyCatalog} className="bg-pink-100 hover:bg-pink-200 text-pink-700 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap transition-colors font-medium"><Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> ייבוא מהאתר</button>
                      <button onClick={() => setIsUpdateStockModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap"><RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" /> עדכון ידני</button>
                      <button onClick={() => setIsAddBookModalOpen(true)} className="col-span-2 sm:col-span-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 shadow-sm whitespace-nowrap"><Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> הוסף ספר</button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {sortedSuppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col relative group">
                    {userRole === 'admin' && (
                      <button onClick={() => { setEditingSupplier(supplier); setIsEditSupplierModalOpen(true); }} className="absolute top-4 left-4 p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex justify-between items-start mb-4 pr-2">
                      <div>
                        <h4 className="font-bold text-base md:text-lg text-slate-800">{supplier.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md">{supplier.type}</span>
                          <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(supplier.status)}`}>{supplier.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-100 flex-1">
                      <div className="flex items-center gap-3 text-sm text-slate-600"><Users className="w-4 h-4 text-slate-400" /> {supplier.contact}</div>
                      <div className="flex items-center gap-3 text-sm text-slate-600" dir="ltr"><Phone className="w-4 h-4 text-slate-400" /> {supplier.phone}</div>
                      <div className="flex items-center gap-3 text-sm text-slate-600"><FileText className="w-4 h-4 text-slate-400" /> {supplier.email}</div>
                    </div>
                    <div className="pt-5 mt-4 border-t border-slate-50 flex gap-2 flex-col">
                      <button onClick={() => setSelectedSupplierForStock(supplier)} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm font-medium transition-colors"><Package className="w-4 h-4" /> צפה במלאי</button>
                      <button onClick={() => { setSelectedSupplierForHistory(supplier); setIsSupplierHistoryModalOpen(true); }} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm font-medium transition-colors"><History className="w-4 h-4" /> היסטוריית פעולות</button>
                      {userRole === 'admin' && (
                        <>
                          <button onClick={() => openConsignmentModal(supplier)} className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2.5 rounded-lg text-sm font-medium transition-colors"><ArrowLeftRight className="w-4 h-4" /> דיווח מכירה / החזרה</button>
                          <button onClick={() => openSupplierInvoice(supplier)} className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-lg text-sm font-medium transition-colors"><Receipt className="w-4 h-4" /> הפק הזמנה / קבלה</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTION (KANBAN) VIEW */}
          {activeTab === 'production' && (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              {userRole === 'admin' && (
                <div className="flex justify-end mb-4">
                  <button onClick={() => setIsAddTaskModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> הוסף פרויקט הפקה חדש
                  </button>
                </div>
              )}
              <div className="flex gap-4 md:gap-6 h-full min-h-[450px] overflow-x-auto pb-4 snap-x">
                {kanbanColumns.map((col) => {
                  const Icon = col.icon;
                  return (
                    <div key={col.id} className={`snap-center flex-1 min-w-[280px] md:min-w-[320px] rounded-2xl border ${col.color} p-4 flex flex-col`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon className="w-5 h-5 text-slate-600" />
                        <h3 className="font-bold text-slate-700">{col.title}</h3>
                      </div>
                      <div className="flex-1 space-y-3">
                        {tasks[col.id]?.map((task) => {
                          const totalExpenses = task.invoices ? task.invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0) : 0;
                          const filesCount = (task.coverFile ? 1 : 0) + (task.bookFile ? 1 : 0) + (task.dedicationFile ? 1 : 0);
                          
                          return (
                            <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:border-indigo-200 cursor-pointer group">
                              <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                              <p className="text-sm text-slate-500 mb-3">מאת: {task.author}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {filesCount > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md"><Paperclip className="w-3 h-3" />{filesCount} קבצים</span>}
                                {totalExpenses > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-red-50 text-red-600 px-2 py-1 rounded-md"><DollarSign className="w-3 h-3" />₪{totalExpenses.toLocaleString()} הוצאות</span>}
                                {task.addedToInventory && <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md"><CheckCircle className="w-3 h-3" /> הועבר למלאי</span>}
                              </div>

                              <div className="flex justify-between items-center text-xs text-slate-400 mt-2 pt-3 border-t border-slate-50">
                                <span>יעד סיום:</span><span className="bg-slate-50 px-2 py-1 rounded-md text-slate-600">{task.date}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MARKETING AND PR VIEW */}
          {activeTab === 'marketing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in fade-in duration-300 w-full">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col w-full overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-2"><Megaphone className="w-5 h-5 text-indigo-600" /> קמפיינים</h3>
                  {userRole === 'admin' && <button onClick={() => setIsAddCampaignModalOpen(true)} className="text-xs md:text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-4 h-4" /> הוסף</button>}
                </div>
                <div className="p-4 md:p-6 space-y-5 md:space-y-6">
                  {campaignsList.map(camp => (
                    <div key={camp.id} className="space-y-2 relative group">
                       <div className="flex justify-between items-center gap-2">
                           <div className="font-bold text-xs md:text-sm text-slate-700 truncate pr-6">{camp.name}</div>
                           <div className="text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 md:py-1 rounded shrink-0">החזר: {camp.roas}</div>
                           {userRole === 'admin' && <button onClick={() => { setEditingCampaign(camp); setIsEditCampaignModalOpen(true); }} className="absolute right-0 top-0 p-1 text-slate-300 hover:text-indigo-600 bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Edit className="w-4 h-4" /></button>}
                       </div>
                       <div className="flex justify-between text-[10px] md:text-xs text-slate-500">
                           <span>נוצל: ₪{Number(camp.spent).toLocaleString()}</span><span>מתוך ₪{Number(camp.budget).toLocaleString()}</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-1.5 md:h-2"><div className="bg-indigo-500 h-1.5 md:h-2 rounded-full" style={{ width: `${Number(camp.budget) > 0 ? Math.min(100, (Number(camp.spent)/Number(camp.budget))*100) : 0}%`}}></div></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col w-full overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2"><Share2 className="w-5 h-5 text-pink-500" /> עותקי סיקור ויח"צ</h3>
                  {userRole === 'admin' && <button onClick={() => setIsAddPrModalOpen(true)} className="text-xs md:text-sm font-medium text-pink-600 hover:text-pink-700 bg-pink-50 px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-4 h-4" /> חדש</button>}
                </div>
                <div className="p-0 flex-1 overflow-x-auto w-full">
                  <table className="w-full text-right text-sm min-w-[350px]">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 md:py-3 px-3 md:px-4 font-medium text-xs md:text-sm">נמען</th>
                        <th className="py-2.5 md:py-3 px-3 md:px-4 font-medium text-xs md:text-sm">ספר נשלח</th>
                        <th className="py-2.5 md:py-3 px-3 md:px-4 font-medium text-center text-xs md:text-sm">סטטוס</th>
                        {userRole === 'admin' && <th className="py-2.5 md:py-3 px-2 md:px-4 font-medium text-center text-xs md:text-sm">ערוך</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prCopies.map(pr => (
                        <tr key={pr.id} className="hover:bg-slate-50">
                          <td className="py-2.5 md:py-3 px-3 md:px-4 font-medium text-slate-700 text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{pr.recipient}</td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 text-slate-500 text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{pr.book}</td>
                          <td className="py-2.5 md:py-3 px-3 md:px-4 text-center">
                            <span className={`inline-flex px-1.5 md:px-2 py-0.5 md:py-1 rounded-md text-[9px] md:text-[10px] lg:text-xs font-medium whitespace-nowrap ${pr.status === 'פורסמה ביקורת' ? 'bg-emerald-100 text-emerald-700' : pr.status === 'נמסר ליעד' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{pr.status}</span>
                          </td>
                          {userRole === 'admin' && (
                            <td className="py-2.5 md:py-3 px-2 md:px-4 text-center">
                              <button onClick={() => { setEditingPr(pr); setIsEditPrModalOpen(true); }} className="text-slate-400 hover:text-indigo-600 p-1 md:p-1.5"><Edit className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS AND AUTOMATION VIEW */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">אינטגרציות ומערכות</h3>
                  <p className="text-slate-500 text-xs md:text-sm mt-1">חיבור אוטומטי למערכות הפקת חשבוניות וחנויות</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {integrations.map((int) => (
                  <div key={int.id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center text-lg md:text-xl font-bold">{int.logo}</div>
                      <div className="flex flex-col items-end gap-1.5">
                        <button onClick={() => handleToggleIntegration(int.id)} disabled={userRole !== 'admin'} className={`w-10 md:w-12 h-5 md:h-6 rounded-full transition-colors relative focus:outline-none ${int.connected ? 'bg-emerald-500' : 'bg-slate-300'} ${userRole !== 'admin' && 'opacity-70 cursor-not-allowed'}`}>
                          <span className={`absolute top-0.5 md:top-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm ${int.connected ? 'left-1' : 'right-1'}`} />
                        </button>
                        <span className={`text-[10px] md:text-xs font-medium ${int.connected ? 'text-emerald-600' : 'text-slate-400'}`}>{int.connected ? 'מחובר' : 'מנותק'}</span>
                      </div>
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-slate-800">{int.name}</h4>
                    <p className="text-xs md:text-sm text-slate-500 mb-6">{int.type}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <div className="text-[10px] md:text-xs text-slate-400">סנכרון אחרון:<br/><span className="text-slate-600 font-medium">{int.lastSync}</span></div>
                      <button onClick={() => handleSync(int.id)} disabled={!int.connected || isSyncing === int.id || userRole !== 'admin'} className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${!int.connected || userRole !== 'admin' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}><RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isSyncing === int.id ? 'animate-spin' : ''}`} /> סנכרן</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTES AND TASKS VIEW */}
          {activeTab === 'notes' && (
            <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
              <div className="flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">פתקים ומשימות</h3>
                  <p className="text-slate-500 text-xs md:text-sm mt-1">לוח אישי לכתיבת הערות, רעיונות או משימות מהירות</p>
                </div>
              </div>

              {/* Add Note Form */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <form onSubmit={handleAddNote} className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">תוכן הפתק</label>
                    <textarea 
                      required
                      value={newNote.text}
                      onChange={(e) => setNewNote({...newNote, text: e.target.value})}
                      placeholder="הקלד כאן..." 
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-16"
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">צבע</label>
                      <div className="flex gap-2">
                        {['bg-yellow-100', 'bg-green-100', 'bg-pink-100', 'bg-blue-100'].map(color => (
                          <button 
                            key={color} 
                            type="button" 
                            onClick={() => setNewNote({...newNote, color})}
                            className={`w-8 h-8 rounded-full ${color} border-2 ${newNote.color === color ? 'border-slate-500 scale-110' : 'border-transparent'} transition-all`}
                          />
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 h-[42px] self-end">
                      <Plus className="w-4 h-4" /> הוסף פתק
                    </button>
                  </div>
                </form>
              </div>

              {/* Notes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10 overflow-y-auto">
                {notesList.map((note) => (
                  <div key={note.id} className={`${note.color} p-4 rounded-xl shadow-sm border border-black/5 hover:shadow-md transition-all flex flex-col min-h-[140px] group relative`}>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-2 left-2 p-1.5 bg-white/60 hover:bg-red-500 hover:text-white text-slate-700 rounded-md md:opacity-0 md:group-hover:opacity-100 transition-all shadow-sm md:shadow-none"
                      title="מחק פתק"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-slate-800 text-sm whitespace-pre-wrap flex-1 mt-3 leading-relaxed">{note.text}</p>
                    <div className="text-[10px] text-slate-500 mt-4 text-left border-t border-black/5 pt-2">
                      {note.date}
                    </div>
                  </div>
                ))}
                
                {notesList.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
                    <StickyNote className="w-16 h-16 mb-4 opacity-50" />
                    <p>אין לך פתקים עדיין. אפשר להתחיל לכתוב למעלה!</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      {/* --- MODALS --- */}

      {/* חלון צפייה במלאי ספק */}
      {selectedSupplierForStock && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-600" /> מלאי אצל: {selectedSupplierForStock.name}</h3>
                <p className="text-sm text-slate-500">{selectedSupplierForStock.type}</p>
              </div>
              <button onClick={() => setSelectedSupplierForStock(null)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-md shadow-sm border border-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {getSupplierStock(selectedSupplierForStock.name).length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex justify-between items-center text-sm">
                    <span className="font-medium text-indigo-900">סה"כ עותקים אצל הספק:</span>
                    <span className="font-bold text-indigo-700 text-base">
                      {getSupplierStock(selectedSupplierForStock.name).reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()} עותקים
                    </span>
                  </div>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 font-medium">שם הספר</th>
                          <th className="py-3 px-4 font-medium">מחבר</th>
                          <th className="py-3 px-4 font-medium text-center">כמות במלאי</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {getSupplierStock(selectedSupplierForStock.name).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-medium text-slate-700">{item.title}</td>
                            <td className="py-3 px-4 text-slate-600 text-sm">{item.author}</td>
                            <td className="py-3 px-4 font-bold text-indigo-600 text-center">{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">אין כרגע מלאי המשויך לספק זה במערכת.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Supplier History Modal */}
      {isSupplierHistoryModalOpen && selectedSupplierForHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-indigo-600" /> היסטוריית פעולות</h3>
                <p className="text-sm text-slate-500">עבור הספק/רשת: {selectedSupplierForHistory.name}</p>
              </div>
              <button onClick={() => setIsSupplierHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-md shadow-sm border border-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50/50">
              {supplierLogs.filter(log => log.supplierName === selectedSupplierForHistory.name).length > 0 ? (
                <div className="space-y-4">
                  {supplierLogs.filter(log => log.supplierName === selectedSupplierForHistory.name)
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .map((log, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-3 relative">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Clock className="w-4 h-4" /></div>
                          <div>
                            <p className="font-bold text-slate-700 text-sm">{log.action}</p>
                            <p className="text-[10px] text-slate-400">{log.date}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-indigo-600">₪{Number(log.totalAmount).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200/60 leading-relaxed shadow-sm">
                        {log.details}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-1">
                        <UserCog className="w-3.5 h-3.5" /> בוצע ע"י: <span className="font-semibold text-slate-700">{log.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">אין היסטוריית פעולות לספק זה במערכת עדיין.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isUserManageModalOpen && username === 'admin' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2"><UserCog className="w-5 h-5 text-indigo-600" /> ניהול משתמשים והרשאות</h3>
              <button onClick={() => setIsUserManageModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-6">
              
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-700 mb-3 border-b border-slate-100 pb-2">משתמשים פעילים</h4>
                <div className="space-y-2">
                  {usersList.map((u, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex justify-between items-center">
                      <div><div className="font-bold text-sm text-slate-800">{u.name}</div><div className="text-xs text-slate-500 font-mono">@{u.username}</div></div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-1 rounded font-medium ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>{u.role === 'admin' ? 'מנהל' : 'צופה'}</span>
                        <button onClick={() => handleRemoveUser(u.username)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-sm text-indigo-900 mb-3 flex items-center gap-2"><UserPlus className="w-4 h-4" /> יצירת משתמש חדש</h4>
                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div><label className="block text-xs font-medium text-slate-700 mb-1">שם מלא</label><input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full p-2 border rounded-lg bg-white text-sm" placeholder="למשל: דנה לוי" /></div>
                  <div><label className="block text-xs font-medium text-slate-700 mb-1">שם משתמש (באנגלית)</label><input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full p-2 border rounded-lg bg-white text-sm" dir="ltr" /></div>
                  <div><label className="block text-xs font-medium text-slate-700 mb-1">סיסמה</label><input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full p-2 border rounded-lg bg-white text-sm" dir="ltr" /></div>
                  <div><label className="block text-xs font-medium text-slate-700 mb-1">אימייל (לשליחת פרטים)</label><input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full p-2 border rounded-lg bg-white text-sm" dir="ltr" placeholder="דוא״ל הנמען" /></div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">הרשאה</label>
                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full p-2 border rounded-lg bg-white text-sm">
                      <option value="viewer">צופה (קריאה בלבד)</option>
                      <option value="admin">מנהל מערכת</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium mt-2 flex justify-center items-center gap-2">
                    <Send className="w-4 h-4" /> צור משתמש ושלח למייל
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {isSupplierInvoiceModalOpen && invoiceSupplier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2"><Receipt className="w-5 h-5 text-indigo-600" /> הפקת קבלה / הזמנה</h3>
                <p className="text-sm text-slate-500">עבור הספק/רשת: <span className="font-bold text-slate-700">{invoiceSupplier.name}</span></p>
              </div>
              <button onClick={() => setIsSupplierInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-end mb-3">
                <h4 className="font-bold text-sm text-slate-700">פירוט ספרים בהזמנה</h4>
                <button type="button" onClick={addInvoiceItemRow} className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> הוסף שורה</button>
              </div>

              <div className="space-y-2.5 mb-5">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <select
                      value={item.bookId}
                      onChange={(e) => handleInvoiceItemChange(idx, 'bookId', e.target.value)}
                      className="w-full sm:flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- בחר ספר --</option>
                      {inventoryList.map(book => (
                        <option key={book.id} value={book.id}>{book.title} (במחסן: {book.publisherStock})</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">כמות:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.amount}
                          onChange={(e) => handleInvoiceItemChange(idx, 'amount', e.target.value)}
                          className="w-16 p-2 border border-slate-200 rounded-lg text-sm bg-white text-center"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">₪ ליח':</span>
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleInvoiceItemChange(idx, 'price', e.target.value)}
                          className="w-20 p-2 border border-slate-200 rounded-lg text-sm bg-white text-center"
                          dir="ltr"
                        />
                      </div>
                      <span className="text-xs font-bold text-indigo-700 min-w-[55px] text-left">
                        ₪{(item.amount * item.price).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeInvoiceItemRow(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="הסר שורה"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex justify-between items-center mb-4">
                <span className="font-bold text-emerald-900 text-sm md:text-base">סה"כ הזמנה לתשלום (לפי מחירי ספק):</span>
                <span className="text-xl md:text-2xl font-bold text-emerald-600">₪{invoiceItems.reduce((acc, item) => acc + (item.amount * item.price), 0).toLocaleString()}</span>
              </div>

              <label className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-6 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deductFromWarehouse}
                  onChange={(e) => setDeductFromWarehouse(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-xs md:text-sm font-medium text-slate-700">
                  הפחת את הכמויות האלו אוטומטית גם מ"מחסן ראשי" (המלאי יעבור למלאי הספק)
                </span>
              </label>

              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-2.5">
                <h4 className="font-bold text-sm text-blue-900">אישור הזמנה, עדכון מלאי ושליחה</h4>
                <p className="text-xs text-slate-600">לחיצה על אחד מכפתורי העדכון תעדכן מיד את המלאי תחת "צפה במלאי" של <strong>{invoiceSupplier.name}</strong> ותתעד בהיסטוריה.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleProcessSupplierOrder('whatsapp')}
                    disabled={invoiceItems.length === 0 || !invoiceItems.some(i => i.bookId)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed py-3 rounded-xl font-medium text-sm flex justify-center items-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> עדכן מלאי ושלח בוואטסאפ
                  </button>
                  <button
                    onClick={() => handleProcessSupplierOrder('email')}
                    disabled={invoiceItems.length === 0 || !invoiceItems.some(i => i.bookId)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed py-3 rounded-xl font-medium text-sm flex justify-center items-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" /> עדכן מלאי ושלח למייל
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleProcessSupplierOrder('save_only')}
                    disabled={invoiceItems.length === 0 || !invoiceItems.some(i => i.bookId)}
                    className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl font-medium text-xs md:text-sm flex justify-center items-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> שמור ועדכן מלאי בלבד
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenPrintSupplierDelivery}
                    disabled={invoiceItems.length === 0 || !invoiceItems.some(i => i.bookId)}
                    className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl font-medium text-xs md:text-sm flex justify-center items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-indigo-600" /> הפק תעודת משלוח להדפסה
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Consignment (Sales & Returns) Modal --- */}
      {isConsignmentModalOpen && consignmentSupplier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2"><ArrowLeftRight className="w-5 h-5 text-emerald-600" /> התחשבנות קונסיגנציה</h3>
                <p className="text-xs text-slate-500">ספק: {consignmentSupplier.name}</p>
              </div>
              <button onClick={() => setIsConsignmentModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleConsignmentSubmit} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setConsignmentForm({ ...consignmentForm, type: 'sale' })} className={`py-2 rounded-lg text-sm font-medium transition-colors ${consignmentForm.type === 'sale' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'}`}>דיווח מכירה</button>
                <button type="button" onClick={() => setConsignmentForm({ ...consignmentForm, type: 'return' })} className={`py-2 rounded-lg text-sm font-medium transition-colors ${consignmentForm.type === 'return' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>החזרה למחסן</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">בחר ספר מהמלאי אצל הספק</label>
                <select required value={consignmentForm.bookId} onChange={(e) => setConsignmentForm({ ...consignmentForm, bookId: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm">
                  <option value="" disabled>-- בחר ספר --</option>
                  {inventoryList
                    .filter(b => (b.breakdown || []).some(item => item.supplier === consignmentSupplier.name && Number(item.amount) > 0))
                    .map(b => {
                      const supQty = b.breakdown.find(item => item.supplier === consignmentSupplier.name)?.amount || 0;
                      return <option key={b.id} value={b.id}>{b.title} (אצל הספק: {supQty})</option>;
                    })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">כמות עותקים</label>
                <input required type="number" min="1" value={consignmentForm.amount} onChange={(e) => setConsignmentForm({ ...consignmentForm, amount: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50" dir="ltr" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">הערה (אופציונלי)</label>
                <input type="text" value={consignmentForm.note} onChange={(e) => setConsignmentForm({ ...consignmentForm, note: e.target.value })} placeholder="למשל: דוח חודש נובמבר / מספר קבלה" className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm" />
              </div>

              <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white shadow-sm ${consignmentForm.type === 'sale' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {consignmentForm.type === 'sale' ? 'רשום מכירה והפחת ממלאי הספק' : 'אשר החזרה והחזר למחסן הראשי'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Gift / Donor Distribution Modal --- */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2"><Gift className="w-5 h-5 text-purple-600" /> חלוקה לתורמים / בוגרים / רבנים</h3>
              <button onClick={() => setIsGiftModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleGiftSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">בחר ספר (מופחת מהמחסן הראשי)</label>
                <select required value={giftForm.bookId} onChange={(e) => setGiftForm({ ...giftForm, bookId: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm">
                  <option value="" disabled>-- בחר ספר --</option>
                  {inventoryList.map(book => (
                    <option key={book.id} value={book.id}>{book.title} (במחסן: {book.publisherStock})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">כמות</label>
                  <input required type="number" min="1" value={giftForm.amount} onChange={(e) => setGiftForm({ ...giftForm, amount: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">סיווג</label>
                  <select value={giftForm.category} onChange={(e) => setGiftForm({ ...giftForm, category: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm">
                    <option>תורם</option>
                    <option>בוגר</option>
                    <option>רב / ר"מ</option>
                    <option>יח"צ / אחר</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם המקבל</label>
                <input required type="text" value={giftForm.recipient} onChange={(e) => setGiftForm({ ...giftForm, recipient: e.target.value })} placeholder="למשל: הרב פלוני / משפחת כהן" className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">הערה (אופציונלי)</label>
                <input type="text" value={giftForm.note} onChange={(e) => setGiftForm({ ...giftForm, note: e.target.value })} placeholder="אירוע / הקדשה / סיבה" className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-sm">אשר חלוקה ועדכן מלאי</button>
            </form>
          </div>
        </div>
      )}

      {/* --- Gift History Modal --- */}
      {isGiftHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2"><Gift className="w-5 h-5 text-purple-600" /> מעקב חלוקה לתורמים ומתנות</h3>
              <button onClick={() => setIsGiftHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              {giftLogs.length > 0 ? (
                <div className="space-y-3">
                  {[...giftLogs].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map((log, idx) => (
                    <div key={log.id || idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded">{log.category}</span>
                          <span className="font-bold text-slate-800 text-sm">{log.recipient}</span>
                        </div>
                        <p className="text-sm text-slate-700">{log.bookTitle} — <span className="font-bold text-indigo-700">{log.amount} עותקים</span></p>
                        {log.note && <p className="text-xs text-slate-500 mt-1">הערה: {log.note}</p>}
                        <p className="text-[11px] text-slate-400 mt-1">{log.date} | בוצע ע"י: {log.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Gift className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>עדיין לא נרשמו חלוקות מתנה במערכת.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Add Production Task Modal --- */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2"><PenTool className="w-5 h-5 text-indigo-600" /> פרויקט הפקה חדש</h3>
              <button onClick={() => setIsAddTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddTaskSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם הספר</label>
                <input required type="text" value={newTaskForm.title} onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">מחבר</label>
                <input required type="text" value={newTaskForm.author} onChange={(e) => setNewTaskForm({ ...newTaskForm, author: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תאריך יעד לסיום</label>
                <input type="text" placeholder="למשל: 01/05/2027" value={newTaskForm.date} onChange={(e) => setNewTaskForm({ ...newTaskForm, date: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-sm">צור פרויקט בלוח ההפקה</button>
            </form>
          </div>
        </div>
      )}

      {/* --- Print Preview Modal --- */}
      {printDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" dir="rtl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Printer className="w-5 h-5 text-indigo-600" /> תצוגה מקדימה להדפסה</h3>
              <button onClick={() => setPrintDoc(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">הוצאת ספרי ישיבת ירוחם</h2>
                  <p className="text-sm text-slate-500">{printDoc.docTitle}</p>
                </div>
                <div className="text-left text-xs text-slate-600">
                  <p className="font-bold">אסמכתא: {printDoc.orderId}</p>
                  <p>{printDoc.date}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm space-y-1">
                <p><span className="font-bold">לכבוד:</span> {printDoc.recipient}</p>
                {printDoc.address && <p><span className="font-bold">פרטים / כתובת:</span> {printDoc.address}</p>}
                {printDoc.shippingMethod && <p><span className="font-bold">משלוח / סוג:</span> {printDoc.shippingMethod}</p>}
              </div>
              <table className="w-full text-right border-collapse border border-slate-200 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-200 p-2">#</th>
                    <th className="border border-slate-200 p-2">שם הספר</th>
                    <th className="border border-slate-200 p-2 text-center">כמות</th>
                    {printDoc.type === 'supplier_delivery' && <th className="border border-slate-200 p-2 text-center">מחיר</th>}
                    {printDoc.type === 'supplier_delivery' && <th className="border border-slate-200 p-2 text-center">סה"כ</th>}
                  </tr>
                </thead>
                <tbody>
                  {printDoc.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-200 p-2">{idx + 1}</td>
                      <td className="border border-slate-200 p-2 font-medium">{item.name}</td>
                      <td className="border border-slate-200 p-2 text-center font-bold">{item.quantity}</td>
                      {printDoc.type === 'supplier_delivery' && <td className="border border-slate-200 p-2 text-center">₪{Number(item.price || 0).toLocaleString()}</td>}
                      {printDoc.type === 'supplier_delivery' && <td className="border border-slate-200 p-2 text-center font-bold">₪{Number(item.lineTotal || 0).toLocaleString()}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              {printDoc.total !== undefined && (
                <div className="text-left font-bold text-lg text-emerald-700">
                  סה"כ: ₪{Number(printDoc.total || 0).toLocaleString()}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={() => window.print()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Printer className="w-5 h-5" /> הדפס / שמור כ-PDF</button>
              <button onClick={() => setPrintDoc(null)} className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-medium">סגור</button>
            </div>
          </div>
        </div>
      )}

      {isEditStatsModalOpen && editingStats && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-base md:text-lg text-slate-800">עריכת נתוני דאשבורד ({dashboardPeriod === 'monthly' ? 'חודשי' : 'שנתי'})</h3>
              <button onClick={() => setIsEditStatsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto">
              <form onSubmit={handleEditStatsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm mb-1 text-slate-700">ספרים בהפקה</label><input type="text" value={editingStats.inProduction} onChange={e => setEditingStats({...editingStats, inProduction: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                  <div><label className="block text-sm mb-1 text-slate-700">ספרים שהושלמו</label><input type="text" value={editingStats.completed} onChange={e => setEditingStats({...editingStats, completed: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                  <div><label className="block text-sm mb-1 text-slate-700">עותקים שנמכרו</label><input type="text" value={editingStats.sold} onChange={e => setEditingStats({...editingStats, sold: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                  <div><label className="block text-sm mb-1 text-slate-700">רווח (₪)</label><input type="text" value={editingStats.revenue} onChange={e => setEditingStats({...editingStats, revenue: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                  <div><label className="block text-sm mb-1 text-slate-700">מגמת צמיחה</label><input type="text" value={editingStats.trend} onChange={e => setEditingStats({...editingStats, trend: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" dir="ltr" /></div>
                  <div><label className="block text-sm mb-1 text-slate-700">התראות מלאי</label><input type="text" value={editingStats.alerts} onChange={e => setEditingStats({...editingStats, alerts: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium mt-4">שמור שינויים</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-base md:text-lg text-slate-800">הוספת ספק / רשת</h3>
              <button onClick={() => setIsAddSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto">
              <form onSubmit={handleAddSupplier} className="space-y-4">
                {'contacts' in navigator && (
                   <button type="button" onClick={handleImportContact} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-lg border border-blue-200 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                     <Users className="w-4 h-4" /> ייבא מאנשי הקשר בטלפון
                   </button>
                )}
                <div><label className="block text-sm font-medium mb-1">שם הספק</label><input required type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-medium mb-1">סוג</label><select value={newSupplier.type} onChange={e => setNewSupplier({...newSupplier, type: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50"><option>רשת קמעונאית</option><option>הפצה</option><option>מחסן לוגיסטי</option><option>בית דפוס</option></select></div>
                <div><label className="block text-sm font-medium mb-1">סטטוס</label><select value={newSupplier.status} onChange={e => setNewSupplier({...newSupplier, status: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50"><option>פעיל - יש הסכם</option><option>ללא הסכם מכירה</option><option>ממתין לספרים</option><option>אין שיתוף פעולה</option></select></div>
                <div><label className="block text-sm font-medium mb-1">איש קשר</label><input required type="text" value={newSupplier.contact} onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-medium mb-1">טלפון</label><input required type="text" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" dir="ltr" /></div>
                <div><label className="block text-sm font-medium mb-1">אימייל</label><input required type="email" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" dir="ltr" /></div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium mt-4">הוסף ספק למערכת</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditSupplierModalOpen && editingSupplier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-base md:text-lg text-slate-800">עריכת ספק: {editingSupplier.name}</h3>
              <button onClick={() => setIsEditSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto">
              <form onSubmit={handleEditSupplierSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">שם</label><input required type="text" value={editingSupplier.name} onChange={e => setEditingSupplier({...editingSupplier, name: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-medium mb-1">סוג</label><select value={editingSupplier.type} onChange={e => setEditingSupplier({...editingSupplier, type: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50"><option>רשת קמעונאית</option><option>הפצה</option><option>מחסן לוגיסטי</option><option>בית דפוס</option></select></div>
                <div><label className="block text-sm font-medium mb-1">סטטוס</label><select value={editingSupplier.status} onChange={e => setEditingSupplier({...editingSupplier, status: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50"><option>פעיל - יש הסכם</option><option>ללא הסכם מכירה</option><option>ממתין לספרים</option><option>אין שיתוף פעולה</option></select></div>
                <div><label className="block text-sm font-medium mb-1">איש קשר</label><input required type="text" value={editingSupplier.contact} onChange={e => setEditingSupplier({...editingSupplier, contact: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" /></div>
                <div><label className="block text-sm font-medium mb-1">טלפון</label><input required type="text" value={editingSupplier.phone} onChange={e => setEditingSupplier({...editingSupplier, phone: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" dir="ltr" /></div>
                <div><label className="block text-sm font-medium mb-1">אימייל</label><input required type="email" value={editingSupplier.email} onChange={e => setEditingSupplier({...editingSupplier, email: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50" dir="ltr" /></div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium mt-4">שמור שינויים</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAddCampaignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base md:text-lg text-slate-800">הוספת קמפיין שיווק חדש</h3>
              <button onClick={() => setIsAddCampaignModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-5">
              <form onSubmit={handleAddCampaignSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">שם הקמפיין</label><input type="text" required value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" /></div>
                <div><label className="block text-sm font-medium mb-1">ספר מקודם</label><input type="text" required value={newCampaign.book} onChange={e => setNewCampaign({...newCampaign, book: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium mb-1">תקציב (₪)</label><input type="number" required value={newCampaign.budget} onChange={e => setNewCampaign({...newCampaign, budget: Number(e.target.value)})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" dir="ltr" /></div>
                  <div><label className="block text-sm font-medium mb-1">נוצל (₪)</label><input type="number" required value={newCampaign.spent} onChange={e => setNewCampaign({...newCampaign, spent: Number(e.target.value)})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" dir="ltr" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">החזר / תוצאה (ROAS)</label><input type="text" required value={newCampaign.roas} onChange={e => setNewCampaign({...newCampaign, roas: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" dir="ltr" placeholder="לדוגמה: 2.5x" /></div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 md:py-2.5 rounded-xl font-medium mt-2">הוסף קמפיין למערכת</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditCampaignModalOpen && editingCampaign && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base md:text-lg text-slate-800">עריכת קמפיין שיווק</h3>
              <button onClick={() => setIsEditCampaignModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-5">
              <form onSubmit={handleEditCampaignSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">שם הקמפיין</label><input type="text" required value={editingCampaign.name} onChange={e => setEditingCampaign({...editingCampaign, name: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" /></div>
                <div><label className="block text-sm font-medium mb-1">ספר מקודם</label><input type="text" required value={editingCampaign.book} onChange={e => setEditingCampaign({...editingCampaign, book: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium mb-1">תקציב (₪)</label><input type="number" required value={editingCampaign.budget} onChange={e => setEditingCampaign({...editingCampaign, budget: Number(e.target.value)})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" dir="ltr" /></div>
                  <div><label className="block text-sm font-medium mb-1">נוצל (₪)</label><input type="number" required value={editingCampaign.spent} onChange={e => setEditingCampaign({...editingCampaign, spent: Number(e.target.value)})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" dir="ltr" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">החזר / תוצאה (ROAS)</label><input type="text" required value={editingCampaign.roas} onChange={e => setEditingCampaign({...editingCampaign, roas: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" dir="ltr" /></div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 md:py-2.5 rounded-xl font-medium mt-2">שמור קמפיין</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAddPrModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base md:text-lg text-slate-800">הוספת עותק סיקור / יח"צ</h3>
              <button onClick={() => setIsAddPrModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-5">
              <form onSubmit={handleAddPrSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">נמען (משפיען/מבקר)</label><input type="text" required value={newPr.recipient} onChange={e => setNewPr({...newPr, recipient: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" placeholder="לדוגמה: מוסף ספרים הארץ" /></div>
                <div><label className="block text-sm font-medium mb-1">ספר נשלח</label><input type="text" required value={newPr.book} onChange={e => setNewPr({...newPr, book: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">סטטוס מול המשפיען</label>
                  <select value={newPr.status} onChange={e => setNewPr({...newPr, status: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option>במשלוח</option><option>נמסר ליעד</option><option>פורסמה ביקורת</option><option>לא פורסם</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 md:py-2.5 rounded-xl font-medium mt-2">שמור פעילות יח"צ</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditPrModalOpen && editingPr && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base md:text-lg text-slate-800">עדכון סטטוס יח"צ</h3>
              <button onClick={() => setIsEditPrModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-5">
              <form onSubmit={handleEditPrSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">נמען</label><input type="text" value={editingPr.recipient} onChange={e => setEditingPr({...editingPr, recipient: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                <div><label className="block text-sm font-medium mb-1">ספר נשלח</label><input type="text" value={editingPr.book} onChange={e => setEditingPr({...editingPr, book: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">סטטוס מול המשפיען</label>
                  <select value={editingPr.status} onChange={e => setEditingPr({...editingPr, status: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option>במשלוח</option><option>נמסר ליעד</option><option>פורסמה ביקורת</option><option>לא פורסם</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 md:py-2.5 rounded-xl font-medium mt-2">עדכן נתונים</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAddBookModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] md:max-h-[90vh]" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-base md:text-lg text-slate-800">הוספת ספר חדש למלאי</h3>
              <button onClick={() => setIsAddBookModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddBook} className="flex flex-col h-full overflow-hidden">
              <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-5 md:space-y-6">
                
                <div>
                  <h4 className="font-bold text-sm md:text-base text-slate-700 mb-2 md:mb-3 border-b border-slate-100 pb-2">פרטי הספר</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="col-span-1 md:col-span-2"><label className="block text-xs md:text-sm font-medium mb-1">שם הספר</label><input required type="text" value={newBookForm.title} onChange={e => setNewBookForm({...newBookForm, title: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50 focus:bg-white" /></div>
                    <div><label className="block text-xs md:text-sm font-medium mb-1">מחבר</label><input required type="text" value={newBookForm.author} onChange={e => setNewBookForm({...newBookForm, author: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                    <div><label className="block text-xs md:text-sm font-medium mb-1">דאנאק (ISBN)</label><input type="text" value={newBookForm.isbn} onChange={e => setNewBookForm({...newBookForm, isbn: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" dir="ltr" /></div>
                    <div><label className="block text-xs md:text-sm font-medium mb-1">רף התראה (להדפסה חוזרת)</label><input required type="number" min="0" value={newBookForm.threshold} onChange={e => setNewBookForm({...newBookForm, threshold: Number(e.target.value)})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                  </div>
                </div>

                <div className="bg-indigo-50/50 p-3 md:p-4 rounded-xl border border-indigo-100">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm md:text-base text-indigo-900">מעקב מהדורות</h4>
                    <button type="button" onClick={() => handleAddEdition(setNewBookForm, newBookForm)} className="text-[10px] md:text-xs bg-white border border-indigo-200 text-indigo-700 px-2 md:px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm whitespace-nowrap"><Plus className="w-3 h-3" /> מהדורה נוספת</button>
                  </div>
                  <div className="space-y-2">
                    {newBookForm.editions.map((ed, idx) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-white p-2 rounded-lg border border-indigo-100">
                        <input required type="text" placeholder="שם המהדורה" value={ed.name} onChange={(e) => handleUpdateEdition(setNewBookForm, newBookForm, idx, 'name', e.target.value)} className="w-full md:flex-1 p-2 md:p-1.5 border border-slate-200 rounded text-sm focus:border-indigo-500 outline-none" />
                        <div className="flex items-center gap-2 w-full md:w-auto justify-between">
                            <span className="text-xs md:text-sm text-slate-500">כמות מודפסת:</span>
                            <div className="flex items-center gap-2">
                                <input required type="number" min="0" value={ed.printRun || ''} onChange={(e) => handleUpdateEdition(setNewBookForm, newBookForm, idx, 'printRun', e.target.value)} className="w-20 md:w-24 p-2 md:p-1.5 border border-slate-200 rounded text-sm focus:border-indigo-500 outline-none" dir="ltr" />
                                <button type="button" onClick={() => handleRemoveEdition(setNewBookForm, newBookForm, idx)} className="text-slate-400 hover:text-red-500 p-1 bg-slate-50 rounded md:bg-transparent"><X className="w-4 h-4 md:w-5 md:h-5" /></button>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-3 md:p-4 rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-sm md:text-base text-emerald-900 mb-2 md:mb-3 border-b border-emerald-100 pb-2">חלוקת מלאי נוכחית (פיזי)</h4>
                  
                  <div className="mb-4">
                    <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">ספרים בתוך מחסן ההוצאה:</label>
                    <input required type="number" min="0" value={newBookForm.publisherStock} onChange={e => setNewBookForm({...newBookForm, publisherStock: Number(e.target.value)})} className="w-full md:w-1/3 p-2.5 md:p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-base md:text-lg font-bold text-emerald-700 bg-white" dir="ltr" />
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-xs md:text-sm font-bold text-slate-700">פיזור במחסנים ורשתות:</h5>
                    <button type="button" onClick={handleAddBookBreakdownRow} className="text-[10px] md:text-xs bg-white border border-emerald-200 text-emerald-700 px-2 md:px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 shadow-sm whitespace-nowrap"><Plus className="w-3 h-3" /> שייך לספק</button>
                  </div>
                  
                  {newBookForm.breakdown.length === 0 ? (
                    <p className="text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-200">לא נבחרו חנויות או ספקים.</p>
                  ) : (
                    <div className="space-y-2">
                      {newBookForm.breakdown.map((item, idx) => (
                        <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-white p-2 rounded-lg border border-emerald-100">
                          <select required value={item.supplier} onChange={(e) => handleUpdateBookBreakdownRow(idx, 'supplier', e.target.value)} className="w-full md:flex-1 p-2 border border-slate-200 rounded-md text-sm outline-none">
                            <option value="" disabled>-- בחר ספק מפיץ --</option>
                            {suppliersList.map(sup => <option key={sup.id} value={sup.name}>{sup.name}</option>)}
                          </select>
                          <div className="flex items-center gap-2 w-full md:w-auto justify-between">
                              <span className="text-xs md:text-sm text-slate-500">עותקים:</span>
                              <div className="flex items-center gap-2">
                                <input required type="number" min="0" value={item.amount || ''} onChange={(e) => handleUpdateBookBreakdownRow(idx, 'amount', e.target.value)} className="w-20 md:w-24 p-2 border border-slate-200 rounded-md text-sm outline-none" dir="ltr" />
                                <button type="button" onClick={() => handleRemoveBookBreakdownRow(idx)} className="text-slate-400 hover:text-red-500 p-1 bg-slate-50 rounded md:bg-transparent"><X className="w-4 h-4 md:w-5 md:h-5" /></button>
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm md:text-base text-slate-700 mb-2 md:mb-3 border-b border-slate-100 pb-2">מחירונים ועלויות (₪)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">עלות הפקה כוללת</label><input type="number" value={newBookForm.productionCost || ''} onChange={e => setNewBookForm({...newBookForm, productionCost: Number(e.target.value)})} className="w-full p-2.5 md:p-2 border border-rose-200 bg-rose-50 rounded-lg focus:ring-2 focus:ring-rose-500 font-semibold text-rose-700" placeholder="0" /></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">מחיר לצרכן</label><input type="number" value={newBookForm.prices.general} onChange={e => setNewBookForm({...newBookForm, prices: {...newBookForm.prices, general: Number(e.target.value)}})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">מחיר לחנויות</label><input type="number" value={newBookForm.prices.supplier} onChange={e => setNewBookForm({...newBookForm, prices: {...newBookForm.prices, supplier: Number(e.target.value)}})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                    <div><label className="block text-xs font-medium text-slate-600 mb-1">מחיר מיוחד</label><input type="number" value={newBookForm.prices.yeshiva} onChange={e => setNewBookForm({...newBookForm, prices: {...newBookForm.prices, yeshiva: Number(e.target.value)}})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 md:py-3.5 rounded-xl font-bold shadow-sm">שמור פריט מלאי חדש</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditBookModalOpen && editingBook && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] md:max-h-[90vh]" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-base md:text-lg text-slate-800">עריכת ספר: <span className="text-indigo-600 block md:inline text-sm md:text-lg truncate">{editingBook.title}</span></h3>
              <button onClick={() => {setIsEditBookModalOpen(false); setEditingBook(null);}} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleEditBookSubmit} className="flex flex-col h-full overflow-hidden">
              <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-5 md:space-y-6">
                
                <div>
                   <h4 className="font-bold text-sm md:text-base text-slate-700 mb-2 md:mb-3 border-b border-slate-100 pb-2">פרטי הספר</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                     <div className="col-span-1 md:col-span-2"><label className="block text-xs md:text-sm font-medium mb-1">שם הספר</label><input required type="text" value={editingBook.title} onChange={e => setEditingBook({...editingBook, title: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                     <div><label className="block text-xs md:text-sm font-medium mb-1">מחבר</label><input required type="text" value={editingBook.author} onChange={e => setEditingBook({...editingBook, author: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                     <div><label className="block text-xs md:text-sm font-medium mb-1">דאנאק</label><input type="text" value={editingBook.isbn} onChange={e => setEditingBook({...editingBook, isbn: e.target.value})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" dir="ltr" /></div>
                     <div><label className="block text-xs md:text-sm font-medium mb-1">רף התראה (הדפסה)</label><input required type="number" min="0" value={editingBook.threshold} onChange={e => setEditingBook({...editingBook, threshold: Number(e.target.value)})} className="w-full p-2.5 md:p-2 border rounded-lg bg-slate-50" /></div>
                   </div>
                </div>

                <div className="bg-indigo-50/50 p-3 md:p-4 rounded-xl border border-indigo-100">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm md:text-base text-indigo-900">מהדורות והדפסות</h4>
                    <button type="button" onClick={() => handleAddEdition(setEditingBook, editingBook)} className="text-[10px] md:text-xs bg-white border border-indigo-200 text-indigo-700 px-2 md:px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm whitespace-nowrap"><Plus className="w-3 h-3" /> הוסף</button>
                  </div>
                  <div className="space-y-2">
                    {editingBook.editions?.map((ed, idx) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-white p-2 rounded-lg border border-indigo-100">
                        <input required type="text" placeholder="שם מהדורה" value={ed.name} onChange={(e) => handleUpdateEdition(setEditingBook, editingBook, idx, 'name', e.target.value)} className="w-full md:flex-1 p-2 md:p-1.5 border border-slate-200 rounded text-sm outline-none" />
                        <div className="flex items-center gap-2 w-full md:w-auto justify-between">
                            <span className="text-xs md:text-sm text-slate-500">כמות:</span>
                            <div className="flex items-center gap-2">
                                <input required type="number" min="0" value={ed.printRun || ''} onChange={(e) => handleUpdateEdition(setEditingBook, editingBook, idx, 'printRun', e.target.value)} className="w-20 md:w-24 p-2 md:p-1.5 border border-slate-200 rounded text-sm outline-none" dir="ltr" />
                                <button type="button" onClick={() => handleRemoveEdition(setEditingBook, editingBook, idx)} className="text-slate-400 hover:text-red-500 p-1 bg-slate-50 rounded md:bg-transparent"><X className="w-4 h-4 md:w-5 md:h-5" /></button>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-3 md:p-4 rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-sm md:text-base text-emerald-900 mb-2 md:mb-3 border-b border-emerald-100 pb-2">חלוקת מלאי פיזי</h4>
                  
                  <div className="mb-4">
                    <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">כמות במחסן המרכזי:</label>
                    <input required type="number" min="0" value={editingBook.publisherStock} onChange={e => setEditingBook({...editingBook, publisherStock: Number(e.target.value)})} className="w-full md:w-1/3 p-2.5 md:p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-base md:text-lg font-bold text-emerald-700 bg-white" dir="ltr" />
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-xs md:text-sm font-bold text-slate-700">פיזור אצל ספקים:</h5>
                    <button type="button" onClick={handleEditBookBreakdownRow} className="text-[10px] md:text-xs bg-white border border-emerald-200 text-emerald-700 px-2 md:px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 shadow-sm whitespace-nowrap"><Plus className="w-3 h-3" /> הוסף ספק</button>
                  </div>
                  
                  <div className="space-y-2">
                    {editingBook.breakdown.map((item, idx) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-white p-2 rounded-lg border border-emerald-100">
                        <select required value={item.supplier} onChange={(e) => handleUpdateEditBookBreakdownRow(idx, 'supplier', e.target.value)} className="w-full md:flex-1 p-2 border border-slate-200 rounded-md text-sm outline-none">
                          <option value="" disabled>-- בחר ספק --</option>
                          {suppliersList.map(sup => <option key={sup.id} value={sup.name}>{sup.name}</option>)}
                        </select>
                        <div className="flex items-center gap-2 w-full md:w-auto justify-between">
                            <span className="text-xs md:text-sm text-slate-500">עותקים:</span>
                            <div className="flex items-center gap-2">
                                <input required type="number" min="0" value={item.amount || ''} onChange={(e) => handleUpdateEditBookBreakdownRow(idx, 'amount', e.target.value)} className="w-20 md:w-24 p-2 border border-slate-200 rounded-md text-sm outline-none" dir="ltr" />
                                <button type="button" onClick={() => handleRemoveEditBookBreakdownRow(idx)} className="text-slate-400 hover:text-red-500 p-1 bg-slate-50 rounded md:bg-transparent"><X className="w-4 h-4 md:w-5 md:h-5" /></button>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                   <h4 className="font-bold text-sm md:text-base text-slate-700 mb-2 md:mb-3 border-b border-slate-100 pb-2">מחירונים ועלויות (₪)</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     <div><label className="block text-xs font-medium text-slate-600 mb-1">עלות הפקה כוללת</label><input required type="number" min="0" value={editingBook.productionCost || 0} onChange={e => setEditingBook({...editingBook, productionCost: Number(e.target.value)})} className="w-full p-2.5 md:p-2 border border-rose-200 bg-rose-50 rounded-lg focus:ring-2 focus:ring-rose-500 font-semibold text-rose-700" dir="ltr" /></div>
                     <div><label className="block text-xs font-medium text-slate-600 mb-1">מחיר כללי</label><input required type="number" min="0" value={editingBook.prices.general} onChange={e => setEditingBook({...editingBook, prices: {...editingBook.prices, general: Number(e.target.value)}})} className="w-full p-2.5 md:p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" dir="ltr" /></div>
                     <div><label className="block text-xs font-medium text-slate-600 mb-1">מחיר ספק</label><input required type="number" min="0" value={editingBook.prices.supplier} onChange={e => setEditingBook({...editingBook, prices: {...editingBook.prices, supplier: Number(e.target.value)}})} className="w-full p-2.5 md:p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" dir="ltr" /></div>
                     <div><label className="block text-xs font-medium text-slate-600 mb-1">מחיר ישיבות</label><input required type="number" min="0" value={editingBook.prices.yeshiva} onChange={e => setEditingBook({...editingBook, prices: {...editingBook.prices, yeshiva: Number(e.target.value)}})} className="w-full p-2.5 md:p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" dir="ltr" /></div>
                   </div>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 md:py-3 rounded-xl font-bold shadow-sm">עדכן וסיים</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUpdateStockModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base md:text-lg text-slate-800">עדכון מלאי ידני</h3>
              <button onClick={() => setIsUpdateStockModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md shadow-sm border border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              <form onSubmit={handleManualStockUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">בחר ספר (מעדכן את מחסן ההוצאה)</label>
                  <select 
                    required 
                    value={stockUpdateForm.bookId} 
                    onChange={e => setStockUpdateForm({...stockUpdateForm, bookId: e.target.value})}
                    className="w-full p-2.5 md:p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-sm"
                  >
                    <option value="" disabled>-- בחר מספרייה --</option>
                    {inventoryList.map(book => (
                      <option key={book.id} value={book.id}>{book.title} (במחסן ההוצאה: {book.publisherStock})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">כמות לעדכון</label>
                  <input 
                    required 
                    type="number" 
                    value={stockUpdateForm.amount} 
                    onChange={e => setStockUpdateForm({...stockUpdateForm, amount: e.target.value})}
                    className="w-full p-2.5 md:p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    placeholder="למשל: 50 או -20"
                    dir="ltr"
                  />
                  <p className="text-xs text-slate-400 mt-1">הזן מספר חיובי להוספה למלאי, או שלילי להחסרה מ"מחסן ההוצאה".</p>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium mt-2 md:mt-4">
                  עדכן מלאי
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full h-[90vh] md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">{selectedTask.title}</h2>
                <p className="text-sm md:text-base text-slate-500">מאת: {selectedTask.author} | יעד לסיום: {selectedTask.date}</p>
                {userRole === 'admin' && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedTask.status === 'in_progress' ? (
                      <button onClick={() => handleUpdateTaskStatus(selectedTask, 'published')} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> סמן כ"ספר שיצא לאור"
                      </button>
                    ) : (
                      <button onClick={() => handleUpdateTaskStatus(selectedTask, 'in_progress')} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" /> החזר ל"בעבודה"
                      </button>
                    )}
                    {!selectedTask.addedToInventory ? (
                      <button onClick={() => handleTransferTaskToInventory(selectedTask)} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors">
                        <Package className="w-3.5 h-3.5" /> העבר אוטומטית למלאי (עם סך ההוצאות)
                      </button>
                    ) : (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> כבר הועבר למלאי
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {userRole === 'admin' && (
                  <button onClick={() => handleDeleteTask(selectedTask.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 bg-white p-2 rounded-md shadow-sm border border-slate-200 transition-colors" title="מחק פרויקט">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-md shadow-sm border border-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8">
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Paperclip className="w-5 h-5 text-indigo-600" /> קבצי מקור</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50">
                    <div className={`p-3 rounded-full ${selectedTask.coverFile ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><ImageIcon className="w-6 h-6" /></div>
                    <div><p className="font-medium text-sm text-slate-700">עיצוב כריכה</p>{selectedTask.coverFile ? <p className="text-xs text-emerald-600 mt-1 font-mono">{selectedTask.coverFile}</p> : <p className="text-xs text-slate-400 mt-1">לא הועלה</p>}</div>
                    {userRole === 'admin' && <button onClick={() => handleFileUpload('coverFile')} className="mt-2 text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 w-full justify-center"><Upload className="w-3 h-3" /> {selectedTask.coverFile ? 'החלף קובץ' : 'העלה קובץ'}</button>}
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50">
                    <div className={`p-3 rounded-full ${selectedTask.bookFile ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}><FileText className="w-6 h-6" /></div>
                    <div><p className="font-medium text-sm text-slate-700">קובץ הספר (פנים)</p>{selectedTask.bookFile ? <p className="text-xs text-blue-600 mt-1 font-mono">{selectedTask.bookFile}</p> : <p className="text-xs text-slate-400 mt-1">לא הועלה</p>}</div>
                    {userRole === 'admin' && <button onClick={() => handleFileUpload('bookFile')} className="mt-2 text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 w-full justify-center"><Upload className="w-3 h-3" /> {selectedTask.bookFile ? 'החלף קובץ' : 'העלה קובץ'}</button>}
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50">
                    <div className={`p-3 rounded-full ${selectedTask.dedicationFile ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}><Users className="w-6 h-6" /></div>
                    <div><p className="font-medium text-sm text-slate-700">רשימת הקדשות</p>{selectedTask.dedicationFile ? <p className="text-xs text-purple-600 mt-1 font-mono">{selectedTask.dedicationFile}</p> : <p className="text-xs text-slate-400 mt-1">לא הועלה</p>}</div>
                    {userRole === 'admin' && <button onClick={() => handleFileUpload('dedicationFile')} className="mt-2 text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 w-full justify-center"><Upload className="w-3 h-3" /> {selectedTask.dedicationFile ? 'החלף קובץ' : 'העלה קובץ'}</button>}
                  </div>
                </div>
              </section>

              <section>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Receipt className="w-5 h-5 text-indigo-600" /> מעקב הוצאות וחשבוניות (תמחור)</h3>
                  <div className="text-sm font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">סה"כ: ₪{(selectedTask.invoices || []).reduce((s, i) => s + (i.amount || 0), 0).toLocaleString()}</div>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">תיאור הוצאה</th>
                        <th className="py-2.5 px-4 font-medium">סכום</th>
                        <th className="py-2.5 px-4 font-medium text-center">אסמכתא</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedTask.invoices || []).map(inv => (
                        <tr key={inv.id}>
                          <td className="py-3 px-4 font-medium text-slate-700">{inv.desc}</td>
                          <td className="py-3 px-4 text-slate-600">₪{inv.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            {inv.receiptFile ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle className="w-3 h-3" /> הועלה</span> : userRole === 'admin' ? <button onClick={() => handleInvoiceReceiptUpload(inv.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline flex items-center justify-center gap-1 mx-auto"><Upload className="w-3 h-3" /> צרף קבלה</button> : <span className="text-xs text-slate-400">חסר</span>}
                          </td>
                        </tr>
                      ))}
                      {(!selectedTask.invoices || selectedTask.invoices.length === 0) && (
                        <tr><td colSpan="3" className="py-6 text-center text-slate-400">אין הוצאות רשומות לספר זה.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {userRole === 'admin' && (
                  <form onSubmit={handleAddInvoice} className="flex gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <input required type="text" placeholder="תיאור (למשל: עריכה לשונית)" value={newInvoice.desc} onChange={e => setNewInvoice({...newInvoice, desc: e.target.value})} className="flex-1 p-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input required type="number" placeholder="סכום (₪)" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} className="w-28 p-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">הוסף</button>
                  </form>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
// ... existing code ...
import { 
  LayoutDashboard, KanbanSquare, Package, BookOpen, AlertTriangle, CheckCircle, 
  TrendingUp, FileText, PenTool, Printer, Truck, Store, Users, Search, X, 
  Image as ImageIcon, Upload, Receipt, Plus, DollarSign, Paperclip, Mail, 
  Megaphone, Settings, RefreshCw, Share2, Download, Edit, Phone, Menu, Trash2, 
  Settings2, UserPlus, Send, UserCog, Info, StickyNote, History, Clock,
  ShoppingCart, MapPin, CheckSquare, MessageCircle, Gift, ArrowLeftRight,
  Percent, ArrowRight, Calculator, ClipboardList, Copy, CreditCard, Database,
  Minus, Wallet, BookMarked
} from 'lucide-react';

// ==========================================
// ... existing code ...
  // --- Print Document (Packing Slip / Delivery Note / Catalog) State ---
  const [printDoc, setPrintDoc] = useState(null);

  // --- Stage B: POS (Quick Stall Sales) State ---
  const [posSales, setPosSales] = useState([]);
  const [posCart, setPosCart] = useState([]);
  const [posPriceMode, setPosPriceMode] = useState('yeshiva'); // 'yeshiva' | 'general'
  const [posPaymentMethod, setPosPaymentMethod] = useState('מזומן');
  const [posBuyerNote, setPosBuyerNote] = useState('');
  const [posSearch, setPosSearch] = useState('');

  // --- Stage B: Warehouse Stocktake Mode State ---
  const [isWarehouseMode, setIsWarehouseMode] = useState(false);
  const [warehouseBoxSize, setWarehouseBoxSize] = useState(20);

  // --- Stage B: Break-Even Calculator State ---
  const [isBreakEvenModalOpen, setIsBreakEvenModalOpen] = useState(false);
  const [breakEvenForm, setBreakEvenForm] = useState({
    bookTitle: '',
    totalCost: 15000,
    printRun: 1000,
    sellPrice: 60
  });

  // --- Stage B: Digital Catalog Modal State ---
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogPriceTier, setCatalogPriceTier] = useState('general'); // 'general' | 'supplier' | 'yeshiva'
  const [catalogOnlyInStock, setCatalogOnlyInStock] = useState(false);

  // --- Stage B: Supplier Payment Partial Input State ---
  const [partialPayInputs, setPartialPayInputs] = useState({});

  // --- Marketing & PR States ---
// ... existing code ...
        unsubs.push(onSnapshot(getCollRef('supplier_logs'), snap => setSupplierLogs(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('gift_logs'), snap => setGiftLogs(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('pos_sales'), snap => setPosSales(snap.docs.map(d => ({id: d.id, ...d.data()}))), handleDbError));
        unsubs.push(onSnapshot(getCollRef('users'), snap => {
// ... existing code ...
    const logObj = {
      supplierName: invoiceSupplier.name,
      action: actionLabel,
      type: 'order',
      user: currentUserName || username,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now(),
      totalAmount: totalOrderPrice,
      paymentStatus: 'unpaid',
      paidAmount: 0,
      details: itemsText
    };
    if (db) addDoc(getCollRef('supplier_logs'), logObj);
    else setSupplierLogs([{ ...logObj, id: Date.now().toString() }, ...supplierLogs]);

    setIsSupplierInvoiceModalOpen(false);
  };

  // --- התחשבנות קונסיגנציה: דיווח מכירה או החזרת ספרים מספק ---
// ... existing code ...
    const logObj = {
      supplierName: consignmentSupplier.name,
      action: isReturn ? 'החזרת ספרים למחסן' : 'דיווח מכירת קונסיגנציה',
      type: consignmentForm.type,
      user: currentUserName || username,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now(),
      totalAmount,
      paymentStatus: isReturn ? 'paid' : 'unpaid',
      paidAmount: isReturn ? 0 : 0,
      details
    };

    if (db) addDoc(getCollRef('supplier_logs'), logObj);
    else setSupplierLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]);

    showToast(isReturn ? `${qty} עותקים הוחזרו למחסן הראשי!` : `נרשמה מכירה ע"ס ₪${totalAmount.toLocaleString()}!`, "success");
    setIsConsignmentModalOpen(false);
  };

  // --- Stage B (2): מעקב גבייה ותשלומים מספקים ---
  const getLogRemainingDebt = (log) => {
    if (log.type === 'return') return 0;
    const total = Number(log.totalAmount || 0);
    if (total <= 0) return 0;
    if (log.paymentStatus === 'paid') return 0;
    if (log.paymentStatus === 'partial') return Math.max(0, total - Number(log.paidAmount || 0));
    return total;
  };

  const getSupplierOpenDebt = (supplierName) => {
    return supplierLogs
      .filter(log => log.supplierName === supplierName)
      .reduce((sum, log) => sum + getLogRemainingDebt(log), 0);
  };

  const handleUpdateLogPayment = async (log, status, customPaidAmount = null) => {
    const total = Number(log.totalAmount || 0);
    let paidAmount = 0;
    if (status === 'paid') paidAmount = total;
    else if (status === 'partial') {
      const parsed = Number(customPaidAmount);
      if (isNaN(parsed) || parsed < 0 || parsed > total) {
        showToast(`אנא הזן סכום תקין בין 0 ל-₪${total.toLocaleString()}`, "warning");
        return;
      }
      paidAmount = parsed;
    }

    setSupplierLogs(prev => prev.map(l => l.id === log.id ? { ...l, paymentStatus: status, paidAmount } : l));
    if (db && log.id) {
      try {
        await updateDoc(getDocRef('supplier_logs', log.id), { paymentStatus: status, paidAmount });
      } catch (err) {
        console.error("שגיאה בעדכון סטטוס תשלום:", err);
      }
    }
    showToast(status === 'paid' ? "החיוב סומן כשולם!" : status === 'partial' ? `עודכן תשלום חלקי ע"ס ₪${paidAmount.toLocaleString()}` : "סטטוס עודכן לטרם שולם", "success");
  };

  const handleSendDebtWhatsAppReminder = (supplier) => {
    const debt = getSupplierOpenDebt(supplier.name);
    const waPhone = formatWhatsAppPhone(supplier.phone);
    if (!waPhone) {
      showToast("לספק זה לא מוגדר מספר טלפון תקין לוואטסאפ.", "error");
      return;
    }
    const msg = `שלום ${supplier.contact || supplier.name},\nמקווים ששלומכם טוב!\nפונים אליכם בעדינות מהוצאת ספרי ישיבת ירוחם לגבי יתרת תשלום פתוחה על הזמנות ספרים ע"ס ₪${debt.toLocaleString()}.\nנשמח לעדכון מתי צפויה העברה או אם נדרש מאיתנו מסמך נוסף.\nתודה רבה וכל טוב!`;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  // --- Stage B (1): קופה מהירה (POS) למכירות בישיבה / דוכן ---
  const getPosBookPrice = (book, mode = posPriceMode) => {
    if (mode === 'yeshiva') return Number(book.prices?.yeshiva || book.prices?.general || 0);
    return Number(book.prices?.general || 0);
  };

  const handleAddToPosCart = (book) => {
    setPosCart(prev => {
      const existing = prev.find(i => i.bookId === book.id);
      if (existing) {
        return prev.map(i => i.bookId === book.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { bookId: book.id, title: book.title, qty: 1 }];
    });
  };

  const handleUpdatePosCartQty = (bookId, delta) => {
    setPosCart(prev => prev
      .map(i => i.bookId === bookId ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    );
  };

  const handleCompletePosSale = async () => {
    if (posCart.length === 0) {
      showToast("הסל ריק. בחר ספרים למכירה.", "warning");
      return;
    }

    let totalAmount = 0;
    const saleItems = posCart.map(item => {
      const book = inventoryList.find(b => b.id === item.bookId);
      const unitPrice = book ? getPosBookPrice(book, posPriceMode) : 0;
      const lineTotal = unitPrice * item.qty;
      totalAmount += lineTotal;
      return { bookId: item.bookId, title: item.title, qty: item.qty, unitPrice, lineTotal };
    });

    // הפחתה אוטומטית מהמחסן הראשי
    const updatedBooks = [];
    setInventoryList(prev => prev.map(book => {
      const cartItem = posCart.find(c => c.bookId === book.id);
      if (!cartItem) return book;
      const newStock = Math.max(0, Number(book.publisherStock || 0) - cartItem.qty);
      const updated = { ...book, publisherStock: newStock, updatedAt: Date.now() };
      updatedBooks.push(updated);
      return updated;
    }));

    if (db) {
      try {
        await Promise.all(
          updatedBooks.map(b => updateDoc(getDocRef('inventory', b.id), { publisherStock: b.publisherStock, updatedAt: b.updatedAt }))
        );
      } catch (err) {
        console.error("שגיאה בעדכון מלאי לאחר מכירת קופה:", err);
      }
    }

    const saleObj = {
      items: saleItems,
      totalAmount,
      priceMode: posPriceMode === 'yeshiva' ? 'מחיר ישיבה' : 'מחיר צרכן',
      paymentMethod: posPaymentMethod,
      buyerNote: posBuyerNote.trim(),
      user: currentUserName || username,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now()
    };

    if (db) await addDoc(getCollRef('pos_sales'), saleObj);
    else setPosSales(prev => [{ ...saleObj, id: Date.now().toString() }, ...prev]);

    setPosCart([]);
    setPosBuyerNote('');
    showToast(`מכירה הושלמה ע"ס ₪${totalAmount.toLocaleString()} והמלאי עודכן!`, "success");
  };

  // --- Stage B (4): ספירת מלאי מהירה (מצב מחסן) ---
  const handleQuickWarehouseAdjust = async (book, delta) => {
    const newStock = Math.max(0, Number(book.publisherStock || 0) + delta);
    const updatedAt = Date.now();
    setInventoryList(prev => prev.map(b => b.id === book.id ? { ...b, publisherStock: newStock, updatedAt } : b));
    if (db) {
      try {
        await updateDoc(getDocRef('inventory', book.id), { publisherStock: newStock, updatedAt });
      } catch (err) {
        console.error("שגיאה בעדכון מלאי מהיר:", err);
      }
    }
  };

  // --- Stage B (3): גיבוי ושחזור מלא (JSON) ---
  const handleExportFullBackup = () => {
    const backupPayload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      data: {
        inventory: inventoryList,
        suppliers: suppliersList,
        tasks: tasksList,
        orders: ordersList,
        notes: notesList,
        supplierLogs,
        giftLogs,
        posSales,
        campaigns: campaignsList,
        prCopies,
        statsData
      }
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `yhy_publisher_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("קובץ גיבוי מלא (JSON) הורד למחשב בהצלחה!", "success");
  };

  const handleImportBackupFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const d = parsed.data || parsed;
        if (!Array.isArray(d.inventory)) {
          showToast("קובץ הגיבוי אינו תקין או אינו מכיל נתוני מלאי.", "error");
          return;
        }
        setConfirmDialog({
          title: "שחזור מגיבוי מלא",
          message: `נמצא גיבוי עם ${d.inventory.length} ספרים ו-${(d.suppliers || []).length} ספקים. האם לשחזר ולהחליף את הנתונים הנוכחיים במערכת?`,
          confirmText: "כן, שחזר נתונים",
          confirmStyle: "bg-indigo-600 hover:bg-indigo-700",
          icon: <Database className="w-6 h-6" />,
          iconStyle: "bg-indigo-100 text-indigo-600",
          onConfirm: async () => {
            if (d.inventory) setInventoryList(d.inventory);
            if (d.suppliers) setSuppliersList(d.suppliers);
            if (d.tasks) setTasksList(d.tasks);
            if (d.orders) setOrdersList(d.orders);
            if (d.notes) setNotesList(d.notes);
            if (d.supplierLogs) setSupplierLogs(d.supplierLogs);
            if (d.giftLogs) setGiftLogs(d.giftLogs);
            if (d.posSales) setPosSales(d.posSales);
            if (d.campaigns) setCampaignsList(d.campaigns);
            if (d.prCopies) setPrCopies(d.prCopies);
            if (d.statsData) setStatsData(d.statsData);
            if (db && d.statsData) {
              try { await setDoc(getDocRef('globals', 'stats'), d.statsData); } catch {}
            }
            showToast("הנתונים שוחזרו בהצלחה מקובץ הגיבוי!", "success");
          }
        });
      } catch (err) {
        console.error(err);
        showToast("שגיאה בקריאת קובץ הגיבוי. ודא שזהו קובץ JSON תקין.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Stage B (6): קטלוג דיגיטלי מעוצב (וואטסאפ / PDF) ---
  const getCatalogBooks = () => {
    return [...inventoryList]
      .filter(b => !catalogOnlyInStock || calculateTotalStock(b) > 0)
      .sort((a, b) => a.title.localeCompare(b.title, 'he'));
  };

  const getCatalogBookPrice = (book) => {
    if (catalogPriceTier === 'supplier') return Number(book.prices?.supplier || 0);
    if (catalogPriceTier === 'yeshiva') return Number(book.prices?.yeshiva || book.prices?.general || 0);
    return Number(book.prices?.general || 0);
  };

  const buildCatalogWhatsAppText = () => {
    const tierLabel = catalogPriceTier === 'supplier' ? 'מחירון ספקים וחנויות' : catalogPriceTier === 'yeshiva' ? 'מחירון מיוחד לתלמידי ובוגרי הישיבה' : 'מחירון לצרכן';
    const books = getCatalogBooks();
    const lines = books.map((b, i) => {
      const price = getCatalogBookPrice(b);
      return `${i + 1}. *${b.title}*${b.author ? ` (${b.author})` : ''} — ${price > 0 ? `₪${price}` : 'בתיאום'}`;
    });
    return `📚 *קטלוג הוצאת ספרי ישיבת ירוחם*\n_${tierLabel}_\n\n${lines.join('\n')}\n\nלהזמנות ופרטים נוספים ניתן להשיב להודעה זו.`;
  };

  const handleCopyCatalogText = () => {
    const text = buildCatalogWhatsAppText();
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast("הקטלוג הועתק! אפשר להדביק ישירות בוואטסאפ.", "success");
    } catch {
      showToast("לא ניתן להעתיק אוטומטית, אנא העתק ידנית מהתיבה.", "warning");
    }
    document.body.removeChild(textarea);
  };

  const handlePrintCatalogPdf = () => {
    const tierLabel = catalogPriceTier === 'supplier' ? 'מחירון ספקים וחנויות' : catalogPriceTier === 'yeshiva' ? 'מחירון תלמידי ובוגרי הישיבה' : 'מחירון לצרכן';
    const books = getCatalogBooks();
    setIsCatalogModalOpen(false);
    setPrintDoc({
      type: 'catalog',
      docTitle: `קטלוג ספרים רשמי — ${tierLabel}`,
      orderId: new Date().toLocaleDateString('he-IL'),
      date: new Date().toLocaleDateString('he-IL'),
      recipient: 'כלל הלקוחות, הבוגרים והחנויות',
      items: books.map(b => ({
        name: b.title,
        author: b.author || '',
        price: getCatalogBookPrice(b),
        inStock: calculateTotalStock(b) > 0
      }))
    });
  };

  // --- חלוקה לתורמים / בוגרים / רבנים (עותקי מתנה) ---
// ... existing code ...
  const navItems = [
    { id: 'dashboard', label: 'דאשבורד', icon: LayoutDashboard },
    { id: 'pos', label: 'קופה מהירה (דוכן)', icon: CreditCard },
    { id: 'orders', label: 'הזמנות חנות (אתר)', icon: ShoppingCart },
    { id: 'inventory', label: 'ניהול מלאי', icon: Package },
    { id: 'suppliers', label: 'ספקים והפצה', icon: Truck },
    { id: 'production', label: 'הפקת ספרים', icon: KanbanSquare },
    { id: 'marketing', label: 'שיווק ויח״צ', icon: Megaphone },
    { id: 'integrations', label: 'אוטומציה וגיבוי', icon: Settings },
    { id: 'notes', label: 'פתקים ומשימות', icon: StickyNote },
  ];
// ... existing code ...
  const liveStoreRevenue = ordersList.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const liveSupplierRevenue = supplierLogs.filter(l => l.type !== 'return').reduce((sum, l) => sum + Number(l.totalAmount || 0), 0);
  const livePosRevenue = posSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  const totalOpenSupplierDebt = supplierLogs.reduce((sum, l) => sum + getLogRemainingDebt(l), 0);
  
  const currentStats = statsData[dashboardPeriod] || initialStatsData.monthly;
// ... existing code ...
          <table className="w-full text-right border-collapse border border-slate-300 text-sm mb-6">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2">#</th>
                <th className="border border-slate-300 p-2">שם הספר</th>
                {printDoc.type === 'catalog' ? (
                  <>
                    <th className="border border-slate-300 p-2">מחבר</th>
                    <th className="border border-slate-300 p-2 text-center">מחיר</th>
                  </>
                ) : (
                  <>
                    <th className="border border-slate-300 p-2 text-center">כמות</th>
                    {printDoc.type === 'supplier_delivery' && <th className="border border-slate-300 p-2 text-center">מחיר יח'</th>}
                    {printDoc.type === 'supplier_delivery' && <th className="border border-slate-300 p-2 text-center">סה"כ</th>}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {printDoc.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-300 p-2">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 font-medium">{item.name}</td>
                  {printDoc.type === 'catalog' ? (
                    <>
                      <td className="border border-slate-300 p-2 text-slate-600">{item.author}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{item.price > 0 ? `₪${Number(item.price).toLocaleString()}` : 'בתיאום'}</td>
                    </>
                  ) : (
                    <>
                      <td className="border border-slate-300 p-2 text-center font-bold">{item.quantity}</td>
                      {printDoc.type === 'supplier_delivery' && <td className="border border-slate-300 p-2 text-center">₪{Number(item.price || 0).toLocaleString()}</td>}
                      {printDoc.type === 'supplier_delivery' && <td className="border border-slate-300 p-2 text-center font-bold">₪{Number(item.lineTotal || 0).toLocaleString()}</td>}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
// ... existing code ...
                    <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                      <p className="text-xs text-purple-700">הכנסות מתועדות (אתר + ספקים + דוכן)</p>
                      <p className="text-base md:text-lg font-bold text-purple-800 mt-1">₪{Math.round(liveStoreRevenue + liveSupplierRevenue + livePosRevenue).toLocaleString()}</p>
                      <p className="text-[11px] text-purple-500 mt-0.5">אתר: ₪{Math.round(liveStoreRevenue).toLocaleString()} | ספקים: ₪{Math.round(liveSupplierRevenue).toLocaleString()} | דוכן: ₪{Math.round(livePosRevenue).toLocaleString()}</p>
                    </div>
                  </div>
                  <div onClick={() => setActiveTab('suppliers')} className="cursor-pointer bg-rose-50/70 hover:bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex justify-between items-center transition-colors">
                    <div className="flex items-center gap-2.5">
                      <Wallet className="w-5 h-5 text-rose-600" />
                      <div>
                        <p className="text-xs font-bold text-rose-800">יתרת חוב פתוחה לגבייה מספקים</p>
                        <p className="text-[11px] text-rose-600">לחץ למעבר למסך הספקים ותזכורות גבייה</p>
                      </div>
                    </div>
                    <span className="text-lg md:text-xl font-bold text-rose-700">₪{Math.round(totalOpenSupplierDebt).toLocaleString()}</span>
                  </div>
                </div>
// ... existing code ...
          {/* POS (QUICK STALL SALES) VIEW */}
          {activeTab === 'pos' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-600" /> קופה מהירה למכירות בישיבה / דוכן</h3>
                  <p className="text-slate-500 text-xs md:text-sm mt-0.5">בחר ספרים להוספה לסל – המלאי יופחת אוטומטית מהמחסן הראשי</p>
                </div>
                <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 w-full sm:w-auto">
                  <button onClick={() => setPosPriceMode('yeshiva')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${posPriceMode === 'yeshiva' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}>מחירון ישיבה</button>
                  <button onClick={() => setPosPriceMode('general')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${posPriceMode === 'general' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}>מחירון צרכן</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Books Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      placeholder="חפש ספר מהיר בדוכן..."
                      className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {inventoryList
                      .filter(b => b.title.includes(posSearch) || (b.author || '').includes(posSearch))
                      .sort((a, b) => a.title.localeCompare(b.title, 'he'))
                      .map(book => {
                        const price = getPosBookPrice(book, posPriceMode);
                        const inCart = posCart.find(c => c.bookId === book.id)?.qty || 0;
                        return (
                          <button
                            key={book.id}
                            type="button"
                            onClick={() => handleAddToPosCart(book)}
                            className={`text-right p-4 rounded-2xl border transition-all active:scale-95 flex flex-col justify-between min-h-[115px] relative ${inCart > 0 ? 'bg-indigo-50 border-indigo-400 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'}`}
                          >
                            {inCart > 0 && (
                              <span className="absolute -top-2 -left-2 bg-indigo-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                                {inCart}
                              </span>
                            )}
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{book.title}</h4>
                              <p className="text-[11px] text-slate-400 mt-1">במחסן: {book.publisherStock}</p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                              <span className="text-base font-extrabold text-emerald-600">₪{price}</span>
                              <span className="text-[11px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md">+ הוסף</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Cart & Checkout */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-fit sticky top-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-indigo-600" /> סל קנייה נוכחי</h4>
                    {posCart.length > 0 && (
                      <button onClick={() => setPosCart([])} className="text-xs text-red-500 hover:underline">רוקן סל</button>
                    )}
                  </div>

                  {posCart.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm">
                      לחץ על הספרים מימין כדי להוסיף אותם למכירה
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {posCart.map(item => {
                        const book = inventoryList.find(b => b.id === item.bookId);
                        const unitPrice = book ? getPosBookPrice(book, posPriceMode) : 0;
                        return (
                          <div key={item.bookId} className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-slate-800 truncate">{item.title}</p>
                              <p className="text-[11px] text-slate-500">₪{unitPrice} ליח' · סה"כ ₪{(unitPrice * item.qty).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => handleUpdatePosCartQty(item.bookId, -1)} className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="font-bold text-sm w-6 text-center">{item.qty}</span>
                              <button onClick={() => handleUpdatePosCartQty(item.bookId, 1)} className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">אמצעי תשלום</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['מזומן', 'ביט', 'פייבוקס', 'אשראי'].map(m => (
                          <button key={m} type="button" onClick={() => setPosPaymentMethod(m)} className={`py-2 rounded-lg text-xs font-bold border transition-colors ${posPaymentMethod === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{m}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">שם קונה / הערה (אופציונלי)</label>
                      <input type="text" value={posBuyerNote} onChange={e => setPosBuyerNote(e.target.value)} placeholder="למשל: תלמיד שיעור ג' / כנס בוגרים" className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex justify-between items-center">
                      <span className="font-bold text-emerald-900 text-sm">סה"כ לתשלום:</span>
                      <span className="text-2xl font-extrabold text-emerald-700">
                        ₪{posCart.reduce((sum, item) => {
                          const b = inventoryList.find(x => x.id === item.bookId);
                          return sum + (b ? getPosBookPrice(b, posPriceMode) * item.qty : 0);
                        }, 0).toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={posCart.length === 0}
                      onClick={handleCompletePosSale}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3.5 rounded-xl font-bold text-base shadow-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" /> אשר מכירה והפחת ממלאי
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent POS Sales */}
              {posSales.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><History className="w-4 h-4 text-indigo-600" /> מכירות אחרונות בדוכן ({posSales.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...posSales].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 9).map((sale, idx) => (
                      <div key={sale.id || idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-emerald-700 text-sm">₪{Number(sale.totalAmount || 0).toLocaleString()}</span>
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">{sale.paymentMethod} · {sale.priceMode}</span>
                        </div>
                        <p className="text-slate-700">{(sale.items || []).map(i => `${i.title} (x${i.qty})`).join(', ')}</p>
                        {sale.buyerNote && <p className="text-slate-500">הערה: {sale.buyerNote}</p>}
                        <p className="text-[10px] text-slate-400">{sale.date} | {sale.user}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STORE ORDERS VIEW */}
// ... existing code ...
          {/* INVENTORY VIEW */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
              <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חיפוש לפי שם ספר, מחבר או דאנאק..."
                      className="w-full pr-9 pl-3 py-2 md:py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                    />
                  </div>
                  <select
                    value={inventorySort}
                    onChange={(e) => setInventorySort(e.target.value)}
                    className="p-2 md:p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm outline-none"
                  >
                    <option value="alphabetical">מיון: אלף-בית</option>
                    <option value="date">מיון: עודכן לאחרונה</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap gap-2 w-full lg:w-auto print:hidden">
                  <button
                    onClick={() => setIsWarehouseMode(!isWarehouseMode)}
                    className={`px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap font-bold transition-colors ${isWarehouseMode ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'}`}
                  >
                    <ClipboardList className="w-3.5 h-3.5 md:w-4 md:h-4" /> {isWarehouseMode ? 'חזרה לטבלה רגילה' : 'מצב ספירת מלאי (מחסן)'}
                  </button>
                  <button onClick={() => setIsCatalogModalOpen(true)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap font-medium"><BookMarked className="w-3.5 h-3.5 md:w-4 md:h-4" /> קטלוג לשליחה</button>
                  <button onClick={() => window.print()} className="bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap"><Printer className="w-3.5 h-3.5 md:w-4 md:h-4" /> הדפס</button>
                  <button onClick={handleExportCSV} className="bg-slate-100 hover:bg-slate-200 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap"><Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> ייצוא</button>
                  <button onClick={() => setIsGiftHistoryOpen(true)} className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap font-medium"><History className="w-3.5 h-3.5 md:w-4 md:h-4" /> מעקב מתנות ({giftLogs.length})</button>
                  {userRole === 'admin' && (
                    <>
                      <button onClick={() => setIsGiftModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap font-medium shadow-sm"><Gift className="w-3.5 h-3.5 md:w-4 md:h-4" /> חלוקה לתורמים</button>
                      <button onClick={handleImportYhyCatalog} className="bg-pink-100 hover:bg-pink-200 text-pink-700 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap transition-colors font-medium"><Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> ייבוא מהאתר</button>
                      <button onClick={() => setIsUpdateStockModalOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap"><RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" /> עדכון ידני</button>
                      <button onClick={() => setIsAddBookModalOpen(true)} className="col-span-2 sm:col-span-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 md:py-2.5 rounded-lg text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 shadow-sm whitespace-nowrap"><Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> הוסף ספר</button>
                    </>
                  )}
                </div>
              </div>

              {isWarehouseMode ? (
                /* --- מצב ספירת מלאי מהירה מהטלפון (מחסן) --- */
                <div className="p-4 md:p-6 bg-amber-50/30 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm md:text-base flex items-center gap-2"><ClipboardList className="w-4 h-4" /> מצב ספירת מלאי מהירה במחסן</h4>
                      <p className="text-xs text-amber-700">כל לחיצה מעדכנת מיד את כמות המלאי במחסן הראשי</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-amber-900">גודל ארגז:</span>
                      {[10, 20, 25, 30].map(size => (
                        <button key={size} onClick={() => setWarehouseBoxSize(size)} className={`px-2.5 py-1 rounded-lg font-bold border ${warehouseBoxSize === size ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-800 border-amber-200'}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sortedInventory.map(book => (
                      <div key={book.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h5 className="font-bold text-slate-800 text-base">{book.title}</h5>
                            <p className="text-xs text-slate-400">{book.author}</p>
                          </div>
                          <div className="text-left bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                            <span className="block text-[10px] text-indigo-500">במחסן הראשי</span>
                            <span className="text-xl font-extrabold text-indigo-700">{Number(book.publisherStock || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        {userRole === 'admin' && (
                          <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => handleQuickWarehouseAdjust(book, -warehouseBoxSize)} className="py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 active:scale-95">-{warehouseBoxSize} ארגז</button>
                            <button onClick={() => handleQuickWarehouseAdjust(book, -1)} className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base active:scale-95">-1</button>
                            <button onClick={() => handleQuickWarehouseAdjust(book, 1)} className="py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-base active:scale-95">+1</button>
                            <button onClick={() => handleQuickWarehouseAdjust(book, warehouseBoxSize)} className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs active:scale-95">+{warehouseBoxSize} ארגז</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* --- טבלת המלאי המלאה --- */
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-right text-sm min-w-[900px]">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">שם הספר / מחבר</th>
                        <th className="py-3.5 px-4 font-bold text-center">מחירים (צרכן / ספק / ישיבה)</th>
                        <th className="py-3.5 px-4 font-bold text-center text-rose-700">עלות הפקה</th>
                        <th className="py-3.5 px-4 font-bold text-center text-emerald-700">רווחיות לעותק</th>
                        <th className="py-3.5 px-4 font-bold text-center text-indigo-700">במחסן הראשי</th>
                        <th className="py-3.5 px-4 font-bold">פיזור אצל ספקים</th>
                        <th className="py-3.5 px-4 font-bold text-center">סה"כ מלאי</th>
                        {userRole === 'admin' && <th className="py-3.5 px-4 font-bold text-center print:hidden">פעולות</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedInventory.map((book) => {
                        const totalStock = calculateTotalStock(book);
                        const isLow = totalStock <= Number(book.threshold || 0);
                        const cost = Number(book.productionCost || 0);
                        const retailPrice = Number(book.prices?.general || 0);
                        const supPrice = Number(book.prices?.supplier || 0);
                        const retailProfit = retailPrice - cost;
                        const retailMargin = retailPrice > 0 ? Math.round((retailProfit / retailPrice) * 100) : 0;
                        const supProfit = supPrice - cost;

                        return (
                          <tr key={book.id} className={`hover:bg-slate-50/70 transition-colors ${isLow ? 'bg-red-50/20' : ''}`}>
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-800">{book.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{book.author}{book.isbn ? ` · ${book.isbn}` : ''}</div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="inline-flex flex-col gap-0.5 text-xs">
                                <span className="font-bold text-slate-700">צרכן: ₪{retailPrice}</span>
                                <span className="text-indigo-600 font-medium">ספק: ₪{supPrice}</span>
                                <span className="text-emerald-600">ישיבה: ₪{Number(book.prices?.yeshiva || 0)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center bg-rose-50/30 border-x border-slate-100">
                              <div className="font-bold text-rose-700 text-base">₪{cost.toLocaleString()}</div>
                            </td>
                            <td className="py-4 px-4 text-center bg-emerald-50/20">
                              <div className="text-xs space-y-0.5">
                                <div className="font-bold text-emerald-700">אתר: ₪{retailProfit.toFixed(1)} ({retailMargin}%)</div>
                                <div className="text-slate-500">ספק: ₪{supProfit.toFixed(1)}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center bg-indigo-50/30">
                              {userRole === 'admin' ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={book.publisherStock}
                                  onChange={async (e) => {
                                    const val = Math.max(0, Number(e.target.value));
                                    setInventoryList(prev => prev.map(b => b.id === book.id ? { ...b, publisherStock: val, updatedAt: Date.now() } : b));
                                    if (db) await updateDoc(getDocRef('inventory', book.id), { publisherStock: val, updatedAt: Date.now() });
                                  }}
                                  className="w-16 md:w-20 font-bold text-indigo-700 text-lg text-center bg-transparent border-b-2 border-transparent hover:border-indigo-300 focus:border-indigo-600 focus:bg-white outline-none transition-all"
                                  dir="ltr"
                                />
                              ) : (
                                <div className="font-bold text-indigo-700 text-lg">{Number(book.publisherStock).toLocaleString()}</div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {(book.breakdown || []).filter(i => Number(i.amount) > 0).length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {book.breakdown.filter(i => Number(i.amount) > 0).map((item, i) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs border border-slate-200">
                                      {item.supplier}: <strong>{item.amount}</strong>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">ללא פיזור</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-sm ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
                                {totalStock.toLocaleString()}
                              </span>
                            </td>
                            {userRole === 'admin' && (
                              <td className="py-4 px-4 text-center print:hidden">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button onClick={() => openEditBook(book)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="ערוך ספר"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteBook(book.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="מחק ספר"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUPPLIERS VIEW */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <select
                    value={suppliersSort}
                    onChange={(e) => setSuppliersSort(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-sm outline-none"
                  >
                    <option value="alphabetical">מיון ספקים: אלף-בית</option>
                    <option value="date">מיון ספקים: עודכן לאחרונה</option>
                  </select>
                  {totalOpenSupplierDebt > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                      <Wallet className="w-4 h-4" /> סה"כ חוב פתוח לגבייה: ₪{totalOpenSupplierDebt.toLocaleString()}
                    </div>
                  )}
                </div>
                {userRole === 'admin' && (
                  <button onClick={() => setIsAddSupplierModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> הוסף ספק / רשת חדשה
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {sortedSuppliers.map((supplier) => {
                  const openDebt = getSupplierOpenDebt(supplier.name);
                  return (
                    <div key={supplier.id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col relative group">
                      {userRole === 'admin' && (
                        <button onClick={() => { setEditingSupplier(supplier); setIsEditSupplierModalOpen(true); }} className="absolute top-4 left-4 p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <div className="flex justify-between items-start mb-4 pr-2">
                        <div>
                          <h4 className="font-bold text-base md:text-lg text-slate-800">{supplier.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md">{supplier.type}</span>
                            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(supplier.status)}`}>{supplier.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* יתרת חוב פתוחה לגבייה */}
                      {openDebt > 0 && (
                        <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex justify-between items-center gap-2">
                          <div>
                            <p className="text-[11px] font-medium text-rose-700">יתרת חוב פתוחה לגבייה:</p>
                            <p className="text-base font-extrabold text-rose-800">₪{openDebt.toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => handleSendDebtWhatsAppReminder(supplier)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm shrink-0"
                            title="שלח תזכורת מנומסת בוואטסאפ"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> תזכורת גבייה
                          </button>
                        </div>
                      )}
                      
                      <div className="space-y-3 pt-4 border-t border-slate-100 flex-1">
                        <div className="flex items-center gap-3 text-sm text-slate-600"><Users className="w-4 h-4 text-slate-400" /> {supplier.contact}</div>
                        <div className="flex items-center gap-3 text-sm text-slate-600" dir="ltr"><Phone className="w-4 h-4 text-slate-400" /> {supplier.phone}</div>
                        <div className="flex items-center gap-3 text-sm text-slate-600"><FileText className="w-4 h-4 text-slate-400" /> {supplier.email}</div>
                      </div>
                      <div className="pt-5 mt-4 border-t border-slate-50 flex gap-2 flex-col">
                        <button onClick={() => setSelectedSupplierForStock(supplier)} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm font-medium transition-colors"><Package className="w-4 h-4" /> צפה במלאי</button>
                        <button onClick={() => { setSelectedSupplierForHistory(supplier); setIsSupplierHistoryModalOpen(true); }} className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm font-medium transition-colors"><History className="w-4 h-4" /> היסטוריית פעולות וגבייה</button>
                        {userRole === 'admin' && (
                          <>
                            <button onClick={() => openConsignmentModal(supplier)} className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2.5 rounded-lg text-sm font-medium transition-colors"><ArrowLeftRight className="w-4 h-4" /> דיווח מכירה / החזרה</button>
                            <button onClick={() => openSupplierInvoice(supplier)} className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-lg text-sm font-medium transition-colors"><Receipt className="w-4 h-4" /> הפק הזמנה / קבלה</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PRODUCTION (KANBAN) VIEW */}
          {activeTab === 'production' && (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex flex-wrap justify-end gap-2 mb-4">
                <button
                  onClick={() => {
                    setBreakEvenForm({ bookTitle: '', totalCost: 15000, printRun: 1000, sellPrice: 60 });
                    setIsBreakEvenModalOpen(true);
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" /> מחשבון נקודת איזון (Break-Even)
                </button>
                {userRole === 'admin' && (
                  <button onClick={() => setIsAddTaskModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> הוסף פרויקט הפקה חדש
                  </button>
                )}
              </div>
// ... existing code ...
          {/* INTEGRATIONS AND AUTOMATION VIEW */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* --- גיבוי ושחזור מלא (JSON Backup) --- */}
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl shrink-0"><Database className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-800">גיבוי ושחזור מלא של כל נתוני המערכת (JSON)</h3>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">הורד קובץ גיבוי אחד הכולל מלאי, ספקים, הזמנות, גבייה, מתנות, קופה ופתקים — או שחזר מגיבוי קודם.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button onClick={handleExportFullBackup} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors">
                    <Download className="w-4 h-4" /> הורד גיבוי מלא
                  </button>
                  {userRole === 'admin' && (
                    <label className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200">
                      <Upload className="w-4 h-4" /> שחזר מגיבוי
                      <input type="file" accept=".json,application/json" onChange={handleImportBackupFile} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">אינטגרציות ומערכות</h3>
                  <p className="text-slate-500 text-xs md:text-sm mt-1">חיבור אוטומטי למערכות הפקת חשבוניות וחנויות</p>
                </div>
              </div>
// ... existing code ...
      {/* Supplier History Modal */}
      {isSupplierHistoryModalOpen && selectedSupplierForHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-indigo-600" /> היסטוריית פעולות וגבייה</h3>
                <p className="text-sm text-slate-500">עבור הספק/רשת: {selectedSupplierForHistory.name} | יתרה פתוחה: <strong className="text-rose-600">₪{getSupplierOpenDebt(selectedSupplierForHistory.name).toLocaleString()}</strong></p>
              </div>
              <button onClick={() => setIsSupplierHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-md shadow-sm border border-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[65vh] overflow-y-auto bg-slate-50/50">
              {supplierLogs.filter(log => log.supplierName === selectedSupplierForHistory.name).length > 0 ? (
                <div className="space-y-4">
                  {supplierLogs.filter(log => log.supplierName === selectedSupplierForHistory.name)
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .map((log, idx) => {
                      const isBillable = log.type !== 'return' && Number(log.totalAmount || 0) > 0;
                      const payStatus = log.paymentStatus || 'unpaid';
                      const remaining = getLogRemainingDebt(log);
                      const statusBadge = payStatus === 'paid'
                        ? { text: 'שולם', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
                        : payStatus === 'partial'
                        ? { text: `שולם חלקית (נותר ₪${remaining.toLocaleString()})`, cls: 'bg-amber-100 text-amber-800 border-amber-200' }
                        : { text: 'טרם שולם', cls: 'bg-rose-100 text-rose-700 border-rose-200' };

                      return (
                        <div key={log.id || idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-3 relative">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Clock className="w-4 h-4" /></div>
                              <div>
                                <p className="font-bold text-slate-700 text-sm">{log.action}</p>
                                <p className="text-[10px] text-slate-400">{log.date}</p>
                              </div>
                            </div>
                            <div className="text-left flex flex-col items-end gap-1">
                              <p className="text-sm font-bold text-indigo-600">₪{Number(log.totalAmount).toLocaleString()}</p>
                              {isBillable && (
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusBadge.cls}`}>{statusBadge.text}</span>
                              )}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200/60 leading-relaxed shadow-sm">
                            {log.details}
                          </div>

                          {/* כפתורי עדכון סטטוס גבייה */}
                          {isBillable && userRole === 'admin' && (
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap gap-1.5">
                                <button onClick={() => handleUpdateLogPayment(log, 'unpaid')} className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${payStatus === 'unpaid' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'}`}>טרם שולם</button>
                                <button onClick={() => handleUpdateLogPayment(log, 'paid')} className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${payStatus === 'paid' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}>סמן כשולם</button>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  max={log.totalAmount}
                                  placeholder="סכום חלקי..."
                                  value={partialPayInputs[log.id] ?? (payStatus === 'partial' ? log.paidAmount : '')}
                                  onChange={(e) => setPartialPayInputs(prev => ({ ...prev, [log.id]: e.target.value }))}
                                  className="w-24 p-1 text-xs border border-slate-300 rounded-md bg-white text-center"
                                  dir="ltr"
                                />
                                <button onClick={() => handleUpdateLogPayment(log, 'partial', partialPayInputs[log.id])} className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white">שולם חלקית</button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-1">
                            <UserCog className="w-3.5 h-3.5" /> בוצע ע"י: <span className="font-semibold text-slate-700">{log.user}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">אין היסטוריית פעולות לספק זה במערכת עדיין.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Stage B (5): Break-Even Calculator Modal --- */}
      {isBreakEvenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2"><Calculator className="w-5 h-5 text-amber-600" /> מחשבון נקודת איזון למהדורה (Break-Even)</h3>
                {breakEvenForm.bookTitle && <p className="text-xs text-slate-500 mt-0.5">עבור: {breakEvenForm.bookTitle}</p>}
              </div>
              <button onClick={() => setIsBreakEvenModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">עלות הפקה והדפסה כוללת (₪)</label>
                  <input type="number" min="0" value={breakEvenForm.totalCost} onChange={e => setBreakEvenForm({...breakEvenForm, totalCost: Number(e.target.value)})} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">כמות עותקים במהדורה</label>
                  <input type="number" min="1" value={breakEvenForm.printRun} onChange={e => setBreakEvenForm({...breakEvenForm, printRun: Math.max(1, Number(e.target.value))})} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">מחיר מכירה ממוצע לעותק (₪)</label>
                  <input type="number" min="1" value={breakEvenForm.sellPrice} onChange={e => setBreakEvenForm({...breakEvenForm, sellPrice: Math.max(1, Number(e.target.value))})} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800" dir="ltr" />
                </div>
              </div>

              {(() => {
                const totalCost = Number(breakEvenForm.totalCost || 0);
                const printRun = Math.max(1, Number(breakEvenForm.printRun || 1));
                const sellPrice = Math.max(1, Number(breakEvenForm.sellPrice || 1));
                const costPerCopy = totalCost / printRun;
                const breakEvenCopies = Math.ceil(totalCost / sellPrice);
                const breakEvenPct = Math.round((breakEvenCopies / printRun) * 100);
                const scenarios = [50, 75, 100].map(pct => {
                  const copiesSold = Math.round((printRun * pct) / 100);
                  const revenue = copiesSold * sellPrice;
                  const netProfit = revenue - totalCost;
                  return { pct, copiesSold, revenue, netProfit };
                });

                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-center">
                        <p className="text-xs text-indigo-700 font-medium">נקודת איזון (החזר השקעה)</p>
                        <p className="text-2xl font-extrabold text-indigo-800 mt-1">{breakEvenCopies.toLocaleString()} עותקים</p>
                        <p className="text-[11px] text-indigo-500 mt-0.5">{breakEvenPct}% מהמהדורה</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                        <p className="text-xs text-slate-600 font-medium">עלות הפקה לעותק בודד</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1">₪{costPerCopy.toFixed(2)}</p>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">רווח גולמי לעותק: ₪{(sellPrice - costPerCopy).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-xs border-b border-slate-200">
                          <tr>
                            <th className="p-3">תרחיש מכירה</th>
                            <th className="p-3 text-center">עותקים</th>
                            <th className="p-3 text-center">הכנסה</th>
                            <th className="p-3 text-center">רווח נקי</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {scenarios.map(s => (
                            <tr key={s.pct}>
                              <td className="p-3 font-bold text-slate-700">{s.pct}% מהמהדורה</td>
                              <td className="p-3 text-center text-slate-600">{s.copiesSold.toLocaleString()}</td>
                              <td className="p-3 text-center text-slate-700 font-medium">₪{s.revenue.toLocaleString()}</td>
                              <td className={`p-3 text-center font-extrabold ${s.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {s.netProfit >= 0 ? '+' : ''}₪{s.netProfit.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* --- Stage B (6): Digital Catalog Export Modal --- */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" dir="rtl">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-base md:text-lg text-slate-800 flex items-center gap-2"><BookMarked className="w-5 h-5 text-emerald-600" /> קטלוג דיגיטלי לשליחה (וואטסאפ / PDF)</h3>
              <button onClick={() => setIsCatalogModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-md border border-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'general', label: 'מחיר צרכן' },
                  { id: 'yeshiva', label: 'מחיר ישיבה' },
                  { id: 'supplier', label: 'מחיר ספקים' }
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setCatalogPriceTier(t.id)} className={`py-2 rounded-lg text-xs font-bold transition-colors ${catalogPriceTier === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>{t.label}</button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input type="checkbox" checked={catalogOnlyInStock} onChange={e => setCatalogOnlyInStock(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                הצג רק ספרים שנמצאים כרגע במלאי (מעל 0 עותקים)
              </label>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">תצוגה מקדימה להודעת וואטסאפ:</label>
                <textarea readOnly value={buildCatalogWhatsAppText()} rows="9" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button onClick={handleCopyCatalogText} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                  <Copy className="w-4 h-4" /> העתק קטלוג לוואטסאפ
                </button>
                <button onClick={handlePrintCatalogPdf} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                  <Printer className="w-4 h-4" /> הדפס / שמור קטלוג כ-PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUserManageModalOpen && username === 'admin' && (
// ... existing code ...
              <table className="w-full text-right border-collapse border border-slate-200 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-200 p-2">#</th>
                    <th className="border border-slate-200 p-2">שם הספר</th>
                    {printDoc.type === 'catalog' ? (
                      <>
                        <th className="border border-slate-200 p-2">מחבר</th>
                        <th className="border border-slate-200 p-2 text-center">מחיר</th>
                      </>
                    ) : (
                      <>
                        <th className="border border-slate-200 p-2 text-center">כמות</th>
                        {printDoc.type === 'supplier_delivery' && <th className="border border-slate-200 p-2 text-center">מחיר</th>}
                        {printDoc.type === 'supplier_delivery' && <th className="border border-slate-200 p-2 text-center">סה"כ</th>}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {printDoc.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-200 p-2">{idx + 1}</td>
                      <td className="border border-slate-200 p-2 font-medium">{item.name}</td>
                      {printDoc.type === 'catalog' ? (
                        <>
                          <td className="border border-slate-200 p-2 text-slate-600">{item.author}</td>
                          <td className="border border-slate-200 p-2 text-center font-bold">{item.price > 0 ? `₪${Number(item.price).toLocaleString()}` : 'בתיאום'}</td>
                        </>
                      ) : (
                        <>
                          <td className="border border-slate-200 p-2 text-center font-bold">{item.quantity}</td>
                          {printDoc.type === 'supplier_delivery' && <td className="border border-slate-200 p-2 text-center">₪{Number(item.price || 0).toLocaleString()}</td>}
                          {printDoc.type === 'supplier_delivery' && <td className="border border-slate-200 p-2 text-center font-bold">₪{Number(item.lineTotal || 0).toLocaleString()}</td>}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
// ... existing code ...
                    {!selectedTask.addedToInventory ? (
                      <button onClick={() => handleTransferTaskToInventory(selectedTask)} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors">
                        <Package className="w-3.5 h-3.5" /> העבר אוטומטית למלאי (עם סך ההוצאות)
                      </button>
                    ) : (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> כבר הועבר למלאי
                      </span>
                    )}
                    <button
                      onClick={() => {
                        const totalExpenses = (selectedTask.invoices || []).reduce((s, i) => s + Number(i.amount || 0), 0);
                        setBreakEvenForm({
                          bookTitle: selectedTask.title,
                          totalCost: totalExpenses > 0 ? totalExpenses : 15000,
                          printRun: 1000,
                          sellPrice: 60
                        });
                        setIsBreakEvenModalOpen(true);
                      }}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5" /> חשב נקודת איזון
                    </button>
                  </div>
                )}
              </div>
// ... existing code ...
