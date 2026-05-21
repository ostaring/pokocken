import { Route, Routes } from "react-router-dom";
import { AdminLoginRoute } from "@/routes/admin/AdminLoginRoute";
import { AdminRouteGuard } from "@/routes/admin/AdminRouteGuard";
import { AdminDashboardPage } from "@/pages/admin/dashboard/AdminDashboardPage";
import { AdminGalleryPage } from "@/pages/admin/gallery/AdminGalleryPage";
import { AdminLoginPage } from "@/pages/admin/login/AdminLoginPage";
import { PublicLayout } from "@/components/layout/public/PublicLayout";
import { GalleryPage } from "@/pages/public/gallery/GalleryPage";
import { AdminRecipeEditorPage } from "@/pages/admin/recipes/AdminRecipeEditorPage";
import { HomePage } from "@/pages/public/home/HomePage";
import { NotFoundPage } from "@/pages/system/not-found/NotFoundPage";
import { RecipeDetailsPage } from "@/pages/public/recipes/RecipeDetailsPage";
import { RecipeSuggestionsPage } from "@/pages/public/recipe-suggestions/RecipeSuggestionsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/suggest" element={<RecipeSuggestionsPage />} />
        <Route path="/recipes/:slug" element={<RecipeDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route
        path="/admin/login"
        element={
          <AdminLoginRoute>
            <AdminLoginPage />
          </AdminLoginRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRouteGuard>
            <AdminDashboardPage />
          </AdminRouteGuard>
        }
      />
      <Route
        path="/admin/gallery"
        element={
          <AdminRouteGuard>
            <AdminGalleryPage />
          </AdminRouteGuard>
        }
      />
      <Route
        path="/admin/recipes/new"
        element={
          <AdminRouteGuard>
            <AdminRecipeEditorPage mode="create" />
          </AdminRouteGuard>
        }
      />
      <Route
        path="/admin/recipes/:id/edit"
        element={
          <AdminRouteGuard>
            <AdminRecipeEditorPage mode="edit" />
          </AdminRouteGuard>
        }
      />
    </Routes>
  );
}
