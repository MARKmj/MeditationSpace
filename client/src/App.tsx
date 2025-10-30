import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Suspense, lazy } from "react";

// 懒加载页面组件以提升初始加载性能
const Home = lazy(() => import("./pages/Home"));
const Timer = lazy(() => import("./pages/Timer"));
const Breathe = lazy(() => import("./pages/Breathe"));
const Guided = lazy(() => import("./pages/Guided"));
const Sounds = lazy(() => import("./pages/Sounds"));
const Records = lazy(() => import("./pages/Records"));

// 开发环境测试页面
const BrowserTest = process.env.NODE_ENV === 'development'
  ? lazy(() => import("./components/BrowserTest"))
  : null;

// 页面加载骨架屏组件
const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-pulse space-y-4 w-full max-w-md">
      <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
      <div className="h-32 bg-muted rounded"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/timer"} component={Timer} />
        <Route path="/breathe" component={Breathe} />
        <Route path="/guided" component={Guided} />
        <Route path="/sounds" component={Sounds} />
        <Route path="/records" component={Records} />
        {BrowserTest && <Route path="/browser-test" component={BrowserTest} />}
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
