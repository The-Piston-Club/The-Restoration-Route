import { useNavigate } from "react-router";
import { useBudget } from "../context/BudgetContext";
import { ArrowLeft, Download, Share2, Film, DollarSign, Calendar, Users, CheckCircle2 } from "lucide-react";

export function ReviewPage() {
  const navigate = useNavigate();
  const { intakeData, modules, getTotalBudget, resetBudget } = useBudget();

  const selectedModules = modules.filter(m => m.selected);
  const totalBudget = getTotalBudget();

  const categoryTotals = selectedModules.reduce((acc, module) => {
    const category = module.category;
    if (!acc[category]) {
      acc[category] = { total: 0, items: [] };
    }
    acc[category].total += module.basePrice * module.quantity;
    acc[category].items.push(module);
    return acc;
  }, {} as Record<string, { total: number; items: typeof selectedModules }>);

  const handleExport = () => {
    const budgetData = {
      projectInfo: intakeData,
      lineItems: selectedModules,
      categoryTotals,
      total: totalBudget,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(budgetData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewBudget = () => {
    resetBudget();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-[#252525] bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/modules")}
              className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#e8e8e8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Modules</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded-lg bg-[#151515] border border-[#252525] hover:border-[#353535] transition-colors flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Message */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-lg p-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-lg">Budget Complete</div>
              <div className="text-sm text-[#a0a0a0] mt-1">
                Your production budget has been generated based on your requirements
              </div>
            </div>
          </div>

          {/* Project Summary */}
          <div className="bg-[#151515] border border-[#252525] rounded-lg p-6 space-y-4">
            <h2 className="text-xl flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-500" />
              Project Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-[#707070]">Type</div>
                <div className="mt-1 capitalize">{intakeData.projectType?.replace(/-/g, ' ')}</div>
              </div>
              <div>
                <div className="text-xs text-[#707070]">Budget Tier</div>
                <div className="mt-1 capitalize">{intakeData.budget}</div>
              </div>
              <div>
                <div className="text-xs text-[#707070]">Shooting Days</div>
                <div className="mt-1">{intakeData.shootingDays}</div>
              </div>
              <div>
                <div className="text-xs text-[#707070]">Crew Size</div>
                <div className="mt-1 capitalize">{intakeData.crewSize}</div>
              </div>
            </div>
          </div>

          {/* Total Budget */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#a0a0a0]">Total Production Budget</div>
                <div className="text-4xl font-mono text-amber-500 mt-2">
                  ${totalBudget.toLocaleString()}
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-amber-500/30" />
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-4">
            <h2 className="text-xl">Budget Breakdown</h2>
            {Object.entries(categoryTotals).map(([category, data]) => (
              <div key={category} className="bg-[#151515] border border-[#252525] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[#252525] flex items-center justify-between">
                  <div className="font-medium">{category}</div>
                  <div className="font-mono text-amber-500">
                    ${data.total.toLocaleString()}
                  </div>
                </div>
                <div className="divide-y divide-[#252525]">
                  {data.items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm">{item.name}</div>
                        <div className="text-xs text-[#707070] mt-1">
                          {item.quantity} × ${item.basePrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="font-mono text-sm">
                        ${(item.basePrice * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleNewBudget}
              className="flex-1 px-6 py-3 rounded-lg bg-[#151515] border border-[#252525] hover:border-[#353535] transition-colors"
            >
              New Budget
            </button>
            <button
              onClick={() => navigate("/modules")}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/20 transition-all"
            >
              Edit Modules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
