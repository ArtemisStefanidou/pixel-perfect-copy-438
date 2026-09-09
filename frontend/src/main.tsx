import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/outfit/300.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "./styles.css";

import { QueryClient } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();
const router = createRouter({
  routeTree,
  context: { queryClient },
  basepath: import.meta.env.BASE_URL.replace(/\/$/, "") || "/",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
