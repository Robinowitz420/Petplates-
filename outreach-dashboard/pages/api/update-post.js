import { getFirestoreAdmin } from '../../lib/firestoreAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, updates } = req.body || {};
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing id' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Missing updates' });
    }

    const allowed = {};
    if (typeof updates.status === 'string') allowed.status = updates.status;
    if (typeof updates.edited_response === 'string') allowed.edited_response = updates.edited_response;

    const db = getFirestoreAdmin();
    const ref = db.collection('outreach_posts').document(id);
    await ref.set(allowed, { merge: true });
    const updated = await ref.get();
    return res.status(200).json({ post: { ...updated.data(), id: updated.id } });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
