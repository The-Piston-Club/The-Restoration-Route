import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { HomePage } from "./components/HomePage";
import { IntakePage } from "./components/IntakePage";
import { ModulesPage } from "./components/ModulesPage";
import { ReviewPage } from "./components/ReviewPage";
import { AdminPage } from "./components/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "intake", Component: IntakePage },
      { path: "modules", Component: ModulesPage },
      { path: "review", Component: ReviewPage },
      { path: "admin", Component: AdminPage },
    ],
  },
]);
