import { useState } from "react";
import { useNavigate } from "react-router";
import { useBudget } from "../context/BudgetContext";
import { ArrowLeft, ArrowRight, Info, Check, Minus, Plus, DollarSign } from "lucide-react";

export function ModulesPage() {
  const navigate = useNavigate();
  const { modules, toggleModule, updateModuleQuantity, getTotalBudget } = useBudget();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(modules.map(m => m.category)))];
  const filteredModules = activeCategory === 'All'
    ? modules
    : modules.filter(m => m.category === activeCategory);

  const selectedCount = modules.filter(m => m.selected).length;
  const totalBudget = getTotalBudget();

  const categoryGroups = categories.filter(c => c !== 'All').map(category => ({
    category,
    modules: modules.filter(m => m.category === category),
    selectedCount: modules.filter(m => m.category === category && m.selected).length,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-[#252525] bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/intake")}
              className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#e8e8e8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Intake</span>
            </button>
            <div className="text-sm text-amber-500 font-mono">
              ${totalBudget.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl">Select Budget Modules</h1>
            <p className="text-[#a0a0a0]">
              Choose the line items for your production budget
            </p>
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

          {/* Category Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {categoryGroups.map(({ category, modules: catModules, selectedCount }) => (
              <div
                key={category}
                className="bg-[#151515] border border-[#252525] rounded-lg p-4 space-y-2"
              >
                <div className="text-xs text-[#707070]">{category}</div>
                <div className="text-2xl font-mono">
                  {selectedCount}/{catModules.length}
                </div>
                <div className="text-xs text-[#a0a0a0]">items selected</div>
              </div>
            ))}
          </div>

          {/* Module Cards */}
          <div className="space-y-3">
            {filteredModules.map((module) => (
              <div
                key={module.id}
                className={`rounded-lg border transition-all ${
                  module.selected
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-[#151515] border-[#252525]'
                }`}
              >
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 text-left flex items-center gap-4"
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      module.selected
                        ? 'bg-amber-500 border-amber-500'
                        : 'border-[#353535]'
                    }`}
                  >
                    {module.selected && <Check className="w-4 h-4 text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{module.name}</div>
                    <div className="text-sm text-[#707070]">{module.category}</div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="font-mono text-amber-500">
                      ${module.basePrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#707070]">per unit</div>
                  </div>
                </button>

                {module.selected && (
                  <div className="px-4 pb-4 flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-3 bg-[#0a0a0a] rounded-lg p-3 border border-[#252525]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateModuleQuantity(module.id, module.quantity - 1);
                        }}
                        className="w-8 h-8 rounded bg-[#151515] border border-[#252525] flex items-center justify-center hover:border-[#353535] transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-xs text-[#707070]">Quantity</div>
                        <div className="text-xl font-mono">{module.quantity}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateModuleQuantity(module.id, module.quantity + 1);
                        }}
                        className="w-8 h-8 rounded bg-[#151515] border border-[#252525] flex items-center justify-center hover:border-[#353535] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#707070]">Subtotal</div>
                      <div className="text-lg font-mono text-amber-500">
                        ${(module.basePrice * module.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12 text-[#707070]">
              No modules in this category
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#252525] bg-[#0a0a0a] sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
              <DollarSign className="w-4 h-4" />
              <span>{selectedCount} items selected</span>
            </div>
            <button
              onClick={() => navigate("/review")}
              disabled={selectedCount === 0}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <span>Review Budget</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
