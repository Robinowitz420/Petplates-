import { getFirestoreAdmin } from '../../lib/firestoreAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getFirestoreAdmin();
    const snap = await db.collection('outreach_posts').orderBy('created_at', 'desc').limit(500).get();
    const posts = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    return res.status(200).json({ posts });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
