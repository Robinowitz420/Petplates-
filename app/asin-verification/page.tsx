'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle, Edit2, ExternalLink, Download } from 'lucide-react';

// Import the real vetted products data
import { VETTED_PRODUCTS } from '@/lib/data/vetted-products';
import { INITIAL_VERIFICATION_STATE } from '@/lib/data/verification-state';
import { ensureSellerId } from '@/lib/utils/affiliateLinks';

// Import automated correction suggestions (if available)
let AUTOMATED_CORRECTIONS = {};
try {
  const correctionsPath = './lib/data/vetted-products-CORRECTED.txt';
  // We'll load this dynamically if it exists
} catch (e) {
  // File doesn't exist yet
}

function extractASIN(url: string) {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/);
  return match ? match[1] : null;
}

export default function ASINVerificationPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Convert vetted products to array format with initial verification state
    const productArray = Object.entries(VETTED_PRODUCTS).map(([ingredient, data]: [string, any]) => {
      const verificationState = INITIAL_VERIFICATION_STATE.find(v => v.ingredient === ingredient);

      return {
        id: ingredient,
        ingredient,
        productName: data.productName,
        amazonLink: data.asinLink || data.amazonLink,
        vetNote: data.vetNote,
        category: data.category,
        asin: extractASIN(data.asinLink || data.amazonLink),
        verified: verificationState?.verified || false,
        needsReview: verificationState?.needsReview || true,
        autoVerified: verificationState?.autoVerified || false,
        commissionRate: data.commissionRate,
        species: data.species,
        costTier: data.costTier
      };
    });
    setProducts(productArray);
  }, []);

  const filteredProducts = products.filter(p => {
    if (filter === 'needs-review') return p.needsReview;
    if (filter === 'verified') return p.verified;
    if (filter === 'auto-verified') return p.autoVerified;
    if (searchQuery) {
      return p.ingredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setEditData({
      productName: product.productName,
      asin: product.asin,
      vetNote: product.vetNote
    });
  };

  const saveEdit = (id: string) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          productName: editData.productName,
          asin: editData.asin,
          amazonLink: `https://www.amazon.com/dp/${editData.asin}?tag=robinfrench-20`,
          vetNote: editData.vetNote,
          verified: true,
          needsReview: false
        };
      }
      return p;
    }));
    setEditingId(null);
  };

  const markVerified = (id: string) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, verified: true, needsReview: false } : p
    ));
  };

  const exportCorrections = () => {
    const corrections = products
      .filter(p => p.verified)
      .map(p => ({
        ingredient: p.ingredient,
        productName: p.productName,
        asin: p.asin,
        amazonLink: p.amazonLink,
        vetNote: p.vetNote,
        category: p.category,
        commissionRate: p.commissionRate,
        species: p.species,
        costTier: p.costTier
      }));

    const tsCode = `// Corrected products - ${new Date().toISOString()}\n` +
      `export const CORRECTED_PRODUCTS: Record<string, any> = {\n` +
      corrections.map(c =>
        `  '${c.ingredient}': {\n` +
        `    productName: '${c.productName}',\n` +
        `    asinLink: '${c.amazonLink}',\n` +
        `    vetNote: '${c.vetNote}',\n` +
        `    category: '${c.category}',\n` +
        `    commissionRate: ${c.commissionRate},\n` +
        `    species: ${JSON.stringify(c.species)},\n` +
        `    costTier: '${c.costTier}'\n` +
        `  }`
      ).join(',\n') +
      '\n};';

    const blob = new Blob([tsCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corrected-products.ts';
    a.click();
  };

  const stats = {
    total: products.length,
    verified: products.filter(p => p.verified).length,
    autoVerified: products.filter(p => p.autoVerified).length,
    manuallyVerified: products.filter(p => p.verified && !p.autoVerified).length,
    needsReview: products.filter(p => p.needsReview).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            ASIN Verification Tool
          </h1>
          <p className="text-slate-600">
            Review and correct product ASINs for your vetted products list
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Products</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              <div className="text-sm text-green-600">Total Verified</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">{stats.autoVerified}</div>
              <div className="text-sm text-emerald-600">Auto-Verified</div>
            </div>
            <div className="bg-teal-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-teal-600">{stats.manuallyVerified}</div>
              <div className="text-sm text-teal-600">Manually Verified</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.needsReview}</div>
              <div className="text-sm text-orange-600">Needs Review</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Verification Progress</span>
              <span>{stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.verified / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search ingredients, products, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Products ({stats.total})</option>
              <option value="needs-review">Needs Review ({stats.needsReview})</option>
              <option value="verified">Verified ({stats.verified})</option>
              <option value="auto-verified">Auto-Verified ({products.filter(p => p.autoVerified).length})</option>
            </select>

            <button
              onClick={exportCorrections}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              disabled={stats.verified === 0}
            >
              <Download className="w-4 h-4" />
              Export Corrections ({stats.verified})
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.map(product => (
            <div key={product.id} className={`bg-white rounded-xl shadow-lg p-6 ${product.needsReview ? 'border-l-4 border-orange-400' : 'border-l-4 border-green-400'}`}>
              {editingId === product.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-slate-800">
                      Editing: {product.ingredient}
                    </h3>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                      {product.category}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editData.productName}
                      onChange={(e) => setEditData({...editData, productName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      ASIN
                    </label>
                    <input
                      type="text"
                      value={editData.asin}
                      onChange={(e) => setEditData({...editData, asin: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="B0XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vet Note
                    </label>
                    <textarea
                      value={editData.vetNote}
                      onChange={(e) => setEditData({...editData, vetNote: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(product.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-800">
                          {product.ingredient}
                        </h3>
                        {product.verified ? (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <CheckCircle className="w-4 h-4" />
                            {product.autoVerified ? 'Auto-Verified' : 'Verified'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Needs Review
                          </span>
                        )}
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                          {product.category}
                        </span>
                      </div>
                      <div className="text-slate-600 mb-2">
                        <strong>Product:</strong> {product.productName}
                      </div>
                      <div className="text-slate-600 mb-2">
                        <strong>ASIN:</strong> <code className="bg-slate-100 px-2 py-1 rounded">{product.asin}</code>
                      </div>
                      <div className="text-sm text-slate-500 mt-2">
                        {product.vetNote}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={ensureSellerId(product.amazonLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View on Amazon"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => startEdit(product)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {!product.verified && (
                        <button
                          onClick={() => markVerified(product.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Mark Verified
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="text-sm text-slate-600 space-y-2">
                      <div>
                        <strong>Quick Search:</strong>{' '}
                        <a
                          href={ensureSellerId(
                            `https://www.amazon.com/s?k=${encodeURIComponent(product.ingredient + ' for dogs')}&i=pet-supplies`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Search "{product.ingredient}" on Amazon →
                        </a>
                      </div>
                      <div>
                        <strong>ASIN Check:</strong>{' '}
                        <a
                          href={ensureSellerId(`https://www.amazon.com/dp/${product.asin}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Verify current ASIN →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-slate-500 text-lg">No products match your filters</p>
            <p className="text-slate-400 text-sm mt-2">
              Try adjusting your search query or filter settings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
