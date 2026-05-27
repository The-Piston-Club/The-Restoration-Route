import { createContext, useContext, useState, ReactNode } from 'react';

export interface IntakeData {
  projectType?: 'feature' | 'commercial' | 'documentary' | 'short';
  budget?: 'micro' | 'low' | 'medium' | 'high';
  duration?: number;
  crewSize?: 'minimal' | 'small' | 'medium' | 'large';
  locations?: number;
  hasStunts?: boolean;
  hasVFX?: boolean;
  shootingDays?: number;
}

export interface ModuleItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  selected: boolean;
  quantity: number;
}

export interface PricingItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  unit: string;
  description: string;
}

interface BudgetContextType {
  intakeData: IntakeData;
  updateIntakeData: (data: Partial<IntakeData>) => void;
  modules: ModuleItem[];
  toggleModule: (id: string) => void;
  updateModuleQuantity: (id: string, quantity: number) => void;
  pricingDatabase: PricingItem[];
  addPricingItem: (item: Omit<PricingItem, 'id'>) => void;
  updatePricingItem: (id: string, item: Partial<PricingItem>) => void;
  deletePricingItem: (id: string) => void;
  getTotalBudget: () => number;
  resetBudget: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const defaultPricingDatabase: PricingItem[] = [
  // Pre-Production
  { id: '1', name: 'Director', category: 'Pre-Production', basePrice: 5000, unit: 'day', description: 'Lead creative director' },
  { id: '2', name: 'Producer', category: 'Pre-Production', basePrice: 4000, unit: 'day', description: 'Line producer' },
  { id: '3', name: 'Location Scout', category: 'Pre-Production', basePrice: 500, unit: 'day', description: 'Location scouting' },

  // Production
  { id: '4', name: 'Director of Photography', category: 'Production', basePrice: 3500, unit: 'day', description: 'Lead cinematographer' },
  { id: '5', name: 'Camera Operator', category: 'Production', basePrice: 1200, unit: 'day', description: 'Camera operation' },
  { id: '6', name: 'Gaffer', category: 'Production', basePrice: 1000, unit: 'day', description: 'Chief lighting technician' },
  { id: '7', name: 'Sound Mixer', category: 'Production', basePrice: 1100, unit: 'day', description: 'Production sound' },

  // Equipment
  { id: '8', name: 'Camera Package', category: 'Equipment', basePrice: 2500, unit: 'day', description: 'Full camera kit' },
  { id: '9', name: 'Lighting Package', category: 'Equipment', basePrice: 1800, unit: 'day', description: 'Full lighting kit' },
  { id: '10', name: 'Sound Package', category: 'Equipment', basePrice: 800, unit: 'day', description: 'Full sound kit' },

  // Post-Production
  { id: '11', name: 'Editor', category: 'Post-Production', basePrice: 1500, unit: 'day', description: 'Video editing' },
  { id: '12', name: 'Colorist', category: 'Post-Production', basePrice: 1800, unit: 'day', description: 'Color grading' },
  { id: '13', name: 'Sound Design', category: 'Post-Production', basePrice: 1200, unit: 'day', description: 'Audio post-production' },
  { id: '14', name: 'VFX Artist', category: 'Post-Production', basePrice: 2000, unit: 'day', description: 'Visual effects' },

  // Other
  { id: '15', name: 'Craft Services', category: 'Other', basePrice: 300, unit: 'day', description: 'On-set catering' },
  { id: '16', name: 'Location Fee', category: 'Other', basePrice: 2000, unit: 'location', description: 'Location rental' },
  { id: '17', name: 'Insurance', category: 'Other', basePrice: 5000, unit: 'production', description: 'Production insurance' },
];

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [intakeData, setIntakeData] = useState<IntakeData>({});
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [pricingDatabase, setPricingDatabase] = useState<PricingItem[]>(defaultPricingDatabase);

  const updateIntakeData = (data: Partial<IntakeData>) => {
    setIntakeData(prev => ({ ...prev, ...data }));
  };

