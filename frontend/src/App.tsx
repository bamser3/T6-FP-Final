import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import Flashcards from "@/pages/Flashcards";
import Browse from "@/pages/Browse";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import { MatrixRain } from "@/MatrixRain";
import { AuthProvider } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/RequireAuth";

function Router() {
  return (
    <div className="min-h-screen flex flex-col w-full text-primary font-mono relative overflow-hidden">
      <div className="scanlines" />
      <MatrixRain />
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          <Switch>
            {/* Public routes */}
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />

            {/* Protected routes — must be logged in */}
            <Route path="/">
              <RequireAuth><Home /></RequireAuth>
            </Route>
            <Route path="/flashcards">
              <RequireAuth><Flashcards /></RequireAuth>
            </Route>
            <Route path="/browse">
              <RequireAuth><Browse /></RequireAuth>
            </Route>
            <Route path="/profile">
              <RequireAuth><Profile /></RequireAuth>
            </Route>

            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("dark");
  }
  return (
    <AuthProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
