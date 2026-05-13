import { Route, Routes } from "react-router-dom";
import { AdminLoginRoute } from "./AdminLoginRoute";
import { AdminRouteGuard } from "./AdminRouteGuard";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { AdminGalleryPage } from "../pages/AdminGalleryPage";
import { AdminLoginPage } from "../pages/AdminLoginPage";
import { GalleryPage } from "../pages/GalleryPage";
import { AdminRecipeEditorPage } from "../pages/AdminRecipeEditorPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RecipeDetailsPage } from "../pages/RecipeDetailsPage";
import { RecipesPage } from "../pages/RecipesPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="/recipes/:slug" element={<RecipeDetailsPage />} />
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
