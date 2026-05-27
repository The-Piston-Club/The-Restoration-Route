import { Outlet } from "react-router";
import { BudgetProvider } from "../context/BudgetContext";

export function RootLayout() {
  return (
    <BudgetProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
        <Outlet />
      </div>
    </BudgetProvider>
  );
}