  const generateModulesFromIntake = (intake: IntakeData) => {
    const generatedModules: ModuleItem[] = [];

    // Always include core modules
    generatedModules.push(
      { id: 'm1', name: 'Director', category: 'Pre-Production', basePrice: 5000, selected: false, quantity: 1 },
      { id: 'm2', name: 'Producer', category: 'Pre-Production', basePrice: 4000, selected: false, quantity: 1 },
      { id: 'm4', name: 'Director of Photography', category: 'Production', basePrice: 3500, selected: false, quantity: 1 },
      { id: 'm8', name: 'Camera Package', category: 'Equipment', basePrice: 2500, selected: false, quantity: 1 },
      { id: 'm11', name: 'Editor', category: 'Post-Production', basePrice: 1500, selected: false, quantity: 1 },
    );

    // Add based on crew size
    if (intake.crewSize && ['medium', 'large'].includes(intake.crewSize)) {
      generatedModules.push(
        { id: 'm5', name: 'Camera Operator', category: 'Production', basePrice: 1200, selected: false, quantity: 1 },
        { id: 'm6', name: 'Gaffer', category: 'Production', basePrice: 1000, selected: false, quantity: 1 },
        { id: 'm7', name: 'Sound Mixer', category: 'Production', basePrice: 1100, selected: false, quantity: 1 },
        { id: 'm9', name: 'Lighting Package', category: 'Equipment', basePrice: 1800, selected: false, quantity: 1 },
        { id: 'm10', name: 'Sound Package', category: 'Equipment', basePrice: 800, selected: false, quantity: 1 },
      );
    }

    // Add VFX if needed
    if (intake.hasVFX) {
      generatedModules.push(
        { id: 'm14', name: 'VFX Artist', category: 'Post-Production', basePrice: 2000, selected: false, quantity: 1 }
      );
    }

    // Add color grading for higher budgets
    if (intake.budget && ['medium', 'high'].includes(intake.budget)) {
      generatedModules.push(
        { id: 'm12', name: 'Colorist', category: 'Post-Production', basePrice: 1800, selected: false, quantity: 1 }
      );
    }

    // Add craft services and location fees
    if (intake.shootingDays) {
      generatedModules.push(
        { id: 'm15', name: 'Craft Services', category: 'Other', basePrice: 300, selected: false, quantity: intake.shootingDays }
      );
    }

    if (intake.locations) {
      generatedModules.push(
        { id: 'm16', name: 'Location Fee', category: 'Other', basePrice: 2000, selected: false, quantity: intake.locations }
      );
    }

    // Always add insurance
    generatedModules.push(
      { id: 'm17', name: 'Insurance', category: 'Other', basePrice: 5000, selected: false, quantity: 1 }
    );

    setModules(generatedModules);
  };

  const toggleModule = (id: string) => {
    setModules(prev =>
      prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m)
    );
  };

  const updateModuleQuantity = (id: string, quantity: number) => {
    setModules(prev =>
      prev.map(m => m.id === id ? { ...m, quantity: Math.max(1, quantity) } : m)
    );
  };

  const addPricingItem = (item: Omit<PricingItem, 'id'>) => {
    const newItem: PricingItem = {
      ...item,
      id: `custom-${Date.now()}`,
    };
    setPricingDatabase(prev => [...prev, newItem]);
  };

  const updatePricingItem = (id: string, item: Partial<PricingItem>) => {
    setPricingDatabase(prev =>
      prev.map(p => p.id === id ? { ...p, ...item } : p)
    );
  };

  const deletePricingItem = (id: string) => {
    setPricingDatabase(prev => prev.filter(p => p.id !== id));
  };

  const getTotalBudget = () => {
    return modules
      .filter(m => m.selected)
      .reduce((sum, m) => sum + (m.basePrice * m.quantity), 0);
  };

  const resetBudget = () => {
    setIntakeData({});
    setModules([]);
  };

  // Generate modules when intake is complete
  const isIntakeComplete = intakeData.projectType && intakeData.budget && intakeData.shootingDays;
  if (isIntakeComplete && modules.length === 0) {
    generateModulesFromIntake(intakeData);
  }

  return (
    <BudgetContext.Provider
      value={{
        intakeData,
        updateIntakeData,
        modules,
        toggleModule,
        updateModuleQuantity,
        pricingDatabase,
        addPricingItem,
        updatePricingItem,
        deletePricingItem,
        getTotalBudget,
        resetBudget,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
}
