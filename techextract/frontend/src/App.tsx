import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import Flashcards from "@/pages/Flashcards";
import Browse from "@/pages/Browse";
import { MatrixRain } from "@/components/ui/MatrixRain";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <div className="min-h-screen flex flex-col w-full text-primary font-mono relative overflow-hidden">
      <div className="scanlines" />
      <MatrixRain />
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/flashcards" component={Flashcards} />
            <Route path="/browse" component={Browse} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  // Enforce dark mode class
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
