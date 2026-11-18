import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, setDoc, onSnapshot
} from 'firebase/firestore';
import {
  LayoutDashboard, KanbanSquare, Package, BookOpen, AlertTriangle, CheckCircle,
  TrendingUp, FileText, Printer, Truck, Search, X, Upload, Plus, DollarSign,
  Mail, Megaphone, Settings, RefreshCw, Download, Edit, Phone, Menu, Trash2,
  UserCog, StickyNote, History, Clock, ShoppingCart, MessageCircle, Gift,
  ArrowLeftRight, Calculator, ClipboardList, Copy, CreditCard, Database,
  Minus, Wallet, BookMarked, Scale, Award, Eye, Check, Send,
  LogIn, LogOut, Lock, Shield, KeyRound
} from 'lucide-react';

// ==========================================
// הגדרת Firebase (עם גיבוי אוטומטי ל-localStorage)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBACO6rv7KvdmWyPBPp1RzaeVUyQorQpVI",
  authDomain: "yhydeshboard.firebaseapp.com",
  projectId: "yhydeshboard",
  storageBucket: "yhydeshboard.firebasestorage.app",
  messagingSenderId: "498271801335",
  appId: "1:498271801335:web:1609f07e024ac66709e8f2"
};

const appId = 'publisher_erp_v1';
let db = null;
try {
  const fbApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(fbApp);
} catch (err) {
  console.warn('Firebase init skipped, using local mode:', err);
}

