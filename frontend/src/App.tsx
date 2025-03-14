
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MediaTrackingProvider } from "./contexts/MediaTrackingContext";

// Pages
import Index from "./pages/Index";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import SeriesPage from "./pages/SeriesPage";
import MoviesPage from "./pages/MoviesPage";
import SettingsPage from "./pages/SettingsPage";
import LogoutPage from "./pages/LogoutPage";
import NotFound from "./pages/NotFound";
import TrackerPage from "./pages/TrackerPage";
import BookDetailPage from "./pages/BookDetailPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import SeriesDetailPage from "./pages/SeriesDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MediaTrackingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/detail/:id" element={<BookDetailPage />} />
              <Route path="/series" element={<SeriesPage />} />
              <Route path="/series/detail/:id" element={<SeriesDetailPage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/detail/:id" element={<MovieDetailPage />} />
              <Route path="/tracker" element={<TrackerPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/logout" element={<LogoutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MediaTrackingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
