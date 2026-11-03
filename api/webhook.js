import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

// 1. הגדרות החיבור ל-Firebase (אותן הגדרות כמו באפליקציה שלך)
const firebaseConfig = {
  apiKey: "AIzaSyBACO6rv7KvdmWyPBPp1RzaeVUyQorQpVI",
  authDomain: "yhydeshboard.firebaseapp.com",
  projectId: "yhydeshboard",
  storageBucket: "yhydeshboard.firebasestorage.app",
  messagingSenderId: "498271801335",
  appId: "1:498271801335:web:1609f07e024ac66709e8f2",
  measurementId: "G-GHK9P9E47J"
};

// מונע אתחול כפול של פיירבייס בסביבת השרת של Vercel
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const appId = 'publisher_erp_v1';

// 2. הפונקציה שתופעל אוטומטית בכל פעם שיש הזמנה בווקומרס
export default async function handler(req, res) {
  // מענה "ידידותי" לבדיקת התקינות שווקומרס עושה בעת השמירה
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Webhook is active!' });
  }
  
  // אם זו הודעת הפינג הראשונית שווקומרס שולח רק כדי לבדוק חיבור
  if (req.body && req.body.webhook_id) {
    return res.status(200).json({ message: 'Ping received successfully' });
  }

  try {
    const order = req.body || {}; // כאן נמצאים כל פרטי ההזמנה שווקומרס שלח
    const lineItems = order.line_items || [];

    // עוברים על כל הספרים שהלקוח קנה בהזמנה
    for (const item of lineItems) {
      const bookName = item.name; // שם הספר כפי שמופיע בחנות ווקומרס
      const quantitySold = item.quantity; // כמה עותקים קנו מתוכו

      // מחפשים את הספר במערכת הניהול שלנו (Firebase) לפי השם שלו
      const inventoryRef = collection(db, 'erp', appId, 'inventory');
      const q = query(inventoryRef, where("title", "==", bookName));
      const querySnapshot = await getDocs(q);

      // אם מצאנו את הספר במלאי שלנו
      if (!querySnapshot.empty) {
        const bookDoc = querySnapshot.docs[0];
        const currentStock = Number(bookDoc.data().publisherStock) || 0;
        
        // מחשבים את המלאי החדש (מוודאים שלא יורד מתחת ל-0 בטעות)
        const newStock = Math.max(0, currentStock - quantitySold);

        // מעדכנים את המלאי של מחסן ההוצאה במסד הנתונים!
        await updateDoc(doc(db, 'erp', appId, 'inventory', bookDoc.id), {
          publisherStock: newStock
        });
      }
    }

    // מחזירים תשובה לווקומרס שהכל עבר בהצלחה
    return res.status(200).json({ success: true, message: 'המלאי באפליקציה עודכן בהצלחה' });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
