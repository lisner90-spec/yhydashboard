import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  LogIn, LogOut, Lock, Shield, KeyRound, Sun, Moon, Sparkles,
  ShieldCheck, RotateCcw, Zap, HardDrive, Sliders, FileCheck
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
  { id: 'book_1', title: 'אותך אבקש - שערים לימי התשובה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 10.03, prices: { catalog: 98, general: 59, supplier: 29, yeshiva: 50, yeshivaGuest: 59 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_2', title: 'ונהר יוצא מעדן - חגי תשרי', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 14.04, prices: { catalog: 98, general: 60, supplier: 30, yeshiva: 40, yeshivaGuest: 50 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_3', title: 'ונהר יוצא מעדן - מועדי חורף', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 14.04, prices: { catalog: 98, general: 60, supplier: 30, yeshiva: 40, yeshivaGuest: 50 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_4', title: 'ונהר יוצא מעדן - חגי האביב', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 14.04, prices: { catalog: 98, general: 60, supplier: 30, yeshiva: 40, yeshivaGuest: 50 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_5', title: 'ונהר יוצא מעדן סט', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 20, publisherStock: 0, productionCost: 42.13, prices: { catalog: 0, general: 160, supplier: 90, yeshiva: 120, yeshivaGuest: 140 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_6', title: 'ונהר יוצא מעדן - אכילה ומצוותיה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 16.52, prices: { catalog: 98, general: 69, supplier: 32, yeshiva: 45, yeshivaGuest: 54 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_7', title: 'להשקות את הגן - סנהדרין', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 17.84, prices: { catalog: 108, general: 69, supplier: 30, yeshiva: 50, yeshivaGuest: 50 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_8', title: 'להשקות את הגן - סוכה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 12.50, prices: { catalog: 98, general: 59, supplier: 28, yeshiva: 40, yeshivaGuest: 40 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_9', title: 'שערים למשנתו של מניטו', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 12.66, prices: { catalog: 98, general: 83, supplier: 42, yeshiva: 55, yeshivaGuest: 69 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_10', title: 'והתהלכתי בתוככם א', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 0, prices: { catalog: 98, general: 65, supplier: 35, yeshiva: 60, yeshivaGuest: 60 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_11', title: 'והתהלכתי בתוככם ב', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 0, prices: { catalog: 98, general: 65, supplier: 35, yeshiva: 60, yeshivaGuest: 60 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_12', title: 'והתהלכתי בתוככם סט', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 20, publisherStock: 0, productionCost: 0, prices: { catalog: 0, general: 120, supplier: 68, yeshiva: 110, yeshivaGuest: 110 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_13', title: 'חוברת שובו אליי - הרב בלומנצווייג', author: 'הרב בלומנצווייג', isbn: '', threshold: 50, publisherStock: 0, productionCost: 0, prices: { catalog: 29, general: 29, supplier: 19, yeshiva: 25, yeshivaGuest: 25 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_14', title: 'חוברת כעץ שתול - תפילה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 50, publisherStock: 0, productionCost: 0, prices: { catalog: 20, general: 20, supplier: 16, yeshiva: 15, yeshivaGuest: 15 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_15', title: 'חוברת כעץ שתול - עיון', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 50, publisherStock: 0, productionCost: 0, prices: { catalog: 20, general: 20, supplier: 16, yeshiva: 15, yeshivaGuest: 15 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_16', title: 'חוברת כעץ שתול - אמונה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 50, publisherStock: 0, productionCost: 0, prices: { catalog: 20, general: 20, supplier: 16, yeshiva: 15, yeshivaGuest: 15 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_17', title: 'שמיטה', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 0, prices: { catalog: 0, general: 0, supplier: 23, yeshiva: 23, yeshivaGuest: 23 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_18', title: 'חוברת כעץ שתול - סט', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 30, publisherStock: 0, productionCost: 0, prices: { catalog: 0, general: 55, supplier: 0, yeshiva: 40, yeshivaGuest: 40 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
  { id: 'book_19', title: 'חוברת מעפר קומי', author: 'הוצאת ישיבת ירוחם', isbn: '', threshold: 40, publisherStock: 0, productionCost: 0, prices: { catalog: 0, general: 30, supplier: 0, yeshiva: 25, yeshivaGuest: 30 }, editions: [{ name: 'מהדורה 1', printRun: 0 }], breakdown: [], updatedAt: Date.now() },
];

const normalizeBookTitle = (str = '') =>
  String(str).replace(/[-–—״"'׳.,]/g, ' ').replace(/\s+/g, ' ').trim();

const findMatchingCatalogBook = (title = '') => {
  const norm = normalizeBookTitle(title);
  if (!norm) return null;
  const exact = initialInventory.find(b => normalizeBookTitle(b.title) === norm);
  if (exact) return exact;

  if (norm.includes('אותך אבקש')) return initialInventory.find(b => b.id === 'book_1');
  if (norm.includes('חגי תשרי')) return initialInventory.find(b => b.id === 'book_2');
  if (norm.includes('מועדי חורף')) return initialInventory.find(b => b.id === 'book_3');
  if (norm.includes('חגי האביב')) return initialInventory.find(b => b.id === 'book_4');
  if (norm.includes('ונהר יוצא מעדן') && norm.includes('סט')) return initialInventory.find(b => b.id === 'book_5');
  if (norm.includes('אכילה ומצוותיה')) return initialInventory.find(b => b.id === 'book_6');
  if (norm.includes('סנהדרין')) return initialInventory.find(b => b.id === 'book_7');
  if (norm.includes('סוכה')) return initialInventory.find(b => b.id === 'book_8');
  if (norm.includes('מניטו')) return initialInventory.find(b => b.id === 'book_9');
  if (norm.includes('והתהלכתי') && norm.includes('סט')) return initialInventory.find(b => b.id === 'book_12');
  if (norm.includes('והתהלכתי') && (norm.includes(' ב') || norm.endsWith('ב'))) return initialInventory.find(b => b.id === 'book_11');
  if (norm.includes('והתהלכתי')) return initialInventory.find(b => b.id === 'book_10');
  if (norm.includes('שובו אלי')) return initialInventory.find(b => b.id === 'book_13');
  if (norm.includes('כעץ שתול') && norm.includes('סט')) return initialInventory.find(b => b.id === 'book_18');
  if (norm.includes('כעץ שתול') && norm.includes('תפילה')) return initialInventory.find(b => b.id === 'book_14');
  if (norm.includes('כעץ שתול') && norm.includes('עיון')) return initialInventory.find(b => b.id === 'book_15');
  if (norm.includes('כעץ שתול') && norm.includes('אמונה')) return initialInventory.find(b => b.id === 'book_16');
  if (norm.includes('שמיטה')) return initialInventory.find(b => b.id === 'book_17');
  if (norm.includes('מעפר קומי')) return initialInventory.find(b => b.id === 'book_19');
  return null;
};

const getEffectiveBookPrices = (book) => {
  const catalogMatch = findMatchingCatalogBook(book?.title);
  const p = book?.prices || {};
  const general = Number(p.general || catalogMatch?.prices?.general || 0);
  const supplier = Number(p.supplier || catalogMatch?.prices?.supplier || 0);
  const hasExplicitGuest = p.yeshivaGuest !== undefined && p.yeshivaGuest !== null && Number(p.yeshivaGuest) > 0;

  const yeshiva = hasExplicitGuest
    ? Number(p.yeshiva || catalogMatch?.prices?.yeshiva || general)
    : Number(catalogMatch?.prices?.yeshiva ?? p.yeshiva ?? general);
  const yeshivaGuest = hasExplicitGuest
    ? Number(p.yeshivaGuest)
    : Number(catalogMatch?.prices?.yeshivaGuest ?? p.yeshiva ?? general);

  return { general, supplier, yeshiva, yeshivaGuest };
};

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
  prices: { catalog: 0, general: 0, supplier: 0, yeshiva: 0, yeshivaGuest: 0 },
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

const defaultDashboardAdjustments = {
  extraCopies: 0,
  extraWarehouseCopies: 0,
  extraSuppliersCopies: 0,
  extraRetailValue: 0,
  extraProductionValue: 0,
  extraStoreRevenue: 0,
  extraSupplierRevenue: 0,
  extraPosRevenue: 0,
  extraOpenDebt: 0
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
  // --- Navigation & Auth State (ברירת מחדל: דאשבורד) ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('yhy_erp_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('yhy_erp_theme', darkMode ? 'dark' : 'light');
    } catch {}
  }, [darkMode]);

  // --- Users & Session State ---
  const [usersList, setUsersList] = useState(() => {
    const saved = loadLocal('yhy_erp_users', initialUsers);
    return Array.isArray(saved) && saved.length > 0 ? saved : initialUsers;
  });
  const [currentUser, setCurrentUser] = useState(() => loadLocal('yhy_erp_session', null));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [newUserForm, setNewUserForm] = useState({ name: '', username: '', password: '', email: '', phone: '', role: 'viewer' });
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

  // --- התאמות ידניות לדאשבורד ---
  const [dashboardAdjustments, setDashboardAdjustments] = useState(() =>
    loadLocal('yhy_erp_dashboard_adj', defaultDashboardAdjustments)
  );
  const [isDashboardEditOpen, setIsDashboardEditOpen] = useState(false);

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

  // --- Suppliers, Orders, Consignment, Quick Calc & Smart Text Parser States ---
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierSort, setSupplierSort] = useState('alphabetical');
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);

  // עריכת מלאי אצל ספק ספציפי
  const [viewingSupplierStock, setViewingSupplierStock] = useState(null);
  const [supplierStockDraft, setSupplierStockDraft] = useState({});
  const [newBookForSupplier, setNewBookForSupplier] = useState({ bookId: '', amount: 10 });

  // הפקת הזמנה לספק (כולל עריכת מחיר לכל ספר)
  const [isSupplierInvoiceModalOpen, setIsSupplierInvoiceModalOpen] = useState(false);
  const [invoiceSupplier, setInvoiceSupplier] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([{ bookId: '', quantity: 10, customPrice: 0 }]);
  const [deductFromWarehouse, setDeductFromWarehouse] = useState(true);
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // מחשבון קניית ספרים מהיר (ללא הזמנה)
  const [isPurchaseCalcOpen, setIsPurchaseCalcOpen] = useState(false);
  const [calcPriceTier, setCalcPriceTier] = useState('supplier');
  const [calcDiscountPct, setCalcDiscountPct] = useState(0);
  const [calcItems, setCalcItems] = useState([{ bookId: '', quantity: 10 }]);

  // קליטת הזמנה וקבלה אוטומטית מהודעת טקסט של ספק
  const [isParseOrderModalOpen, setIsParseOrderModalOpen] = useState(false);
  const [rawOrderMessage, setRawOrderMessage] = useState('');
  const [parsedSupplierName, setParsedSupplierName] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [parsedDeductWarehouse, setParsedDeductWarehouse] = useState(true);
  const [parsedMarkAsPaid, setParsedMarkAsPaid] = useState(true);

  // קונסיגנציה והיסטוריה
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

  // --- Command Palette & Transition Polish States ---
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [webhookCheckState, setWebhookCheckState] = useState({ loading: false, status: null, message: '' });
  const [sendingTestOrder, setSendingTestOrder] = useState(false);

  // --- Auto-Backup System States ---
  const [autoBackupSettings, setAutoBackupSettings] = useState(() =>
    loadLocal('yhy_erp_autobackup_settings', {
      enabled: true,
      intervalMinutes: 30,
      maxSnapshots: 5
    })
  );
  const [autoSnapshots, setAutoSnapshots] = useState(() =>
    loadLocal('yhy_erp_auto_snapshots', [])
  );

  const latestDataRef = useRef({});
  latestDataRef.current = {
    inventory: inventoryList,
    suppliers: suppliersList,
    tasks: tasksList,
    orders: ordersList,
    notes: notesList,
    supplierLogs,
    giftLogs,
    posSales,
    printQuotes,
    campaigns: campaignsList,
    prCopies
  };

  useEffect(() => {
    setIsTabTransitioning(true);
    const t = setTimeout(() => setIsTabTransitioning(false), 360);
    return () => clearTimeout(t);
  }, [activeTab]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
        setCommandQuery('');
      } else if (e.key === 'Escape') {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('yhy_erp_autobackup_settings', JSON.stringify(autoBackupSettings)); } catch {}
  }, [autoBackupSettings]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev && prev.message === message ? null : prev));
    }, 3500);
  };

  // --- Firestore Helpers ---
  const getCollRef = (collName) => collection(db, 'erp', appId, collName);
  const getDocRef = (collName, docId) => doc(db, 'erp', appId, collName, docId);

  // --- Sync with Firebase ---
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
      unsubs.push(onSnapshot(getCollRef('orders'), snap => {
        const cleanOrders = [];
        snap.docs.forEach(d => {
          const data = d.data();
          const cName = String(data.customerName || '').trim();
          // סינון ומחיקה אוטומטית של הזמנות דמה חוזרות מ"ישראל ישראלי"
          if (cName.includes('ישראל ישראלי')) {
            try { deleteDoc(getDocRef('orders', d.id)); } catch {}
            return;
          }
          cleanOrders.push({ id: d.id, ...data });
        });
        setOrdersList(cleanOrders);
      }, handleDbError));
      unsubs.push(onSnapshot(getCollRef('notes'), snap => setNotesList(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('supplier_logs'), snap => setSupplierLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('gift_logs'), snap => setGiftLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('pos_sales'), snap => setPosSales(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('print_quotes'), snap => setPrintQuotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('campaigns'), snap => setCampaignsList(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getCollRef('pr_copies'), snap => setPrCopies(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleDbError));
      unsubs.push(onSnapshot(getDocRef('settings', 'dashboard_adjustments'), snap => {
        if (snap.exists()) {
          setDashboardAdjustments(prev => ({ ...prev, ...snap.data() }));
        }
      }, handleDbError));
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
  useEffect(() => { try { localStorage.setItem('yhy_erp_dashboard_adj', JSON.stringify(dashboardAdjustments)); } catch {} }, [dashboardAdjustments]);

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
    setActiveTab('dashboard');
    showToast(`שלום ${found.name}, התחברת בהצלחה!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMobileMenuOpen(false);
    setActiveTab('dashboard');
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
      email: (newUserForm.email || '').trim(),
      phone: (newUserForm.phone || '').trim(),
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
    setNewUserForm({ name: '', username: '', password: '', email: '', phone: '', role: 'viewer' });
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
      email: (editingUser.email || '').trim(),
      phone: (editingUser.phone || '').trim(),
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

  const buildUserCredentialsMessage = (user) => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const roleLabel = user.role === 'admin' ? 'מנהל מערכת (גישה מלאה)' : 'צופה בלבד';
    return (
      `שלום ${user.name},\n\n` +
      `להלן פרטי ההתחברות שלך למערכת הניהול של הוצאת ספרי ישיבת ירוחם:\n` +
      (appUrl ? `🔗 קישור למערכת: ${appUrl}\n` : '') +
      `👤 שם משתמש: ${user.username}\n` +
      `🔑 סיסמה: ${user.password}\n` +
      `🛡️ הרשאה: ${roleLabel}\n\n` +
      `בהצלחה!`
    );
  };

  const handleSendCredentialsEmail = (user) => {
    const subject = 'פרטי התחברות — מערכת הוצאת ספרי ישיבת ירוחם';
    const body = buildUserCredentialsMessage(user);
    window.location.href = `mailto:${user.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast(`נפתח חלון מייל עם פרטי ההתחברות של ${user.name}.`, 'info');
  };

  const handleSendCredentialsWhatsApp = (user) => {
    const msg = buildUserCredentialsMessage(user);
    const waPhone = formatWhatsAppPhone(user.phone);
    const url = waPhone
      ? `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`נפתח וואטסאפ לשליחת פרטי ההתחברות של ${user.name}.`, 'success');
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
  // חישובים ועזרים למלאי ולספקים
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
  // התאמות ידניות לדאשבורד וניקוי חובות רפאים
  // ==========================================
  const handleSaveDashboardAdjustments = async (e) => {
    e.preventDefault();
    if (db && dbConnected) {
      try {
        await setDoc(getDocRef('settings', 'dashboard_adjustments'), dashboardAdjustments, { merge: true });
      } catch {}
    }
    setIsDashboardEditOpen(false);
    showToast('נתוני הדאשבורד הידניים נשמרו בהצלחה!', 'success');
  };

  const handlePurgeOrphanSupplierDebts = async () => {
    const activeNames = new Set(suppliersList.map(s => (s.name || '').trim()));
    const orphanLogs = supplierLogs.filter(l => !activeNames.has((l.supplierName || '').trim()));
    if (orphanLogs.length === 0) {
      showToast('לא נמצאו חובות פתוחים מספקים שנמחקו.', 'info');
      return;
    }
    setSupplierLogs(prev => prev.filter(l => activeNames.has((l.supplierName || '').trim())));
    if (db && dbConnected) {
      try {
        await Promise.all(orphanLogs.filter(l => l.id).map(l => deleteDoc(getDocRef('supplier_logs', l.id))));
      } catch {}
    }
    showToast(`נוקו ${orphanLogs.length} רשומות חוב של ספקים שכבר נמחקו!`, 'success');
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
        const idx = nextList.findIndex(b => {
          if (normalizeBookTitle(b.title) === normalizeBookTitle(catalogBook.title)) return true;
          const matched = findMatchingCatalogBook(b.title);
          return matched && matched.id === catalogBook.id;
        });
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
        yeshivaGuest: Math.max(0, Number(newBookForm.prices?.yeshivaGuest || newBookForm.prices?.yeshiva || 0)),
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
        yeshivaGuest: Math.max(0, Number(editingBook.prices?.yeshivaGuest || editingBook.prices?.yeshiva || 0)),
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
  // פעולות ספקים, עריכת מלאי ספק והפקת הזמנות
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
      const oldName = editingSupplier.name;
      setSuppliersList(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...payload } : s));
      if (oldName && oldName !== payload.name) {
        setInventoryList(prev => prev.map(b => ({
          ...b,
          breakdown: (b.breakdown || []).map(r => r.location === oldName ? { ...r, location: payload.name } : r)
        })));
        setSupplierLogs(prev => prev.map(l => l.supplierName === oldName ? { ...l, supplierName: payload.name } : l));
      }
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
      title: 'מחיקת ספק וחובותיו',
      message: `האם למחוק את הספק "${supplier.name}" כולל כל היסטוריית החובות והמלאי המשויך אליו?`,
      confirmText: 'מחק ספק לצמיתות',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      icon: <Trash2 className="w-6 h-6" />,
      iconStyle: 'bg-red-100 text-red-600',
      onConfirm: async () => {
        setSuppliersList(prev => prev.filter(s => s.id !== supplier.id));
        const logsToDelete = supplierLogs.filter(l => l.supplierName === supplier.name);
        setSupplierLogs(prev => prev.filter(l => l.supplierName !== supplier.name));

        const affectedBooks = [];
        setInventoryList(prev => prev.map(book => {
          const hasSup = (book.breakdown || []).some(r => r.location === supplier.name);
          if (!hasSup) return book;
          const nextBreakdown = (book.breakdown || []).filter(r => r.location !== supplier.name);
          const updated = { ...book, breakdown: nextBreakdown, updatedAt: Date.now() };
          affectedBooks.push(updated);
          return updated;
        }));

        if (db && dbConnected) {
          try {
            if (supplier.id) await deleteDoc(getDocRef('suppliers', supplier.id));
            await Promise.all([
              ...logsToDelete.filter(l => l.id).map(l => deleteDoc(getDocRef('supplier_logs', l.id))),
              ...affectedBooks.filter(b => b.id).map(b => updateDoc(getDocRef('inventory', b.id), { breakdown: b.breakdown, updatedAt: b.updatedAt }))
            ]);
          } catch {}
        }
        showToast(`הספק "${supplier.name}" וכל חובותיו נמחקו!`, 'info');
      }
    });
  };

  const openEditSupplierStockModal = (supplier) => {
    const draft = {};
    inventoryList.forEach(book => {
      const match = (book.breakdown || []).find(r => r.location === supplier.name);
      if (match && Number(match.amount) > 0) {
        draft[book.id] = Number(match.amount);
      }
    });
    setSupplierStockDraft(draft);
    setNewBookForSupplier({ bookId: inventoryList[0]?.id || '', amount: 10 });
    setViewingSupplierStock(supplier);
  };

  const handleSaveSupplierStockChanges = async () => {
    if (!viewingSupplierStock) return;
    const supName = viewingSupplierStock.name;
    const updatedBooks = [];

    setInventoryList(prev => prev.map(book => {
      const desiredAmount = Math.max(0, Number(supplierStockDraft[book.id] || 0));
      const existingMatch = (book.breakdown || []).find(r => r.location === supName);
      const oldAmount = existingMatch ? Number(existingMatch.amount || 0) : 0;
      if (desiredAmount === oldAmount) return book;

      let nextBreakdown = (book.breakdown || []).filter(r => r.location !== supName);
      if (desiredAmount > 0) {
        nextBreakdown.push({ location: supName, amount: desiredAmount });
      }
      const updated = { ...book, breakdown: nextBreakdown, updatedAt: Date.now() };
      updatedBooks.push(updated);
      return updated;
    }));

    if (db && dbConnected && updatedBooks.length > 0) {
      try {
        await Promise.all(updatedBooks.map(b =>
          updateDoc(getDocRef('inventory', b.id), { breakdown: b.breakdown, updatedAt: b.updatedAt })
        ));
      } catch {}
    }
    setViewingSupplierStock(null);
    showToast(`מלאי הספרים אצל "${supName}" עודכן בהצלחה!`, 'success');
  };

  const openSupplierOrderModal = (supplier) => {
    const firstBook = inventoryList[0];
    setInvoiceSupplier(supplier);
    setInvoiceItems([{
      bookId: firstBook?.id || '',
      quantity: 10,
      customPrice: Number(firstBook?.prices?.supplier || 0)
    }]);
    setDeductFromWarehouse(true);
    setInvoiceNotes('');
    setIsSupplierInvoiceModalOpen(true);
  };

  const processSupplierOrder = async (mode) => {
    if (!invoiceSupplier) return;
    const validItems = invoiceItems
      .filter(i => i.bookId && Number(i.quantity) > 0)
      .map(i => {
        const book = inventoryList.find(b => b.id === i.bookId);
        const price = i.customPrice !== undefined && i.customPrice !== ''
          ? Math.max(0, Number(i.customPrice))
          : Number(book?.prices?.supplier || 0);
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
        `סה"כ לתשלום: ₪${totalOrderPrice.toLocaleString()}\n` +
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

  // ==========================================
  // פענוח אוטומטי חכם של הודעת הזמנה מספק (כולל שמות חלקיים, קיצורים וטעויות הקלדה)
  // ==========================================
  const handleParseSupplierMessageText = (text) => {
    setRawOrderMessage(text);
    if (!text.trim()) {
      setParsedItems([]);
      return;
    }

    // זיהוי אוטומטי של ספק מתוך הטקסט (גם התאמה חלקית של שם הספק)
    const lowerText = text.toLowerCase();
    const matchedSup = suppliersList.find(s => {
      const sName = (s.name || '').trim().toLowerCase();
      return sName.length >= 2 && lowerText.includes(sName);
    });
    if (matchedSup && !parsedSupplierName) {
      setParsedSupplierName(matchedSup.name);
    }

    const STOP_WORDS = new Set(['חוברת', 'ספר', 'ספרים', 'של', 'את', 'על', 'אל', 'עם', 'הרב', 'יוצא', 'מעדן', 'שערים', 'להשקות', 'הגן', 'כעץ', 'שתול', 'ונהר']);

    const cleanHebWord = (w) => {
      let s = w.replace(/[^א-תa-z0-9]/gi, '').toLowerCase();
      if (s.length > 3 && (s.startsWith('ו') || s.startsWith('ה') || s.startsWith('ל') || s.startsWith('ב') || s.startsWith('מ'))) {
        s = s.slice(1);
      }
      return s;
    };

    const getKeywords = (title) =>
      normalizeBookTitle(title)
        .split(' ')
        .map(cleanHebWord)
        .filter(w => w.length >= 2 && !STOP_WORDS.has(w));

    // חישוב מרחק עריכה (Levenshtein) לזיהוי שגיאות כתיב קלות
    const isSimilarWord = (a, b) => {
      if (a === b) return true;
      if (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))) return true;
      if (Math.abs(a.length - b.length) > 1 || a.length < 4 || b.length < 4) return false;
      const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
      for (let j = 1; j <= b.length; j++) dp[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          dp[i][j] = a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
      return dp[a.length][b.length] <= 1;
    };

    // פירוק חכם למקטעים: לפי שורות, פסיקים, וגם פיצול בין מספר ספרים באותה שורה (למשל "10 מניטו ו-5 סוכה")
    const rawSegments = text
      .split(/\r?\n|,|;|\+|\//)
      .flatMap(chunk => chunk.split(/(?=(?:^|\s|ו[-–]?)(?:×|x|\*)?\d{1,4}\s+[א-ת])/i))
      .map(s => s.trim())
      .filter(Boolean);

    const scoreBookMatch = (segment, book) => {
      const normSeg = normalizeBookTitle(segment).toLowerCase();
      const normTitle = normalizeBookTitle(book.title).toLowerCase();
      if (!normSeg || !normTitle) return 0;

      // התאמה מדויקת או הכלה מלאה
      if (normSeg.includes(normTitle)) return 100;

      // התאמה לפי מילות מפתח מהקטלוג
      const catMatch = findMatchingCatalogBook(segment);
      if (catMatch && (normalizeBookTitle(catMatch.title) === normalizeBookTitle(book.title) || findMatchingCatalogBook(book.title)?.id === catMatch.id)) {
        return 90;
      }

      const segWords = normSeg.split(' ').map(cleanHebWord).filter(w => w.length >= 2);
      const bookWords = getKeywords(book.title);
      if (bookWords.length === 0 || segWords.length === 0) return 0;

      // בדיקת הבחנה חשובה בין "סט", "א", "ב" וכו'
      const titleHasSet = normTitle.includes('סט');
      const segHasSet = normSeg.includes('סט');
      if (titleHasSet !== segHasSet && (normSeg.includes('ונהר') || normSeg.includes('תהלכתי') || normSeg.includes('שתול'))) {
        return 0;
      }

      let matchedCount = 0;
      for (const bw of bookWords) {
        if (segWords.some(sw => isSimilarWord(sw, bw))) {
          matchedCount++;
        }
      }

      if (matchedCount === 0) return 0;
      const ratio = matchedCount / bookWords.length;
      // אם לפחות חצי ממילות המפתח הייחודיות של הספר מופיעות (או מילה ייחודית ארוכה)
      if (ratio >= 0.5 || (matchedCount >= 1 && bookWords.length === 1)) {
        return Math.round(50 + ratio * 40);
      }
      return 0;
    };

    const foundMap = new Map();

    rawSegments.forEach(seg => {
      let bestBook = null;
      let bestScore = 0;

      for (const book of inventoryList) {
        const sc = scoreBookMatch(seg, book);
        if (sc > bestScore) {
          bestScore = sc;
          bestBook = book;
        }
      }

      if (!bestBook || bestScore < 50) return;

      // חילוץ כמות (תומך ב-10, x10, 10x, 10 יח', 10 עותקים, ו-10)
      const qtyMatch =
        seg.match(/(?:^|\s|ו[-–]?)(?:×|x|\*)?\s*(\d{1,4})\s*(?:×|x|\*|עותקים|יחידות|יח'|יח)?(?:\s|$)/i) ||
        seg.match(/(\d{1,4})/);
      const qty = qtyMatch ? Math.max(1, Number(qtyMatch[1])) : 1;
      const defaultPrice = Number(getEffectiveBookPrices(bestBook).supplier || bestBook.prices?.supplier || 0);

      if (foundMap.has(bestBook.id)) {
        const prev = foundMap.get(bestBook.id);
        foundMap.set(bestBook.id, { ...prev, quantity: prev.quantity + qty });
      } else {
        foundMap.set(bestBook.id, {
          bookId: bestBook.id,
          title: bestBook.title,
          quantity: qty,
          unitPrice: defaultPrice
        });
      }
    });

    setParsedItems(Array.from(foundMap.values()));
  };

  const handleConfirmParsedOrderAndReceipt = async () => {
    const supName = (parsedSupplierName || '').trim() || 'ספק / לקוח מוסדי';
    const validItems = parsedItems.filter(i => i.bookId && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      showToast('לא זוהו ספרים תקינים. ניתן להוסיף שורה ידנית למטה.', 'warning');
      return;
    }

    const totalAmount = validItems.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice || 0), 0);
    const dateStr = new Date().toLocaleDateString('he-IL');
    const receiptNum = `REC-${Date.now().toString().slice(-5)}`;

    // עדכון מלאי (הפחתה מהמחסן + הוספה לספק אם רשום)
    const updatedBooks = [];
    setInventoryList(prev => prev.map(book => {
      const item = validItems.find(v => v.bookId === book.id);
      if (!item) return book;
      const newPubStock = parsedDeductWarehouse
        ? Math.max(0, Number(book.publisherStock || 0) - Number(item.quantity))
        : Number(book.publisherStock || 0);
      const nextBreakdown = [...(book.breakdown || [])];
      const existingIdx = nextBreakdown.findIndex(r => r.location === supName);
      if (existingIdx !== -1) {
        nextBreakdown[existingIdx] = {
          ...nextBreakdown[existingIdx],
          amount: Number(nextBreakdown[existingIdx].amount || 0) + Number(item.quantity)
        };
      } else {
        nextBreakdown.push({ location: supName, amount: Number(item.quantity) });
      }
      const updated = { ...book, publisherStock: newPubStock, breakdown: nextBreakdown, updatedAt: Date.now() };
      updatedBooks.push(updated);
      return updated;
    }));

    if (db && dbConnected && updatedBooks.length > 0) {
      try {
        await Promise.all(updatedBooks.map(b =>
          updateDoc(getDocRef('inventory', b.id), { publisherStock: b.publisherStock, breakdown: b.breakdown, updatedAt: b.updatedAt })
        ));
      } catch {}
    }

    // הוספת ספק אוטומטית אם לא קיים ברשימה
    if (!suppliersList.some(s => s.name === supName)) {
      const newSup = { name: supName, contact: '', phone: '', email: '', address: '', notes: 'נוצר אוטומטית מקליטת הודעה', updatedAt: Date.now() };
      if (db && dbConnected) {
        try { await addDoc(getCollRef('suppliers'), newSup); } catch { setSuppliersList(prev => [...prev, { ...newSup, id: 'sup_' + Date.now() }]); }
      } else {
        setSuppliersList(prev => [...prev, { ...newSup, id: 'sup_' + Date.now() }]);
      }
    }

    const itemsText = validItems
      .map((item, idx) => `${idx + 1}. ${item.title} — ${item.quantity} עותקים × ₪${item.unitPrice} = ₪${(item.quantity * item.unitPrice).toLocaleString()}`)
      .join('\n');

    const logObj = {
      supplierName: supName,
      action: `הזמנה וקבלה אוטומטית מהודעה (${receiptNum})`,
      type: 'order',
      user: currentUserName,
      date: new Date().toLocaleString('he-IL'),
      timestamp: Date.now(),
      totalAmount,
      paymentStatus: parsedMarkAsPaid ? 'paid' : 'unpaid',
      paidAmount: parsedMarkAsPaid ? totalAmount : 0,
      details: itemsText
    };

    if (db && dbConnected) {
      try { await addDoc(getCollRef('supplier_logs'), logObj); } catch { setSupplierLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]); }
    } else {
      setSupplierLogs(prev => [{ ...logObj, id: Date.now().toString() }, ...prev]);
    }

    setIsParseOrderModalOpen(false);
    setRawOrderMessage('');
    setParsedItems([]);

    // פתיחת קבלה / תעודת משלוח להדפסה אוטומטית
    setPrintDoc({
      type: 'supplier_delivery',
      docTitle: parsedMarkAsPaid ? 'קבלה ותעודת משלוח לספק' : 'אישור הזמנה ותעודת משלוח לספק',
      orderId: receiptNum,
      date: dateStr,
      recipient: supName,
      totalAmount,
      notes: parsedMarkAsPaid ? 'התשלום התקבל וסומן כשולם במערכת.' : 'יתרה פתוחה לתשלום.',
      items: validItems.map(i => ({
        name: i.title,
        quantity: Number(i.quantity),
        price: Number(i.unitPrice),
        lineTotal: Number(i.quantity) * Number(i.unitPrice)
      }))
    });

    showToast(`ההזמנה והקבלה #${receiptNum} הופקו והמלאי עודכן!`, 'success');
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
        setOrdersList(prev => prev.map(o => o.id === order.id ? { ...o, status: 'shipped', shippedAt: Date.now() } : o));
        if (db && dbConnected && order.id) {
          try { await updateDoc(getDocRef('orders', order.id), { status: 'shipped', shippedAt: Date.now() }); } catch {}
        }
        showToast(`הזמנה #${order.orderId} הועברה להזמנות שנשלחו!`, 'success');
      }
    });
  };

  const handleDeleteOrder = (order) => {
    setConfirmDialog({
      title: 'מחיקת הזמנה',
      message: `האם למחוק את הזמנה #${String(order.orderId || '').replace(/^#/, '')} (${order.customerName})?`,
      confirmText: 'מחק הזמנה',
      confirmStyle: 'bg-red-600 hover:bg-red-700',
      icon: <Trash2 className="w-6 h-6" />,
      iconStyle: 'bg-red-100 text-red-600',
      onConfirm: async () => {
        setOrdersList(prev => prev.filter(o => o.id !== order.id));
        if (db && dbConnected && order.id) {
          try { await deleteDoc(getDocRef('orders', order.id)); } catch {}
        }
        showToast('ההזמנה נמחקה.', 'info');
      }
    });
  };

  const getWebhookUrl = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname || '';
      const isPreviewOrLocal =
        !host ||
        host.includes('localhost') ||
        host.includes('127.0.0.1') ||
        host.includes('googleusercontent') ||
        host.includes('webcontainer');
      if (!isPreviewOrLocal && window.location.protocol.startsWith('http')) {
        return `${window.location.origin}/api/webhook`;
      }
    }
    return 'https://yhydashboard.vercel.app/api/webhook';
  };

  const handlePingWebhook = async () => {
    const url = getWebhookUrl();
    setWebhookCheckState({ loading: true, status: null, message: `בודק זמינות שרת (${url})...` });
    try {
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      if (res.ok) {
        setWebhookCheckState({ loading: false, status: 'ok', message: `החיבור תקין! השרת (${url}) פעיל ומוכן לקבל הזמנות מהאתר.` });
        showToast('שרת ה-Webhook פעיל ותקין!', 'success');
      } else {
        setWebhookCheckState({ loading: false, status: 'error', message: `השרת החזיר שגיאה ${res.status} בכתובת ${url}. ${res.status === 404 ? 'הקובץ api/webhook.js לא נמצא ב-Vercel.' : text.slice(0, 120)}` });
        showToast(`שגיאת שרת (${res.status}) בבדיקת ה-Webhook`, 'error');
      }
    } catch (err) {
      setWebhookCheckState({ loading: false, status: 'error', message: `שגיאת תקשורת מול ${url}: ${err?.message || 'השרת לא הגיב (בדוק שהאפליקציה ו-api/webhook.js עלו ל-Vercel).'}` });
      showToast('לא ניתן להתחבר לשרת ה-Webhook.', 'error');
    }
  };

  const handleSendTestOrder = async () => {
    const url = getWebhookUrl();
    setSendingTestOrder(true);
    setWebhookCheckState({ loading: true, status: null, message: `שולח הזמנת ניסיון אמיתית אל ${url}...` });
    const testId = `TEST-${Date.now().toString().slice(-4)}`;
    const sampleBookTitle = inventoryList[0]?.title || 'אותך אבקש - שערים לימי התשובה';
    const samplePayload = {
      id: testId,
      number: testId,
      status: 'processing',
      is_test: true,
      total: '59',
      customer_note: 'הזמנת בדיקה אמיתית שעברה דרך שרת ה-Webhook (ללא הורדת מלאי)',
      billing: { first_name: 'הזמנת', last_name: 'בדיקה (אתר)', phone: '050-0000000', email: 'test@yhyh.co.il', address_1: 'ישיבת ירוחם', city: 'ירוחם' },
      shipping_lines: [{ method_title: 'איסוף עצמי / בדיקה' }],
      line_items: [{ name: sampleBookTitle, quantity: 1 }]
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samplePayload)
      });
      const responseText = await res.text();
      if (res.ok) {
        setWebhookCheckState({ loading: false, status: 'ok', message: `הזמנת הבדיקה #${testId} עברה בהצלחה דרך שרת ה-Webhook ונשמרה!` });
        showToast(`הזמנת הבדיקה #${testId} נשלחה בהצלחה דרך ה-Webhook!`, 'success');
        setActiveTab('orders');
      } else {
        setWebhookCheckState({
          loading: false,
          status: 'error',
          message: `שליחת הזמנת הניסיון נכשלה (שגיאה ${res.status}) בכתובת ${url}. ${res.status === 404 ? 'ודא שהקובץ api/webhook.js קיים בתיקיית api ב-GitHub/Vercel.' : responseText.slice(0, 140)}`
        });
        showToast(`שגיאה ${res.status} בשליחת הזמנת ניסיון לשרת.`, 'error');
      }
    } catch (err) {
      setWebhookCheckState({
        loading: false,
        status: 'error',
        message: `לא ניתן להגיע לשרת ה-Webhook (${url}): ${err?.message || 'שגיאת רשת / CORS'}.`
      });
      showToast('הבקשה לשרת ה-Webhook נכשלה — ראה פירוט בתיבת הסטטוס.', 'error');
    } finally {
      setSendingTestOrder(false);
    }
  };

  // ==========================================
  // פעולות קופה מהירה (POS)
  // ==========================================
  const getPosBookPrice = (book, mode = posPriceMode) => {
    const eff = getEffectiveBookPrices(book);
    if (mode === 'yeshiva') return eff.yeshiva;
    if (mode === 'yeshivaGuest') return eff.yeshivaGuest;
    return eff.general;
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
      priceMode: posPriceMode === 'yeshiva' ? 'תלמיד ישיבה (ראשון)' : posPriceMode === 'yeshivaGuest' ? 'ישיבה (שני / אורח)' : 'מחיר אתר (צרכן)',
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
      version: '3.2',
      exportedAt: new Date().toISOString(),
      data: { inventory: inventoryList, suppliers: suppliersList, tasks: tasksList, orders: ordersList, notes: notesList, supplierLogs, giftLogs, posSales, printQuotes, campaigns: campaignsList, prCopies, dashboardAdjustments }
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
            if (d.dashboardAdjustments) setDashboardAdjustments(d.dashboardAdjustments);
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

  // ==========================================
  // מנוע גיבוי אוטומטי ונקודות שחזור
  // ==========================================
  const persistSnapshotsSafely = (snapshotsArr) => {
    let list = [...snapshotsArr];
    while (list.length > 0) {
      try {
        localStorage.setItem('yhy_erp_auto_snapshots', JSON.stringify(list));
        setAutoSnapshots(list);
        return true;
      } catch {
        list.pop();
      }
    }
    return false;
  };

  const createAutoSnapshot = (reason = 'גיבוי אוטומטי מתוזמן', silent = true) => {
    try {
      const current = latestDataRef.current;
      const compactQuotes = (current.printQuotes || []).map(q => {
        if (q.fileData && String(q.fileData).length > 150000) {
          return { ...q, fileData: '' };
        }
        return q;
      });
      const dataPayload = { ...current, printQuotes: compactQuotes };
      const jsonStr = JSON.stringify(dataPayload);
      const sizeKB = Math.max(1, Math.round((jsonStr.length * 2) / 1024));

      const snapshot = {
        id: 'snap_' + Date.now(),
        createdAt: Date.now(),
        dateLabel: new Date().toLocaleString('he-IL'),
        reason,
        sizeKB,
        summary: {
          books: (current.inventory || []).length,
          suppliers: (current.suppliers || []).length,
          orders: (current.orders || []).length,
          quotes: (current.printQuotes || []).length
        },
        data: dataPayload
      };

      const maxKeep = Math.max(1, Number(autoBackupSettings.maxSnapshots || 5));
      const existing = loadLocal('yhy_erp_auto_snapshots', []);
      const nextSnapshots = [snapshot, ...existing].slice(0, maxKeep);
      const saved = persistSnapshotsSafely(nextSnapshots);
      if (saved && !silent) {
        showToast('נקודת שחזור נוצרה ונשמרה בהצלחה!', 'success');
      }
    } catch (err) {
      console.warn('Auto-backup snapshot error:', err);
      if (!silent) showToast('לא ניתן היה לשמור נקודת שחזור בזיכרון הדפדפן.', 'warning');
    }
  };

  useEffect(() => {
    if (!currentUser || !autoBackupSettings.enabled) return;
    const checkAndRunBackup = () => {
      const intervalMs = Math.max(5, Number(autoBackupSettings.intervalMinutes || 30)) * 60 * 1000;
      const existing = loadLocal('yhy_erp_auto_snapshots', []);
      const lastTime = existing[0]?.createdAt || 0;
      if (Date.now() - lastTime >= intervalMs) {
        createAutoSnapshot('גיבוי אוטומטי מתוזמן', true);
      }
    };
    const initialTimer = setTimeout(checkAndRunBackup, 10000);
    const intervalId = setInterval(checkAndRunBackup, 60000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, [currentUser, autoBackupSettings.enabled, autoBackupSettings.intervalMinutes, autoBackupSettings.maxSnapshots]);

  const handleRestoreSnapshot = (snapshot) => {
    if (!snapshot?.data) return;
    setConfirmDialog({
      title: 'שחזור מנקודת גיבוי אוטומטי',
      message: `האם לשחזר את כל נתוני המערכת לנקודת הזמן ${snapshot.dateLabel}?`,
      confirmText: 'שחזר נקודה זו',
      confirmStyle: 'bg-indigo-600 hover:bg-indigo-700',
      icon: <RotateCcw className="w-6 h-6" />,
      iconStyle: 'bg-indigo-100 text-indigo-600',
      onConfirm: () => {
        const d = snapshot.data;
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
        showToast(`המערכת שוחזרה בהצלחה לנקודה מתאריך ${snapshot.dateLabel}!`, 'success');
      }
    });
  };

  const handleDownloadSnapshot = (snapshot) => {
    const payload = {
      version: '3.2-snapshot',
      exportedAt: new Date(snapshot.createdAt).toISOString(),
      reason: snapshot.reason,
      data: snapshot.data
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yhy_autobackup_${new Date(snapshot.createdAt).toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('קובץ נקודת השחזור הורד למחשב!', 'success');
  };

  const handleDeleteSnapshot = (snapId) => {
    const next = autoSnapshots.filter(s => s.id !== snapId);
    persistSnapshotsSafely(next);
    showToast('נקודת השחזור הוסרה.', 'info');
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
        (s.contact || '').toLowerCase().includes(supplierSearch.toLowerCase()) ||
        (s.phone || '').toLowerCase().includes(supplierSearch.toLowerCase())
      )
      .sort((a, b) => {
        if (supplierSort === 'alphabetical') return (a.name || '').localeCompare(b.name || '', 'he');
        return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
      });
  }, [suppliersList, supplierSearch, supplierSort]);

  const pendingOrders = useMemo(
    () => [...ordersList].filter(o => o.status !== 'shipped').sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0)),
    [ordersList]
  );
  const shippedOrders = useMemo(
    () => [...ordersList].filter(o => o.status === 'shipped').sort((a, b) => Number(b.shippedAt || b.timestamp || 0) - Number(a.shippedAt || a.timestamp || 0)),
    [ordersList]
  );

  // --- מדדי דאשבורד חיים + התאמות ידניות ---
  const totalWarehouseCopies = useMemo(
    () => Math.max(0, inventoryList.reduce((sum, b) => sum + Number(b.publisherStock || 0), 0) + Number(dashboardAdjustments.extraWarehouseCopies || 0)),
    [inventoryList, dashboardAdjustments.extraWarehouseCopies]
  );
  const totalSuppliersCopies = useMemo(
    () => Math.max(0, inventoryList.reduce((sum, b) => sum + calculateSuppliersStock(b), 0) + Number(dashboardAdjustments.extraSuppliersCopies || 0)),
    [inventoryList, dashboardAdjustments.extraSuppliersCopies]
  );
  const totalCopiesInSystem = useMemo(
    () => Math.max(0, totalWarehouseCopies + totalSuppliersCopies + Number(dashboardAdjustments.extraCopies || 0)),
    [totalWarehouseCopies, totalSuppliersCopies, dashboardAdjustments.extraCopies]
  );
  const totalRetailValue = useMemo(
    () => Math.max(0, inventoryList.reduce((sum, b) => sum + calculateTotalStock(b) * Number(b.prices?.general || 0), 0) + Number(dashboardAdjustments.extraRetailValue || 0)),
    [inventoryList, dashboardAdjustments.extraRetailValue]
  );
  const totalProductionValue = useMemo(
    () => Math.max(0, inventoryList.reduce((sum, b) => sum + calculateTotalStock(b) * Number(b.productionCost || 0), 0) + Number(dashboardAdjustments.extraProductionValue || 0)),
    [inventoryList, dashboardAdjustments.extraProductionValue]
  );
  const liveStoreRevenue = useMemo(
    () => Math.max(0, ordersList.reduce((sum, o) => sum + Number(o.total || 0), 0) + Number(dashboardAdjustments.extraStoreRevenue || 0)),
    [ordersList, dashboardAdjustments.extraStoreRevenue]
  );
  const liveSupplierRevenue = useMemo(
    () => Math.max(0, supplierLogs.filter(l => l.type !== 'return').reduce((sum, l) => sum + Number(l.totalAmount || 0), 0) + Number(dashboardAdjustments.extraSupplierRevenue || 0)),
    [supplierLogs, dashboardAdjustments.extraSupplierRevenue]
  );
  const livePosRevenue = useMemo(
    () => Math.max(0, posSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0) + Number(dashboardAdjustments.extraPosRevenue || 0)),
    [posSales, dashboardAdjustments.extraPosRevenue]
  );
  const totalOpenSupplierDebt = useMemo(
    () => Math.max(0, supplierLogs.reduce((sum, l) => sum + getLogRemainingDebt(l), 0) + Number(dashboardAdjustments.extraOpenDebt || 0)),
    [supplierLogs, dashboardAdjustments.extraOpenDebt]
  );
  const lowStockBooks = useMemo(() => inventoryList.filter(b => calculateTotalStock(b) < Number(b.threshold || 30)), [inventoryList]);

  const hasAnyDashboardAdjustment = useMemo(() => {
    const keys = ['extraCopies', 'extraWarehouseCopies', 'extraSuppliersCopies', 'extraRetailValue', 'extraProductionValue', 'extraStoreRevenue', 'extraSupplierRevenue', 'extraPosRevenue', 'extraOpenDebt'];
    return keys.some(k => Number(dashboardAdjustments[k] || 0) !== 0);
  }, [dashboardAdjustments]);

  // --- תפריט ניווט ראשי ---
  const navItems = [
    { id: 'dashboard', label: 'דאשבורד ובקרה', icon: LayoutDashboard, group: 'ראשי' },
    { id: 'pos', label: 'קופה מהירה (דוכן)', icon: CreditCard, group: 'מכירות והזמנות' },
    { id: 'orders', label: 'הזמנות חנות', icon: ShoppingCart, group: 'מכירות והזמנות', badge: pendingOrders.length },
    { id: 'inventory', label: 'ניהול מלאי', icon: Package, group: 'מלאי והפצה' },
    { id: 'suppliers', label: 'ספקים וחנויות', icon: Truck, group: 'מלאי והפצה' },
    { id: 'production', label: 'הפקת ספרים', icon: KanbanSquare, group: 'הפקה ושיווק' },
    { id: 'print_quotes', label: 'השוואת דפוסים', icon: Scale, group: 'הפקה ושיווק' },
    { id: 'marketing', label: 'שיווק ויח"צ', icon: Megaphone, group: 'הפקה ושיווק' },
    { id: 'notes', label: 'לוח פתקים', icon: StickyNote, group: 'מערכת' },
    { id: 'integrations', label: 'אוטומציה וגיבוי', icon: Settings, group: 'מערכת' },
    ...(userRole === 'admin' ? [{ id: 'users', label: 'ניהול משתמשים', icon: UserCog, group: 'מערכת' }] : [])
  ];

  const activeNavItem = navItems.find(i => i.id === activeTab) || navItems[0];
  const userInitial = (currentUserName || 'מ').trim().charAt(0);

  // סגנונות מערכת מתקדמים, אנימציות ומעברים חלקים
  const themeStyles = `
    @keyframes pageEnter {
      0% { opacity: 0; transform: translateY(14px) scale(0.992); filter: blur(4px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes staggerItem {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes modalPop {
      0% { opacity: 0; transform: translateY(16px) scale(0.955); filter: blur(3px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes backdropFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateY(18px) scale(0.94); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes tabProgressBar {
      0% { transform: scaleX(0); opacity: 1; }
      70% { transform: scaleX(0.88); opacity: 1; }
      100% { transform: scaleX(1); opacity: 0; }
    }
    .animate-page-enter {
      animation: pageEnter 0.36s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .animate-page-enter .grid > div {
      animation: staggerItem 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .animate-page-enter .grid > div:nth-child(2) { animation-delay: 40ms; }
    .animate-page-enter .grid > div:nth-child(3) { animation-delay: 80ms; }
    .animate-page-enter .grid > div:nth-child(4) { animation-delay: 120ms; }
    .animate-page-enter .grid > div:nth-child(5) { animation-delay: 160ms; }
    .animate-tab-progress {
      transform-origin: right center;
      animation: tabProgressBar 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .animate-toast {
      animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .erp-shell .fixed.inset-0 {
      animation: backdropFade 0.22s ease-out both;
    }
    .erp-shell .fixed.inset-0 > div {
      animation: modalPop 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .erp-shell {
      font-feature-settings: "tnum" on, "lnum" on;
      background-image: radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.06) 0px, transparent 42%),
                        radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 42%);
      background-attachment: fixed;
    }
    .erp-shell.erp-dark {
      background-image: radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 45%),
                        radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 45%);
    }
    .erp-shell button {
      transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease, color 0.2s ease, box-shadow 0.22s ease, border-color 0.2s ease;
    }
    .erp-shell button:active:not(:disabled) {
      transform: scale(0.97);
    }
    .erp-shell ::-webkit-scrollbar { width: 7px; height: 7px; }
    .erp-shell ::-webkit-scrollbar-track { background: transparent; }
    .erp-shell ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.35); border-radius: 9999px; }
    .erp-shell ::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.55); }

    .erp-dark { color-scheme: dark; }
    .erp-dark .bg-white,
    .erp-dark .bg-white\\/95,
    .erp-dark .bg-white\\/80 {
      background-color: #0F172A !important;
      color: #F1F5F9 !important;
    }
    .erp-dark .bg-slate-50,
    .erp-dark .bg-slate-50\\/90,
    .erp-dark .bg-slate-50\\/80,
    .erp-dark .bg-slate-50\\/70,
    .erp-dark .bg-slate-50\\/50 {
      background-color: #162033 !important;
    }
    .erp-dark .bg-slate-100,
    .erp-dark .bg-slate-100\\/90 {
      background-color: #1E293B !important;
    }
    .erp-dark .bg-slate-200 { background-color: #334155 !important; }
    .erp-dark .bg-indigo-50,
    .erp-dark .bg-indigo-50\\/80,
    .erp-dark .bg-indigo-50\\/70,
    .erp-dark .bg-indigo-50\\/50,
    .erp-dark .bg-indigo-50\\/40,
    .erp-dark .bg-indigo-50\\/20 {
      background-color: rgba(79, 70, 229, 0.16) !important;
    }
    .erp-dark .bg-emerald-50,
    .erp-dark .bg-emerald-50\\/80,
    .erp-dark .bg-emerald-50\\/70,
    .erp-dark .bg-emerald-50\\/35 {
      background-color: rgba(16, 185, 129, 0.14) !important;
    }
    .erp-dark .bg-amber-50,
    .erp-dark .bg-amber-50\\/70,
    .erp-dark .bg-amber-50\\/30,
    .erp-dark .from-amber-50 {
      background-color: rgba(245, 158, 11, 0.14) !important;
    }
    .erp-dark .bg-rose-50,
    .erp-dark .bg-rose-50\\/80,
    .erp-dark .bg-rose-50\\/40,
    .erp-dark .bg-rose-50\\/25,
    .erp-dark .from-rose-50 {
      background-color: rgba(244, 63, 94, 0.14) !important;
    }
    .erp-dark .bg-purple-50,
    .erp-dark .bg-purple-50\\/70 {
      background-color: rgba(168, 85, 247, 0.16) !important;
    }
    .erp-dark .bg-pink-50 { background-color: rgba(236, 72, 153, 0.16) !important; }
    .erp-dark .bg-blue-50\\/70 { background-color: rgba(59, 130, 246, 0.14) !important; }

    .erp-dark .text-slate-900,
    .erp-dark .text-slate-800 { color: #F8FAFC !important; }
    .erp-dark .text-slate-700 { color: #E2E8F0 !important; }
    .erp-dark .text-slate-600 { color: #CBD5E1 !important; }
    .erp-dark .text-slate-500 { color: #94A3B8 !important; }
    .erp-dark .text-indigo-900,
    .erp-dark .text-indigo-800,
    .erp-dark .text-indigo-700,
    .erp-dark .text-indigo-600 { color: #A5B4FC !important; }
    .erp-dark .text-emerald-900,
    .erp-dark .text-emerald-700,
    .erp-dark .text-emerald-600 { color: #6EE7B7 !important; }
    .erp-dark .text-amber-900,
    .erp-dark .text-amber-800,
    .erp-dark .text-amber-700 { color: #FCD34D !important; }
    .erp-dark .text-rose-800,
    .erp-dark .text-rose-700,
    .erp-dark .text-rose-600 { color: #FDA4AF !important; }
    .erp-dark .text-purple-900,
    .erp-dark .text-purple-700 { color: #D8B4FE !important; }
    .erp-dark .text-pink-700 { color: #F9A8D4 !important; }

    .erp-dark .border-slate-100,
    .erp-dark .border-slate-200,
    .erp-dark .border-slate-200\\/80,
    .erp-dark .border-slate-200\\/70,
    .erp-dark .border-slate-300,
    .erp-dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]) {
      border-color: rgba(51, 65, 85, 0.75) !important;
    }
    .erp-dark [class*="ring-slate-200"],
    .erp-dark [class*="ring-slate-100"],
    .erp-dark [class*="ring-slate-300"] {
      --tw-ring-color: rgba(51, 65, 85, 0.85) !important;
    }
    .erp-dark [class*="ring-indigo-100"],
    .erp-dark [class*="ring-indigo-200"] {
      --tw-ring-color: rgba(99, 102, 241, 0.35) !important;
    }
    .erp-dark [class*="ring-emerald-200"],
    .erp-dark [class*="ring-emerald-100"] {
      --tw-ring-color: rgba(16, 185, 129, 0.35) !important;
    }
    .erp-dark [class*="ring-amber-200"] {
      --tw-ring-color: rgba(245, 158, 11, 0.35) !important;
    }
    .erp-dark [class*="ring-rose-200"],
    .erp-dark [class*="ring-rose-100"] {
      --tw-ring-color: rgba(244, 63, 94, 0.35) !important;
    }
    .erp-dark [class*="ring-purple-200"] {
      --tw-ring-color: rgba(168, 85, 247, 0.35) !important;
    }
    .erp-dark input,
    .erp-dark select,
    .erp-dark textarea {
      background-color: #1E293B !important;
      color: #F8FAFC !important;
      border-color: #334155 !important;
    }
    .erp-dark input::placeholder,
    .erp-dark textarea::placeholder {
      color: #64748B !important;
    }
    .erp-dark tr:hover {
      background-color: rgba(30, 41, 59, 0.65) !important;
    }
    .erp-dark .print-paper-surface,
    .erp-dark .print-paper-surface * {
      background-color: #FFFFFF !important;
      color: #0F172A !important;
      border-color: #CBD5E1 !important;
    }
  `;

  // ==========================================
  // מסך התחברות
  // ==========================================
  if (!currentUser) {
    return (
      <div className={`min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-[#060A14]' : 'bg-gradient-to-br from-slate-100 via-indigo-50/60 to-slate-200'}`} dir="rtl">
        <style>{themeStyles}</style>
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className={`fixed top-5 left-5 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-lg backdrop-blur-md transition-all ${
            darkMode
              ? 'bg-slate-800/80 text-amber-300 ring-1 ring-slate-700 hover:bg-slate-700'
              : 'bg-white/85 text-slate-700 ring-1 ring-slate-200 hover:bg-white'
          }`}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          <span>{darkMode ? 'מצב יום' : 'מצב לילה'}</span>
        </button>

        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#4B5320]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/25 blur-3xl" />

        <div className={`relative backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 transition-colors ${darkMode ? 'bg-slate-900/95 ring-slate-700/80' : 'bg-white/95 ring-white/60'}`}>
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
              <label className={`block text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>שם משתמש</label>
              <div className="relative">
                <UserCog className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="text"
                  autoFocus
                  value={loginForm.username}
                  onChange={e => { setLoginForm({ ...loginForm, username: e.target.value }); setLoginError(''); }}
                  placeholder="הזן שם משתמש..."
                  className={`w-full pr-10 pl-3 py-3 border rounded-xl text-sm outline-none transition-all ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'
                      : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500'
                  }`}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>סיסמה</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={loginForm.password}
                  onChange={e => { setLoginForm({ ...loginForm, password: e.target.value }); setLoginError(''); }}
                  placeholder="••••••••"
                  className={`w-full pr-10 pl-3 py-3 border rounded-xl text-sm outline-none transition-all ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'
                      : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500'
                  }`}
                  dir="ltr"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
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
    <div className={`erp-shell min-h-screen flex flex-col lg:flex-row font-sans antialiased transition-colors duration-300 ${darkMode ? 'erp-dark bg-[#070B14] text-slate-100' : 'bg-[#F1F5F9] text-slate-800'}`} dir="rtl">
      <style>{themeStyles}</style>

      {/* Toast Notification */}
      {toast && (
        <div className={`animate-toast fixed bottom-20 lg:bottom-6 left-5 z-[100] px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-white text-sm font-bold flex items-center gap-2.5 ring-1 ring-white/20 print:hidden ${
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
      <aside className="hidden lg:flex lg:flex-col w-68 bg-gradient-to-b from-[#0B1120] via-[#0F172A] to-[#0B1120] text-white shrink-0 border-l border-slate-800/80 print:hidden">
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#65702c] to-[#3b4219] flex items-center justify-center shadow-lg shadow-black/30 ring-1 ring-amber-200/30 shrink-0">
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
                          ? 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-950/60 ring-1 ring-indigo-400/40'
                          : 'text-slate-300 hover:bg-slate-800/75 hover:text-white'
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

        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 space-y-3">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{darkMode ? 'מצב לילה (כהה)' : 'מצב יום (בהיר)'}</span>
            </span>
            <span className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${darkMode ? 'bg-indigo-600 justify-start' : 'bg-slate-600 justify-end'}`}>
              <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </span>
          </button>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 border border-indigo-400/30 text-indigo-200 font-extrabold text-sm flex items-center justify-center shrink-0">
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
            title={darkMode ? 'עבור למצב יום (בהיר)' : 'עבור למצב לילה (כהה)'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
      <div className="flex-1 flex flex-col min-w-0 relative">
        {isTabTransitioning && (
          <div className="fixed top-0 inset-x-0 h-[3px] z-50 pointer-events-none print:hidden overflow-hidden">
            <div className="animate-tab-progress h-full w-full bg-gradient-to-l from-indigo-500 via-violet-500 to-emerald-400 shadow-[0_0_10px_rgba(99,102,241,0.7)]" />
          </div>
        )}

        {/* Desktop Top Utility Header */}
        <div className={`hidden lg:flex items-center justify-between px-8 py-4 backdrop-blur-xl border-b sticky top-0 z-20 print:hidden transition-colors ${darkMode ? 'bg-[#0B1120]/85 border-slate-800/80' : 'bg-white/80 border-slate-200/80'}`}>
          <div className="flex items-center gap-3">
            {activeNavItem && (() => {
              const ActiveIcon = activeNavItem.icon;
              return (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-indigo-500/25">
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
            <button
              type="button"
              onClick={() => { setIsCommandOpen(true); setCommandQuery(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 ring-1 transition-all ${
                darkMode
                  ? 'bg-slate-800/90 text-slate-300 ring-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100/90 text-slate-500 ring-slate-200/80 hover:bg-white hover:text-slate-800'
              }`}
              title="חיפוש וניווט מהיר (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>חיפוש מהיר...</span>
              <kbd className="text-[10px] font-mono bg-white/80 text-slate-500 px-1.5 py-0.5 rounded-md ring-1 ring-slate-200" dir="ltr">Ctrl+K</kbd>
            </button>

            <button
              type="button"
              onClick={() => {
                setCalcItems([{ bookId: inventoryList[0]?.id || '', quantity: 10 }]);
                setCalcDiscountPct(0);
                setIsPurchaseCalcOpen(true);
              }}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ring-1 ring-amber-200/80 transition-all"
            >
              <Calculator className="w-3.5 h-3.5" /> מחשבון ספרים
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('integrations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ring-1 transition-all ${
                autoBackupSettings.enabled
                  ? 'bg-emerald-50/90 text-emerald-700 ring-emerald-200/80 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 ring-slate-200 hover:bg-slate-200/70'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{autoBackupSettings.enabled ? 'גובה אוטומטית' : 'גיבוי כבוי'}</span>
            </button>

            {pendingOrders.length > 0 && activeTab !== 'orders' && (
              <button
                onClick={() => setActiveTab('orders')}
                className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {pendingOrders.length} הזמנות
              </button>
            )}

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ring-1 transition-all ${
                darkMode
                  ? 'bg-slate-800 text-amber-300 ring-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 ring-slate-200 hover:bg-slate-200/70'
              }`}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{darkMode ? 'מצב יום' : 'מצב לילה'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 pb-28 md:p-6 lg:p-8 lg:pb-10 max-w-[1600px] w-full mx-auto overflow-x-hidden">
          <div key={activeTab} className="animate-page-enter">
        {/* ==================== 1. DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0F172A] via-[#1E1B4B] to-[#312E81] p-6 md:p-7 text-white shadow-lg">
              <div className="pointer-events-none absolute -left-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 -bottom-20 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl" />
              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-indigo-200 ring-1 ring-white/15">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> מרכז הבקרה החי של ההוצאה
                    {hasAnyDashboardAdjustment && <span className="bg-amber-400/25 text-amber-200 px-2 py-0.5 rounded-full mr-1">כולל התאמות ידניות</span>}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">שלום {currentUserName}, תמונת מצב עסקית</h2>
                  <p className="text-xs md:text-sm text-indigo-100/80">סקירה בזמן אמת של מלאי הספרים, שווי ההדפסה, הכנסות המכירות ויתרות הגבייה</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setActiveTab('pos')} className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ring-1 ring-white/20 transition-all">
                    <CreditCard className="w-4 h-4 text-emerald-300" /> מכירה בדוכן
                  </button>
                  <button onClick={() => { setCalcItems([{ bookId: inventoryList[0]?.id || '', quantity: 10 }]); setCalcDiscountPct(0); setIsPurchaseCalcOpen(true); }} className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ring-1 ring-white/20 transition-all">
                    <Calculator className="w-4 h-4 text-amber-300" /> מחשבון ספרים
                  </button>
                  {userRole === 'admin' && (
                    <button onClick={() => setIsDashboardEditOpen(true)} className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all">
                      <Sliders className="w-4 h-4" /> ערוך נתוני דאשבורד
                    </button>
                  )}
                </div>
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
                  <span>ספקים: <strong className="text-emerald-700">{totalSuppliersCopies.toLocaleString()}</strong></span>
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

            {/* פס ויזואלי להתפלגות המלאי */}
            <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                <span className="font-extrabold text-slate-800 text-sm">התפלגות המלאי: מחסן ראשי מול ספקים וחנויות</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-bold text-indigo-600"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> מחסן ראשי: {totalWarehouseCopies.toLocaleString()} ({totalCopiesInSystem > 0 ? Math.round((totalWarehouseCopies / totalCopiesInSystem) * 100) : 0}%)</span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> אצל ספקים: {totalSuppliersCopies.toLocaleString()} ({totalCopiesInSystem > 0 ? Math.round((totalSuppliersCopies / totalCopiesInSystem) * 100) : 0}%)</span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-l from-indigo-500 to-violet-500 h-full transition-all duration-500"
                  style={{ width: `${totalCopiesInSystem > 0 ? Math.min(100, (totalWarehouseCopies / totalCopiesInSystem) * 100) : 0}%` }}
                />
                <div
                  className="bg-gradient-to-l from-emerald-400 to-teal-500 h-full transition-all duration-500"
                  style={{ width: `${totalCopiesInSystem > 0 ? Math.min(100, (totalSuppliersCopies / totalCopiesInSystem) * 100) : 0}%` }}
                />
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
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70">
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><CreditCard className="w-5 h-5" /></span>
                  קופה מהירה למכירות בישיבה / דוכן
                </h2>
                <p className="text-slate-500 text-xs mt-1">בחר ספרים להוספה לסל — המלאי יופחת אוטומטית מהמחסן הראשי</p>
              </div>
              <div className="bg-slate-100 p-1.5 rounded-xl grid grid-cols-3 gap-1 ring-1 ring-slate-200/80 w-full xl:w-auto shrink-0 overflow-hidden">
                <button onClick={() => setPosPriceMode('yeshiva')} className={`px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap text-center transition-all ${posPriceMode === 'yeshiva' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}>תלמיד ראשון</button>
                <button onClick={() => setPosPriceMode('yeshivaGuest')} className={`px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap text-center transition-all ${posPriceMode === 'yeshivaGuest' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}>שני / אורח</button>
                <button onClick={() => setPosPriceMode('general')} className={`px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap text-center transition-all ${posPriceMode === 'general' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}>צרכן (אתר)</button>
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
            <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><ShoppingCart className="w-5 h-5" /></span>
                    הזמנות מהחנות (אתר הישיבה)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">הזמנות שנכנסות מהאתר וממתינות לאריזה ומשלוח</p>
                </div>
                <div className="bg-slate-100 p-1 rounded-xl flex gap-1 ring-1 ring-slate-200/80 w-full sm:w-auto">
                  <button onClick={() => setOrdersSubTab('pending')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${ordersSubTab === 'pending' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}>הזמנות פתוחות ({pendingOrders.length})</button>
                  <button onClick={() => setOrdersSubTab('shipped')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${ordersSubTab === 'shipped' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}>הזמנות שנשלחו ({shippedOrders.length})</button>
                </div>
              </div>

              {userRole === 'admin' && (
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={webhookCheckState.loading}
                      onClick={handlePingWebhook}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ring-1 ring-slate-200"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${webhookCheckState.loading ? 'animate-spin' : ''}`} /> בדוק חיבור שרת
                    </button>
                    <button
                      type="button"
                      disabled={sendingTestOrder}
                      onClick={handleSendTestOrder}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" /> {sendingTestOrder ? 'שולח...' : 'שלח הזמנת ניסיון'}
                    </button>
                  </div>
                  {webhookCheckState.message && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      webhookCheckState.status === 'ok'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : webhookCheckState.status === 'error'
                          ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                          : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
                    }`}>
                      {webhookCheckState.status === 'ok' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                      <span>{webhookCheckState.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(ordersSubTab === 'pending' ? pendingOrders : shippedOrders).map(order => (
                <div key={order.id} className={`bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 border-r-4 hover:shadow-md transition-all space-y-3.5 ${ordersSubTab === 'pending' ? 'border-r-amber-500' : 'border-r-emerald-500'}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="inline-block text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">הזמנה #{String(order.orderId || '').replace(/^#/, '')}</span>
                        {order.isTest && <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">בדיקה</span>}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">{order.customerName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{order.address} · {order.shippingMethod}</p>
                      {(order.phone || order.email) && (
                        <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2.5">
                          {order.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {order.phone}</span>}
                          {order.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {order.email}</span>}
                        </p>
                      )}
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
                  {order.customerNote && (
                    <p className="text-xs text-amber-800 bg-amber-50/80 ring-1 ring-amber-200/70 p-2.5 rounded-xl">
                      <strong>הערת לקוח:</strong> {order.customerNote}
                    </p>
                  )}
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
                    {order.phone && formatWhatsAppPhone(order.phone) && (
                      <a
                        href={`https://wa.me/${formatWhatsAppPhone(order.phone)}?text=${encodeURIComponent(`שלום ${order.customerName}, תודה על הזמנתך #${String(order.orderId || '').replace(/^#/, '')} מהוצאת ספרי ישיבת ירוחם!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> וואטסאפ
                      </a>
                    )}
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDeleteOrder(order)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="מחק הזמנה"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                      const effPrices = getEffectiveBookPrices(book);
                      const webPrice = effPrices.general;
                      const supPrice = effPrices.supplier;
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
                              <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                                תלמיד ₪{effPrices.yeshiva}
                                {effPrices.yeshivaGuest > 0 && effPrices.yeshivaGuest !== effPrices.yeshiva ? ` / שני ₪${effPrices.yeshivaGuest}` : ''}
                              </span>
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
                                    prices: { catalog: 0, general: 0, supplier: 0, yeshiva: 0, yeshivaGuest: book.prices?.yeshiva || 0, ...(book.prices || {}) },
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
            <div className="bg-white p-5 rounded-2xl shadow-xs ring-1 ring-slate-200/70 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3.5">
              <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={supplierSearch}
                    onChange={e => setSupplierSearch(e.target.value)}
                    placeholder="חפש ספק, חנות או איש קשר..."
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCalcItems([{ bookId: inventoryList[0]?.id || '', quantity: 10 }]);
                    setCalcDiscountPct(0);
                    setIsPurchaseCalcOpen(true);
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 ring-1 ring-amber-200/80 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Calculator className="w-4 h-4 text-amber-600" /> מחשבון קניית ספרים
                </button>
                {userRole === 'admin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRawOrderMessage('');
                        setParsedSupplierName(suppliersList[0]?.name || '');
                        setParsedItems([]);
                        setParsedDeductWarehouse(true);
                        setParsedMarkAsPaid(true);
                        setIsParseOrderModalOpen(true);
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <FileCheck className="w-4 h-4 text-emerald-600" /> הזמנה מהודעת ספק
                    </button>
                    <button
                      onClick={() => { setEditingSupplier(null); setSupplierForm(emptySupplierForm); setIsSupplierModalOpen(true); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all"
                    >
                      <Plus className="w-4 h-4" /> הוסף ספק / חנות
                    </button>
                  </>
                )}
              </div>
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
                        <button onClick={() => openEditSupplierStockModal(supplier)} className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                          <Package className="w-3.5 h-3.5" /> מלאי ועריכה
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
                    showToast('הקמפיין נוסף בהצלחה!', 'success');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/90 p-3.5 rounded-2xl ring-1 ring-slate-200/70"
                >
                  <input required placeholder="שם הקמפיין *" value={newCampaignForm.name} onChange={e => setNewCampaignForm({ ...newCampaignForm, name: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white sm:col-span-2" />
                  <input type="number" min="0" placeholder="תקציב (₪)" value={newCampaignForm.budget} onChange={e => setNewCampaignForm({ ...newCampaignForm, budget: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white" dir="ltr" />
                  <input type="number" min="0" placeholder="הוצאה בפועל (₪)" value={newCampaignForm.spent} onChange={e => setNewCampaignForm({ ...newCampaignForm, spent: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white" dir="ltr" />
                  <input placeholder="ערוץ פרסום" value={newCampaignForm.channel} onChange={e => setNewCampaignForm({ ...newCampaignForm, channel: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white" />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold">+ הוסף קמפיין</button>
                </form>
              )}
              <div className="space-y-2.5">
                {campaignsList.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-6">עדיין לא הוגדרו קמפיינים.</p>
                ) : campaignsList.map(c => {
                  const pct = Number(c.budget) > 0 ? Math.min(100, Math.round((Number(c.spent || 0) / Number(c.budget)) * 100)) : 0;
                  return (
                    <div key={c.id} className="p-3.5 bg-slate-50/90 rounded-xl ring-1 ring-slate-200/70 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="text-xs text-slate-500">{c.channel}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>נוצל: ₪{Number(c.spent || 0).toLocaleString()}</span>
                        <span>תקציב: ₪{Number(c.budget || 0).toLocaleString()} ({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs ring-1 ring-slate-200/70 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><FileText className="w-4 h-4" /></span>
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
                    showToast('עותק ביקורת תועד בהצלחה!', 'success');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/90 p-3.5 rounded-2xl ring-1 ring-slate-200/70"
                >
                  <input required placeholder="שם הספר *" value={newPrForm.bookTitle} onChange={e => setNewPrForm({ ...newPrForm, bookTitle: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white sm:col-span-2" />
                  <input required placeholder="שם המקבל *" value={newPrForm.recipient} onChange={e => setNewPrForm({ ...newPrForm, recipient: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white" />
                  <input placeholder="תפקיד / גוף תקשורת" value={newPrForm.role} onChange={e => setNewPrForm({ ...newPrForm, role: e.target.value })} className="p-2.5 border border-slate-200 rounded-xl text-xs bg-white" />
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold sm:col-span-2">+ תעד שליחת עותק יח"צ</button>
                </form>
              )}
              <div className="space-y-2">
                {prCopies.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-6">עדיין לא תועדו עותקי ביקורת.</p>
                ) : prCopies.map(pr => (
                  <div key={pr.id} className="p-3.5 bg-slate-50/90 rounded-xl ring-1 ring-slate-200/70 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{pr.bookTitle}</p>
                      <p className="text-slate-500 mt-0.5">{pr.recipient} · {pr.role}</p>
                    </div>
                    <span className="text-slate-400">{pr.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 9. INTEGRATIONS & BACKUP ==================== */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xs ring-1 ring-indigo-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0" /> אוטומציה וחיבור Webhook לחנות WooCommerce
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">הזמנות חדשות מהאתר יקפצו מיד ללשונית "הזמנות חנות" ויפחיתו אוטומטית מהמלאי.</p>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    disabled={webhookCheckState.loading}
                    onClick={handlePingWebhook}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ring-1 ring-slate-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${webhookCheckState.loading ? 'animate-spin' : ''}`} /> בדוק חיבור שרת
                  </button>
                  <button
                    type="button"
                    disabled={sendingTestOrder}
                    onClick={handleSendTestOrder}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> {sendingTestOrder ? 'שולח...' : 'שלח הזמנת ניסיון'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#0F172A] text-emerald-400 p-3.5 rounded-xl font-mono text-xs ring-1 ring-slate-800" dir="ltr">
                <span className="flex-1 truncate select-all">{getWebhookUrl()}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(getWebhookUrl());
                    showToast('כתובת ה-Webhook הועתקה!', 'success');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" /> העתק
                </button>
              </div>

              {webhookCheckState.message && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  webhookCheckState.status === 'ok'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : webhookCheckState.status === 'error'
                      ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                      : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
                }`}>
                  {webhookCheckState.status === 'ok' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{webhookCheckState.message}</span>
                </div>
              )}

              <div className="bg-slate-50/90 p-4 rounded-2xl ring-1 ring-slate-200/70 text-xs text-slate-600 space-y-1.5">
                <p className="font-extrabold text-slate-800">הגדרות נדרשות בוורדפרס (WooCommerce ← הגדרות ← מתקדם ← Webhooks):</p>
                <p>1. <strong>סטטוס (Status):</strong> פעיל (Active)</p>
                <p>2. <strong>נושא (Topic):</strong> הזמנה נוצרה (Order created)</p>
                <p>3. <strong>כתובת מסירה (Delivery URL):</strong> הדבק את הכתובת שמופיעה למעלה ושמור.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xs ring-1 ring-emerald-200/80 space-y-5">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-start gap-3.5">
                  <div className={`p-3.5 rounded-2xl ring-1 ${autoBackupSettings.enabled ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">גיבוי אוטומטי ונקודות שחזור</h3>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${autoBackupSettings.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {autoBackupSettings.enabled ? 'פעיל' : 'מושהה'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">
                      המערכת שומרת אוטומטית נקודות שחזור של כל הנתונים לפי התדירות שתבחר.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => createAutoSnapshot('נקודת שחזור ידנית', false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/20"
                  >
                    <HardDrive className="w-4 h-4" /> צור נקודת שחזור עכשיו
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoBackupSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs ring-1 transition-all ${
                      autoBackupSettings.enabled
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 ring-slate-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white ring-indigo-600'
                    }`}
                  >
                    {autoBackupSettings.enabled ? 'השהה גיבוי אוטומטי' : 'הפעל גיבוי אוטומטי'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50/90 p-4 rounded-2xl ring-1 ring-slate-200/70 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">תדירות גיבוי אוטומטי</label>
                  <select
                    value={autoBackupSettings.intervalMinutes}
                    onChange={e => setAutoBackupSettings(prev => ({ ...prev, intervalMinutes: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold outline-none"
                  >
                    <option value={15}>כל 15 דקות</option>
                    <option value={30}>כל 30 דקות (מומלץ)</option>
                    <option value={60}>כל שעה</option>
                    <option value={240}>כל 4 שעות</option>
                    <option value={1440}>פעם ביום</option>
                  </select>
                </div>

                <div className="bg-slate-50/90 p-4 rounded-2xl ring-1 ring-slate-200/70 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600">מספר נקודות שחזור לשמירה</label>
                  <select
                    value={autoBackupSettings.maxSnapshots}
                    onChange={e => setAutoBackupSettings(prev => ({ ...prev, maxSnapshots: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm font-bold outline-none"
                  >
                    <option value={3}>3 נקודות אחרונות</option>
                    <option value={5}>5 נקודות אחרונות (מומלץ)</option>
                    <option value={10}>10 נקודות אחרונות</option>
                  </select>
                </div>

                <div className="bg-indigo-50/70 p-4 rounded-2xl ring-1 ring-indigo-100 flex flex-col justify-center">
                  <span className="text-xs font-bold text-indigo-700">גיבוי אוטומטי אחרון</span>
                  <span className="text-base font-extrabold text-indigo-900 mt-1">
                    {autoSnapshots[0] ? autoSnapshots[0].dateLabel : 'טרם נוצר גיבוי'}
                  </span>
                  <span className="text-[11px] text-indigo-600 mt-0.5">
                    נשמרו {autoSnapshots.length} מתוך {autoBackupSettings.maxSnapshots} נקודות
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" /> היסטוריית נקודות שחזור זמינות ({autoSnapshots.length})
                </h4>
                {autoSnapshots.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
                    עדיין לא נשמרו נקודות שחזור. לחץ על "צור נקודת שחזור עכשיו".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {autoSnapshots.map((snap, idx) => (
                      <div key={snap.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/90 hover:bg-indigo-50/30 rounded-2xl ring-1 ring-slate-200/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${idx === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/80 text-slate-600'}`}>
                            {idx === 0 ? <CheckCircle className="w-4 h-4" /> : `#${idx + 1}`}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{snap.dateLabel}</span>
                              <span className="text-[10px] font-bold bg-white ring-1 ring-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{snap.reason}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {snap.summary?.books || 0} ספרים · {snap.summary?.suppliers || 0} ספקים · {snap.summary?.orders || 0} הזמנות · {snap.sizeKB || 1}KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRestoreSnapshot(snap)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> שחזר
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadSnapshot(snap)}
                            className="bg-white hover:bg-slate-100 text-slate-700 ring-1 ring-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                            title="הורד קובץ JSON"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            title="מחק נקודת שחזור"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xs ring-1 ring-slate-200/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">גיבוי ושחזור ידני מלא (קובץ JSON)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">הורד קובץ גיבוי אחד של כל הנתונים למחשב שלך או שחזר מקובץ שמור.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportFullBackup}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" /> הורד גיבוי מלא
                </button>
                <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 ring-1 ring-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" /> שחזר מקובץ גיבוי
                  <input type="file" accept=".json" onChange={handleImportBackupFile} className="hidden" />
                </label>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">אימייל (אופציונלי)</label>
                    <input type="email" placeholder="name@example.com" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">טלפון לוואטסאפ (אופציונלי)</label>
                    <input type="tel" placeholder="050-0000000" value={newUserForm.phone} onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" dir="ltr" />
                  </div>
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
                                onClick={() => handleSendCredentialsWhatsApp(u)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                title="שלח פרטי התחברות בוואטסאפ"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSendCredentialsEmail(u)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                title="שלח פרטי התחברות במייל"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingUser({ ...u, email: u.email || '', phone: u.phone || '', newPassword: '' })}
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
          </div>
        </main>

        {/* Mobile Native-Style Bottom Navigation Bar — דאשבורד במרכז */}
        <nav className={`lg:hidden fixed bottom-0 inset-x-0 z-30 border-t backdrop-blur-xl px-2 py-1.5 flex items-center justify-around print:hidden ${darkMode ? 'bg-[#0B1120]/95 border-slate-800' : 'bg-white/95 border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]'}`}>
          {[
            { id: 'pos', label: 'קופה', icon: CreditCard },
            { id: 'inventory', label: 'מלאי', icon: Package },
            { id: 'dashboard', label: 'דאשבורד', icon: LayoutDashboard, isCenter: true },
            { id: 'suppliers', label: 'ספקים', icon: Truck },
            { id: 'orders', label: 'הזמנות', icon: ShoppingCart, badge: pendingOrders.length },
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl min-w-[58px] transition-all ${
                  item.isCenter
                    ? active
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 font-extrabold -translate-y-1'
                      : 'bg-indigo-50/90 text-indigo-700 font-bold'
                    : active
                      ? 'text-indigo-600 bg-indigo-50/90 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] leading-none">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute top-0.5 left-1.5 bg-rose-500 text-white text-[9px] font-extrabold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ===================================================================== */}
      {/* MODALS */}
      {/* ===================================================================== */}

      {/* Manual Dashboard Adjustments Modal */}
      {isDashboardEditOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
            <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><Sliders className="w-5 h-5 text-amber-600" /> התאמות ידניות של נתוני הדאשבורד</h3>
                <p className="text-xs text-slate-500 mt-0.5">הזן תוספת (+) או הפחתה (-) לכל מדד בדאשבורד (למשל יתרות קודמות או מלאי חיצוני)</p>
              </div>
              <button onClick={() => setIsDashboardEditOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveDashboardAdjustments} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">התאמת סה"כ עותקים כללית (+/-)</label>
                    <input type="number" value={dashboardAdjustments.extraCopies} onChange={e => setDashboardAdjustments({ ...dashboardAdjustments, extraCopies: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">התאמת עותקים במחסן הראשי (+/-)</label>
                    <input type="number" value={dashboardAdjustments.extraWarehouseCopies} onChange={e => setDashboardAdjustments({ ...dashboardAdjustments, extraWarehouseCopies: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">התאמת עותקים אצל ספקים (+/-)</label>
                    <input type="number" value={dashboardAdjustments.extraSuppliersCopies} onChange={e => setDashboardAdjustments({ ...dashboardAdjustments, extraSuppliersCopies: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">התאמת שווי מלאי לצרכן ₪ (+/-)</label>
                    <input type="number" value={dashboardAdjustments.extraRetailValue} onChange={e => setDashboardAdjustments({ ...dashboardAdjustments, extraRetailValue: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-rose-700 mb-1">התאמת שווי לפי עלות הדפסה ₪ (+/-)</label>
                    <input type="number" value={dashboardAdjustments.extraProductionValue} onChange={e => setDashboardAdjustments({ ...dashboardAdjustments, extraProductionValue: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">התאמת הכנסות אתר ₪ (+/-)</label>
                    <input type="number" value={dashboardAdjustments.extraStoreRevenue} onChange={e => setDashboardAdjustments({ ...dashboardAdjustments, extraStoreRevenue: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">התאמת הכנסות ספקים ₪ (+/-)</label>
                    <input type="number" value={dashboardAdjustments.extraSupplierRevenue} onChange={e => setDashboardAdjustments({ ...dashboardAdjustments, extraSupplierRevenue: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">התאמת הכנסות דוכן/קופה ₪ (+/-)</label>
                    <input type="number" value={dashboardAdjustments.extraPosRevenue} onChange={e => setDashboardAdjustments({ ...dashboardAdjustments, extraPosRevenue: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-rose-700 mb-1">התאמת יתרת חוב פתוחה ₪ (+/-)</label>
                    <input type="number" value={dashboardAdjustments.extraOpenDebt} onChange={e => setDashboardAdjustments({ ...dashboardAdjustments, extraOpenDebt: Number(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" dir="ltr" />
                  </div>
                </div>
                <div className="bg-rose-50/80 border border-rose-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-rose-800">נשאר חוב מספקים שכבר מחקת?</span>
                  <button
                    type="button"
                    onClick={handlePurgeOrphanSupplierDebts}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0"
                  >
                    נקה חובות של ספקים שנמחקו
                  </button>
                </div>
              </div>
              <div className="p-4 border-t bg-slate-50/80 flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setDashboardAdjustments(defaultDashboardAdjustments)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  אפס את כל ההתאמות ל-0
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsDashboardEditOpen(false)} className="px-4 py-2 text-sm text-slate-600">ביטול</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-xs">שמור נתונים</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Purchase Calculator Modal (ללא הוצאת הזמנה) */}
      {isPurchaseCalcOpen && (() => {
        const getTierPrice = (book) => {
          if (!book) return 0;
          const eff = getEffectiveBookPrices(book);
          if (calcPriceTier === 'supplier') return eff.supplier;
          if (calcPriceTier === 'yeshiva') return eff.yeshiva;
          if (calcPriceTier === 'yeshivaGuest') return eff.yeshivaGuest;
          return eff.general;
        };
        const subtotal = calcItems.reduce((sum, row) => {
          const b = inventoryList.find(x => x.id === row.bookId);
          return sum + getTierPrice(b) * Math.max(0, Number(row.quantity || 0));
        }, 0);
        const discountAmount = Math.round(subtotal * (Math.max(0, Math.min(100, Number(calcDiscountPct || 0))) / 100));
        const finalTotal = Math.max(0, subtotal - discountAmount);
        const totalQty = calcItems.reduce((s, r) => s + (r.bookId ? Math.max(0, Number(r.quantity || 0)) : 0), 0);

        return (
          <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
              <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><Calculator className="w-5 h-5 text-amber-600" /> מחשבון קניית ספרים (הצעת מחיר מהירה)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">חישוב סל ספרים והנחות מבלי להוציא הזמנה או לשנות מלאי</p>
                </div>
                <button onClick={() => setIsPurchaseCalcOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2 rounded-2xl">
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'supplier', label: 'מחירון ספקים' },
                      { id: 'general', label: 'צרכן (אתר)' },
                      { id: 'yeshiva', label: 'תלמיד ראשון' },
                      { id: 'yeshivaGuest', label: 'שני / אורח' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setCalcPriceTier(t.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${calcPriceTier === t.id ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-2">
                    <span>הנחה (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={calcDiscountPct}
                      onChange={e => setCalcDiscountPct(e.target.value)}
                      className="w-16 p-1.5 border border-slate-200 rounded-xl text-center bg-white"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {calcItems.map((row, idx) => {
                    const book = inventoryList.find(b => b.id === row.bookId);
                    const price = getTierPrice(book);
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50/90 p-2.5 rounded-xl ring-1 ring-slate-200/70">
                        <select
                          value={row.bookId}
                          onChange={e => {
                            const next = [...calcItems];
                            next[idx] = { ...next[idx], bookId: e.target.value };
                            setCalcItems(next);
                          }}
                          className="flex-1 p-2 border border-slate-200 rounded-xl text-sm bg-white"
                        >
                          <option value="">בחר ספר...</option>
                          {[...inventoryList].sort((a, b) => a.title.localeCompare(b.title, 'he')).map(b => (
                            <option key={b.id} value={b.id}>{b.title} (₪{getTierPrice(b)})</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={e => {
                            const next = [...calcItems];
                            next[idx] = { ...next[idx], quantity: e.target.value };
                            setCalcItems(next);
                          }}
                          className="w-20 p-2 border border-slate-200 rounded-xl text-sm text-center font-bold bg-white"
                          dir="ltr"
                        />
                        <span className="text-xs font-extrabold text-indigo-700 w-24 text-center">₪{(price * Number(row.quantity || 0)).toLocaleString()}</span>
                        {calcItems.length > 1 && (
                          <button type="button" onClick={() => setCalcItems(calcItems.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500 p-1"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setCalcItems([...calcItems, { bookId: '', quantity: 10 }])} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> הוסף ספר נוסף לחישוב
                  </button>
                </div>

                <div className="bg-emerald-50 ring-1 ring-emerald-200/80 p-4 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs text-emerald-800">
                    <span>סה"כ עותקים: <strong>{totalQty}</strong></span>
                    {discountAmount > 0 && <span>הנחה ({calcDiscountPct}%): <strong>-₪{discountAmount.toLocaleString()}</strong></span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-900">סה"כ משוקלל:</span>
                    <span className="text-2xl font-extrabold text-emerald-700">₪{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t bg-slate-50/80 flex justify-between items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const lines = calcItems
                      .filter(r => r.bookId && Number(r.quantity) > 0)
                      .map((r, i) => {
                        const b = inventoryList.find(x => x.id === r.bookId);
                        const p = getTierPrice(b);
                        return `${i + 1}. ${b?.title} — ${r.quantity} עותקים × ₪${p} = ₪${(p * Number(r.quantity)).toLocaleString()}`;
                      });
                    const txt = `📚 *הצעת מחיר — הוצאת ספרי ישיבת ירוחם*\n\n${lines.join('\n')}\n\n*סה"כ לתשלום: ₪${finalTotal.toLocaleString()}*`;
                    navigator.clipboard?.writeText(txt);
                    showToast('סיכום הצעת המחיר הועתק להדבקה!', 'success');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" /> העתק סיכום לוואטסאפ
                </button>
                <button type="button" onClick={() => setIsPurchaseCalcOpen(false)} className="px-4 py-2 text-sm text-slate-600">סגור</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Smart Parse Supplier Message Modal (הזמנה וקבלה אוטומטית מהודעה) */}
      {isParseOrderModalOpen && (() => {
        const parsedTotal = parsedItems.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);
        return (
          <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
              <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><FileCheck className="w-5 h-5 text-emerald-600" /> יצירת הזמנה וקבלה אוטומטית מהודעת ספק</h3>
                  <p className="text-xs text-slate-500 mt-0.5">הדבק הודעה מוואטסאפ או מייל — המערכת תזהה ספרים, כמויות ומחירים ותפיק קבלה</p>
                </div>
                <button onClick={() => setIsParseOrderModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">הדבק כאן את הודעת ההזמנה מהספק / חנות:</label>
                  <textarea
                    rows="3"
                    value={rawOrderMessage}
                    onChange={e => handleParseSupplierMessageText(e.target.value)}
                    placeholder="לדוגמה: שלום, נשמח להזמין 10 אותך אבקש, 5 ונהר יוצא מעדן סט ו-8 שמיטה"
                    className="w-full p-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">שם הספק / החנות:</label>
                  <input
                    type="text"
                    list="suppliers-datalist-parse"
                    value={parsedSupplierName}
                    onChange={e => setParsedSupplierName(e.target.value)}
                    placeholder="בחר או הקלד שם ספק..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                  <datalist id="suppliers-datalist-parse">
                    {suppliersList.map(s => <option key={s.id} value={s.name} />)}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">פריטים שזוהו (ניתן לערוך כמות ומחיר):</span>
                    <button
                      type="button"
                      onClick={() => setParsedItems([...parsedItems, { bookId: inventoryList[0]?.id || '', title: inventoryList[0]?.title || '', quantity: 1, unitPrice: Number(inventoryList[0]?.prices?.supplier || 0) }])}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      + הוסף שורה
                    </button>
                  </div>
                  {parsedItems.length === 0 ? (
                    <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">הדבק הודעה למעלה כדי לזהות ספרים אוטומטית, או לחץ "+ הוסף שורה".</p>
                  ) : (
                    parsedItems.map((row, idx) => (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50/90 p-2.5 rounded-xl ring-1 ring-slate-200/70">
                        <select
                          value={row.bookId}
                          onChange={e => {
                            const b = inventoryList.find(x => x.id === e.target.value);
                            const next = [...parsedItems];
                            next[idx] = { ...next[idx], bookId: e.target.value, title: b?.title || '', unitPrice: Number(b?.prices?.supplier || 0) };
                            setParsedItems(next);
                          }}
                          className="flex-1 p-2 border border-slate-200 rounded-xl text-xs bg-white font-bold"
                        >
                          {inventoryList.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={e => {
                            const next = [...parsedItems];
                            next[idx] = { ...next[idx], quantity: Number(e.target.value) };
                            setParsedItems(next);
                          }}
                          className="w-16 p-2 border border-slate-200 rounded-xl text-xs text-center font-bold bg-white"
                          title="כמות"
                          dir="ltr"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">₪</span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={row.unitPrice}
                            onChange={e => {
                              const next = [...parsedItems];
                              next[idx] = { ...next[idx], unitPrice: Number(e.target.value) };
                              setParsedItems(next);
                            }}
                            className="w-20 p-2 border border-indigo-200 rounded-xl text-xs text-center font-bold bg-white"
                            title="מחיר ליחידה"
                            dir="ltr"
                          />
                        </div>
                        <span className="text-xs font-extrabold text-emerald-700 w-20 text-center">₪{(Number(row.quantity || 0) * Number(row.unitPrice || 0)).toLocaleString()}</span>
                        <button type="button" onClick={() => setParsedItems(parsedItems.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500 p-1"><X className="w-4 h-4" /></button>
                      </div>
                    ))
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className="flex items-center gap-2 font-bold text-slate-700 bg-slate-50 p-3 rounded-xl ring-1 ring-slate-200/70 cursor-pointer">
                    <input type="checkbox" checked={parsedDeductWarehouse} onChange={e => setParsedDeductWarehouse(e.target.checked)} className="w-4 h-4 rounded" />
                    הפחת מהמחסן הראשי והעבר לספק
                  </label>
                  <label className="flex items-center gap-2 font-bold text-emerald-800 bg-emerald-50/70 p-3 rounded-xl ring-1 ring-emerald-200/70 cursor-pointer">
                    <input type="checkbox" checked={parsedMarkAsPaid} onChange={e => setParsedMarkAsPaid(e.target.checked)} className="w-4 h-4 rounded" />
                    סמן כקבלה ששולמה (ללא חוב פתוח)
                  </label>
                </div>

                <div className="bg-indigo-50 ring-1 ring-indigo-100 p-4 rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-indigo-900">סה"כ להזמנה ולקבלה:</span>
                  <span className="text-2xl font-extrabold text-indigo-700">₪{parsedTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 border-t bg-slate-50/80 flex justify-end gap-2 shrink-0">
                <button type="button" onClick={() => setIsParseOrderModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">ביטול</button>
                <button type="button" onClick={handleConfirmParsedOrderAndReceipt} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> אשר, עדכן מלאי והפק קבלה
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">מחיר באתר (₪)</label>
                      <input type="number" min="0" step="0.01" value={formState.prices?.general ?? 0} onChange={e => setFormState({ ...formState, prices: { ...formState.prices, general: e.target.value } })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-700 mb-1">מחיר לספקים (₪)</label>
                      <input type="number" min="0" step="0.01" value={formState.prices?.supplier ?? 0} onChange={e => setFormState({ ...formState, prices: { ...formState.prices, supplier: e.target.value } })} className="w-full p-2.5 border border-indigo-200 rounded-xl text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-700 mb-1">תלמיד ישיבה (₪)</label>
                      <input type="number" min="0" step="0.01" value={formState.prices?.yeshiva ?? 0} onChange={e => setFormState({ ...formState, prices: { ...formState.prices, yeshiva: e.target.value } })} className="w-full p-2.5 border border-emerald-200 rounded-xl text-sm" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-teal-700 mb-1">ישיבה שני/אורח (₪)</label>
                      <input type="number" min="0" step="0.01" value={formState.prices?.yeshivaGuest ?? formState.prices?.yeshiva ?? 0} onChange={e => setFormState({ ...formState, prices: { ...formState.prices, yeshivaGuest: e.target.value } })} className="w-full p-2.5 border border-teal-200 rounded-xl text-sm" dir="ltr" />
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

      {/* View & Edit Specific Supplier Stock Modal */}
      {viewingSupplierStock && (() => {
        const draftEntries = Object.entries(supplierStockDraft)
          .map(([bookId, amount]) => {
            const book = inventoryList.find(b => b.id === bookId);
            return book ? { bookId, title: book.title, amount: Number(amount || 0), supplierPrice: Number(book.prices?.supplier || 0) } : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.title.localeCompare(b.title, 'he'));
        const totalQty = draftEntries.reduce((s, i) => s + Math.max(0, i.amount), 0);

        return (
          <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
              <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-slate-900">מלאי ועריכת כמויות אצל: {viewingSupplierStock.name}</h3>
                  <p className="text-xs text-slate-500">ערוך ישירות את כמות הספרים אצל ספק זה או הוסף ספר חדש למלאי שלו</p>
                </div>
                <button onClick={() => setViewingSupplierStock(null)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {userRole === 'admin' && (
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-indigo-50/70 p-3 rounded-2xl ring-1 ring-indigo-100">
                    <select
                      value={newBookForSupplier.bookId}
                      onChange={e => setNewBookForSupplier({ ...newBookForSupplier, bookId: e.target.value })}
                      className="flex-1 p-2 border border-slate-200 rounded-xl text-xs bg-white font-bold"
                    >
                      {[...inventoryList].sort((a, b) => a.title.localeCompare(b.title, 'he')).map(b => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={newBookForSupplier.amount}
                      onChange={e => setNewBookForSupplier({ ...newBookForSupplier, amount: Number(e.target.value) })}
                      className="w-20 p-2 border border-slate-200 rounded-xl text-xs text-center font-bold bg-white"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBookForSupplier.bookId) return;
                        setSupplierStockDraft(prev => ({
                          ...prev,
                          [newBookForSupplier.bookId]: Math.max(0, Number(prev[newBookForSupplier.bookId] || 0)) + Math.max(1, Number(newBookForSupplier.amount || 1))
                        }));
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0"
                    >
                      + הוסף לספק
                    </button>
                  </div>
                )}

                {draftEntries.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm">אין כרגע ספרים משויכים לספק זה.</p>
                ) : (
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 border-b">
                      <tr>
                        <th className="p-2.5">שם הספר</th>
                        <th className="p-2.5 text-center">כמות אצל הספק</th>
                        <th className="p-2.5 text-center">שווי (ספק)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {draftEntries.map(it => (
                        <tr key={it.bookId}>
                          <td className="p-2.5 font-medium">{it.title}</td>
                          <td className="p-2.5 text-center">
                            {userRole === 'admin' ? (
                              <input
                                type="number"
                                min="0"
                                value={it.amount}
                                onChange={e => setSupplierStockDraft(prev => ({ ...prev, [it.bookId]: Math.max(0, Number(e.target.value || 0)) }))}
                                className="w-20 p-1.5 border border-indigo-200 rounded-xl text-center font-extrabold text-indigo-700 bg-white"
                                dir="ltr"
                              />
                            ) : (
                              <span className="font-bold text-indigo-700">{it.amount}</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-bold">₪{(Math.max(0, it.amount) * it.supplierPrice).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="bg-indigo-50 ring-1 ring-indigo-100 p-3.5 rounded-xl flex justify-between font-bold text-indigo-900 text-sm">
                  <span>סה"כ עותקים אצל הספק:</span>
                  <span>{totalQty.toLocaleString()} עותקים</span>
                </div>
              </div>
              {userRole === 'admin' && (
                <div className="p-4 border-t bg-slate-50/80 flex justify-end gap-2 shrink-0">
                  <button type="button" onClick={() => setViewingSupplierStock(null)} className="px-4 py-2 text-sm text-slate-600">ביטול</button>
                  <button type="button" onClick={handleSaveSupplierStockChanges} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> שמור מלאי ספק
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Supplier Order / Invoice Modal (כולל עריכת מחיר לכל ספר) */}
      {isSupplierInvoiceModalOpen && invoiceSupplier && (() => {
        const orderTotal = invoiceItems.reduce((sum, item) => {
          const b = inventoryList.find(x => x.id === item.bookId);
          const unitPrice = item.customPrice !== undefined && item.customPrice !== ''
            ? Math.max(0, Number(item.customPrice))
            : Number(b?.prices?.supplier || 0);
          return sum + (unitPrice * Number(item.quantity || 0));
        }, 0);

        return (
          <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" dir="rtl">
              <div className="p-5 border-b bg-slate-50/80 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">הפקת הזמנה לספק: {invoiceSupplier.name}</h3>
                  <p className="text-xs text-slate-500">ניתן לערוך מחיר ליחידה לכל ספר בהזמנה זו בנפרד</p>
                </div>
                <button onClick={() => setIsSupplierInvoiceModalOpen(false)} className="p-1.5 rounded-xl bg-white ring-1 ring-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                <div className="space-y-2.5">
                  {invoiceItems.map((row, idx) => {
                    const book = inventoryList.find(b => b.id === row.bookId);
                    const unitPrice = row.customPrice !== undefined && row.customPrice !== ''
                      ? Math.max(0, Number(row.customPrice))
                      : Number(book?.prices?.supplier || 0);
                    return (
                      <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50/90 p-2.5 rounded-xl ring-1 ring-slate-200/70">
                        <select
                          value={row.bookId}
                          onChange={e => {
                            const selectedBook = inventoryList.find(x => x.id === e.target.value);
                            const next = [...invoiceItems];
                            next[idx] = {
                              ...next[idx],
                              bookId: e.target.value,
                              customPrice: Number(selectedBook?.prices?.supplier || 0)
                            };
                            setInvoiceItems(next);
                          }}
                          className="flex-1 p-2 border border-slate-200 rounded-xl text-sm bg-white"
                        >
                          <option value="">בחר ספר...</option>
                          {[...inventoryList].sort((a, b) => a.title.localeCompare(b.title, 'he')).map(b => (
                            <option key={b.id} value={b.id}>{b.title} (במחסן: {b.publisherStock})</option>
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
                          className="w-16 p-2 border border-slate-200 rounded-xl text-sm text-center bg-white font-bold"
                          title="כמות"
                          dir="ltr"
                        />
                        <div className="flex items-center gap-1" title="מחיר ליחידה להזמנה זו">
                          <span className="text-xs text-slate-400">₪</span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={row.customPrice ?? unitPrice}
                            onChange={e => {
                              const next = [...invoiceItems];
                              next[idx] = { ...next[idx], customPrice: e.target.value };
                              setInvoiceItems(next);
                            }}
                            className="w-20 p-2 border border-indigo-200 rounded-xl text-sm text-center bg-white font-bold text-indigo-700"
                            dir="ltr"
                          />
                        </div>
                        <span className="text-xs font-extrabold text-emerald-700 w-20 text-center">₪{(unitPrice * Number(row.quantity || 0)).toLocaleString()}</span>
                        {invoiceItems.length > 1 && (
                          <button onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500 p-1"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { bookId: '', quantity: 10, customPrice: 0 }])} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> הוסף ספר נוסף להזמנה
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-indigo-50/70 p-3.5 rounded-xl ring-1 ring-indigo-100 cursor-pointer">
                  <input type="checkbox" checked={deductFromWarehouse} onChange={e => setDeductFromWarehouse(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                  הפחת אוטומטית את הכמויות מ"המחסן הראשי" והעבר למלאי של {invoiceSupplier.name}
                </label>

                <input type="text" value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} placeholder="הערות להזמנה (אופציונלי)..." className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" />

                <div className="bg-emerald-50 ring-1 ring-emerald-200/80 p-4 rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-emerald-900">סה"כ משוקלל להזמנה:</span>
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
            <div className="print-paper-surface p-6 overflow-y-auto space-y-4">
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
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">אימייל</label>
                  <input type="email" value={editingUser.email || ''} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">טלפון לוואטסאפ</label>
                  <input type="tel" value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm" dir="ltr" />
                </div>
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

      {/* Command Palette / Quick Search Modal (Ctrl+K) */}
      {isCommandOpen && (() => {
        const q = commandQuery.trim().toLowerCase();
        const matchingTabs = navItems.filter(i => !q || i.label.toLowerCase().includes(q));
        const matchingBooks = q ? inventoryList.filter(b => (b.title || '').toLowerCase().includes(q)).slice(0, 5) : [];
        const matchingSuppliers = q ? suppliersList.filter(s => (s.name || '').toLowerCase().includes(q)).slice(0, 4) : [];

        return (
          <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm z-[95] flex items-start justify-center pt-[12vh] p-4" onClick={() => setIsCommandOpen(false)}>
            <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200/80 w-full max-w-xl overflow-hidden" dir="rtl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <Search className="w-5 h-5 text-indigo-500 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={commandQuery}
                  onChange={e => setCommandQuery(e.target.value)}
                  placeholder="קפוץ למסך, חפש ספר או ספק, או הפעל פעולה..."
                  className="flex-1 bg-transparent text-sm font-medium outline-none"
                />
                <button onClick={() => setIsCommandOpen(false)} className="text-[11px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">ESC</button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
                {matchingTabs.length > 0 && (
                  <div className="space-y-1">
                    <p className="px-3 text-[11px] font-bold text-slate-400">ניווט מהיר בין מסכים</p>
                    {matchingTabs.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveTab(item.id); setIsCommandOpen(false); }}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-indigo-50/80 text-sm font-bold text-slate-700 hover:text-indigo-700 transition-colors"
                        >
                          <span className="flex items-center gap-3"><Icon className="w-4 h-4 text-indigo-500" /> {item.label}</span>
                          <span className="text-[11px] text-slate-400 font-normal">{item.group}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {matchingBooks.length > 0 && (
                  <div className="space-y-1">
                    <p className="px-3 text-[11px] font-bold text-slate-400">ספרים במלאי</p>
                    {matchingBooks.map(book => (
                      <button
                        key={book.id}
                        onClick={() => { setSearchQuery(book.title); setActiveTab('inventory'); setIsCommandOpen(false); }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-emerald-50/70 text-sm text-slate-700 transition-colors"
                      >
                        <span className="font-bold flex items-center gap-2.5"><BookOpen className="w-4 h-4 text-emerald-600" /> {book.title}</span>
                        <span className="text-xs text-slate-500">במחסן: {book.publisherStock}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchingSuppliers.length > 0 && (
                  <div className="space-y-1">
                    <p className="px-3 text-[11px] font-bold text-slate-400">ספקים וחנויות</p>
                    {matchingSuppliers.map(sup => (
                      <button
                        key={sup.id}
                        onClick={() => { setSupplierSearch(sup.name); setActiveTab('suppliers'); setIsCommandOpen(false); }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-amber-50/70 text-sm text-slate-700 transition-colors"
                      >
                        <span className="font-bold flex items-center gap-2.5"><Truck className="w-4 h-4 text-amber-600" /> {sup.name}</span>
                        <span className="text-xs text-slate-500">{sup.phone || ''}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <p className="px-3 text-[11px] font-bold text-slate-400">פעולות מהירות</p>
                  <button
                    onClick={() => { createAutoSnapshot('נקודת שחזור מהירה', false); setIsCommandOpen(false); }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-50 text-sm font-bold text-emerald-700 transition-colors"
                  >
                    <Zap className="w-4 h-4" /> צור נקודת שחזור (גיבוי) עכשיו
                  </button>
                  <button
                    onClick={() => { setDarkMode(!darkMode); setIsCommandOpen(false); }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-indigo-50 text-sm font-bold text-indigo-700 transition-colors"
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} החלף ל{darkMode ? 'מצב יום (בהיר)' : 'מצב לילה (כהה)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
