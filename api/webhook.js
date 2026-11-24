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

// נרמול שמות ספרים כדי למנוע פספוסים בגלל מקפים, גרשיים או רווחים כפולים בין האתר לאפליקציה
const normalizeTitle = (str = '') =>
  String(str).replace(/[-–—״"'׳.,]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

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
    // פענוח בטוח של גוף הבקשה (כולל פינג ראשוני של WooCommerce)
    let body = req.body;
    if (typeof body === 'string') {
      if (body.includes('webhook_id=')) {
        return res.status(200).json({ ok: true, message: 'WooCommerce ping received successfully' });
      }
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    if (!body || body.webhook_id) {
      return res.status(200).json({ ok: true, message: 'Ping received successfully' });
    }

    const order = body;
    const incomingOrderId = String(order.number || order.id || '').trim();
    const lineItems = Array.isArray(order.line_items) ? order.line_items : [];

    if (!incomingOrderId || lineItems.length === 0) {
      return res.status(200).json({ ok: true, skipped: true, message: 'Payload without valid order items ignored' });
    }

    // התעלמות מהזמנות מבוטלות, נכשלות, שנמחקו או הזמנות דמה חוזרות מ"ישראל ישראלי"
    const ignoredStatuses = ['cancelled', 'failed', 'refunded', 'trash'];
    if (order.status && ignoredStatuses.includes(String(order.status).toLowerCase())) {
      return res.status(200).json({ ok: true, skipped: true, message: `Order skipped due to status: ${order.status}` });
    }

    const rawCustomerName = `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim();
    if (rawCustomerName.includes('ישראל ישראלי')) {
      return res.status(200).json({ ok: true, skipped: true, message: 'Dummy test order (ישראל ישראלי) ignored' });
    }

    // בדיקת מניעת כפילויות — אם ההזמנה כבר קיימת במערכת לא מורידים מלאי פעמיים
    const ordersRef = collection(db, 'erp', appId, 'orders');
    const dupQuery = query(ordersRef, where('orderId', '==', incomingOrderId));
    const dupSnap = await getDocs(dupQuery);

    if (!dupSnap.empty) {
      return res.status(200).json({ ok: true, duplicate: true, message: `Order #${incomingOrderId} already processed` });
    }

    // משיכת המלאי פעם אחת והתאמה חכמה של שמות הספרים (כולל פירוק אוטומטי של סטים לכרכים בודדים)
    const isTestOrder = Boolean(order.is_test);
    if (!isTestOrder) {
      const inventoryRef = collection(db, 'erp', appId, 'inventory');
      const invSnap = await getDocs(inventoryRef);
      const allBooks = invSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const deductSingleBook = async (targetBook, qty) => {
        const currentStock = Number(targetBook.publisherStock) || 0;
        const newStock = Math.max(0, currentStock - qty);
        targetBook.publisherStock = newStock;
        await updateDoc(doc(db, 'erp', appId, 'inventory', targetBook.id), {
          publisherStock: newStock,
          updatedAt: Date.now()
        });
      };

      for (const item of lineItems) {
        const normItemName = normalizeTitle(item.name);
        const quantitySold = Math.max(1, Number(item.quantity) || 1);

        const matchedBook =
          allBooks.find(b => normalizeTitle(b.title) === normItemName) ||
          allBooks.find(b => {
            const normBookTitle = normalizeTitle(b.title);
            return normBookTitle && (normItemName.includes(normBookTitle) || normBookTitle.includes(normItemName));
          });

        if (matchedBook) {
          const compIds = Array.isArray(matchedBook.setComponents) ? matchedBook.setComponents.filter(Boolean) : [];
          if ((matchedBook.isSet || compIds.length > 0) && compIds.length > 0) {
            for (const cid of compIds) {
              const compBook = allBooks.find(b => b.id === cid);
              if (compBook) {
                await deductSingleBook(compBook, quantitySold);
              }
            }
          } else {
            await deductSingleBook(matchedBook, quantitySold);
          }
        }
      }
    }

    // בניית אובייקט ההזמנה ושמירתו באפליקציה
    const shippingAddress = [
      order.shipping?.address_1 || order.billing?.address_1 || '',
      order.shipping?.city || order.billing?.city || ''
    ].filter(Boolean).join(', ');

    const orderData = {
      orderId: incomingOrderId,
      customerName: rawCustomerName || 'לקוח מהאתר',
      phone: order.billing?.phone || '',
      email: order.billing?.email || '',
      address: shippingAddress || 'לא צוינה כתובת',
      shippingMethod: order.shipping_lines && order.shipping_lines.length > 0 ? order.shipping_lines[0].method_title : 'משלוח רגיל',
      customerNote: order.customer_note || '',
      items: lineItems.map(item => ({ name: item.name, quantity: Number(item.quantity) || 1 })),
      total: Number(order.total) || 0,
      date: new Date().toLocaleDateString('he-IL'),
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'pending',
      isTest: isTestOrder
    };

    await addDoc(ordersRef, orderData);

    return res.status(200).json({ ok: true, success: true, message: 'Order processed successfully' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ ok: false, success: false, error: error.message });
  }
}
