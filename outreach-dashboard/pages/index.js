import { useEffect, useMemo, useState } from 'react';
import PostCard from '../components/PostCard';

const STATUS_FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'posted', label: 'Posted' },
  { key: 'all', label: 'All' },
];

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'reptile', label: 'Reptiles' },
  { key: 'bird', label: 'Birds' },
  { key: 'pocket_pet', label: 'Pocket Pets' },
  { key: 'dog_cat', label: 'Dogs/Cats' },
];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchPosts() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/posts');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'failed to load');
      setPosts(Array.isArray(json.posts) ? json.posts : []);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
    const id = setInterval(fetchPosts, 30_000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const statusOk = statusFilter === 'all' ? true : p.status === statusFilter;
      const catOk = categoryFilter === 'all' ? true : p.category === categoryFilter;
      return statusOk && catOk;
    });
  }, [posts, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const s = { pending: 0, approved: 0, posted: 0, skipped: 0, total: posts.length };
    for (const p of posts) {
      if (p.status && s[p.status] !== undefined) s[p.status] += 1;
    }
    return s;
  }, [posts]);

  async function onUpdate(id, updates) {
    const res = await fetch('/api/update-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'update failed');

    setPosts((prev) => prev.map((p) => (p.id === id ? json.post : p)));
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-2xl font-semibold">outreach monitor</div>
            <div className="text-sm text-gray-400 mt-1">reddit feeding/nutrition posts saved for review</div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-gray-300">
            <div className="px-3 py-2 rounded-xl bg-gray-800/60 ring-1 ring-gray-700/60">total: {stats.total}</div>
            <div className="px-3 py-2 rounded-xl bg-gray-800/60 ring-1 ring-gray-700/60">pending: {stats.pending}</div>
            <div className="px-3 py-2 rounded-xl bg-gray-800/60 ring-1 ring-gray-700/60">approved: {stats.approved}</div>
            <div className="px-3 py-2 rounded-xl bg-gray-800/60 ring-1 ring-gray-700/60">posted: {stats.posted}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs text-gray-400 mr-2">status</div>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-2 rounded-xl text-sm ring-1 ring-gray-700/70 ${
                  statusFilter === f.key ? 'bg-orange-500/80' : 'bg-gray-900/40 hover:bg-gray-900/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs text-gray-400 mr-2">category</div>
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setCategoryFilter(f.key)}
                className={`px-3 py-2 rounded-xl text-sm ring-1 ring-gray-700/70 ${
                  categoryFilter === f.key ? 'bg-orange-500/80' : 'bg-gray-900/40 hover:bg-gray-900/60'
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="flex-1" />

            <button
              onClick={fetchPosts}
              className="px-3 py-2 rounded-xl text-sm bg-gray-900/40 ring-1 ring-gray-700/70 hover:bg-gray-900/60"
            >
              {loading ? 'refreshing…' : 'refresh'}
            </button>
          </div>

          {error ? <div className="text-sm text-red-300">{error}</div> : null}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} onUpdate={onUpdate} />
          ))}
        </div>

        {!loading && filtered.length === 0 ? (
          <div className="mt-10 text-sm text-gray-400">no posts match your filters</div>
        ) : null}
      </div>
    </main>
  );
}
