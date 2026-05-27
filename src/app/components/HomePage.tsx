import { useNavigate } from "react-router";
import { Film, DollarSign, FileText, Settings } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
            <Film className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl tracking-tight">Production Budget</h1>
          <p className="text-[#a0a0a0]">Professional film production budgeting tool</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/intake")}
            className="w-full flex items-center gap-4 p-6 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 hover:border-amber-500/40 transition-all group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <FileText className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">New Budget</div>
              <div className="text-sm text-[#a0a0a0]">Start diagnostic intake</div>
            </div>
            <div className="text-amber-500 group-hover:translate-x-1 transition-transform">→</div>
          </button>

          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-4 p-6 rounded-lg bg-[#151515] border border-[#252525] hover:border-[#353535] transition-all group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#1a1a1a] border border-[#252525]">
              <Settings className="w-6 h-6 text-[#a0a0a0]" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Admin Settings</div>
              <div className="text-sm text-[#a0a0a0]">Manage pricing database</div>
            </div>
            <div className="text-[#a0a0a0] group-hover:translate-x-1 transition-transform">→</div>
          </button>
        </div>

        <div className="pt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-medium text-amber-500">Fast</div>
            <div className="text-xs text-[#707070]">Diagnostic Intake</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-medium text-amber-500">Smart</div>
            <div className="text-xs text-[#707070]">Adaptive Questions</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-medium text-amber-500">Pro</div>
            <div className="text-xs text-[#707070]">Industry Standard</div>
          </div>
        </div>
      </div>
    </div>
  );
}
