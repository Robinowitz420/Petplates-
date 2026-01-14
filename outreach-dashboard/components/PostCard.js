import { Check, Copy, ExternalLink, Pencil, X } from 'lucide-react';
import { useMemo, useState } from 'react';

function badgeClasses(category) {
  switch (category) {
    case 'reptile':
      return 'bg-green-500/15 text-green-200 ring-1 ring-green-500/30';
    case 'bird':
      return 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/30';
    case 'pocket_pet':
      return 'bg-purple-500/15 text-purple-200 ring-1 ring-purple-500/30';
    case 'dog_cat':
      return 'bg-orange-500/15 text-orange-200 ring-1 ring-orange-500/30';
    default:
      return 'bg-gray-500/15 text-gray-200 ring-1 ring-gray-500/30';
  }
}

export default function PostCard({ post, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState(post.edited_response || '');
  const [copied, setCopied] = useState(false);

  const responseText = useMemo(() => {
    return (edited && edited.trim().length > 0 ? edited : post.draft_response) || '';
  }, [edited, post.draft_response]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(responseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  async function update(updates) {
    await onUpdate(post.id, updates);
  }

  return (
    <div className="rounded-2xl bg-gray-800/60 ring-1 ring-gray-700/60 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs rounded-full ${badgeClasses(post.category)}`}>{post.category}</span>
            <span className="px-2 py-1 text-xs rounded-full bg-gray-700/60 text-gray-200 ring-1 ring-gray-600/60">
              {post.platform} / r/{post.subreddit}
            </span>
            <span className="text-xs text-gray-400">@{post.author}</span>
          </div>
          <div className="text-sm font-semibold text-gray-100 truncate">{post.title}</div>
          {post.text ? <div className="text-sm text-gray-300 line-clamp-3 mt-1">{post.text}</div> : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900/40 ring-1 ring-gray-700/70 hover:bg-gray-900/60"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="text-xs">copy</span>
          </button>

          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900/40 ring-1 ring-gray-700/70 hover:bg-gray-900/60"
          >
            <ExternalLink size={16} />
            <span className="text-xs">open</span>
          </a>
        </div>
      </div>

      {post.detected_species?.length ? (
        <div className="text-xs text-gray-300">
          <span className="text-gray-400">detected: </span>
          {post.detected_species.slice(0, 6).join(', ')}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">draft / edited response</div>
          <button
            onClick={() => setIsEditing((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900/40 ring-1 ring-gray-700/70 hover:bg-gray-900/60"
          >
            <Pencil size={14} />
            <span className="text-xs">{isEditing ? 'lock' : 'edit'}</span>
          </button>
        </div>

        <textarea
          value={isEditing ? edited : responseText}
          onChange={(e) => setEdited(e.target.value)}
          readOnly={!isEditing}
          className="w-full min-h-[120px] rounded-xl bg-gray-900/40 ring-1 ring-gray-700/70 px-3 py-2 text-sm text-gray-100 focus:outline-none"
        />

        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => update({ edited_response: edited })}
              className="px-3 py-2 rounded-xl bg-orange-500/80 hover:bg-orange-500 text-sm"
            >
              save edit
            </button>
            <button
              onClick={() => {
                setEdited(post.edited_response || '');
                setIsEditing(false);
              }}
              className="px-3 py-2 rounded-xl bg-gray-900/40 ring-1 ring-gray-700/70 text-sm"
            >
              cancel
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-700/60">
        <span className="text-xs text-gray-400">status:</span>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 ring-1 ring-gray-600/60">{post.status}</span>

        <div className="flex-1" />

        <button
          onClick={() => update({ status: 'approved' })}
          className="px-3 py-2 rounded-xl bg-gray-900/40 ring-1 ring-gray-700/70 hover:bg-gray-900/60 text-sm"
        >
          approve
        </button>
        <button
          onClick={() => update({ status: 'posted' })}
          className="px-3 py-2 rounded-xl bg-gray-900/40 ring-1 ring-gray-700/70 hover:bg-gray-900/60 text-sm"
        >
          mark posted
        </button>
        <button
          onClick={() => update({ status: 'skipped' })}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900/40 ring-1 ring-gray-700/70 hover:bg-gray-900/60 text-sm"
        >
          <X size={16} />
          skip
        </button>
      </div>
    </div>
  );
}
