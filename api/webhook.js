import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBACO6rv7KvdmWyPBPp1RzaeVUyQorQpVI",
  authDomain: "yhydeshboard.firebaseapp.com",
  projectId: "yhydeshboard",
  storageBucket: "yhydeshboard.firebasestorage.app",
  messagingSenderId: "498271801335",
  appId: "1:498271801335:web:1609f07e024ac66709e8f2"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const appId = 'publisher_erp_v1';

const IGNORED_STATUSES = new Set(['cancelled', 'failed', 'refunded', 'trash']);

// נרמול שמות ספרים כדי למנוע פספוסים בגלל מקפים, גרשיים או רווחים כפולים בין האתר לאפליקציה
const normalizeTitle = (str = '') =>
  String(str).replace(/[-–—״"'׳.,]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

// פענוח בטוח של גוף הבקשה
function parseWebhookPayload(rawBody) {
  if (!rawBody) return null;
  if (typeof rawBody === 'string') {
    if (rawBody.includes('webhook_id=')) {
      return { isPing: true };
    }
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  }
  if (typeof rawBody === 'object') {
    if (rawBody.webhook_id) return { isPing: true };
    return rawBody;
  }
  return null;
}

// התאמת פריט מהזמנה לספר במלאי
function findMatchingBook(allBooks, itemName) {
  const normItemName = normalizeTitle(itemName);
  if (!normItemName) return null;

  return (
    allBooks.find(b => normalizeTitle(b.title) === normItemName) ||
    allBooks.find(b => {
      const normBookTitle = normalizeTitle(b.title);
      return normBookTitle && (normItemName.includes(normBookTitle) || normBookTitle.includes(normItemName));
    }) ||
    null
  );
}

// עדכון מלאי חכם כולל פירוק סטים לכרכים בודדים
async function deductInventoryForItems(lineItems) {
  const inventoryRef = collection(db, 'erp', appId, 'inventory');
  const invSnap = await getDocs(inventoryRef);
  const allBooks = invSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const booksById = new Map(allBooks.map(b => [b.id, b]));
  const deductionsByBookId = new Map();

  for (const item of lineItems) {
    const quantitySold = Math.max(1, Number(item.quantity) || 1);
    const matchedBook = findMatchingBook(allBooks, item.name);
    if (!matchedBook) continue;

    const compIds = Array.isArray(matchedBook.setComponents) ? matchedBook.setComponents.filter(Boolean) : [];
    const isDecomposableSet = (matchedBook.isSet || compIds.length > 0) && compIds.length > 0;

    if (isDecomposableSet) {
      for (const cid of compIds) {
        if (booksById.has(cid)) {
          deductionsByBookId.set(cid, (deductionsByBookId.get(cid) || 0) + quantitySold);
        }
      }
    } else {
      deductionsByBookId.set(matchedBook.id, (deductionsByBookId.get(matchedBook.id) || 0) + quantitySold);
    }
  }

  const now = Date.now();
  const updatePromises = [];
  for (const [bookId, totalDeducted] of deductionsByBookId.entries()) {
    const targetBook = booksById.get(bookId);
    if (!targetBook) continue;
    const currentStock = Number(targetBook.publisherStock) || 0;
    const newStock = Math.max(0, currentStock - totalDeducted);
    updatePromises.push(
      updateDoc(doc(db, 'erp', appId, 'inventory', bookId), {
        publisherStock: newStock,
        updatedAt: now
      })
    );
  }

  if (updatePromises.length > 0) {
    await Promise.all(updatePromises);
  }
}

export default async function handler(req, res) {
  // אישור CORS - מונע חסימות אבטחה מצד השרת
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      message: 'Webhook is active and connected to Firebase!',
      appId
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const order = parseWebhookPayload(req.body);
    if (!order) {
      return res.status(400).json({ ok: false, error: 'Invalid or malformed JSON payload' });
    }

    if (order.isPing) {
      return res.status(200).json({ ok: true, message: 'WooCommerce ping received successfully' });
    }

    const incomingOrderId = String(order.number || order.id || '').trim();
    const lineItems = Array.isArray(order.line_items) ? order.line_items : [];

    if (!incomingOrderId || lineItems.length === 0) {
      return res.status(200).json({ ok: true, skipped: true, message: 'Payload without valid order items ignored' });
    }

    // התעלמות מהזמנות מבוטלות, נכשלות, שנמחקו או הזמנות דמה חוזרות מ"ישראל ישראלי"
    const normalizedStatus = String(order.status || '').trim().toLowerCase();
    if (normalizedStatus && IGNORED_STATUSES.has(normalizedStatus)) {
      return res.status(200).json({ ok: true, skipped: true, message: `Order skipped due to status: ${order.status}` });
    }

    const rawCustomerName = `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim();
    if (rawCustomerName.includes('ישראל ישראלי')) {
      return res.status(200).json({ ok: true, skipped: true, message: 'Dummy test order (ישראל ישראלי) ignored' });
    }

    // בדיקת מניעת כפילויות — אם ההזמנה כבר קיימת במערכת לא מורידים מלאי פעמיים
    const ordersRef = collection(db, 'erp', appId, 'orders');
    const dupSnap = await getDocs(query(ordersRef, where('orderId', '==', incomingOrderId)));
    if (!dupSnap.empty) {
      return res.status(200).json({ ok: true, duplicate: true, message: `Order #${incomingOrderId} already processed` });
    }

    // עדכון מלאי (למעט הזמנות ניסיון)
    const isTestOrder = Boolean(order.is_test);
    if (!isTestOrder) {
      await deductInventoryForItems(lineItems);
    }

    // בניית אובייקט ההזמנה ושמירתו באפליקציה
    const shippingAddress = [
      order.shipping?.address_1 || order.billing?.address_1 || '',
      order.shipping?.city || order.billing?.city || ''
    ].filter(Boolean).join(', ');

    const shippingMethod = Array.isArray(order.shipping_lines) && order.shipping_lines.length > 0
      ? order.shipping_lines[0].method_title
      : 'משלוח רגיל';

    const orderData = {
      orderId: incomingOrderId,
      customerName: rawCustomerName || 'לקוח מהאתר',
      phone: order.billing?.phone || '',
      email: order.billing?.email || '',
      address: shippingAddress || 'לא צוינה כתובת',
      shippingMethod,
      customerNote: order.customer_note || '',
      items: lineItems.map(item => ({ name: item.name, quantity: Math.max(1, Number(item.quantity) || 1) })),
      total: Number(order.total) || 0,
      date: new Date().toLocaleDateString('he-IL'),
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'pending',
      isTest: isTestOrder
    };

    await addDoc(ordersRef, orderData);

    return res.status(200).json({ ok: true, success: true, orderId: incomingOrderId, message: 'Order processed successfully' });
  } catch (error) {
    console.error('Webhook Error:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    return res.status(500).json({ ok: false, success: false, error: error?.message || 'Internal server error' });
  }
}
