import { useState } from "react";
import { useNavigate } from "react-router";
import { useBudget } from "../context/BudgetContext";
import { ArrowLeft, ArrowRight, Info, Film, DollarSign, Users, MapPin, Zap, Calendar } from "lucide-react";

export function IntakePage() {
  const navigate = useNavigate();
  const { intakeData, updateIntakeData } = useBudget();
  const [step, setStep] = useState(1);

  const totalSteps = getTotalSteps();

  function getTotalSteps() {
    let steps = 3; // Base: project type, budget, duration
    if (intakeData.projectType) steps++;
    if (intakeData.budget && ['medium', 'high'].includes(intakeData.budget)) steps++;
    return steps;
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate("/modules");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/");
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!intakeData.projectType;
      case 2: return !!intakeData.budget;
      case 3: return !!intakeData.shootingDays;
      case 4: return !!intakeData.crewSize;
      case 5: return intakeData.hasStunts !== undefined || intakeData.hasVFX !== undefined;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-[#252525] bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#e8e8e8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
            <div className="text-sm text-[#a0a0a0]">
              Step {step} of {totalSteps}
            </div>
          </div>
          <div className="mt-4 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-500" />
                  <h2 className="text-2xl">What type of project?</h2>
                </div>
                <p className="text-[#a0a0a0]">This helps us tailor the budget to your specific needs</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: 'feature', label: 'Feature Film', desc: 'Full-length theatrical' },
                  { value: 'commercial', label: 'Commercial', desc: 'Advertising content' },
                  { value: 'documentary', label: 'Documentary', desc: 'Non-fiction storytelling' },
                  { value: 'short', label: 'Short Film', desc: 'Short-form narrative' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateIntakeData({ projectType: option.value as any })}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      intakeData.projectType === option.value
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-[#151515] border-[#252525] hover:border-[#353535]'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-[#a0a0a0] mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  <h2 className="text-2xl">Budget range?</h2>
                </div>
                <p className="text-[#a0a0a0]">Select the approximate budget tier for this production</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'micro', label: 'Micro Budget', desc: 'Under $50K', range: '< $50K' },
                  { value: 'low', label: 'Low Budget', desc: '$50K - $250K', range: '$50K - $250K' },
                  { value: 'medium', label: 'Medium Budget', desc: '$250K - $1M', range: '$250K - $1M' },
                  { value: 'high', label: 'High Budget', desc: 'Over $1M', range: '> $1M' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateIntakeData({ budget: option.value as any })}
                    className={`w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between ${
                      intakeData.budget === option.value
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-[#151515] border-[#252525] hover:border-[#353535]'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-[#a0a0a0] mt-1">{option.desc}</div>
                    </div>
                    <div className="text-amber-500 font-mono text-sm">{option.range}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h2 className="text-2xl">Shooting schedule?</h2>
                </div>
                <p className="text-[#a0a0a0]">How many days will principal photography take?</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#151515] border border-[#252525] rounded-lg p-6">
                  <label className="block text-sm text-[#a0a0a0] mb-2">Number of shooting days</label>
                  <input
                    type="number"
                    min="1"
                    value={intakeData.shootingDays || ''}
                    onChange={(e) => updateIntakeData({ shootingDays: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0a0a0a] border border-[#252525] rounded px-4 py-3 text-2xl font-mono focus:border-amber-500/40 focus:outline-none transition-colors"
                    placeholder="0"
                  />
                  <div className="mt-4 flex items-start gap-2 text-xs text-[#707070]">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Include all principal photography days. Pre-production and post-production will be calculated separately.</p>
                  </div>
                </div>

                <div className="bg-[#151515] border border-[#252525] rounded-lg p-6">
                  <label className="block text-sm text-[#a0a0a0] mb-2">Number of locations</label>
                  <input
                    type="number"
                    min="1"
                    value={intakeData.locations || ''}
                    onChange={(e) => updateIntakeData({ locations: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0a0a0a] border border-[#252525] rounded px-4 py-3 text-2xl font-mono focus:border-amber-500/40 focus:outline-none transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  <h2 className="text-2xl">Crew size?</h2>
                </div>
                <p className="text-[#a0a0a0]">Estimate your typical crew size on set</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'minimal', label: 'Minimal Crew', desc: '2-5 people', detail: 'Skeleton crew for run-and-gun' },
                  { value: 'small', label: 'Small Crew', desc: '6-15 people', detail: 'Indie production standard' },
                  { value: 'medium', label: 'Medium Crew', desc: '16-40 people', detail: 'Professional production' },
                  { value: 'large', label: 'Large Crew', desc: '40+ people', detail: 'Studio-level production' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateIntakeData({ crewSize: option.value as any })}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      intakeData.crewSize === option.value
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-[#151515] border-[#252525] hover:border-[#353535]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-[#a0a0a0] mt-1">{option.detail}</div>
                      </div>
                      <div className="text-amber-500 font-mono text-sm">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h2 className="text-2xl">Special requirements?</h2>
                </div>
                <p className="text-[#a0a0a0]">Additional considerations for your production</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => updateIntakeData({ hasVFX: !intakeData.hasVFX })}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    intakeData.hasVFX
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-[#151515] border-[#252525] hover:border-[#353535]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Visual Effects (VFX)</div>
                      <div className="text-sm text-[#a0a0a0] mt-1">CGI, compositing, digital enhancements</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      intakeData.hasVFX ? 'bg-amber-500' : 'bg-[#252525]'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${
                        intakeData.hasVFX ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => updateIntakeData({ hasStunts: !intakeData.hasStunts })}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    intakeData.hasStunts
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-[#151515] border-[#252525] hover:border-[#353535]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Stunts & Special Rigging</div>
                      <div className="text-sm text-[#a0a0a0] mt-1">Coordinated action, safety equipment</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      intakeData.hasStunts ? 'bg-amber-500' : 'bg-[#252525]'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${
                        intakeData.hasStunts ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <span>{step === totalSteps ? 'Continue to Modules' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
