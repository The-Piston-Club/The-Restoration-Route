import { useState } from "react";
import { useNavigate } from "react-router";
import { useBudget } from "../context/BudgetContext";
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, DollarSign, Package } from "lucide-react";

interface EditingItem {
  id?: string;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
  description: string;
}

export function AdminPage() {
  const navigate = useNavigate();
  const { pricingDatabase, addPricingItem, updatePricingItem, deletePricingItem } = useBudget();
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(pricingDatabase.map(p => p.category)))];
  const filteredItems = activeCategory === 'All'
    ? pricingDatabase
    : pricingDatabase.filter(p => p.category === activeCategory);

  const handleSave = () => {
    if (!editingItem) return;

    if (editingItem.id) {
      updatePricingItem(editingItem.id, editingItem);
    } else {
      addPricingItem(editingItem);
    }
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this pricing item?')) {
      deletePricingItem(id);
    }
  };

  const startNew = () => {
    setEditingItem({
      name: '',
      category: 'Pre-Production',
      basePrice: 0,
      unit: 'day',
      description: '',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-[#252525] bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#e8e8e8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </button>
            <button
              onClick={startNew}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl flex items-center gap-3">
              <Package className="w-8 h-8 text-amber-500" />
              Pricing Database
            </h1>
            <p className="text-[#a0a0a0]">
              Manage base pricing for budget line items
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.filter(c => c !== 'All').map((category) => {
              const count = pricingDatabase.filter(p => p.category === category).length;
              return (
                <div
                  key={category}
                  className="bg-[#151515] border border-[#252525] rounded-lg p-4 space-y-2"
                >
                  <div className="text-xs text-[#707070]">{category}</div>
                  <div className="text-2xl font-mono">{count}</div>
                  <div className="text-xs text-[#a0a0a0]">items</div>
                </div>
              );
            })}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#151515] border border-[#252525] text-[#a0a0a0] hover:border-[#353535]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Pricing Table */}
          <div className="bg-[#151515] border border-[#252525] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0a] border-b border-[#252525]">
                  <tr>
                    <th className="text-left p-4 text-sm text-[#a0a0a0]">Name</th>
                    <th className="text-left p-4 text-sm text-[#a0a0a0]">Category</th>
                    <th className="text-left p-4 text-sm text-[#a0a0a0]">Description</th>
                    <th className="text-right p-4 text-sm text-[#a0a0a0]">Base Price</th>
                    <th className="text-left p-4 text-sm text-[#a0a0a0]">Unit</th>
                    <th className="text-right p-4 text-sm text-[#a0a0a0]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252525]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="p-4">{item.name}</td>
                      <td className="p-4 text-sm text-[#a0a0a0]">{item.category}</td>
                      <td className="p-4 text-sm text-[#a0a0a0] max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="p-4 text-right font-mono text-amber-500">
                        ${item.basePrice.toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-[#a0a0a0]">{item.unit}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem({ ...item })}
                            className="p-2 rounded hover:bg-[#252525] transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-[#a0a0a0]" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-[#707070]">
                No pricing items in this category
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a] border border-[#252525] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#252525] p-6 flex items-center justify-between">
              <h3 className="text-xl">{editingItem.id ? 'Edit' : 'New'} Pricing Item</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded hover:bg-[#252525] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-2">Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full bg-[#151515] border border-[#252525] rounded px-4 py-3 focus:border-amber-500/40 focus:outline-none transition-colors"
                  placeholder="e.g., Camera Operator"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-[#151515] border border-[#252525] rounded px-4 py-3 focus:border-amber-500/40 focus:outline-none transition-colors"
                  >
                    <option value="Pre-Production">Pre-Production</option>
                    <option value="Production">Production</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Post-Production">Post-Production</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Unit</label>
                  <select
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full bg-[#151515] border border-[#252525] rounded px-4 py-3 focus:border-amber-500/40 focus:outline-none transition-colors"
                  >
                    <option value="day">day</option>
                    <option value="week">week</option>
                    <option value="hour">hour</option>
                    <option value="location">location</option>
                    <option value="production">production</option>
                    <option value="item">item</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#a0a0a0] mb-2">Base Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={editingItem.basePrice}
                  onChange={(e) => setEditingItem({ ...editingItem, basePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#151515] border border-[#252525] rounded px-4 py-3 font-mono focus:border-amber-500/40 focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm text-[#a0a0a0] mb-2">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-[#151515] border border-[#252525] rounded px-4 py-3 focus:border-amber-500/40 focus:outline-none transition-colors resize-none"
                  rows={3}
                  placeholder="Brief description of this line item"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#252525] p-6 flex gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-6 py-3 rounded-lg bg-[#151515] border border-[#252525] hover:border-[#353535] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editingItem.name || editingItem.basePrice <= 0}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