// ==========================================
// נתוני בסיס — מחירון ספרי ישיבת ירוחם
// ==========================================
const initialInventory = [
  { id: 'book_1', title: 'אותך אבקש - שערים לימי התשובה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 10.03, prices: { catalog: 98, general: 59, supplier: 29, yeshiva: 50 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_2', title: 'ונהר יוצא מעדן - חגי תשרי', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 14.04, prices: { catalog: 98, general: 60, supplier: 30, yeshiva: 50 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_3', title: 'ונהר יוצא מעדן - מועדי חורף', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 14.04, prices: { catalog: 98, general: 60, supplier: 30, yeshiva: 50 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_4', title: 'ונהר יוצא מעדן - חגי האביב', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 14.04, prices: { catalog: 98, general: 60, supplier: 30, yeshiva: 50 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_5', title: 'ונהר יוצא מעדן סט', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 20, publisherStock: 0, productionCost: 42.13, prices: { catalog: 0, general: 160, supplier: 90, yeshiva: 140 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_6', title: 'ונהר יוצא מעדן - אכילה ומצוותיה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 16.52, prices: { catalog: 98, general: 69, supplier: 32, yeshiva: 55 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_7', title: 'להשקות את הגן - סנהדרין', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 17.84, prices: { catalog: 108, general: 69, supplier: 30, yeshiva: 55 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_8', title: 'להשקות את הגן - סוכה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 12.50, prices: { catalog: 98, general: 59, supplier: 28, yeshiva: 48 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_9', title: 'שערים למשנתו של מניטו', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 12.66, prices: { catalog: 98, general: 83, supplier: 42, yeshiva: 70 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_10', title: 'והתהלכתי בתוככם א', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 0, prices: { catalog: 98, general: 65, supplier: 35, yeshiva: 55 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_11', title: 'והתהלכתי בתוככם ב', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 0, prices: { catalog: 98, general: 65, supplier: 35, yeshiva: 55 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_12', title: 'והתהלכתי בתוככם סט', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 20, publisherStock: 0, productionCost: 0, prices: { catalog: 0, general: 120, supplier: 68, yeshiva: 100 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_13', title: 'חוברת שובו אליי - הרב בלומנצווייג', author: 'הרב בלומנצווייג', isbn: '', threshold: 50, publisherStock: 0, productionCost: 0, prices: { catalog: 29, general: 29, supplier: 19, yeshiva: 25 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_14', title: 'חוברת כעץ שתול - תפילה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 50, publisherStock: 0, productionCost: 0, prices: { catalog: 20, general: 20, supplier: 16, yeshiva: 18 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_15', title: 'חוברת כעץ שתול - עיון', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 50, publisherStock: 0, productionCost: 0, prices: { catalog: 20, general: 20, supplier: 16, yeshiva: 18 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_16', title: 'חוברת כעץ שתול - אמונה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 50, publisherStock: 0, productionCost: 0, prices: { catalog: 20, general: 20, supplier: 16, yeshiva: 18 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_17', title: 'שמיטה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 0, prices: { catalog: 0, general: 0, supplier: 23, yeshiva: 23 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
];

const KANBAN_COLUMNS = [
  { id: 'planned', title: 'בתכנון', color: 'bg-slate-100 border-slate-200', badge: 'bg-slate-200 text-slate-700' },
  { id: 'editing', title: 'עריכה והגהה', color: 'bg-blue-50/70 border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  { id: 'design', title: 'עימוד ועיצוב', color: 'bg-purple-50/70 border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  { id: 'printing', title: 'בדפוס', color: 'bg-amber-50/70 border-amber-200', badge: 'bg-amber-100 text-amber-800' },
  { id: 'done', title: 'הושלם', color: 'bg-emerald-50/70 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
];

const initialUsers = [
  { id: 'user_admin', username: 'admin', password: '1234', name: 'מנהל ההוצאה', role: 'admin', createdAt: Date.now() }
];

const emptyBookForm = {
  title: '',
  author: 'הוצאת ישיבת ירוחם',
  isbn: '',
  threshold: 30,
  publisherStock: 0,
  productionCost: 0,
  prices: { catalog: 0, general: 0, supplier: 0, yeshiva: 0 },
  editions: [{ name: 'מהדורה 1', printRun: 0 }],
  breakdown: []
};

const emptySupplierForm = {
  name: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  notes: ''
};

const loadLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const formatWhatsAppPhone = (rawPhone) => {
  if (!rawPhone) return '';
  let digits = String(rawPhone).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '972' + digits.slice(1);
  if (digits.length < 9) return '';
  return digits;
};

export default function App() {
  // --- Navigation & Auth State ---
  const [activeTab, setActiveTab] = useState('inventory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // --- Users & Session State ---
  const [usersList, setUsersList] = useState(() => {
    const saved = loadLocal('yhy_erp_users', initialUsers);
    return Array.isArray(saved) && saved.length > 0 ? saved : initialUsers;
  });
  const [currentUser, setCurrentUser] = useState(() => loadLocal('yhy_erp_session', null));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [newUserForm, setNewUserForm] = useState({ name: '', username: '', password: '', role: 'viewer' });
  const [editingUser, setEditingUser] = useState(null);

  const userRole = currentUser?.role || 'viewer';
  const currentUserName = currentUser?.name || 'אורח';

  // --- Core Data States ---
  const [inventoryList, setInventoryList] = useState(() => loadLocal('yhy_erp_inventory', initialInventory));
  const [suppliersList, setSuppliersList] = useState(() => loadLocal('yhy_erp_suppliers', []));
  const [tasksList, setTasksList] = useState(() => loadLocal('yhy_erp_tasks', []));
  const [ordersList, setOrdersList] = useState(() => loadLocal('yhy_erp_orders', []));
  const [notesList, setNotesList] = useState(() => loadLocal('yhy_erp_notes', []));
  const [supplierLogs, setSupplierLogs] = useState(() => loadLocal('yhy_erp_supplier_logs', []));
  const [giftLogs, setGiftLogs] = useState(() => loadLocal('yhy_erp_gift_logs', []));
  const [posSales, setPosSales] = useState(() => loadLocal('yhy_erp_pos_sales', []));
  const [printQuotes, setPrintQuotes] = useState(() => loadLocal('yhy_erp_print_quotes', []));
  const [campaignsList, setCampaignsList] = useState(() => loadLocal('yhy_erp_campaigns', []));
  const [prCopies, setPrCopies] = useState(() => loadLocal('yhy_erp_pr_copies', []));

  // --- Toast & Confirm Dialog ---
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // --- Inventory & Gifts UI States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [inventorySort, setInventorySort] = useState('alphabetical');
  const [isWarehouseMode, setIsWarehouseMode] = useState(false);
  const [warehouseBoxSize, setWarehouseBoxSize] = useState(20);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [newBookForm, setNewBookForm] = useState(emptyBookForm);
  const [editingBook, setEditingBook] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isGiftHistoryOpen, setIsGiftHistoryOpen] = useState(false);
  const [giftForm, setGiftForm] = useState({ bookId: '', quantity: 1, recipient: '', category: 'תורם', notes: '' });

  // --- Suppliers, Orders & Consignment UI States ---
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierSort, setSupplierSort] = useState('alphabetical');
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
  const [viewingSupplierStock, setViewingSupplierStock] = useState(null);
  const [isSupplierInvoiceModalOpen, setIsSupplierInvoiceModalOpen] = useState(false);
  const [invoiceSupplier, setInvoiceSupplier] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([{ bookId: '', quantity: 10 }]);
  const [deductFromWarehouse, setDeductFromWarehouse] = useState(true);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);
  const [consignmentSupplier, setConsignmentSupplier] = useState(null);
  const [consignmentForm, setConsignmentForm] = useState({ type: 'sale', bookId: '', quantity: 1, unitPrice: 0, notes: '' });
  const [isSupplierHistoryModalOpen, setIsSupplierHistoryModalOpen] = useState(false);
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState(null);
  const [partialPayInputs, setPartialPayInputs] = useState({});

  // --- Orders & POS UI States ---
  const [ordersSubTab, setOrdersSubTab] = useState('pending');
  const [posPriceMode, setPosPriceMode] = useState('yeshiva');
  const [posSearch, setPosSearch] = useState('');
  const [posCart, setPosCart] = useState([]);
  const [posPaymentMethod, setPosPaymentMethod] = useState('מזומן');
  const [posBuyerNote, setPosBuyerNote] = useState('');

  // --- Production, Break-Even & Print Quotes UI States ---
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', author: '', status: 'planned', notes: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskInvoiceForm, setTaskInvoiceForm] = useState({ description: '', amount: '' });
  const [isBreakEvenModalOpen, setIsBreakEvenModalOpen] = useState(false);
  const [breakEvenForm, setBreakEvenForm] = useState({ bookTitle: '', totalCost: 15000, printRun: 1000, sellPrice: 60 });
  const [selectedQuoteProject, setSelectedQuoteProject] = useState('ALL');
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    projectTitle: '',
    printerName: '',
    copies: 1000,
    totalPrice: '',
    includesVat: true,
    pages: '',
    coverType: 'כריכה קשה',
    paperType: '',
    deliveryDays: '',
    notes: '',
    fileName: '',
    fileType: '',
    fileData: ''
  });
  const [previewQuoteDoc, setPreviewQuoteDoc] = useState(null);

  // --- Marketing, Notes, Catalog & Print UI States ---
  const [newCampaignForm, setNewCampaignForm] = useState({ name: '', budget: '', spent: '', channel: 'וואטסאפ / בוגרים' });
  const [newPrForm, setNewPrForm] = useState({ bookTitle: '', recipient: '', role: 'מבקר / עיתונאי' });
  const [newNoteText, setNewNoteText] = useState('');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogPriceTier, setCatalogPriceTier] = useState('general');
  const [catalogOnlyInStock, setCatalogOnlyInStock] = useState(false);
  const [printDoc, setPrintDoc] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev && prev.message === message ? null : prev));
    }, 3500);
  };

  // --- Firestore Helpers ---
  const getCollRef = (collName) => collection(db, 'erp', appId, collName);
  const getDocRef = (collName, docId) => doc(db, 'erp', appId, collName, docId);

  // --- Sync with Firebase (with safe fallback) ---
  useEffect(() => {
    if (!db) return;
    const handleDbError = (err) => {
      console.warn('Firestore listener warning:', err.message);
      setDbConnected(false);
    };
    const unsubs = [];
    try {
      unsubs.push(onSnapshot(getCollRef('inventory'), snap => {
        setDbConnected(true);
        if (!snap.empty) {
          setInventoryList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }, handleDbError));
      unsubs.push(onSnapshot(getCollRef('suppliers'), snap => setSuppliersList(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('tasks'), snap => setTasksList(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('orders'), snap => setOrdersList(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('notes'), snap => setNotesList(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('supplier_logs'), snap => setSupplierLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('gift_logs'), snap => setGiftLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('pos_sales'), snap => setPosSales(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('print_quotes'), snap => setPrintQuotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('campaigns'), snap => setCampaignsList(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('pr_copies'), snap => setPrCopies(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('users'), snap => {
        if (!snap.empty) {
          setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }, handleDbError));
    } catch (err) {
      handleDbError(err);
    }
    return () => unsubs.forEach(u => u && u());
  }, []);

  // --- Save Local Backup on every change ---
  useEffect(() => { try { localStorage.setItem('yhy_erp_users', JSON.stringify(usersList)); } catch {} }, [usersList]);
  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem('yhy_erp_session', JSON.stringify(currentUser));
      else localStorage.removeItem('yhy_erp_session');
    } catch {}
  }, [currentUser]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_inventory', JSON.stringify(inventoryList)); } catch {} }, [inventoryList]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_suppliers', JSON.stringify(suppliersList)); } catch {} }, [suppliersList]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_tasks', JSON.stringify(tasksList)); } catch {} }, [tasksList]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_orders', JSON.stringify(ordersList)); } catch {} }, [ordersList]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_notes', JSON.stringify(notesList)); } catch {} }, [notesList]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_supplier_logs', JSON.stringify(supplierLogs)); } catch {} }, [supplierLogs]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_gift_logs', JSON.stringify(giftLogs)); } catch {} }, [giftLogs]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_pos_sales', JSON.stringify(posSales)); } catch {} }, [posSales]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_print_quotes', JSON.stringify(printQuotes)); } catch {} }, [printQuotes]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_campaigns', JSON.stringify(campaignsList)); } catch {} }, [campaignsList]);
  useEffect(() => { try { localStorage.setItem('yhy_erp_pr_copies', JSON.stringify(prCopies)); } catch {} }, [prCopies]);

  // ==========================================
  // התחברות וניהול משתמשים
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();
    const uname = loginForm.username.trim().toLowerCase();
    const pwd = loginForm.password;
    const found = usersList.find(
      u => (u.username || '').trim().toLowerCase() === uname && String(u.password) === String(pwd)
    );
    if (!found) {
      setLoginError('שם משתמש או סיסמה שגויים. אנא נסה שנית.');
      return;
    }
    setCurrentUser({ id: found.id, username: found.username, name: found.name, role: found.role });
    setLoginForm({ username: '', password: '' });
    setLoginError('');
    setActiveTab('inventory');
    showToast(`שלום ${found.name}, התחברת בהצלחה!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMobileMenuOpen(false);
    setActiveTab('inventory');
    showToast('התנתקת מהמערכת.', 'info');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const uname = newUserForm.username.trim().toLowerCase();
    if (!newUserForm.name.trim() || !uname || !newUserForm.password) return;
    if (usersList.some(u => (u.username || '').trim().toLowerCase() === uname)) {
      showToast('שם המשתמש כבר קיים במערכת.', 'warning');
      return;
    }
    const userObj = {
      name: newUserForm.name.trim(),
      username: uname,
      password: newUserForm.password,
      role: newUserForm.role,
      createdAt: Date.now()
    };
    if (db && dbConnected) {
      try {
        await addDoc(getCollRef('users'), userObj);
      } catch {
        setUsersList(prev => [...prev, { ...userObj, id: 'user_' + Date.now() }]);
      }
    } else {
      setUsersList(prev => [...prev, { ...userObj, id: 'user_' + Date.now() }]);
    }
    setNewUserForm({ name: '', username: '', password: '', role: 'viewer' });
    showToast(`המשתמש "${userObj.name}" נוסף בהצלחה!`, 'success');
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name.trim() || !editingUser.username.trim()) return;
    const uname = editingUser.username.trim().toLowerCase();
    const duplicate = usersList.find(u => u.id !== editingUser.id && (u.username || '').trim().toLowerCase() === uname);
    if (duplicate) {
      showToast('שם משתמש זה כבר תפוס.', 'warning');
      return;
    }
    const updatedFields = {
      name: editingUser.name.trim(),
      username: uname,
      role: editingUser.role,
      ...(editingUser.newPassword ? { password: editingUser.newPassword } : {})
    };
    setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updatedFields } : u));
    if (currentUser?.id === editingUser.id) {
      setCurrentUser(prev => ({ ...prev, name: updatedFields.name, username: updatedFields.username, role: updatedFields.role }));
    }
    if (db && dbConnected && editingUser.id) {
      try { await updateDoc(getDocRef('users', editingUser.id), updatedFields); } catch {}
    }
    setEditingUser(null);
    showToast('פרטי המשתמש עודכנו בהצלחה!', 'success');
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id) {
      showToast('לא ניתן למחוק את המשתמש המחובר כרגע.', 'warning');
      return;
    }
    const adminsCount = usersList.filter(u => u.role === 'admin').length;
    if (user.role === 'admin' && adminsCount <= 1) {
      showToast('חייב להישאר לפחות מנהל אחד במערכת.', 'warning');
      return;
    }
    setConfirmDialog({
      title: 'מחיקת משתמש',
      message: `האם למחוק את המשתמש "${user.name}" (${user.username}) מהמערכת?`,
      confirmText: 'מחק משתמש',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      icon: <Trash2 className="w-6 h-6" />,
      iconStyle: 'bg-red-100 text-red-600',
      onConfirm: async () => {
        setUsersList(prev => prev.filter(u => u.id !== user.id));
        if (db && dbConnected && user.id) {
          try { await deleteDoc(getDocRef('users', user.id)); } catch {}
        }
        showToast('המשתמש נמחק.', 'info');
      }
    });
  };

  // ==========================================
  // חישובים ועזרים
  // ==========================================
  const calculateSuppliersStock = (book) => {
    return (book.breakdown || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  };

  const calculateTotalStock = (book) => {
    return Number(book.publisherStock || 0) + calculateSuppliersStock(book);
  };

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

  const getSupplierInventoryItems = (supplierName) => {
    const items = [];
    inventoryList.forEach(book => {
      const match = (book.breakdown || []).find(b => b.location === supplierName);
      if (match && Number(match.amount) > 0) {
        items.push({
          bookId: book.id,
          title: book.title,
          amount: Number(match.amount),
          supplierPrice: Number(book.prices?.supplier || 0)
        });
      }
    });
    return items.sort((a, b) => a.title.localeCompare(b.title, 'he'));
  };

  // ==========================================
  // פעולות ניהול מלאי
  // ==========================================
  const handleImportYhyCatalog = async () => {
    showToast('מסנכרן מחירון מהקטלוג (שומר על כמויות מלאי קיימות)...', 'info');
    try {
      let updatedCount = 0;
      let addedCount = 0;
      const nextList = [...inventoryList];

      for (const catalogBook of initialInventory) {
        const idx = nextList.findIndex(b => b.title.trim() === catalogBook.title.trim());
        if (idx !== -1) {
          const existing = nextList[idx];
          const updatedFields = {
            prices: catalogBook.prices,
            productionCost: catalogBook.productionCost,
            updatedAt: Date.now()
          };
          nextList[idx] = { ...existing, ...updatedFields };
          if (db && dbConnected && existing.id) {
            try { await updateDoc(getDocRef('inventory', existing.id), updatedFields); } catch {}
          }
          updatedCount++;
        } else {
          const toAdd = { ...catalogBook, updatedAt: Date.now() };
          if (db && dbConnected) {
            try {
              const ref = await addDoc(getCollRef('inventory'), toAdd);
              nextList.push({ ...toAdd, id: ref.id });
            } catch {
              nextList.push({ ...toAdd, id: 'book_' + Date.now() + '_' + addedCount });
            }
          } else {
            nextList.push({ ...toAdd, id: 'book_' + Date.now() + '_' + addedCount });
          }
          addedCount++;
        }
      }
      setInventoryList(nextList);
      showToast(`הסנכרון הושלם! ${updatedCount} ספרים עודכנו, ${addedCount} נוספו.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('שגיאה בסנכרון הקטלוג.', 'error');
    }
  };

  const handleInlineStockChange = async (book, rawValue) => {
    const val = Math.max(0, Number(rawValue) || 0);
    const updatedAt = Date.now();
    setInventoryList(prev => prev.map(b => b.id === book.id ? { ...b, publisherStock: val, updatedAt } : b));
    if (db && dbConnected && book.id) {
      try { await updateDoc(getDocRef('inventory', book.id), { publisherStock: val, updatedAt }); } catch {}
    }
  };

  const handleQuickWarehouseAdjust = async (book, delta) => {
    const newStock = Math.max(0, Number(book.publisherStock || 0) + delta);
    const updatedAt = Date.now();
    setInventoryList(prev => prev.map(b => b.id === book.id ? { ...b, publisherStock: newStock, updatedAt } : b));
    if (db && dbConnected && book.id) {
      try { await updateDoc(getDocRef('inventory', book.id), { publisherStock: newStock, updatedAt }); } catch {}
    }
  };

  const handleSaveNewBook = async (e) => {
    e.preventDefault();
    if (!newBookForm.title.trim()) return;
    const bookObj = {
      title: newBookForm.title.trim(),
      author: newBookForm.author.trim(),
      isbn: newBookForm.isbn.trim(),
      threshold: Math.max(0, Number(newBookForm.threshold || 0)),
      publisherStock: Math.max(0, Number(newBookForm.publisherStock || 0)),
      productionCost: Math.max(0, Number(newBookForm.productionCost || 0)),
      prices: {
        catalog: Math.max(0, Number(newBookForm.prices?.catalog || 0)),
        general: Math.max(0, Number(newBookForm.prices?.general || 0)),
        supplier: Math.max(0, Number(newBookForm.prices?.supplier || 0)),
        yeshiva: Math.max(0, Number(newBookForm.prices?.yeshiva || 0)),
      },
      editions: (newBookForm.editions || []).map(ed => ({ name: ed.name || 'מהדורה', printRun: Math.max(0, Number(ed.printRun || 0)) })),
      breakdown: (newBookForm.breakdown || []).filter(r => r.location?.trim()).map(r => ({ location: r.location.trim(), amount: Math.max(0, Number(r.amount || 0)) })),
      updatedAt: Date.now()
    };

    if (db && dbConnected) {
      try {
        await addDoc(getCollRef('inventory'), bookObj);
      } catch {
        setInventoryList(prev => [...prev, { ...bookObj, id: 'book_' + Date.now() }]);
      }
    } else {
      setInventoryList(prev => [...prev, { ...bookObj, id: 'book_' + Date.now() }]);
    }
    setNewBookForm(emptyBookForm);
    setIsAddBookModalOpen(false);
    showToast(`הספר "${bookObj.title}" נוסף בהצלחה!`, 'success');
  };

  const handleSaveEditBook = async (e) => {
    e.preventDefault();
    if (!editingBook || !editingBook.title.trim()) return;
    const updatedFields = {
      title: editingBook.title.trim(),
      author: (editingBook.author || '').trim(),
      isbn: (editingBook.isbn || '').trim(),
      threshold: Math.max(0, Number(editingBook.threshold || 0)),
      publisherStock: Math.max(0, Number(editingBook.publisherStock || 0)),
      productionCost: Math.max(0, Number(editingBook.productionCost || 0)),
      prices: {
        catalog: Math.max(0, Number(editingBook.prices?.catalog || 0)),
        general: Math.max(0, Number(editingBook.prices?.general || 0)),
        supplier: Math.max(0, Number(editingBook.prices?.supplier || 0)),
        yeshiva: Math.max(0, Number(editingBook.prices?.yeshiva || 0)),
      },
      editions: (editingBook.editions || []).map(ed => ({ name: ed.name || 'מהדורה', printRun: Math.max(0, Number(ed.printRun || 0)) })),
      breakdown: (editingBook.breakdown || []).filter(r => r.location?.trim()).map(r => ({ location: r.location.trim(), amount: Math.max(0, Number(r.amount || 0)) })),
      updatedAt: Date.now()
    };

    setInventoryList(prev => prev.map(b => b.id === editingBook.id ? { ...b, ...updatedFields } : b));
    if (db && dbConnected && editingBook.id) {
      try { await updateDoc(getDocRef('inventory', editingBook.id), updatedFields); } catch {}
    }
    setEditingBook(null);
    showToast(`פרטי הספר "${updatedFields.title}" עודכנו בהצלחה!`, 'success');
  };

  const handleDeleteBook = (book) => {
    setConfirmDialog({
      title: 'מחיקת ספר מהמלאי',
      message: `האם למחוק את הספר "${book.title}" לצמיתות מהמערכת?`,
      confirmText: 'מחק ספר',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      icon: <Trash2 className="w-6 h-6" />,
      iconStyle: 'bg-red-100 text-red-600',
      onConfirm: async () => {
        setInventoryList(prev => prev.filter(b => b.id !== book.id));
        if (db && dbConnected && book.id) {
          try { await deleteDoc(getDocRef('inventory', book.id)); } catch {}
        }
        showToast('הספר נמחק מהמלאי.', 'info');
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['שם הספר', 'מחבר', 'מחיר אתר', 'מחיר ספק', 'מחיר ישיבה', 'עלות הפקה', 'במחסן הראשי', 'אצל ספקים', 'סה"כ מלאי'];
    const rows = inventoryList.map(b => [
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.author || '').replace(/"/g, '""')}"`,
      b.prices?.general || 0,
      b.prices?.supplier || 0,
      b.prices?.yeshiva || 0,
      b.productionCost || 0,
      b.publisherStock || 0,
      calculateSuppliersStock(b),
      calculateTotalStock(b)
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yhy_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('קובץ האקסל (CSV) הורד בהצלחה!', 'success');
  };

  // --- חלוקה לתורמים / מתנות ---
  const handleRecordGift = async (e) => {
    e.preventDefault();
    const book = inventoryList.find(b => b.id === giftForm.bookId);
    const qty = Math.max(1, Number(giftForm.quantity || 1));
    if (!book || !giftForm.recipient.trim()) {
      showToast('אנא בחר ספר והזן שם מקבל.', 'warning');
      return;
    }
    const newStock = Math.max(0, Number(book.publisherStock || 0) - qty);
    setInventoryList(prev => prev.map(b => b.id === book.id ? { ...b, publisherStock: newStock, updatedAt: Date.now() } : b));
    if (db && dbConnected && book.id) {
      try { await updateDoc(getDocRef('inventory', book.id), { publisherStock: newStock, updatedAt: Date.now() }); } catch {}
    }

    const logObj = {
      bookTitle: book.title,
      quantity: qty,
      recipient: giftForm.recipient.trim(),
      category: giftForm.category,
      notes: giftForm.notes.trim(),
      user: currentUserName,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now()
    };
    if (db && dbConnected) {
      try { await addDoc(getCollRef('gift_logs'), logObj); } catch { setGiftLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]); }
    } else {
      setGiftLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]);
    }
    setGiftForm({ bookId: '', quantity: 1, recipient: '', category: 'תורם', notes: '' });
    setIsGiftModalOpen(false);
    showToast(`נרשמה חלוקה של ${qty} עותקים ל${logObj.recipient}!`, 'success');
  };

  // ==========================================
  // פעולות ספקים, הזמנות, קונסיגנציה וגבייה
  // ==========================================
  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) return;
    const payload = {
      name: supplierForm.name.trim(),
      contact: supplierForm.contact.trim(),
      phone: supplierForm.phone.trim(),
      email: supplierForm.email.trim(),
      address: supplierForm.address.trim(),
      notes: supplierForm.notes.trim(),
      updatedAt: Date.now()
    };

    if (editingSupplier) {
      setSuppliersList(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...payload } : s));
      if (db && dbConnected && editingSupplier.id) {
        try { await updateDoc(getDocRef('suppliers', editingSupplier.id), payload); } catch {}
      }
      showToast(`פרטי הספק "${payload.name}" עודכנו!`, 'success');
    } else {
      if (db && dbConnected) {
        try { await addDoc(getCollRef('suppliers'), payload); } catch { setSuppliersList(prev => [...prev, { ...payload, id: 'sup_' + Date.now() }]); }
      } else {
        setSuppliersList(prev => [...prev, { ...payload, id: 'sup_' + Date.now() }]);
      }
      showToast(`הספק "${payload.name}" נוסף בהצלחה!`, 'success');
    }
    setIsSupplierModalOpen(false);
    setEditingSupplier(null);
    setSupplierForm(emptySupplierForm);
  };

  const handleDeleteSupplier = (supplier) => {
    setConfirmDialog({
      title: 'מחיקת ספק',
      message: `האם למחוק את הספק "${supplier.name}" מרשימת הספקים?`,
      confirmText: 'מחק ספק',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      icon: <Trash2 className="w-6 h-6" />,
      iconStyle: 'bg-red-100 text-red-600',
      onConfirm: async () => {
        setSuppliersList(prev => prev.filter(s => s.id !== supplier.id));
        if (db && dbConnected && supplier.id) {
          try { await deleteDoc(getDocRef('suppliers', supplier.id)); } catch {}
        }
        showToast('הספק נמחק.', 'info');
      }
    });
  };

  const openSupplierOrderModal = (supplier) => {
    setInvoiceSupplier(supplier);
    setInvoiceItems([{ bookId: inventoryList[0]?.id || '', quantity: 10 }]);
    setDeductFromWarehouse(true);
    setInvoiceNotes('');
    setIsSupplierInvoiceModalOpen(true);
  };

  const processSupplierOrder = async (mode) => {
    // mode: 'email' | 'whatsapp' | 'save_only' | 'print'
    if (!invoiceSupplier) return;
    const validItems = invoiceItems
      .filter(i => i.bookId && Number(i.quantity) > 0)
      .map(i => {
        const book = inventoryList.find(b => b.id === i.bookId);
        const price = Number(book?.prices?.supplier || 0);
        const qty = Number(i.quantity);
        return {
          bookId: i.bookId,
          title: book?.title || 'ספר',
          quantity: qty,
          price,
          lineTotal: price * qty
        };
      });

    if (validItems.length === 0) {
      showToast('אנא בחר לפחות ספר אחד וכמות תקינה.', 'warning');
      return;
    }

    const totalOrderPrice = validItems.reduce((s, i) => s + i.lineTotal, 0);

    // עדכון אוטומטי של מלאי הספק + הפחתה מהמחסן הראשי (אם מסומן)
    const updatedBooks = [];
    setInventoryList(prev => prev.map(book => {
      const orderItem = validItems.find(v => v.bookId === book.id);
      if (!orderItem) return book;
      const newPublisherStock = deductFromWarehouse
        ? Math.max(0, Number(book.publisherStock || 0) - orderItem.quantity)
        : Number(book.publisherStock || 0);

      const currentBreakdown = [...(book.breakdown || [])];
      const existingIdx = currentBreakdown.findIndex(b => b.location === invoiceSupplier.name);
      if (existingIdx !== -1) {
        currentBreakdown[existingIdx] = {
          ...currentBreakdown[existingIdx],
          amount: Number(currentBreakdown[existingIdx].amount || 0) + orderItem.quantity
        };
      } else {
        currentBreakdown.push({ location: invoiceSupplier.name, amount: orderItem.quantity });
      }
      const updated = { ...book, publisherStock: newPublisherStock, breakdown: currentBreakdown, updatedAt: Date.now() };
      updatedBooks.push(updated);
      return updated;
    }));

    if (db && dbConnected) {
      try {
        await Promise.all(updatedBooks.map(b =>
          updateDoc(getDocRef('inventory', b.id), {
            publisherStock: b.publisherStock,
            breakdown: b.breakdown,
            updatedAt: b.updatedAt
          })
        ));
      } catch (err) {
        console.error('Error syncing supplier stock:', err);
      }
    }

    // תיעוד בהיסטוריית הספק
    const itemsText = validItems
      .map((item, idx) => `${idx + 1}. ${item.title} — ${item.quantity} עותקים × ₪${item.price} = ₪${item.lineTotal.toLocaleString()}`)
      .join('\n') + (invoiceNotes.trim() ? `\nהערות: ${invoiceNotes.trim()}` : '');

    const actionLabel =
      mode === 'email' ? 'הפקת הזמנה ושליחה במייל' :
      mode === 'whatsapp' ? 'הפקת הזמנה ושליחה בוואטסאפ' :
      mode === 'print' ? 'הפקת תעודת משלוח' :
      'רישום הזמנה ועדכון מלאי';

    const logObj = {
      supplierName: invoiceSupplier.name,
      action: actionLabel,
      type: 'order',
      user: currentUserName,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now(),
      totalAmount: totalOrderPrice,
      paymentStatus: 'unpaid',
      paidAmount: 0,
      details: itemsText
    };

    if (db && dbConnected) {
      try { await addDoc(getCollRef('supplier_logs'), logObj); } catch { setSupplierLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]); }
    } else {
      setSupplierLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]);
    }

    const dateStr = new Date().toLocaleDateString('he-IL');
    if (mode === 'email') {
      const subject = `הזמנת ספרים — הוצאת ישיבת ירוחם (${dateStr})`;
      const body =
        `שלום רב ${invoiceSupplier.contact || invoiceSupplier.name},\n\n` +
        `להלן פירוט הזמנת הספרים מהוצאת ספרי ישיבת ירוחם בתאריך ${dateStr}:\n\n` +
        `${itemsText}\n\n` +
        `----------------------------------------\n` +
        `סה"כ לתשלום (לפי מחירון ספקים): ₪${totalOrderPrice.toLocaleString()}\n` +
        `----------------------------------------\n\n` +
        `נשמח לאישור קבלת ההזמנה.\nבברכה,\nהוצאת ספרי ישיבת ירוחם`;
      window.location.href = `mailto:${invoiceSupplier.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else if (mode === 'whatsapp') {
      const waPhone = formatWhatsAppPhone(invoiceSupplier.phone);
      const waText =
        `📚 *הזמנת ספרים — הוצאת ישיבת ירוחם*\n` +
        `תאריך: ${dateStr}\nלכבוד: ${invoiceSupplier.name}\n\n` +
        `${itemsText}\n\n` +
        `*סה"כ לתשלום: ₪${totalOrderPrice.toLocaleString()}*`;
      if (waPhone) {
        window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`, '_blank', 'noopener,noreferrer');
      } else {
        showToast('המלאי עודכן, אך לספק אין מספר טלפון תקין לוואטסאפ.', 'warning');
      }
    } else if (mode === 'print') {
      setPrintDoc({
        type: 'supplier_delivery',
        docTitle: 'תעודת משלוח / הזמנה לספק',
        orderId: `SUP-${Date.now().toString().slice(-5)}`,
        date: dateStr,
        recipient: `${invoiceSupplier.name}${invoiceSupplier.address ? ' — ' + invoiceSupplier.address : ''}`,
        totalAmount: totalOrderPrice,
        notes: invoiceNotes.trim(),
        items: validItems.map(i => ({ name: i.title, quantity: i.quantity, price: i.price, lineTotal: i.lineTotal }))
      });
    }

    setIsSupplierInvoiceModalOpen(false);
    showToast(`ההזמנה נשמרה ומלאי "${invoiceSupplier.name}" עודכן אוטומטית!`, 'success');
  };

  // --- קונסיגנציה: דיווח מכירה / החזרה ---
  const openConsignmentModal = (supplier) => {
    const items = getSupplierInventoryItems(supplier.name);
    const first = items[0];
    setConsignmentSupplier(supplier);
    setConsignmentForm({
      type: 'sale',
      bookId: first?.bookId || '',
      quantity: 1,
      unitPrice: first?.supplierPrice || 0,
      notes: ''
    });
    setIsConsignmentModalOpen(true);
  };

  const handleSaveConsignment = async (e) => {
    e.preventDefault();
    if (!consignmentSupplier || !consignmentForm.bookId) return;
    const book = inventoryList.find(b => b.id === consignmentForm.bookId);
    if (!book) return;
    const qty = Math.max(1, Number(consignmentForm.quantity || 1));
    const isReturn = consignmentForm.type === 'return';
    const totalAmount = isReturn ? 0 : qty * Number(consignmentForm.unitPrice || 0);

    const updatedBreakdown = (book.breakdown || [])
      .map(row => row.location === consignmentSupplier.name
        ? { ...row, amount: Math.max(0, Number(row.amount || 0) - qty) }
        : row
      )
      .filter(row => Number(row.amount) > 0);

    const newPublisherStock = isReturn
      ? Number(book.publisherStock || 0) + qty
      : Number(book.publisherStock || 0);

    setInventoryList(prev => prev.map(b =>
      b.id === book.id ? { ...b, publisherStock: newPublisherStock, breakdown: updatedBreakdown, updatedAt: Date.now() } : b
    ));
    if (db && dbConnected && book.id) {
      try {
        await updateDoc(getDocRef('inventory', book.id), {
          publisherStock: newPublisherStock,
          breakdown: updatedBreakdown,
          updatedAt: Date.now()
        });
      } catch {}
    }

    const details = isReturn
      ? `הוחזרו ${qty} עותקים מהספר "${book.title}" למחסן הראשי.${consignmentForm.notes ? '\nהערות: ' + consignmentForm.notes : ''}`
      : `נמכרו ${qty} עותקים מהספר "${book.title}" × ₪${consignmentForm.unitPrice} = ₪${totalAmount.toLocaleString()}.${consignmentForm.notes ? '\nהערות: ' + consignmentForm.notes : ''}`;

    const logObj = {
      supplierName: consignmentSupplier.name,
      action: isReturn ? 'החזרת ספרים למחסן' : 'דיווח מכירת קונסיגנציה',
      type: consignmentForm.type,
      user: currentUserName,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now(),
      totalAmount,
      paymentStatus: isReturn ? 'paid' : 'unpaid',
      paidAmount: 0,
      details
    };

    if (db && dbConnected) {
      try { await addDoc(getCollRef('supplier_logs'), logObj); } catch { setSupplierLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]); }
    } else {
      setSupplierLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]);
    }
    setIsConsignmentModalOpen(false);
    showToast(isReturn ? `${qty} עותקים הוחזרו למחסן הראשי!` : `נרשמה מכירה ע"ס ₪${totalAmount.toLocaleString()}!`, 'success');
  };

  const handleUpdateLogPayment = async (log, status, customPaidAmount = null) => {
    const total = Number(log.totalAmount || 0);
    let paidAmount = 0;
    if (status === 'paid') paidAmount = total;
    else if (status === 'partial') {
      const parsed = Number(customPaidAmount);
      if (isNaN(parsed) || parsed < 0 || parsed > total) {
        showToast(`אנא הזן סכום תקין בין 0 ל-₪${total.toLocaleString()}`, 'warning');
        return;
      }
      paidAmount = parsed;
    }

    setSupplierLogs(prev => prev.map(l => l.id === log.id ? { ...l, paymentStatus: status, paidAmount } : l));
    if (db && dbConnected && log.id) {
      try { await updateDoc(getDocRef('supplier_logs', log.id), { paymentStatus: status, paidAmount }); } catch {}
    }
    showToast(status === 'paid' ? 'החיוב סומן כשולם!' : status === 'partial' ? `עודכן תשלום חלקי ע"ס ₪${paidAmount.toLocaleString()}` : 'סטטוס עודכן לטרם שולם', 'success');
  };

  const handleSendDebtWhatsAppReminder = (supplier) => {
    const debt = getSupplierOpenDebt(supplier.name);
    const waPhone = formatWhatsAppPhone(supplier.phone);
    if (!waPhone) {
      showToast('לספק זה לא מוגדר מספר טלפון תקין לוואטסאפ.', 'error');
      return;
    }
    const msg = `שלום ${supplier.contact || supplier.name},\nמקווים ששלומכם טוב!\nפונים אליכם בעדינות מהוצאת ספרי ישיבת ירוחם לגבי יתרת תשלום פתוחה על הזמנות ספרים ע"ס ₪${debt.toLocaleString()}.\nנשמח לעדכון מתי צפויה העברה או אם נדרש מאיתנו מסמך נוסף.\nתודה רבה וכל טוב!`;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  // ==========================================
  // פעולות הזמנות חנות (אתר)
  // ==========================================
  const handleMarkOrderShipped = (order) => {
    setConfirmDialog({
      title: 'אישור שליחת הזמנה',
      message: `האם הזמנה #${order.orderId} עבור ${order.customerName} נארזה ומוכנה להעברה ל"הזמנות שנשלחו"?`,
      confirmText: 'אשר וסמן כנשלח',
      confirmStyle: 'bg-emerald-600 hover:bg-emerald-700',
      icon: <CheckCircle className="w-6 h-6" />,
      iconStyle: 'bg-emerald-100 text-emerald-600',
      onConfirm: async () => {
        // עדכון אופטימי מיידי
        setOrdersList(prev => prev.map(o => o.id === order.id ? { ...o, status: 'shipped', shippedAt: Date.now() } : o));
        if (db && dbConnected && order.id) {
          try { await updateDoc(getDocRef('orders', order.id), { status: 'shipped', shippedAt: Date.now() }); } catch {}
        }
        showToast(`הזמנה #${order.orderId} הועברה להזמנות שנשלחו!`, 'success');
      }
    });
  };

  // ==========================================
  // פעולות קופה מהירה (POS)
  // ==========================================
  const getPosBookPrice = (book, mode = posPriceMode) => {
    if (mode === 'yeshiva') return Number(book.prices?.yeshiva || book.prices?.general || 0);
    return Number(book.prices?.general || 0);
  };

  const handleAddToPosCart = (book) => {
    setPosCart(prev => {
      const existing = prev.find(i => i.bookId === book.id);
      if (existing) return prev.map(i => i.bookId === book.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { bookId: book.id, title: book.title, qty: 1 }];
    });
  };

  const handleUpdatePosCartQty = (bookId, delta) => {
    setPosCart(prev => prev.map(i => i.bookId === bookId ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  };

  const handleCompletePosSale = async () => {
    if (posCart.length === 0) return;
    let totalAmount = 0;
    const saleItems = posCart.map(item => {
      const book = inventoryList.find(b => b.id === item.bookId);
      const unitPrice = book ? getPosBookPrice(book, posPriceMode) : 0;
      const lineTotal = unitPrice * item.qty;
      totalAmount += lineTotal;
      return { bookId: item.bookId, title: item.title, qty: item.qty, unitPrice, lineTotal };
    });

    const updatedBooks = [];
    setInventoryList(prev => prev.map(book => {
      const cartItem = posCart.find(c => c.bookId === book.id);
      if (!cartItem) return book;
      const newStock = Math.max(0, Number(book.publisherStock || 0) - cartItem.qty);
      const updated = { ...book, publisherStock: newStock, updatedAt: Date.now() };
      updatedBooks.push(updated);
      return updated;
    }));

    if (db && dbConnected) {
      try {
        await Promise.all(updatedBooks.map(b => updateDoc(getDocRef('inventory', b.id), { publisherStock: b.publisherStock, updatedAt: b.updatedAt })));
      } catch {}
    }

    const saleObj = {
      items: saleItems,
      totalAmount,
      priceMode: posPriceMode === 'yeshiva' ? 'מחיר ישיבה' : 'מחיר צרכן',
      paymentMethod: posPaymentMethod,
      buyerNote: posBuyerNote.trim(),
      user: currentUserName,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now()
    };
    if (db && dbConnected) {
      try { await addDoc(getCollRef('pos_sales'), saleObj); } catch { setPosSales(prev => [{ ...saleObj, id: Date.now().toString() }, ...prev]); }
    } else {
      setPosSales(prev => [{ ...saleObj, id: Date.now().toString() }, ...prev]);
    }
    setPosCart([]);
    setPosBuyerNote('');
    showToast(`מכירה הושלמה ע"ס ₪${totalAmount.toLocaleString()} והמלאי עודכן!`, 'success');
  };

  // ==========================================
  // פעולות הפקת ספרים (קנבן)
  // ==========================================
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    const taskObj = {
      title: newTaskForm.title.trim(),
      author: newTaskForm.author.trim(),
      status: newTaskForm.status,
      notes: newTaskForm.notes.trim(),
      invoices: [],
      addedToInventory: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    if (db && dbConnected) {
      try { await addDoc(getCollRef('tasks'), taskObj); } catch { setTasksList(prev => [...prev, { ...taskObj, id: 'task_' + Date.now() }]); }
    } else {
      setTasksList(prev => [...prev, { ...taskObj, id: 'task_' + Date.now() }]);
    }
    setNewTaskForm({ title: '', author: '', status: 'planned', notes: '' });
    setIsAddTaskModalOpen(false);
    showToast(`הפרויקט "${taskObj.title}" נוסף ללוח ההפקה!`, 'success');
  };

  const handleUpdateTaskStatus = async (task, newStatus) => {
    const updated = { ...task, status: newStatus, updatedAt: Date.now() };
    setTasksList(prev => prev.map(t => t.id === task.id ? updated : t));
    if (selectedTask?.id === task.id) setSelectedTask(updated);
    if (db && dbConnected && task.id) {
      try { await updateDoc(getDocRef('tasks', task.id), { status: newStatus, updatedAt: Date.now() }); } catch {}
    }
  };

  const handleAddTaskInvoice = async (e) => {
    e.preventDefault();
    if (!selectedTask || !taskInvoiceForm.description.trim() || !taskInvoiceForm.amount) return;
    const nextInvoices = [
      ...(selectedTask.invoices || []),
      { id: Date.now().toString(), description: taskInvoiceForm.description.trim(), amount: Number(taskInvoiceForm.amount), date: new Date().toLocaleDateString('he-IL') }
    ];
    const updated = { ...selectedTask, invoices: nextInvoices, updatedAt: Date.now() };
    setTasksList(prev => prev.map(t => t.id === selectedTask.id ? updated : t));
    setSelectedTask(updated);
    setTaskInvoiceForm({ description: '', amount: '' });
    if (db && dbConnected && selectedTask.id) {
      try { await updateDoc(getDocRef('tasks', selectedTask.id), { invoices: nextInvoices, updatedAt: Date.now() }); } catch {}
    }
    showToast('הוצאת הפקה נוספה לפרויקט!', 'success');
  };

  const handleDeleteTask = (task) => {
    setConfirmDialog({
      title: 'מחיקת פרויקט הפקה',
      message: `האם למחוק את הפרויקט "${task.title}" לצמיתות?`,
      confirmText: 'מחק פרויקט',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      icon: <Trash2 className="w-6 h-6" />,
      iconStyle: 'bg-red-100 text-red-600',
      onConfirm: async () => {
        setTasksList(prev => prev.filter(t => t.id !== task.id));
        if (selectedTask?.id === task.id) setSelectedTask(null);
        if (db && dbConnected && task.id) {
          try { await deleteDoc(getDocRef('tasks', task.id)); } catch {}
        }
        showToast('הפרויקט נמחק.', 'info');
      }
    });
  };

  const handleTransferTaskToInventory = async (task) => {
    const totalExpenses = (task.invoices || []).reduce((s, i) => s + Number(i.amount || 0), 0);
    const newBook = {
      title: task.title,
      author: task.author || 'הוצאת ישיבת ירוחם',
      isbn: '',
      threshold: 30,
      publisherStock: 0,
      productionCost: totalExpenses,
      prices: { catalog: 0, general: 0, supplier: 0, yeshiva: 0 },
      editions: [{ name: 'מהדורה 1', printRun: 0 }],
      breakdown: [],
      updatedAt: Date.now()
    };
    if (db && dbConnected) {
      try { await addDoc(getCollRef('inventory'), newBook); } catch { setInventoryList(prev => [...prev, { ...newBook, id: 'book_' + Date.now() }]); }
    } else {
      setInventoryList(prev => [...prev, { ...newBook, id: 'book_' + Date.now() }]);
    }
    const updatedTask = { ...task, addedToInventory: true, status: 'done', updatedAt: Date.now() };
    setTasksList(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    if (db && dbConnected && task.id) {
      try { await updateDoc(getDocRef('tasks', task.id), { addedToInventory: true, status: 'done', updatedAt: Date.now() }); } catch {}
    }
    showToast(`הספר "${task.title}" הועבר אוטומטית לטבלת המלאי!`, 'success');
  };

  // ==========================================
  // השוואת הצעות מחיר מבתי דפוס
  // ==========================================
  const handleQuoteFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 700 * 1024) {
      showToast('הקובץ גדול מ-700KB. אנא כווץ את המסמך או העלה קובץ קל יותר.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setQuoteForm(prev => ({
        ...prev,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileData: ev.target.result
      }));
      showToast(`המסמך "${file.name}" צורף בהצלחה!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePrintQuote = async (e) => {
    e.preventDefault();
    if (!quoteForm.projectTitle.trim() || !quoteForm.printerName.trim() || !quoteForm.totalPrice) return;
    const totalPriceNum = Number(quoteForm.totalPrice);
    const copiesNum = Math.max(1, Number(quoteForm.copies || 1));
    const finalPriceWithVat = quoteForm.includesVat ? totalPriceNum : Math.round(totalPriceNum * 1.18);

    const newQuote = {
      projectTitle: quoteForm.projectTitle.trim(),
      printerName: quoteForm.printerName.trim(),
      copies: copiesNum,
      totalPrice: totalPriceNum,
      includesVat: quoteForm.includesVat,
      effectivePrice: finalPriceWithVat,
      costPerCopy: Number((finalPriceWithVat / copiesNum).toFixed(2)),
      pages: quoteForm.pages ? Number(quoteForm.pages) : 0,
      coverType: quoteForm.coverType,
      paperType: quoteForm.paperType.trim(),
      deliveryDays: quoteForm.deliveryDays ? Number(quoteForm.deliveryDays) : 0,
      notes: quoteForm.notes.trim(),
      fileName: quoteForm.fileName,
      fileType: quoteForm.fileType,
      fileData: quoteForm.fileData,
      user: currentUserName,
      date: new Date().toLocaleDateString('he-IL'),
      timestamp: Date.now()
    };

    if (db && dbConnected) {
      try { await addDoc(getCollRef('print_quotes'), newQuote); } catch { setPrintQuotes(prev => [{ ...newQuote, id: Date.now().toString() }, ...prev]); }
    } else {
      setPrintQuotes(prev => [{ ...newQuote, id: Date.now().toString() }, ...prev]);
    }
    setSelectedQuoteProject(newQuote.projectTitle);
    setIsAddQuoteModalOpen(false);
    setQuoteForm(prev => ({ ...prev, printerName: '', totalPrice: '', deliveryDays: '', notes: '', fileName: '', fileType: '', fileData: '' }));
    showToast(`הצעת המחיר מ"${newQuote.printerName}" נשמרה!`, 'success');
  };

  const handleDeletePrintQuote = (quote) => {
    setConfirmDialog({
      title: 'מחיקת הצעת מחיר',
      message: `האם למחוק את ההצעה של "${quote.printerName}" עבור "${quote.projectTitle}"?`,
      confirmText: 'מחק הצעה',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      icon: <Trash2 className="w-6 h-6" />,
      iconStyle: 'bg-red-100 text-red-600',
      onConfirm: async () => {
        setPrintQuotes(prev => prev.filter(q => q.id !== quote.id));
        if (db && dbConnected && quote.id) {
          try { await deleteDoc(getDocRef('print_quotes', quote.id)); } catch {}
        }
        showToast('ההצעה נמחקה.', 'info');
      }
    });
  };

  // ==========================================
  // פתקים, שיווק, גיבוי וקטלוג
  // ==========================================
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const noteObj = { text: newNoteText.trim(), date: new Date().toLocaleString('he-IL'), timestamp: Date.now(), user: currentUserName };
    if (db && dbConnected) {
      try { await addDoc(getCollRef('notes'), noteObj); } catch { setNotesList(prev => [{ ...noteObj, id: Date.now().toString() }, ...prev]); }
    } else {
      setNotesList(prev => [{ ...noteObj, id: Date.now().toString() }, ...prev]);
    }
    setNewNoteText('');
    showToast('הפתק נשמר!', 'success');
  };

  const handleDeleteNote = (note) => {
    setConfirmDialog({
      title: 'מחיקת פתק',
      message: 'האם למחוק פתק זה לצמיתות?',
      confirmText: 'מחק פתק',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      icon: <Trash2 className="w-6 h-6" />,
      iconStyle: 'bg-red-100 text-red-600',
      onConfirm: async () => {
        setNotesList(prev => prev.filter(n => n.id !== note.id));
        if (db && dbConnected && note.id) {
          try { await deleteDoc(getDocRef('notes', note.id)); } catch {}
        }
        showToast('הפתק נמחק.', 'info');
      }
    });
  };

  const handleExportFullBackup = () => {
    const payload = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      data: { inventory: inventoryList, suppliers: suppliersList, tasks: tasksList, orders: ordersList, notes: notesList, supplierLogs, giftLogs, posSales, printQuotes, campaigns: campaignsList, prCopies }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yhy_publisher_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('קובץ גיבוי מלא (JSON) הורד בהצלחה!', 'success');
  };

  const handleImportBackupFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const d = parsed.data || parsed;
        if (!Array.isArray(d.inventory)) {
          showToast('קובץ הגיבוי אינו תקין.', 'error');
          return;
        }
        setConfirmDialog({
          title: 'שחזור מגיבוי מלא',
          message: `נמצאו ${d.inventory.length} ספרים ו-${(d.suppliers || []).length} ספקים. לשחזר?`,
          confirmText: 'שחזר נתונים',
          confirmStyle: 'bg-indigo-600 hover:bg-indigo-700',
          icon: <Database className="w-6 h-6" />,
          iconStyle: 'bg-indigo-100 text-indigo-600',
          onConfirm: () => {
            if (d.inventory) setInventoryList(d.inventory);
            if (d.suppliers) setSuppliersList(d.suppliers);
            if (d.tasks) setTasksList(d.tasks);
            if (d.orders) setOrdersList(d.orders);
            if (d.notes) setNotesList(d.notes);
            if (d.supplierLogs) setSupplierLogs(d.supplierLogs);
            if (d.giftLogs) setGiftLogs(d.giftLogs);
            if (d.posSales) setPosSales(d.posSales);
            if (d.printQuotes) setPrintQuotes(d.printQuotes);
            if (d.campaigns) setCampaignsList(d.campaigns);
            if (d.prCopies) setPrCopies(d.prCopies);
            showToast('הנתונים שוחזרו בהצלחה!', 'success');
          }
        });
      } catch {
        showToast('שגיאה בקריאת קובץ JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- קטלוג דיגיטלי ---
  const getCatalogBooks = () => [...inventoryList].filter(b => !catalogOnlyInStock || calculateTotalStock(b) > 0).sort((a, b) => a.title.localeCompare(b.title, 'he'));
  const getCatalogBookPrice = (book) => catalogPriceTier === 'supplier' ? Number(book.prices?.supplier || 0) : catalogPriceTier === 'yeshiva' ? Number(book.prices?.yeshiva || book.prices?.general || 0) : Number(book.prices?.general || 0);
  const buildCatalogWhatsAppText = () => {
    const tierLabel = catalogPriceTier === 'supplier' ? 'מחירון ספקים וחנויות' : catalogPriceTier === 'yeshiva' ? 'מחירון מיוחד לתלמידי ובוגרי הישיבה' : 'מחירון לצרכן';
    const lines = getCatalogBooks().map((b, i) => `${i + 1}. *${b.title}* — ${getCatalogBookPrice(b) > 0 ? `₪${getCatalogBookPrice(b)}` : 'בתיאום'}`);
    return `📚 *קטלוג הוצאת ספרי ישיבת ירוחם*\n_${tierLabel}_\n\n${lines.join('\n')}\n\nלהזמנות ופרטים נוספים ניתן להשיב להודעה זו.`;
  };

  const handleCopyCatalogText = () => {
    const text = buildCatalogWhatsAppText();
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('הקטלוג הועתק לוואטסאפ!', 'success'); } catch { showToast('העתק ידנית מהתיבה.', 'warning'); }
    document.body.removeChild(ta);
  };

  // ==========================================
  // רשימות מסוננות וממוינות
  // ==========================================
  const sortedInventory = useMemo(() => {
    return [...inventoryList]
      .filter(b =>
        (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.isbn || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (inventorySort === 'alphabetical') return (a.title || '').localeCompare(b.title || '', 'he');
        return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
      });
  }, [inventoryList, searchQuery, inventorySort]);

  const sortedSuppliers = useMemo(() => {
    return [...suppliersList]
      .filter(s =>
        (s.name || '').toLowerCase().includes(supplierSearch.toLowerCase()) ||
        (s.contact || '').toLowerCase().includes(supplierSearch.toLowerCase())
      )
      .sort((a, b) => {
        if (supplierSort === 'alphabetical') return (a.name || '').localeCompare(b.name || '', 'he');
        return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
      });
  }, [suppliersList, supplierSearch, supplierSort]);

  // מדדי דאשבורד חיים
  const totalCopiesInSystem = inventoryList.reduce((s, b) => s + calculateTotalStock(b), 0);
  const totalWarehouseCopies = inventoryList.reduce((s, b) => s + Number(b.publisherStock || 0), 0);
  const totalProductionValue = inventoryList.reduce((s, b) => s + calculateTotalStock(b) * Number(b.productionCost || 0), 0);
  const totalRetailValue = inventoryList.reduce((s, b) => s + calculateTotalStock(b) * Number(b.prices?.general || 0), 0);
  const lowStockBooks = inventoryList.filter(b => calculateTotalStock(b) < Number(b.threshold || 30));
  const liveStoreRevenue = ordersList.reduce((s, o) => s + Number(o.total || 0), 0);
  const liveSupplierRevenue = supplierLogs.filter(l => l.type !== 'return').reduce((s, l) => s + Number(l.totalAmount || 0), 0);
  const livePosRevenue = posSales.reduce((s, sale) => s + Number(sale.totalAmount || 0), 0);
  const totalOpenSupplierDebt = supplierLogs.reduce((s, l) => s + getLogRemainingDebt(l), 0);
  const pendingOrders = ordersList.filter(o => o.status !== 'shipped');
  const shippedOrders = ordersList.filter(o => o.status === 'shipped');

  const navItems = [
    { id: 'dashboard', label: 'דאשבורד', icon: LayoutDashboard, group: 'ראשי' },
    { id: 'pos', label: 'קופה מהירה (דוכן)', icon: CreditCard, group: 'מכירות והזמנות' },
    { id: 'orders', label: 'הזמנות חנות (אתר)', icon: ShoppingCart, badge: pendingOrders.length, group: 'מכירות והזמנות' },
    { id: 'inventory', label: 'ניהול מלאי', icon: Package, group: 'מלאי והפצה' },
    { id: 'suppliers', label: 'ספקים והפצה', icon: Truck, group: 'מלאי והפצה' },
    { id: 'production', label: 'הפקת ספרים', icon: KanbanSquare, group: 'הפקה ושיווק' },
    { id: 'print_quotes', label: 'השוואת דפוסים', icon: Scale, group: 'הפקה ושיווק' },
    { id: 'marketing', label: 'שיווק ויח״צ', icon: Megaphone, group: 'הפקה ושיווק' },
    { id: 'notes', label: 'פתקים ומשימות', icon: StickyNote, group: 'מערכת' },
    { id: 'integrations', label: 'אוטומציה וגיבוי', icon: Settings, group: 'מערכת' },
    ...(userRole === 'admin' ? [{ id: 'users', label: 'ניהול משתמשים', icon: UserCog, group: 'מערכת' }] : []),
  ];

  const activeNavItem = navItems.find(n => n.id === activeTab) || navItems[0];
  const userInitial = (currentUserName || 'מ').trim().charAt(0);

  // ==========================================
  // מסך התחברות (כאשר המשתמש אינו מחובר)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0B1120] relative flex items-center justify-center p-4 font-sans overflow-hidden" dir="rtl">
        {/* רקע גרדיאנט מודרני */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#4B5320]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-white/20">
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#2B3318] p-8 text-center text-white space-y-3.5 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5c6628] to-[#3f461b] mx-auto flex items-center justify-center shadow-lg ring-1 ring-amber-200/30">
              <BookOpen className="w-8 h-8 text-amber-100" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">הוצאת ספרי הישיבה</h1>
              <p className="text-xs text-slate-300/90 mt-1">מערכת ניהול מלאי, הפצה והפקה — ישיבת ההסדר ירוחם</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-7 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">שם משתמש</label>
              <div className="relative">
                <UserCog className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="text"
                  autoFocus
                  value={loginForm.username}
                  onChange={e => { setLoginForm({ ...loginForm, username: e.target.value }); setLoginError(''); }}
                  placeholder="הזן שם משתמש..."
                  className="w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm outline-none transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">סיסמה</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={loginForm.password}
                  onChange={e => { setLoginForm({ ...loginForm, password: e.target.value }); setLoginError(''); }}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-3 py-3 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm outline-none transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-l from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" /> כניסה למערכת
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span>{dbConnected ? 'מחובר למסד הנתונים בענן' : 'מוכן לעבודה (מצב מקומי / ענן)'}</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // תצוגה ראשית
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F3F5F9] text-slate-800 flex flex-col lg:flex-row font-sans antialiased" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 left-5 z-[100] px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md text-white text-sm font-bold flex items-center gap-2.5 ring-1 ring-white/15 print:hidden transition-all ${
          toast.type === 'success' ? 'bg-emerald-600/95' :
          toast.type === 'error' ? 'bg-rose-600/95' :
          toast.type === 'warning' ? 'bg-amber-600/95' : 'bg-slate-900/95'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-75 hover:opacity-100 mr-1"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col w-68 bg-[#0F172A] text-white shrink-0 border-l border-slate-800/80 print:hidden">
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5c6628] to-[#3f461b] flex items-center justify-center shadow-md ring-1 ring-amber-200/25 shrink-0">
            <BookOpen className="w-5 h-5 text-amber-100" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-[15px] leading-tight tracking-tight truncate">הוצאת ספרי הישיבה</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">ישיבת ההסדר ירוחם</p>
          </div>
        </div>

        <nav className="flex-1 p-3.5 space-y-5 overflow-y-auto">
          {['ראשי', 'מכירות והזמנות', 'מלאי והפצה', 'הפקה ושיווק', 'מערכת'].map(groupName => {
            const groupItems = navItems.filter(i => i.group === groupName);
            if (groupItems.length === 0) return null;
            return (
              <div key={groupName} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{groupName}</p>
                {groupItems.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50 ring-1 ring-indigo-400/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                        {item.label}
                      </span>
                      {item.badge > 0 && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white text-indigo-700' : 'bg-rose-500 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-extrabold text-sm flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">{currentUserName}</p>
                <p className="text-[11px] text-slate-400">{userRole === 'admin' ? 'מנהל מערכת' : 'צופה בלבד'}</p>
              </div>
            </div>
            <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full ${dbConnected ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dbConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {dbConnected ? 'ענן' : 'מקומי'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> התנתק מהמערכת
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-[#0F172A] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4B5320] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-amber-100" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight">הוצאת ספרי הישיבה</span>
            <span className="text-[10px] text-slate-400">{activeNavItem?.label}</span>
          </div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs print:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-[#0F172A] text-white w-72 h-full p-4 space-y-1.5 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3.5 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-200" />
                <span className="font-bold text-sm">תפריט ניווט</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg bg-slate-800"><X className="w-4 h-4" /></button>
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === item.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-3"><Icon className="w-4 h-4" />{item.label}</span>
                  {item.badge > 0 && <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                </button>
              );
            })}
            <div className="pt-4 mt-4 border-t border-slate-800 space-y-2.5">
              <div className="px-3 text-xs text-slate-300 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-200 font-bold flex items-center justify-center">{userInitial}</div>
                <div>
                  <strong className="text-white block">{currentUserName}</strong>
                  <span className="text-[10px] text-slate-400">{userRole === 'admin' ? 'מנהל מערכת' : 'צופה בלבד'}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-rose-600/90 hover:bg-rose-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> התנתק מהמערכת
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Utility Header */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-3">
            {activeNavItem && (() => {
              const ActiveIcon = activeNavItem.icon;
              return (
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-100">
                  <ActiveIcon className="w-4 h-4" />
                </div>
              );
            })()}
            <div>
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">{activeNavItem?.label}</h2>
              <p className="text-[11px] text-slate-400">{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {pendingOrders.length > 0 && activeTab !== 'orders' && (
              <button
                onClick={() => setActiveTab('orders')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {pendingOrders.length} הזמנות ממתינות לאריזה
              </button>
            )}
            {activeTab !== 'pos' && (
              <button
                onClick={() => setActiveTab('pos')}
                className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" /> קופה מהירה
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto overflow-x-hidden">
        {/* ==================== 1. DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">תמונת מצב עסקית</h2>
                <p className="text-sm text-slate-500 mt-0.5">סיכום חי של המלאי, שווי הספרים, ההכנסות ויתרות הגבייה</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500">סה"כ עותקים במערכת</p>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Package className="w-4 h-4" /></div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{totalCopiesInSystem.toLocaleString()}</p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>במחסן: <strong className="text-indigo-700">{totalWarehouseCopies.toLocaleString()}</strong></span>
                  <span>ספקים: <strong className="text-slate-700">{(totalCopiesInSystem - totalWarehouseCopies).toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500">שווי מלאי (צרכן / הדפסה)</p>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>
                </div>
                <p className="text-3xl font-extrabold text-emerald-700 mt-2 tracking-tight">₪{Math.round(totalRetailValue).toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-100">לפי עלות הדפסה: <strong className="text-rose-600">₪{Math.round(totalProductionValue).toLocaleString()}</strong></p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-purple-200/70 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-purple-700">הכנסות מתועדות</p>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
                </div>
                <p className="text-3xl font-extrabold text-purple-900 mt-2 tracking-tight">₪{Math.round(liveStoreRevenue + liveSupplierRevenue + livePosRevenue).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">אתר: ₪{Math.round(liveStoreRevenue).toLocaleString()} · ספקים: ₪{Math.round(liveSupplierRevenue).toLocaleString()} · דוכן: ₪{Math.round(livePosRevenue).toLocaleString()}</p>
              </div>

              <div onClick={() => setActiveTab('suppliers')} className="cursor-pointer bg-gradient-to-br from-rose-50 to-white p-5 rounded-2xl shadow-xs ring-1 ring-rose-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-rose-800">יתרת חוב פתוחה מספקים</p>
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><Wallet className="w-4 h-4" /></div>
                </div>
                <p className="text-3xl font-extrabold text-rose-700 mt-2 tracking-tight">₪{Math.round(totalOpenSupplierDebt).toLocaleString()}</p>
                <p className="text-xs text-rose-600/90 font-medium mt-3 pt-2.5 border-t border-rose-100">לחץ למעבר למסך ספקים וגבייה ←</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-xs ring-1 ring-slate-200/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></span>
                    התראות מלאי נמוך
                  </h3>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">{lowStockBooks.length} ספרים</span>
                </div>
                {lowStockBooks.length === 0 ? (
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-700 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> כל הספרים מעל רף ההתראה!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pl-1">
                    {lowStockBooks.map(b => (
                      <div key={b.id} className="flex justify-between items-center p-3 bg-slate-50/80 hover:bg-amber-50/60 border border-slate-200/70 rounded-xl text-sm transition-colors">
                        <span className="font-semibold text-slate-800">{b.title}</span>
                        <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg text-xs shrink-0">
                          {calculateTotalStock(b)} / רף {b.threshold || 30}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs ring-1 ring-slate-200/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><ShoppingCart className="w-4 h-4" /></span>
                    הזמנות פתוחות לטיפול
                  </h3>
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{pendingOrders.length} פתוחות</span>
                </div>
                {pendingOrders.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center text-sm text-slate-400">אין הזמנות פתוחות כרגע.</div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pl-1">
                    {pendingOrders.slice(0, 6).map(o => (
                      <div key={o.id} className="flex justify-between items-center p-3 bg-slate-50/80 hover:bg-indigo-50/40 border border-slate-200/70 rounded-xl text-sm transition-colors">
                        <div>
                          <p className="font-bold text-slate-800">#{String(o.orderId || '').replace(/^#/, '')} — {o.customerName}</p>
                          <p className="text-xs text-slate-500">{o.date}</p>
                        </div>
                        <button onClick={() => setActiveTab('orders')} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg font-bold shadow-xs transition-colors">טפל</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. POS (QUICK STALL SALES) ==================== */}
        {activeTab === 'pos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><CreditCard className="w-5 h-5" /></span>
                  קופה מהירה למכירות בישיבה / דוכן
                </h2>
                <p className="text-slate-500 text-xs mt-1">בחר ספרים להוספה לסל — המלאי יופחת אוטומטית מהמחסן הראשי</p>
              </div>
              <div className="bg-slate-100 p-1 rounded-xl flex items-center ring-1 ring-slate-200/80 w-full sm:w-auto">
                <button onClick={() => setPosPriceMode('yeshiva')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${posPriceMode === 'yeshiva' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}>מחירון ישיבה</button>
                <button onClick={() => setPosPriceMode('general')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${posPriceMode === 'general' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}>מחירון צרכן</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input type="text" value={posSearch} onChange={e => setPosSearch(e.target.value)} placeholder="חפש ספר מהיר בדוכן..." className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm shadow-xs outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {inventoryList
                    .filter(b => (b.title || '').includes(posSearch))
                    .sort((a, b) => a.title.localeCompare(b.title, 'he'))
                    .map(book => {
                      const price = getPosBookPrice(book, posPriceMode);
                      const inCart = posCart.find(c => c.bookId === book.id)?.qty || 0;
                      return (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => handleAddToPosCart(book)}
                          className={`text-right p-4 rounded-2xl transition-all duration-150 active:scale-[0.98] flex flex-col justify-between min-h-[120px] relative ${
                            inCart > 0
                              ? 'bg-indigo-50/80 ring-2 ring-indigo-500 shadow-sm'
                              : 'bg-white ring-1 ring-slate-200/80 hover:ring-indigo-300 hover:shadow-md'
                          }`}
                        >
                          {inCart > 0 && <span className="absolute -top-2 -left-2 bg-indigo-600 text-white text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">{inCart}</span>}
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{book.title}</h4>
                            <span className="inline-block text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1.5">במחסן: {book.publisherStock}</span>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-lg font-extrabold text-emerald-600">₪{price}</span>
                            <span className="text-[11px] bg-indigo-100/80 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">+ הוסף</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/80 p-5 flex flex-col h-fit sticky top-24 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                  <h4 className="font-extrabold text-slate-800 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-indigo-600" /> סל קנייה נוכחי</h4>
                  {posCart.length > 0 && <button onClick={() => setPosCart([])} className="text-xs font-bold text-rose-500 hover:text-rose-700">רוקן סל</button>}
                </div>
                {posCart.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <ShoppingCart className="w-10 h-10 text-slate-200 mx-auto" />
                    <p className="text-slate-400 text-sm">לחץ על הספרים מימין להוספה לסל</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pl-1">
                    {posCart.map(item => {
                      const book = inventoryList.find(b => b.id === item.bookId);
                      const unitPrice = book ? getPosBookPrice(book, posPriceMode) : 0;
                      return (
                        <div key={item.bookId} className="flex items-center justify-between gap-2 bg-slate-50/90 p-3 rounded-xl ring-1 ring-slate-200/60">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-slate-800 truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">₪{unitPrice} ליח' · <strong className="text-slate-700">₪{(unitPrice * item.qty).toLocaleString()}</strong></p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleUpdatePosCartQty(item.bookId, -1)} className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="font-extrabold text-sm w-6 text-center">{item.qty}</span>
                            <button onClick={() => handleUpdatePosCartQty(item.bookId, 1)} className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-4 gap-1.5">
                    {['מזומן', 'ביט', 'פייבוקס', 'אשראי'].map(m => (
                      <button key={m} type="button" onClick={() => setPosPaymentMethod(m)} className={`py-2 rounded-xl text-xs font-bold border transition-all ${posPaymentMethod === m ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{m}</button>
                    ))}
                  </div>
                  <input type="text" value={posBuyerNote} onChange={e => setPosBuyerNote(e.target.value)} placeholder="שם קונה / הערה (אופציונלי)" className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none transition-colors" />
                  <div className="bg-gradient-to-l from-emerald-50 to-teal-50/70 border border-emerald-200/80 p-4 rounded-2xl flex justify-between items-center">
                    <span className="font-bold text-emerald-900 text-sm">סה"כ לתשלום:</span>
                    <span className="text-2xl font-extrabold text-emerald-700">
                      ₪{posCart.reduce((s, item) => { const b = inventoryList.find(x => x.id === item.bookId); return s + (b ? getPosBookPrice(b, posPriceMode) * item.qty : 0); }, 0).toLocaleString()}
                    </span>
                  </div>
                  <button type="button" disabled={posCart.length === 0} onClick={handleCompletePosSale} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 disabled:shadow-none flex items-center justify-center gap-2 transition-all">
                    <CheckCircle className="w-5 h-5" /> אשר מכירה והפחת ממלאי
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. STORE ORDERS ==================== */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><ShoppingCart className="w-5 h-5" /></span>
                  הזמנות מהחנות (אתר הישיבה)
                </h2>
                <p className="text-xs text-slate-500 mt-1">הזמנות שנכנסות מהאתר וממתינות לאריזה ומשלוח</p>
              </div>
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 ring-1 ring-slate-200/80">
                <button onClick={() => setOrdersSubTab('pending')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${ordersSubTab === 'pending' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}>הזמנות פתוחות ({pendingOrders.length})</button>
                <button onClick={() => setOrdersSubTab('shipped')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${ordersSubTab === 'shipped' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}>הזמנות שנשלחו ({shippedOrders.length})</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(ordersSubTab === 'pending' ? pendingOrders : shippedOrders).map(order => (
                <div key={order.id} className={`bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 border-r-4 hover:shadow-md transition-all space-y-3.5 ${ordersSubTab === 'pending' ? 'border-r-amber-500' : 'border-r-emerald-500'}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="inline-block text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md mb-1">הזמנה #{String(order.orderId || '').replace(/^#/, '')}</span>
                      <h4 className="font-extrabold text-slate-900 text-base">{order.customerName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{order.address} · {order.shippingMethod}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-lg font-extrabold text-slate-900">₪{Number(order.total || 0).toLocaleString()}</span>
                      <p className="text-[11px] text-slate-400">{order.date} {order.time}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50/90 p-3.5 rounded-xl ring-1 ring-slate-200/60 text-sm space-y-1.5">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-slate-700">{item.name}</span>
                        <span className="font-extrabold bg-white px-2 py-0.5 rounded-md ring-1 ring-slate-200 text-xs">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => setPrintDoc({
                        type: 'packing_slip',
                        docTitle: 'דף אריזה למשלוח',
                        orderId: String(order.orderId || '').replace(/^#/, ''),
                        date: order.date,
                        recipient: `${order.customerName} — ${order.address}`,
                        items: order.items || []
                      })}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> הדפס דף אריזה
                    </button>
                    {ordersSubTab === 'pending' && userRole === 'admin' && (
                      <button
                        onClick={() => handleMarkOrderShipped(order)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 mr-auto shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> סמן כנארז ונשלח
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(ordersSubTab === 'pending' ? pendingOrders : shippedOrders).length === 0 && (
                <div className="col-span-full bg-white p-14 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                  <ShoppingCart className="w-10 h-10 text-slate-200 mx-auto" />
                  <p className="text-slate-400 font-medium">{ordersSubTab === 'pending' ? 'אין הזמנות פתוחות כרגע.' : 'עדיין אין הזמנות שנשלחו.'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 4. INVENTORY MANAGEMENT ==================== */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl shadow-xs ring-1 ring-slate-200/70 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
              <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3.5">
                <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חיפוש לפי שם ספר, מחבר או דאנאק..."
                      className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm outline-none transition-all"
                    />
                  </div>
                  <select
                    value={inventorySort}
                    onChange={(e) => setInventorySort(e.target.value)}
                    className="p-2.5 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white text-sm outline-none font-medium text-slate-700"
                  >
                    <option value="alphabetical">מיון: אלף-בית</option>
                    <option value="date">מיון: עודכן לאחרונה</option>
                  </select>
                </div>

                {userRole === 'admin' && (
                  <div className="flex flex-wrap gap-2 print:hidden">
                    <button onClick={() => setIsGiftModalOpen(true)} className="bg-purple-50 hover:bg-purple-100 text-purple-700 ring-1 ring-purple-200/80 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"><Gift className="w-4 h-4" /> חלוקה לתורמים</button>
                    <button onClick={handleImportYhyCatalog} className="bg-pink-50 hover:bg-pink-100 text-pink-700 ring-1 ring-pink-200/80 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"><RefreshCw className="w-4 h-4" /> סנכרן מחירון</button>
                    <button onClick={() => { setNewBookForm(emptyBookForm); setIsAddBookModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all"><Plus className="w-4 h-4" /> הוסף ספר</button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 print:hidden">
                <button
                  onClick={() => setIsWarehouseMode(!isWarehouseMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${isWarehouseMode ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 hover:bg-amber-100 text-amber-800 ring-1 ring-amber-200/80'}`}
                >
                  <ClipboardList className="w-3.5 h-3.5" /> {isWarehouseMode ? 'חזרה לטבלה רגילה' : 'מצב ספירת מלאי'}
                </button>
                <button onClick={() => setIsCatalogModalOpen(true)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"><BookMarked className="w-3.5 h-3.5" /> קטלוג לשליחה</button>
                <button onClick={() => setIsGiftHistoryOpen(true)} className="bg-slate-50 hover:bg-slate-100 text-slate-700 ring-1 ring-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"><History className="w-3.5 h-3.5" /> מעקב מתנות ({giftLogs.length})</button>
                <div className="mr-auto flex items-center gap-2">
                  <button onClick={() => window.print()} className="bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"><Printer className="w-3.5 h-3.5" /> הדפס</button>
                  <button onClick={handleExportCSV} className="bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"><Download className="w-3.5 h-3.5" /> ייצוא CSV</button>
                </div>
              </div>
            </div>

            {isWarehouseMode ? (
              /* --- מצב ספירת מלאי מהירה (מחסן) --- */
              <div className="p-4 md:p-6 bg-amber-50/30 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white ring-1 ring-amber-200/80 p-4 rounded-2xl shadow-xs">
                  <div>
                    <h4 className="font-extrabold text-amber-900 text-sm md:text-base flex items-center gap-2"><ClipboardList className="w-4 h-4 text-amber-600" /> מצב ספירת מלאי מהירה במחסן</h4>
                    <p className="text-xs text-slate-500 mt-0.5">כל לחיצה מעדכנת מיד את כמות המלאי במחסן הראשי</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-600 ml-1">גודל ארגז:</span>
                    {[10, 20, 25, 30].map(size => (
                      <button key={size} onClick={() => setWarehouseBoxSize(size)} className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${warehouseBoxSize === size ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'}`}>{size}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {sortedInventory.map(book => (
                    <div key={book.id} className="bg-white p-4 rounded-2xl ring-1 ring-slate-200/80 shadow-xs flex flex-col gap-3">
                      <div className="flex justify-between items-center gap-2">
                        <h5 className="font-bold text-slate-800 text-sm">{book.title}</h5>
                        <span className="text-xl font-extrabold text-indigo-700 bg-indigo-50 ring-1 ring-indigo-100 px-3.5 py-1 rounded-xl">{Number(book.publisherStock || 0).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => handleQuickWarehouseAdjust(book, -warehouseBoxSize)} className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition-colors">-{warehouseBoxSize} ארגז</button>
                        <button onClick={() => handleQuickWarehouseAdjust(book, -1)} className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">-1</button>
                        <button onClick={() => handleQuickWarehouseAdjust(book, 1)} className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm transition-colors">+1</button>
                        <button onClick={() => handleQuickWarehouseAdjust(book, warehouseBoxSize)} className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors">+{warehouseBoxSize} ארגז</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* --- טבלת ניהול המלאי המלאה --- */
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm min-w-[980px]">
                  <thead className="bg-slate-50/90 text-slate-500 border-b border-slate-200/80 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="py-3.5 px-5 font-bold">שם הספר ופרטים</th>
                      <th className="py-3.5 px-4 font-bold text-center">מחירים (אתר / ספק / ישיבה)</th>
                      <th className="py-3.5 px-4 font-bold text-center text-rose-700 bg-rose-50/40">עלות הפקה</th>
                      <th className="py-3.5 px-4 font-bold text-center">רווחיות לעותק</th>
                      <th className="py-3.5 px-4 font-bold text-center bg-indigo-50/40 text-indigo-800">במחסן הראשי</th>
                      <th className="py-3.5 px-4 font-bold">פיזור אצל ספקים</th>
                      <th className="py-3.5 px-4 font-bold text-center">סה"כ מלאי</th>
                      {userRole === 'admin' && <th className="py-3.5 px-4 font-bold text-center print:hidden">פעולות</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedInventory.map(book => {
                      const totalStock = calculateTotalStock(book);
                      const isLow = totalStock < Number(book.threshold || 30);
                      const cost = Number(book.productionCost || 0);
                      const webPrice = Number(book.prices?.general || 0);
                      const supPrice = Number(book.prices?.supplier || 0);
                      const webProfit = webPrice > 0 ? webPrice - cost : 0;
                      const webMargin = webPrice > 0 ? Math.round((webProfit / webPrice) * 100) : 0;
                      const supProfit = supPrice > 0 ? supPrice - cost : 0;

                      return (
                        <tr key={book.id} className="hover:bg-indigo-50/20 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900 text-sm">{book.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-2">
                              {book.author && <span>{book.author}</span>}
                              {book.isbn && <span>· דאנאק: {book.isbn}</span>}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-wrap justify-center gap-1 text-[11px]">
                              <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-md">אתר ₪{webPrice}</span>
                              <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">ספק ₪{supPrice}</span>
                              <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md">ישיבה ₪{Number(book.prices?.yeshiva || 0)}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center bg-rose-50/25 border-x border-slate-100/80">
                            <span className="font-extrabold text-rose-700 text-sm">₪{cost.toLocaleString()}</span>
                          </td>

                          <td className="py-4 px-4 text-center text-xs">
                            {cost > 0 ? (
                              <div className="space-y-1">
                                {webPrice > 0 && <div className="text-emerald-700 font-bold bg-emerald-50/80 inline-block px-2 py-0.5 rounded-md">אתר: ₪{webProfit.toFixed(1)} ({webMargin}%)</div>}
                                {supPrice > 0 && <div className="text-slate-500 text-[11px]">ספק: ₪{supProfit.toFixed(1)}</div>}
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center bg-indigo-50/20">
                            {userRole === 'admin' ? (
                              <input
                                type="number"
                                min="0"
                                value={book.publisherStock}
                                onChange={(e) => handleInlineStockChange(book, e.target.value)}
                                className="w-20 font-extrabold text-indigo-700 text-base text-center bg-white border border-indigo-200/80 rounded-xl py-1.5 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none shadow-2xs transition-all"
                                dir="ltr"
                              />
                            ) : (
                              <span className="font-extrabold text-indigo-700 text-base">{Number(book.publisherStock || 0).toLocaleString()}</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {(book.breakdown || []).filter(r => Number(r.amount) > 0).length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {(book.breakdown || []).filter(r => Number(r.amount) > 0).map((row, i) => (
                                  <span key={i} className="bg-slate-100/90 text-slate-700 ring-1 ring-slate-200/80 px-2.5 py-0.5 rounded-lg text-xs font-medium">
                                    {row.location}: <strong className="text-slate-900">{row.amount}</strong>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">אין אצל ספקים</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <div className="font-extrabold text-slate-900 text-base">{totalStock.toLocaleString()}</div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              {isLow ? 'מלאי נמוך' : 'תקין'}
                            </span>
                          </td>

                          {userRole === 'admin' && (
                            <td className="py-4 px-4 text-center print:hidden">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setEditingBook({
                                    ...book,
                                    prices: { catalog: 0, general: 0, supplier: 0, yeshiva: 0, ...(book.prices || {}) },
                                    editions: book.editions?.length ? book.editions : [{ name: 'מהדורה 1', printRun: 0 }],
                                    breakdown: book.breakdown || []
                                  })}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                  title="ערוך ספר"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteBook(book)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="מחק ספר">
                                  <Trash2 className="w-4 h-4" />
                                </button>
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

        {/* ==================== 5. SUPPLIERS & DISTRIBUTION ==================== */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3.5">
              <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={supplierSearch}
                    onChange={e => setSupplierSearch(e.target.value)}
                    placeholder="חיפוש ספק, חנות או איש קשר..."
                    className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 text-sm outline-none transition-all"
                  />
                </div>
                <select
                  value={supplierSort}
                  onChange={e => setSupplierSort(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-xl bg-slate-50/80 text-sm outline-none font-medium text-slate-700"
                >
                  <option value="alphabetical">מיון: אלף-בית</option>
                  <option value="date">מיון: עודכן לאחרונה</option>
                </select>
              </div>
              {userRole === 'admin' && (
                <button
                  onClick={() => { setEditingSupplier(null); setSupplierForm(emptySupplierForm); setIsSupplierModalOpen(true); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" /> הוסף ספק / חנות
                </button>
              )}
            </div>

            {sortedSuppliers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center space-y-3">
                <Truck className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">עדיין לא הוגדרו ספקים או חנויות</h4>
                <p className="text-sm text-slate-500">לחץ על "הוסף ספק / חנות" כדי להתחיל לנהל הזמנות, מלאי בקונסיגנציה וגבייה.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedSuppliers.map(supplier => {
                  const heldItems = getSupplierInventoryItems(supplier.name);
                  const totalHeld = heldItems.reduce((s, i) => s + i.amount, 0);
                  const openDebt = getSupplierOpenDebt(supplier.name);

                  return (
                    <div key={supplier.id} className="bg-white rounded-2xl shadow-xs ring-1 ring-slate-200/70 hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4">
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-sm flex items-center justify-center shrink-0 ring-1 ring-slate-200/80">
                              {(supplier.name || 'ס').charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-base leading-tight">{supplier.name}</h3>
                              {supplier.contact && <p className="text-xs text-slate-500 mt-0.5">איש קשר: {supplier.contact}</p>}
                            </div>
                          </div>
                          {userRole === 'admin' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setEditingSupplier(supplier); setSupplierForm({ name: supplier.name, contact: supplier.contact || '', phone: supplier.phone || '', email: supplier.email || '', address: supplier.address || '', notes: supplier.notes || '' }); setIsSupplierModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteSupplier(supplier)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1.5">
                          {supplier.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {supplier.phone}</p>}
                          {supplier.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {supplier.email}</p>}
                          {supplier.notes && <p className="text-slate-500 bg-slate-50 p-2.5 rounded-xl ring-1 ring-slate-100 mt-1">{supplier.notes}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <div className="bg-indigo-50/70 ring-1 ring-indigo-100 p-3 rounded-xl text-center">
                            <p className="text-[11px] text-indigo-700 font-semibold">מלאי אצל הספק</p>
                            <p className="text-lg font-extrabold text-indigo-900 mt-0.5">{totalHeld.toLocaleString()} עותקים</p>
                          </div>
                          <div className={`p-3 rounded-xl text-center ring-1 ${openDebt > 0 ? 'bg-rose-50/80 ring-rose-200/80' : 'bg-emerald-50/80 ring-emerald-200/80'}`}>
                            <p className={`text-[11px] font-semibold ${openDebt > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>יתרת חוב פתוחה</p>
                            <p className={`text-lg font-extrabold mt-0.5 ${openDebt > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>₪{openDebt.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3.5 border-t border-slate-100">
                        <button onClick={() => setViewingSupplierStock(supplier)} className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                          <Package className="w-3.5 h-3.5" /> צפה במלאי
                        </button>
                        <button onClick={() => { setSelectedSupplierForHistory(supplier); setIsSupplierHistoryModalOpen(true); }} className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                          <History className="w-3.5 h-3.5" /> היסטוריה וגבייה
                        </button>
                        {userRole === 'admin' && (
                          <>
                            <button onClick={() => openSupplierOrderModal(supplier)} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors">
                              <Send className="w-3.5 h-3.5" /> הפק הזמנה
                            </button>
                            <button onClick={() => openConsignmentModal(supplier)} className="bg-amber-50 hover:bg-amber-100 text-amber-900 ring-1 ring-amber-200/80 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                              <ArrowLeftRight className="w-3.5 h-3.5" /> מכירה / החזרה
                            </button>
                          </>
                        )}
                        {openDebt > 0 && supplier.phone && (
                          <button onClick={() => handleSendDebtWhatsAppReminder(supplier)} className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors">
                            <MessageCircle className="w-3.5 h-3.5" /> שלח תזכורת גבייה בוואטסאפ
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== 6. PRODUCTION KANBAN ==================== */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><KanbanSquare className="w-5 h-5" /></span>
                  מעקב הפקת ספרים
                </h2>
                <p className="text-xs text-slate-500 mt-1">לחץ על כל ספר לניהול שלבים, הוצאות הפקה, מחיקה או העברה למלאי</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setBreakEvenForm({ bookTitle: '', totalCost: 15000, printRun: 1000, sellPrice: 60 }); setIsBreakEvenModalOpen(true); }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 ring-1 ring-amber-200/80 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Calculator className="w-4 h-4" /> מחשבון נקודת איזון
                </button>
                {userRole === 'admin' && (
                  <button onClick={() => setIsAddTaskModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all">
                    <Plus className="w-4 h-4" /> פרויקט ספר חדש
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {KANBAN_COLUMNS.map(col => {
                const colTasks = tasksList.filter(t => (t.status || 'planned') === col.id);
                return (
                  <div key={col.id} className={`rounded-2xl p-3.5 border min-h-[340px] ${col.color}`}>
                    <div className="flex justify-between items-center mb-3.5 px-1">
                      <h3 className="font-extrabold text-slate-800 text-sm">{col.title}</h3>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${col.badge}`}>{colTasks.length}</span>
                    </div>
                    <div className="space-y-2.5">
                      {colTasks.map(task => {
                        const totalExp = (task.invoices || []).reduce((s, i) => s + Number(i.amount || 0), 0);
                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="bg-white p-3.5 rounded-xl shadow-xs ring-1 ring-slate-200/80 hover:ring-indigo-400 hover:shadow-md cursor-pointer transition-all space-y-2"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-slate-900 text-sm leading-snug">{task.title}</h4>
                              {userRole === 'admin' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                                  className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors"
                                  title="מחק פרויקט"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            {task.author && <p className="text-xs text-slate-500">{task.author}</p>}
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px]">
                              <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md">₪{totalExp.toLocaleString()}</span>
                              {task.addedToInventory && <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">במלאי ✓</span>}
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

        {/* ==================== 7. PRINT QUOTES COMPARISON ==================== */}
        {activeTab === 'print_quotes' && (() => {
          const uniqueProjects = Array.from(new Set(printQuotes.map(q => q.projectTitle))).sort((a, b) => a.localeCompare(b, 'he'));
          const filteredQuotes = (selectedQuoteProject === 'ALL'
            ? printQuotes
            : printQuotes.filter(q => q.projectTitle === selectedQuoteProject)
          ).slice().sort((a, b) => (a.effectivePrice || a.totalPrice) - (b.effectivePrice || b.totalPrice));

          const cheapestQuote = filteredQuotes[0] || null;
          const mostExpensiveQuote = filteredQuotes.length > 0 ? filteredQuotes[filteredQuotes.length - 1] : null;
          const cheapestPerCopyQuote = filteredQuotes.length > 0
            ? filteredQuotes.reduce((min, q) => ((q.costPerCopy || 999999) < (min.costPerCopy || 999999) ? q : min), filteredQuotes[0])
            : null;
          const fastestQuote = filteredQuotes.filter(q => Number(q.deliveryDays) > 0).length > 0
            ? filteredQuotes.filter(q => Number(q.deliveryDays) > 0).reduce((min, q) => (Number(q.deliveryDays) < Number(min.deliveryDays) ? q : min))
            : null;

          const minEffectivePrice = cheapestQuote ? Number(cheapestQuote.effectivePrice || cheapestQuote.totalPrice) : 0;
          const maxEffectivePrice = mostExpensiveQuote ? Number(mostExpensiveQuote.effectivePrice || mostExpensiveQuote.totalPrice) : 0;
          const potentialSavings = Math.max(0, maxEffectivePrice - minEffectivePrice);
          const savingsPct = maxEffectivePrice > 0 ? Math.round((potentialSavings / maxEffectivePrice) * 100) : 0;

          return (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Scale className="w-5 h-5" /></span>
                    השוואת הצעות מחיר מבתי דפוס
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">שמור מסמכי הצעות מחיר והשווה בקלות עלות כוללת, עלות לעותק וזמני אספקה</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <select value={selectedQuoteProject} onChange={e => setSelectedQuoteProject(e.target.value)} className="p-2.5 border border-slate-200 rounded-xl bg-slate-50/80 text-sm outline-none min-w-[200px] font-medium">
                    <option value="ALL">כל הפרויקטים ({printQuotes.length})</option>
                    {uniqueProjects.map(p => <option key={p} value={p}>{p} ({printQuotes.filter(q => q.projectTitle === p).length})</option>)}
                  </select>
                  {userRole === 'admin' && (
                    <button onClick={() => setIsAddQuoteModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all">
                      <Plus className="w-4 h-4" /> העלה הצעת דפוס חדשה
                    </button>
                  )}
                </div>
              </div>

              {filteredQuotes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-xs ring-1 ring-emerald-200/80">
                    <div className="flex justify-between items-center text-emerald-700 text-xs font-bold"><span>ההצעה הזולה ביותר</span><div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center"><Award className="w-4 h-4" /></div></div>
                    <p className="text-2xl font-extrabold text-emerald-900 mt-1">₪{minEffectivePrice.toLocaleString()}</p>
                    <p className="text-xs text-emerald-700 mt-1 truncate">{cheapestQuote?.printerName}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-xs ring-1 ring-indigo-200/80">
                    <div className="flex justify-between items-center text-indigo-700 text-xs font-bold"><span>עלות נמוכה לעותק</span><div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center"><DollarSign className="w-4 h-4" /></div></div>
                    <p className="text-2xl font-extrabold text-indigo-900 mt-1">₪{Number(cheapestPerCopyQuote?.costPerCopy || 0).toFixed(2)}</p>
                    <p className="text-xs text-indigo-700 mt-1 truncate">{cheapestPerCopyQuote?.printerName}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-xs ring-1 ring-amber-200/80">
                    <div className="flex justify-between items-center text-amber-800 text-xs font-bold"><span>פער מחירים (חיסכון)</span><div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div></div>
                    <p className="text-2xl font-extrabold text-amber-900 mt-1">₪{potentialSavings.toLocaleString()}</p>
                    <p className="text-xs text-amber-700 mt-1">{filteredQuotes.length > 1 ? `חיסכון של ${savingsPct}%` : 'הוסף הצעה נוספת'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-xs ring-1 ring-slate-200/80">
                    <div className="flex justify-between items-center text-slate-600 text-xs font-bold"><span>אספקה מהירה</span><div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"><Clock className="w-4 h-4" /></div></div>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{fastestQuote ? `${fastestQuote.deliveryDays} ימים` : 'לא הוזן'}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate">{fastestQuote?.printerName || ''}</p>
                  </div>
                </div>
              )}

              {filteredQuotes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center space-y-2">
                  <Scale className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">עדיין לא הועלו הצעות מחיר מדפוסים</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xs ring-1 ring-slate-200/70 overflow-x-auto">
                  <table className="w-full text-right text-sm min-w-[900px]">
                    <thead className="bg-slate-50/90 text-slate-500 border-b border-slate-200/80 text-xs uppercase">
                      <tr>
                        <th className="p-4 font-bold">בית הדפוס / ספר</th>
                        <th className="p-4 font-bold text-center">כמות</th>
                        <th className="p-4 font-bold text-center">מחיר כולל מע"מ</th>
                        <th className="p-4 font-bold text-center">עלות לעותק</th>
                        <th className="p-4 font-bold text-center">פער מהזול</th>
                        <th className="p-4 font-bold">מפרט</th>
                        <th className="p-4 font-bold text-center">מסמך</th>
                        <th className="p-4 font-bold text-center">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredQuotes.map(quote => {
                        const effPrice = Number(quote.effectivePrice || quote.totalPrice);
                        const diff = effPrice - minEffectivePrice;
                        const diffPct = minEffectivePrice > 0 ? Math.round((diff / minEffectivePrice) * 100) : 0;
                        const isBest = filteredQuotes.length > 1 && diff === 0;
                        return (
                          <tr key={quote.id} className={isBest ? 'bg-emerald-50/35' : 'hover:bg-slate-50/70'}>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{quote.printerName}</span>
                                {isBest && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">הכי משתלם</span>}
                              </div>
                              <div className="text-xs text-indigo-600 mt-0.5">{quote.projectTitle}</div>
                            </td>
                            <td className="p-4 text-center font-bold">{Number(quote.copies).toLocaleString()}</td>
                            <td className="p-4 text-center font-extrabold text-slate-900">₪{effPrice.toLocaleString()}</td>
                            <td className="p-4 text-center"><span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">₪{Number(quote.costPerCopy || 0).toFixed(2)}</span></td>
                            <td className="p-4 text-center">
                              {diff === 0 ? <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">הזול ביותר</span> : <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">+₪{diff.toLocaleString()} (+{diffPct}%)</span>}
                            </td>
                            <td className="p-4 text-xs text-slate-600">
                              {[quote.coverType, quote.paperType, quote.pages ? `${quote.pages} עמ'` : '', quote.deliveryDays ? `${quote.deliveryDays} ימים` : ''].filter(Boolean).join(' · ')}
                              {quote.notes && <p className="text-slate-400 mt-0.5">{quote.notes}</p>}
                            </td>
                            <td className="p-4 text-center">
                              {quote.fileData ? (
                                <button onClick={() => setPreviewQuoteDoc(quote)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors"><Eye className="w-3.5 h-3.5" /> צפה</button>
                              ) : <span className="text-xs text-slate-400">—</span>}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-1">
                                <button onClick={() => { setBreakEvenForm({ bookTitle: `${quote.projectTitle} (${quote.printerName})`, totalCost: effPrice, printRun: Number(quote.copies || 1000), sellPrice: 60 }); setIsBreakEvenModalOpen(true); }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors" title="נקודת איזון"><Calculator className="w-4 h-4" /></button>
                                {userRole === 'admin' && <button onClick={() => handleDeletePrintQuote(quote)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {/* ==================== 8. MARKETING & PR ==================== */}
        {activeTab === 'marketing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-xs ring-1 ring-slate-200/70 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Megaphone className="w-4 h-4" /></span>
                קמפיינים ופרסום
              </h3>
              {userRole === 'admin' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newCampaignForm.name.trim()) return;
                    const obj = { ...newCampaignForm, budget: Number(newCampaignForm.budget || 0), spent: Number(newCampaignForm.spent || 0), id: Date.now().toString() };
                    setCampaignsList(prev => [obj, ...prev]);
                    if (db && dbConnected) { try { await addDoc(getCollRef('campaigns'), obj); } catch {} }
                    setNewCampaignForm({ name: '', budget: '', spent: '', channel: 'וואטסאפ / בוגרים' });
                  }}
                  className="grid grid-cols-2 gap-2.5 bg-slate-50/90 p-4 rounded-2xl ring-1 ring-slate-200/70"
                >
                  <input required placeholder="שם הקמפיין" value={newCampaignForm.name} onChange={e => setNewCampaignForm({ ...newCampaignForm, name: e.target.value })} className="col-span-2 p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-indigo-500" />
                  <input type="number" min="0" placeholder="תקציב (₪)" value={newCampaignForm.budget} onChange={e => setNewCampaignForm({ ...newCampaignForm, budget: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-indigo-500" />
                  <input type="number" min="0" placeholder="נוצל (₪)" value={newCampaignForm.spent} onChange={e => setNewCampaignForm({ ...newCampaignForm, spent: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-indigo-500" />
                  <button type="submit" className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors">+ הוסף קמפיין</button>
                </form>
              )}
              <div className="space-y-3">
                {campaignsList.map(c => {
                  const pct = Number(c.budget) > 0 ? Math.min(100, Math.round((Number(c.spent || 0) / Number(c.budget)) * 100)) : 0;
                  return (
                    <div key={c.id} className="p-4 ring-1 ring-slate-200/80 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-800">{c.name}</span>
                        <span className="text-xs font-semibold text-slate-500">₪{Number(c.spent || 0).toLocaleString()} / ₪{Number(c.budget || 0).toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-l from-indigo-500 to-indigo-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {campaignsList.length === 0 && <p className="text-xs text-slate-400 text-center py-6">אין קמפיינים רשומים עדיין.</p>}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs ring-1 ring-slate-200/70 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><FileText className="w-4 h-4" /></span>
                עותקי ביקורת ויח"צ
              </h3>
              {userRole === 'admin' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newPrForm.bookTitle.trim() || !newPrForm.recipient.trim()) return;
                    const obj = { ...newPrForm, date: new Date().toLocaleDateString('he-IL'), id: Date.now().toString() };
                    setPrCopies(prev => [obj, ...prev]);
                    if (db && dbConnected) { try { await addDoc(getCollRef('pr_copies'), obj); } catch {} }
                    setNewPrForm({ bookTitle: '', recipient: '', role: 'מבקר / עיתונאי' });
                  }}
                  className="grid grid-cols-2 gap-2.5 bg-slate-50/90 p-4 rounded-2xl ring-1 ring-slate-200/70"
                >
                  <input required placeholder="שם הספר" value={newPrForm.bookTitle} onChange={e => setNewPrForm({ ...newPrForm, bookTitle: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-emerald-500" />
                  <input required placeholder="למי נשלח" value={newPrForm.recipient} onChange={e => setNewPrForm({ ...newPrForm, recipient: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-emerald-500" />
                  <button type="submit" className="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors">+ תעד עותק ביקורת</button>
                </form>
              )}
              <div className="space-y-2.5">
                {prCopies.map(pr => (
                  <div key={pr.id} className="p-3.5 ring-1 ring-slate-200/80 rounded-xl flex justify-between items-center text-xs hover:bg-slate-50/70 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800">{pr.bookTitle}</p>
                      <p className="text-slate-500 mt-0.5">נשלח אל: {pr.recipient}</p>
                    </div>
                    <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{pr.date}</span>
                  </div>
                ))}
                {prCopies.length === 0 && <p className="text-xs text-slate-400 text-center py-6">לא תועדו עותקי יח"צ.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 9. INTEGRATIONS & BACKUP ==================== */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xs ring-1 ring-indigo-200/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl ring-1 ring-indigo-100"><Database className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">גיבוי ושחזור מלא של כל נתוני המערכת (JSON)</h3>
                  <p className="text-slate-500 text-sm mt-0.5">הורד קובץ גיבוי אחד עם כל המלאי, הספקים, ההזמנות, הצעות הדפוס והפתקים.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button onClick={handleExportFullBackup} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all"><Download className="w-4 h-4" /> הורד גיבוי מלא</button>
                {userRole === 'admin' && (
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer ring-1 ring-slate-200 transition-colors">
                    <Upload className="w-4 h-4" /> שחזר מגיבוי
                    <input type="file" accept=".json,application/json" onChange={handleImportBackupFile} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xs ring-1 ring-slate-200/70 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base">חיבור Webhook לחנות WooCommerce</h3>
              <p className="text-sm text-slate-600">כדי שהזמנות מהאתר יקפצו אוטומטית ללשונית "הזמנות חנות" ויפחיתו מלאי, הגדר בוורדפרס את הכתובת הבאה תחת WooCommerce → הגדרות → מתקדם → Webhooks:</p>
              <div className="bg-[#0F172A] text-emerald-400 p-4 rounded-xl font-mono text-xs select-all ring-1 ring-slate-800" dir="ltr">
                https://yhydashboard.vercel.app/api/webhook
              </div>
            </div>
          </div>
        )}

        {/* ==================== 10. NOTES ==================== */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <form onSubmit={handleAddNote} className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="כתוב פתק או תזכורת חדשה לצוות ההוצאה..."
                className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 text-sm outline-none transition-all"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all"><Plus className="w-4 h-4" /> הוסף פתק</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {notesList.map(note => (
                <div key={note.id} className="bg-gradient-to-br from-amber-50 to-yellow-50/70 ring-1 ring-amber-200/80 border-t-4 border-t-amber-400 p-4 rounded-2xl shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between min-h-[160px]">
                  <button
                    onClick={() => handleDeleteNote(note)}
                    className="absolute top-3 left-3 bg-white/80 hover:bg-rose-500 hover:text-white text-amber-900 w-7 h-7 rounded-full flex items-center justify-center shadow-2xs transition-colors"
                    title="מחק פתק"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap pl-8 leading-relaxed font-medium">{note.text}</p>
                  <p className="text-[11px] text-amber-800/70 mt-4 pt-2 border-t border-amber-200/60">{note.date}</p>
                </div>
              ))}
              {notesList.length === 0 && <p className="col-span-full text-center text-slate-400 py-10">אין פתקים כרגע.</p>}
            </div>
          </div>
        )}

        {/* ==================== 11. USER MANAGEMENT (ADMIN ONLY) ==================== */}
        {activeTab === 'users' && userRole === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><UserCog className="w-5 h-5" /></span>
                ניהול משתמשים והרשאות
              </h2>
              <p className="text-xs text-slate-500 mt-1">הוסף חברי צוות, קבע הרשאות (מנהל מלא או צופה בלבד) ועדכן סיסמאות</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add User Form */}
              <form onSubmit={handleAddUser} className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 space-y-3.5 h-fit">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Plus className="w-4 h-4 text-indigo-600" /> הוספת משתמש חדש
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">שם מלא *</label>
                  <input required type="text" placeholder="למשל: דוד כהן" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">שם משתמש להתחברות *</label>
                  <input required type="text" placeholder="username" value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">סיסמה *</label>
                  <input required type="password" placeholder="בחר סיסמה..." value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">רמת הרשאה</label>
                  <select value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50">
                    <option value="viewer">צופה בלבד (ללא עריכה ומחיקה)</option>
                    <option value="admin">מנהל מערכת (גישה מלאה)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" /> צור משתמש
                </button>
              </form>

              {/* Users List */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs ring-1 ring-slate-200/70 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                  <h3 className="font-bold text-slate-800 text-sm">משתמשים רשומים במערכת ({usersList.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50/70 text-xs text-slate-500 border-b uppercase">
                      <tr>
                        <th className="p-3.5 font-bold">שם מלא</th>
                        <th className="p-3.5 font-bold">שם משתמש</th>
                        <th className="p-3.5 font-bold text-center">הרשאה</th>
                        <th className="p-3.5 font-bold text-center">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5 font-bold text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                                {(u.name || 'מ').charAt(0)}
                              </div>
                              <span>{u.name}</span>
                              {u.id === currentUser?.id && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">אתה</span>}
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-600 font-mono text-xs" dir="ltr">{u.username}</td>
                          <td className="p-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                              <Shield className="w-3 h-3" />
                              {u.role === 'admin' ? 'מנהל מערכת' : 'צופה בלבד'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => setEditingUser({ ...u, newPassword: '' })}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                title="ערוך משתמש / שנה סיסמה"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={u.id === currentUser?.id}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="מחק משתמש"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODALS */}
      {/* ===================================================================== */}

      {/* Add / Edit Book Modal */}
      {(isAddBookModalOpen || editingBook) && (() => {
        const isEdit = Boolean(editingBook);
        const formState = isEdit ? editingBook : newBookForm;
        const setFormState = isEdit ? setEditingBook : setNewBookForm;

        return (
          <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
                <h3 className="font-extrabold text-lg text-slate-900">{isEdit ? `עריכת ספר: ${formState.title}` : 'הוספת ספר חדש למלאי'}</h3>
                <button onClick={() => { setIsAddBookModalOpen(false); setEditingBook(null); }} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-500 hover:text-slate-800"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={isEdit ? handleSaveEditBook : handleSaveNewBook} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">שם הספר *</label>
                      <input required type="text" value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">מחבר</label>
                      <input type="text" value={formState.author || ''} onChange={e => setFormState({ ...formState, author: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">מחיר באתר (₪)</label>
                      <input type="number" min="0" step="0.01" value={formState.prices?.general ?? 0} onChange={e => setFormState({ ...formState, prices: { ...formState.prices, general: e.target.value } })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-700 mb-1">מחיר לספקים (₪)</label>
                      <input type="number" min="0" step="0.01" value={formState.prices?.supplier ?? 0} onChange={e => setFormState({ ...formState, prices: { ...formState.prices, supplier: e.target.value } })} className="w-full p-2.5 border border-indigo-200 rounded-xl text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-700 mb-1">מחיר ישיבה (₪)</label>
                      <input type="number" min="0" step="0.01" value={formState.prices?.yeshiva ?? 0} onChange={e => setFormState({ ...formState, prices: { ...formState.prices, yeshiva: e.target.value } })} className="w-full p-2.5 border border-emerald-200 rounded-xl text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-rose-700 mb-1">עלות הפקה (₪)</label>
                      <input type="number" min="0" step="0.01" value={formState.productionCost ?? 0} onChange={e => setFormState({ ...formState, productionCost: e.target.value })} className="w-full p-2.5 border border-rose-200 bg-rose-50/40 rounded-xl text-sm font-bold" dir="ltr" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-indigo-700 mb-1">מלאי במחסן הראשי</label>
                      <input type="number" min="0" value={formState.publisherStock ?? 0} onChange={e => setFormState({ ...formState, publisherStock: e.target.value })} className="w-full p-2.5 border border-indigo-200 rounded-xl text-sm font-bold" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">רף התראת מלאי</label>
                      <input type="number" min="0" value={formState.threshold ?? 30} onChange={e => setFormState({ ...formState, threshold: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">דאנאק / מק"ט</label>
                      <input type="text" value={formState.isbn || ''} onChange={e => setFormState({ ...formState, isbn: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700">עותקים אצל ספקים וחנויות</label>
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, breakdown: [...(formState.breakdown || []), { location: '', amount: 0 }] })}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        + הוסף ספק
                      </button>
                    </div>
                    {(formState.breakdown || []).map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          list="suppliers-datalist"
                          placeholder="שם ספק / חנות"
                          value={row.location}
                          onChange={e => {
                            const next = [...formState.breakdown];
                            next[idx] = { ...next[idx], location: e.target.value };
                            setFormState({ ...formState, breakdown: next });
                          }}
                          className="flex-1 p-2 border border-slate-200 rounded-xl text-sm"
                        />
                        <input
                          type="number"
                          min="0"
                          value={row.amount}
                          onChange={e => {
                            const next = [...formState.breakdown];
                            next[idx] = { ...next[idx], amount: e.target.value };
                            setFormState({ ...formState, breakdown: next });
                          }}
                          className="w-24 p-2 border border-slate-200 rounded-xl text-sm text-center"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setFormState({ ...formState, breakdown: formState.breakdown.filter((_, i) => i !== idx) })}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <datalist id="suppliers-datalist">
                      {suppliersList.map(s => <option key={s.id} value={s.name} />)}
                    </datalist>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0 flex justify-end gap-2">
                  <button type="button" onClick={() => { setIsAddBookModalOpen(false); setEditingBook(null); }} className="px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-200/70 font-medium">ביטול</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
                    <Check className="w-4 h-4" /> {isEdit ? 'שמור שינויים' : 'הוסף ספר למלאי'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Add / Edit Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-md overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900">{editingSupplier ? 'עריכת ספק' : 'הוספת ספק / חנות חדשה'}</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveSupplier} className="p-5 space-y-3">
              <input required placeholder="שם הספק / החנות *" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
              <input placeholder="שם איש קשר" value={supplierForm.contact} onChange={e => setSupplierForm({ ...supplierForm, contact: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
              <input placeholder="טלפון (לוואטסאפ)" value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" dir="ltr" />
              <input type="email" placeholder="אימייל לשליחת הזמנות" value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" dir="ltr" />
              <input placeholder="כתובת למשלוח" value={supplierForm.address} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
              <textarea rows="2" placeholder="הערות..." value={supplierForm.notes} onChange={e => setSupplierForm({ ...supplierForm, notes: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">ביטול</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs">שמור ספק</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Supplier Stock Modal */}
      {viewingSupplierStock && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-lg overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900">מלאי נוכחי אצל: {viewingSupplierStock.name}</h3>
                <p className="text-xs text-slate-500">מעודכן אוטומטית מהזמנות ודיווחי מכירה</p>
              </div>
              <button onClick={() => setViewingSupplierStock(null)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto">
              {(() => {
                const items = getSupplierInventoryItems(viewingSupplierStock.name);
                const totalQty = items.reduce((s, i) => s + i.amount, 0);
                if (items.length === 0) return <p className="text-center text-slate-400 py-8">אין כרגע ספרים משויכים לספק זה.</p>;
                return (
                  <div className="space-y-3">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500 border-b">
                        <tr>
                          <th className="p-2.5">שם הספר</th>
                          <th className="p-2.5 text-center">כמות</th>
                          <th className="p-2.5 text-center">שווי (ספק)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {items.map(it => (
                          <tr key={it.bookId}>
                            <td className="p-2.5 font-medium">{it.title}</td>
                            <td className="p-2.5 text-center font-bold text-indigo-700">{it.amount}</td>
                            <td className="p-2.5 text-center">₪{(it.amount * it.supplierPrice).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-indigo-50 ring-1 ring-indigo-100 p-3.5 rounded-xl flex justify-between font-bold text-indigo-900 text-sm">
                      <span>סה"כ עותקים אצל הספק:</span>
                      <span>{totalQty.toLocaleString()} עותקים</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Supplier Order / Invoice Modal */}
      {isSupplierInvoiceModalOpen && invoiceSupplier && (() => {
        const orderTotal = invoiceItems.reduce((sum, item) => {
          const b = inventoryList.find(x => x.id === item.bookId);
          return sum + (Number(b?.prices?.supplier || 0) * Number(item.quantity || 0));
        }, 0);

        return (
          <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
              <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">הפקת הזמנה לספק: {invoiceSupplier.name}</h3>
                  <p className="text-xs text-slate-500">המחירים נשלפים אוטומטית ממחירון הספקים ומלאי הספק מתעדכן מיד</p>
                </div>
                <button onClick={() => setIsSupplierInvoiceModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                <div className="space-y-2.5">
                  {invoiceItems.map((row, idx) => {
                    const book = inventoryList.find(b => b.id === row.bookId);
                    const unitPrice = Number(book?.prices?.supplier || 0);
                    return (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50/90 p-2.5 rounded-xl ring-1 ring-slate-200/70">
                        <select
                          value={row.bookId}
                          onChange={e => {
                            const next = [...invoiceItems];
                            next[idx] = { ...next[idx], bookId: e.target.value };
                            setInvoiceItems(next);
                          }}
                          className="flex-1 p-2 border border-slate-200 rounded-xl text-sm bg-white"
                        >
                          <option value="">בחר ספר...</option>
                          {[...inventoryList].sort((a, b) => a.title.localeCompare(b.title, 'he')).map(b => (
                            <option key={b.id} value={b.id}>{b.title} (₪{b.prices?.supplier || 0} | במחסן: {b.publisherStock})</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={e => {
                            const next = [...invoiceItems];
                            next[idx] = { ...next[idx], quantity: e.target.value };
                            setInvoiceItems(next);
                          }}
                          className="w-20 p-2 border border-slate-200 rounded-xl text-sm text-center bg-white font-bold"
                          dir="ltr"
                        />
                        <span className="text-xs font-extrabold text-indigo-700 w-24 text-center">₪{(unitPrice * Number(row.quantity || 0)).toLocaleString()}</span>
                        {invoiceItems.length > 1 && (
                          <button onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500 p-1"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { bookId: '', quantity: 10 }])} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> הוסף ספר נוסף להזמנה
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-indigo-50/70 p-3.5 rounded-xl ring-1 ring-indigo-100 cursor-pointer">
                  <input type="checkbox" checked={deductFromWarehouse} onChange={e => setDeductFromWarehouse(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                  הפחת אוטומטית את הכמויות מ"המחסן הראשי" והעבר למלאי של {invoiceSupplier.name}
                </label>

                <input type="text" value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} placeholder="הערות להזמנה (אופציונלי)..." className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />

                <div className="bg-emerald-50 ring-1 ring-emerald-200/80 p-4 rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-emerald-900">סה"כ משוקלל להזמנה (מחיר ספק):</span>
                  <span className="text-2xl font-extrabold text-emerald-700">₪{orderTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 border-t bg-slate-50/80 grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                <button onClick={() => processSupplierOrder('email')} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"><Mail className="w-4 h-4" /> שלח במייל</button>
                <button onClick={() => processSupplierOrder('whatsapp')} className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"><MessageCircle className="w-4 h-4" /> שלח בוואטסאפ</button>
                <button onClick={() => processSupplierOrder('print')} className="bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"><Printer className="w-4 h-4" /> תעודת משלוח</button>
                <button onClick={() => processSupplierOrder('save_only')} className="bg-white ring-1 ring-slate-300 hover:bg-slate-100 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold">שמור ועדכן בלבד</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Consignment Sale / Return Modal */}
      {isConsignmentModalOpen && consignmentSupplier && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-md overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900">התחשבנות קונסיגנציה — {consignmentSupplier.name}</h3>
              <button onClick={() => setIsConsignmentModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveConsignment} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => setConsignmentForm({ ...consignmentForm, type: 'sale' })} className={`py-2 rounded-lg text-xs font-bold transition-all ${consignmentForm.type === 'sale' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}>דיווח מכירה</button>
                <button type="button" onClick={() => setConsignmentForm({ ...consignmentForm, type: 'return' })} className={`py-2 rounded-lg text-xs font-bold transition-all ${consignmentForm.type === 'return' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'}`}>החזרה למחסן</button>
              </div>
              <select
                required
                value={consignmentForm.bookId}
                onChange={e => {
                  const b = inventoryList.find(x => x.id === e.target.value);
                  setConsignmentForm({ ...consignmentForm, bookId: e.target.value, unitPrice: Number(b?.prices?.supplier || 0) });
                }}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
              >
                <option value="">בחר ספר...</option>
                {getSupplierInventoryItems(consignmentSupplier.name).map(it => (
                  <option key={it.bookId} value={it.bookId}>{it.title} (אצל הספק: {it.amount})</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">כמות</label>
                  <input required type="number" min="1" value={consignmentForm.quantity} onChange={e => setConsignmentForm({ ...consignmentForm, quantity: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                </div>
                {consignmentForm.type === 'sale' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">מחיר ליחידה (₪)</label>
                    <input required type="number" min="0" value={consignmentForm.unitPrice} onChange={e => setConsignmentForm({ ...consignmentForm, unitPrice: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                  </div>
                )}
              </div>
              <input placeholder="הערות..." value={consignmentForm.notes} onChange={e => setConsignmentForm({ ...consignmentForm, notes: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-xs">אשר ועדכן מלאי</button>
            </form>
          </div>
        </div>
      )}

      {/* Supplier History & Debt Modal */}
      {isSupplierHistoryModalOpen && selectedSupplierForHistory && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 max-w-2xl w-full overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><History className="w-5 h-5 text-indigo-600" /> היסטוריית פעולות וגבייה</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSupplierForHistory.name} | יתרה פתוחה: <strong className="text-rose-600">₪{getSupplierOpenDebt(selectedSupplierForHistory.name).toLocaleString()}</strong></p>
              </div>
              <button onClick={() => setIsSupplierHistoryModalOpen(false)} className="p-1.5 bg-white ring-1 ring-slate-200 rounded-xl"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto bg-slate-50/50 space-y-4">
              {supplierLogs.filter(l => l.supplierName === selectedSupplierForHistory.name).length === 0 ? (
                <p className="text-center text-slate-400 py-10">אין היסטוריית פעולות לספק זה.</p>
              ) : (
                supplierLogs
                  .filter(l => l.supplierName === selectedSupplierForHistory.name)
                  .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                  .map((log, idx) => {
                    const isBillable = log.type !== 'return' && Number(log.totalAmount || 0) > 0;
                    const payStatus = log.paymentStatus || 'unpaid';
                    const remaining = getLogRemainingDebt(log);
                    return (
                      <div key={log.id || idx} className="bg-white ring-1 ring-slate-200/80 p-4 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{log.action}</p>
                            <p className="text-xs text-slate-400">{log.date}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-extrabold text-indigo-700 text-base">₪{Number(log.totalAmount || 0).toLocaleString()}</p>
                            {isBillable && (
                              <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border mt-0.5 ${
                                payStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                payStatus === 'partial' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {payStatus === 'paid' ? 'שולם' : payStatus === 'partial' ? `שולם חלקית (נותר ₪${remaining.toLocaleString()})` : 'טרם שולם'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bg-slate-50/90 p-3 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{log.details}</div>
                        {isBillable && userRole === 'admin' && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div className="flex gap-1.5">
                              <button onClick={() => handleUpdateLogPayment(log, 'unpaid')} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${payStatus === 'unpaid' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'}`}>טרם שולם</button>
                              <button onClick={() => handleUpdateLogPayment(log, 'paid')} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${payStatus === 'paid' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}>סמן כשולם</button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input type="number" min="0" placeholder="סכום חלקי" value={partialPayInputs[log.id] ?? (payStatus === 'partial' ? log.paidAmount : '')} onChange={e => setPartialPayInputs(prev => ({ ...prev, [log.id]: e.target.value }))} className="w-24 p-1.5 text-xs border border-slate-200 rounded-xl text-center" dir="ltr" />
                              <button onClick={() => handleUpdateLogPayment(log, 'partial', partialPayInputs[log.id])} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors">שולם חלקית</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gift / Donor Distribution Modal */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-md overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Gift className="w-5 h-5 text-purple-600" /> חלוקה לתורמים / מתנות</h3>
              <button onClick={() => setIsGiftModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleRecordGift} className="p-5 space-y-3">
              <select required value={giftForm.bookId} onChange={e => setGiftForm({ ...giftForm, bookId: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                <option value="">בחר ספר לחלוקה...</option>
                {inventoryList.map(b => <option key={b.id} value={b.id}>{b.title} (במחסן: {b.publisherStock})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2.5">
                <input required type="number" min="1" value={giftForm.quantity} onChange={e => setGiftForm({ ...giftForm, quantity: e.target.value })} placeholder="כמות" className="p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                <select value={giftForm.category} onChange={e => setGiftForm({ ...giftForm, category: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-sm">
                  <option value="תורם">תורם</option>
                  <option value="רב / מרצה">רב / מרצה</option>
                  <option value="בוגר / תלמיד">בוגר / תלמיד</option>
                  <option value="אחר">אחר</option>
                </select>
              </div>
              <input required placeholder="שם המקבל *" value={giftForm.recipient} onChange={e => setGiftForm({ ...giftForm, recipient: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
              <input placeholder="הערה (אופציונלי)" value={giftForm.notes} onChange={e => setGiftForm({ ...giftForm, notes: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-xs">תעד והפחת מהמחסן</button>
            </form>
          </div>
        </div>
      )}

      {/* Gift History Modal */}
      {isGiftHistoryOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-lg overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900">מעקב חלוקה לתורמים ומתנות ({giftLogs.length})</h3>
              <button onClick={() => setIsGiftHistoryOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-2.5">
              {giftLogs.length === 0 ? <p className="text-center text-slate-400 py-8">אין תיעוד חלוקות עדיין.</p> :
                [...giftLogs].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).map((g, i) => (
                  <div key={g.id || i} className="p-3.5 bg-slate-50/90 ring-1 ring-slate-200/70 rounded-xl text-sm flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800">{g.bookTitle} (×{g.quantity})</p>
                      <p className="text-xs text-slate-600 mt-0.5">נמסר ל: {g.recipient} ({g.category})</p>
                      {g.notes && <p className="text-xs text-slate-400 mt-0.5">{g.notes}</p>}
                    </div>
                    <span className="text-[11px] text-slate-400">{g.date}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-md overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900">פרויקט ספר חדש להפקה</h3>
              <button onClick={() => setIsAddTaskModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddTask} className="p-5 space-y-3">
              <input required placeholder="שם הספר / הפרויקט *" value={newTaskForm.title} onChange={e => setNewTaskForm({ ...newTaskForm, title: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
              <input placeholder="שם המחבר" value={newTaskForm.author} onChange={e => setNewTaskForm({ ...newTaskForm, author: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
              <select value={newTaskForm.status} onChange={e => setNewTaskForm({ ...newTaskForm, status: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm">
                {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <textarea rows="2" placeholder="הערות..." value={newTaskForm.notes} onChange={e => setNewTaskForm({ ...newTaskForm, notes: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-xs">צור פרויקט</button>
            </form>
          </div>
        </div>
      )}

      {/* Selected Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{selectedTask.title}</h3>
                {selectedTask.author && <p className="text-xs text-slate-500">{selectedTask.author}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                {userRole === 'admin' && (
                  <button onClick={() => handleDeleteTask(selectedTask)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl" title="מחק פרויקט"><Trash2 className="w-5 h-5" /></button>
                )}
                <button onClick={() => setSelectedTask(null)} className="p-1.5 bg-white ring-1 ring-slate-200 rounded-xl"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">שלב נוכחי בהפקה</label>
                <select value={selectedTask.status} onChange={e => handleUpdateTaskStatus(selectedTask, e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50">
                  {KANBAN_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {!selectedTask.addedToInventory ? (
                  <button onClick={() => handleTransferTaskToInventory(selectedTask)} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-xs"><Package className="w-4 h-4" /> העבר אוטומטית למלאי</button>
                ) : (
                  <span className="text-xs bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> הועבר למלאי</span>
                )}
                <button
                  onClick={() => {
                    const totalExp = (selectedTask.invoices || []).reduce((s, i) => s + Number(i.amount || 0), 0);
                    setBreakEvenForm({ bookTitle: selectedTask.title, totalCost: totalExp > 0 ? totalExp : 15000, printRun: 1000, sellPrice: 60 });
                    setIsBreakEvenModalOpen(true);
                  }}
                  className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 ring-1 ring-amber-200 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Calculator className="w-4 h-4" /> חשב נקודת איזון
                </button>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-bold text-sm text-slate-800">הוצאות הפקה (עריכה, עימוד, דפוס)</h4>
                {userRole === 'admin' && (
                  <form onSubmit={handleAddTaskInvoice} className="flex gap-2">
                    <input required placeholder="תיאור הוצאה..." value={taskInvoiceForm.description} onChange={e => setTaskInvoiceForm({ ...taskInvoiceForm, description: e.target.value })} className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs" />
                    <input required type="number" min="1" placeholder="סכום ₪" value={taskInvoiceForm.amount} onChange={e => setTaskInvoiceForm({ ...taskInvoiceForm, amount: e.target.value })} className="w-24 p-2.5 border border-slate-200 rounded-xl text-xs" dir="ltr" />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 rounded-xl text-xs font-bold">+ הוסף</button>
                  </form>
                )}
                <div className="space-y-1.5">
                  {(selectedTask.invoices || []).map(inv => (
                    <div key={inv.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl text-xs">
                      <span>{inv.description} <span className="text-slate-400">({inv.date})</span></span>
                      <span className="font-bold text-rose-700">₪{Number(inv.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="bg-rose-50 ring-1 ring-rose-100 text-rose-800 p-3.5 rounded-xl font-bold text-sm flex justify-between">
                    <span>סה"כ הוצאות הפקה:</span>
                    <span>₪{(selectedTask.invoices || []).reduce((s, i) => s + Number(i.amount || 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Break-Even Calculator Modal */}
      {isBreakEvenModalOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-xl overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Calculator className="w-5 h-5 text-amber-600" /> מחשבון נקודת איזון (Break-Even)</h3>
                {breakEvenForm.bookTitle && <p className="text-xs text-slate-500">{breakEvenForm.bookTitle}</p>}
              </div>
              <button onClick={() => setIsBreakEvenModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">עלות כוללת (₪)</label>
                  <input type="number" min="0" value={breakEvenForm.totalCost} onChange={e => setBreakEvenForm({ ...breakEvenForm, totalCost: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl font-bold" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">כמות עותקים</label>
                  <input type="number" min="1" value={breakEvenForm.printRun} onChange={e => setBreakEvenForm({ ...breakEvenForm, printRun: Math.max(1, Number(e.target.value)) })} className="w-full p-2.5 border border-slate-200 rounded-xl font-bold" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">מחיר מכירה (₪)</label>
                  <input type="number" min="1" value={breakEvenForm.sellPrice} onChange={e => setBreakEvenForm({ ...breakEvenForm, sellPrice: Math.max(1, Number(e.target.value)) })} className="w-full p-2.5 border border-slate-200 rounded-xl font-bold" dir="ltr" />
                </div>
              </div>
              {(() => {
                const totalCost = Number(breakEvenForm.totalCost || 0);
                const printRun = Math.max(1, Number(breakEvenForm.printRun || 1));
                const sellPrice = Math.max(1, Number(breakEvenForm.sellPrice || 1));
                const costPerCopy = totalCost / printRun;
                const breakEvenCopies = Math.ceil(totalCost / sellPrice);
                const breakEvenPct = Math.round((breakEvenCopies / printRun) * 100);
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo-50 ring-1 ring-indigo-100 p-4 rounded-2xl text-center">
                        <p className="text-xs font-semibold text-indigo-700">נקודת איזון</p>
                        <p className="text-2xl font-extrabold text-indigo-900 mt-0.5">{breakEvenCopies.toLocaleString()} עותקים</p>
                        <p className="text-xs text-indigo-600">{breakEvenPct}% מהמהדורה</p>
                      </div>
                      <div className="bg-slate-50 ring-1 ring-slate-200/80 p-4 rounded-2xl text-center">
                        <p className="text-xs font-semibold text-slate-600">עלות לעותק</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">₪{costPerCopy.toFixed(2)}</p>
                        <p className="text-xs text-emerald-600 font-semibold">רווח לעותק: ₪{(sellPrice - costPerCopy).toFixed(2)}</p>
                      </div>
                    </div>
                    <table className="w-full text-right text-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
                      <thead className="bg-slate-50 text-xs border-b">
                        <tr><th className="p-2.5">תרחיש</th><th className="p-2.5 text-center">עותקים</th><th className="p-2.5 text-center">הכנסה</th><th className="p-2.5 text-center">רווח נקי</th></tr>
                      </thead>
                      <tbody className="divide-y">
                        {[50, 75, 100].map(pct => {
                          const qty = Math.round((printRun * pct) / 100);
                          const rev = qty * sellPrice;
                          const net = rev - totalCost;
                          return (
                            <tr key={pct}>
                              <td className="p-2.5 font-bold">{pct}% מהמהדורה</td>
                              <td className="p-2.5 text-center">{qty.toLocaleString()}</td>
                              <td className="p-2.5 text-center">₪{rev.toLocaleString()}</td>
                              <td className={`p-2.5 text-center font-extrabold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{net >= 0 ? '+' : ''}₪{net.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Digital Catalog Modal */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-xl overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><BookMarked className="w-5 h-5 text-emerald-600" /> קטלוג דיגיטלי לשליחה</h3>
              <button onClick={() => setIsCatalogModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[{ id: 'general', label: 'צרכן' }, { id: 'yeshiva', label: 'ישיבה' }, { id: 'supplier', label: 'ספקים' }].map(t => (
                  <button key={t.id} onClick={() => setCatalogPriceTier(t.id)} className={`py-2 rounded-lg text-xs font-bold transition-all ${catalogPriceTier === t.id ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}>{t.label}</button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={catalogOnlyInStock} onChange={e => setCatalogOnlyInStock(e.target.checked)} className="w-4 h-4 rounded" />
                הצג רק ספרים שנמצאים במלאי
              </label>
              <textarea readOnly rows="8" value={buildCatalogWhatsAppText()} className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs leading-relaxed" />
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={handleCopyCatalogText} className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"><Copy className="w-4 h-4" /> העתק לוואטסאפ</button>
                <button
                  onClick={() => {
                    setIsCatalogModalOpen(false);
                    setPrintDoc({
                      type: 'catalog',
                      docTitle: 'קטלוג ספרי הוצאת ישיבת ירוחם',
                      orderId: new Date().toLocaleDateString('he-IL'),
                      date: new Date().toLocaleDateString('he-IL'),
                      recipient: 'כלל הלקוחות והחנויות',
                      items: getCatalogBooks().map(b => ({ name: b.title, author: b.author || '', price: getCatalogBookPrice(b) }))
                    });
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" /> הדפס / שמור PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Print House Quote Modal */}
      {isAddQuoteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><Scale className="w-5 h-5 text-indigo-600" /> הוספת הצעת מחיר מדפוס</h3>
              <button onClick={() => setIsAddQuoteModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSavePrintQuote} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="שם הספר / הפרויקט *" value={quoteForm.projectTitle} onChange={e => setQuoteForm({ ...quoteForm, projectTitle: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-sm" />
                  <input required placeholder="שם בית הדפוס *" value={quoteForm.printerName} onChange={e => setQuoteForm({ ...quoteForm, printerName: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input required type="number" min="1" placeholder="כמות" value={quoteForm.copies} onChange={e => setQuoteForm({ ...quoteForm, copies: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                  <input required type="number" min="1" placeholder="מחיר כולל (₪)" value={quoteForm.totalPrice} onChange={e => setQuoteForm({ ...quoteForm, totalPrice: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  <input type="number" min="0" placeholder="ימי אספקה" value={quoteForm.deliveryDays} onChange={e => setQuoteForm({ ...quoteForm, deliveryDays: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl ring-1 ring-slate-200/70">
                  <input type="checkbox" checked={quoteForm.includesVat} onChange={e => setQuoteForm({ ...quoteForm, includesVat: e.target.checked })} className="w-4 h-4 rounded" />
                  המחיר כולל מע"מ (אם לא מסומן — יתווסף 18% להשוואה אחידה)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" min="0" placeholder="עמודים" value={quoteForm.pages} onChange={e => setQuoteForm({ ...quoteForm, pages: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                  <select value={quoteForm.coverType} onChange={e => setQuoteForm({ ...quoteForm, coverType: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-sm">
                    <option value="כריכה קשה">כריכה קשה</option>
                    <option value="כריכה קשה + הטבעה">כריכה קשה + הטבעה</option>
                    <option value="כריכה רכה">כריכה רכה</option>
                    <option value="סיכות (חוברת)">סיכות (חוברת)</option>
                  </select>
                  <input placeholder="סוג נייר" value={quoteForm.paperType} onChange={e => setQuoteForm({ ...quoteForm, paperType: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-sm" />
                </div>
                <textarea rows="2" placeholder="הערות והבדלים (הובלה, תנאי תשלום...)" value={quoteForm.notes} onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
                <label className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 p-4 rounded-2xl cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-800">{quoteForm.fileName || 'העלה מסמך הצעת מחיר (PDF / תמונה עד 700KB)'}</span>
                  <input type="file" accept=".pdf,image/*" onChange={handleQuoteFileUpload} className="hidden" />
                </label>
              </div>
              <div className="p-4 border-t bg-slate-50/80 flex justify-end gap-2 shrink-0">
                <button type="button" onClick={() => setIsAddQuoteModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">ביטול</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs">שמור הצעה</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Quote Document Modal */}
      {previewQuoteDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
            <div className="p-4 border-b bg-slate-50/80 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900">{previewQuoteDoc.printerName} — {previewQuoteDoc.fileName}</h3>
              <div className="flex gap-2">
                <a href={previewQuoteDoc.fileData} download={previewQuoteDoc.fileName} className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"><Download className="w-3.5 h-3.5" /> הורד</a>
                <button onClick={() => setPreviewQuoteDoc(null)} className="p-1.5 bg-white ring-1 ring-slate-200 rounded-xl"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
            </div>
            <div className="p-4 bg-slate-100 flex-1 overflow-auto flex items-center justify-center min-h-[400px]">
              {previewQuoteDoc.fileType?.startsWith('image/') ? (
                <img src={previewQuoteDoc.fileData} alt={previewQuoteDoc.fileName} className="max-w-full max-h-[70vh] rounded-xl shadow-sm" />
              ) : previewQuoteDoc.fileType === 'application/pdf' ? (
                <iframe src={previewQuoteDoc.fileData} title={previewQuoteDoc.fileName} className="w-full h-[70vh] bg-white rounded-xl" />
              ) : (
                <a href={previewQuoteDoc.fileData} download={previewQuoteDoc.fileName} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm">הורד לצפייה</a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print Document Preview Modal */}
      {printDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
            <div className="p-4 border-b bg-slate-50/80 flex justify-between items-center print:hidden">
              <h3 className="font-extrabold text-slate-900">{printDoc.docTitle}</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"><Printer className="w-4 h-4" /> הדפס / שמור PDF</button>
                <button onClick={() => setPrintDoc(null)} className="p-1.5 bg-white ring-1 ring-slate-200 rounded-xl"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">הוצאת ספרי ישיבת ירוחם</h2>
                  <p className="text-sm text-slate-600 mt-1">{printDoc.docTitle}</p>
                </div>
                <div className="text-left text-xs text-slate-500">
                  <p>תאריך: {printDoc.date}</p>
                  <p>מספר: {printDoc.orderId}</p>
                </div>
              </div>
              <p className="text-sm"><strong>לכבוד:</strong> {printDoc.recipient}</p>
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
                        {printDoc.type === 'supplier_delivery' && (
                          <>
                            <th className="border border-slate-200 p-2 text-center">מחיר ליח'</th>
                            <th className="border border-slate-200 p-2 text-center">סה"כ</th>
                          </>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(printDoc.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-200 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-200 p-2 font-medium">{item.name}</td>
                      {printDoc.type === 'catalog' ? (
                        <>
                          <td className="border border-slate-200 p-2 text-slate-600">{item.author || '—'}</td>
                          <td className="border border-slate-200 p-2 text-center font-bold">
                            {Number(item.price) > 0 ? `₪${Number(item.price).toLocaleString()}` : 'בתיאום'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border border-slate-200 p-2 text-center font-bold">{item.quantity}</td>
                          {printDoc.type === 'supplier_delivery' && (
                            <>
                              <td className="border border-slate-200 p-2 text-center">₪{Number(item.price || 0).toLocaleString()}</td>
                              <td className="border border-slate-200 p-2 text-center font-bold">₪{Number(item.lineTotal || 0).toLocaleString()}</td>
                            </>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {printDoc.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong>הערות:</strong> {printDoc.notes}
                </p>
              )}
              {printDoc.totalAmount > 0 && (
                <div className="bg-slate-100 p-3.5 rounded-xl flex justify-between items-center font-extrabold text-slate-900">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{Number(printDoc.totalAmount).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-md overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><KeyRound className="w-5 h-5 text-indigo-600" /> עריכת משתמש: {editingUser.name}</h3>
              <button onClick={() => setEditingUser(null)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveEditUser} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">שם מלא</label>
                <input required type="text" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">שם משתמש</label>
                <input required type="text" value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">סיסמה חדשה (השאר ריק כדי לא לשנות)</label>
                <input type="password" placeholder="••••••••" value={editingUser.newPassword || ''} onChange={e => setEditingUser({ ...editingUser, newPassword: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">רמת הרשאה</label>
                <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50">
                  <option value="viewer">צופה בלבד</option>
                  <option value="admin">מנהל מערכת</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm text-slate-600">ביטול</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs">שמור שינויים</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 max-w-md w-full p-6 space-y-4" dir="rtl">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl ${confirmDialog.iconStyle || 'bg-red-100 text-red-600'}`}>{confirmDialog.icon}</div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{confirmDialog.title}</h3>
                <p className="text-sm text-slate-600 mt-0.5">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100">ביטול</button>
              <button
                onClick={async () => {
                  const fn = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  if (fn) await fn();
                }}
                className={`px-5 py-2 rounded-xl text-sm font-bold text-white shadow-sm ${confirmDialog.confirmStyle || 'bg-red-600 hover:bg-red-700'}`}
              >
                {confirmDialog.confirmText || 'אשר'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
