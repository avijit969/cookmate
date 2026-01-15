import { create } from 'zustand';
import { API_BASE_URL } from '../constants/config';
import { useAuthStore } from './authStore';

export interface Ingredient {
  name: string;
  type: string;
  quantity: string;
  unit: string;
}

export interface User {
    name: string;
    email: string;
    avatar: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  image: string;
  ingredients: Ingredient[];
  createdBy?: User;
  likesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt?: string;
}

interface RecipeState {
  recipes: Recipe[];
  userRecipes: Recipe[];
  hasLoadedUserRecipes: boolean;
  searchResults: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  
  fetchRecipes: (page?: number, limit?: number) => Promise<void>;
  fetchRecipeById: (id: string) => Promise<void>;
  fetchUserRecipes: (force?: boolean) => Promise<void>;
  createRecipe: (recipeData: Omit<Recipe, 'id'>) => Promise<void>;
  searchRecipes: (name: string) => Promise<void>;
  clearSearchResults: () => void;
  setRecipes: (recipes: Recipe[]) => void;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  userRecipes: [],
  hasLoadedUserRecipes: false,
  searchResults: [],
  currentRecipe: null,
  isLoading: false,
  isSearching: false,
  error: null,

  setRecipes: (recipes) => set({ recipes }),
  
  clearSearchResults: () => set({ searchResults: [], error: null }),

  fetchUserRecipes: async (force = false) => {
    if (!force && get().hasLoadedUserRecipes) return;
    
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`${API_BASE_URL}/recipes/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user recipes');
      }

      const recipes = (data.recipes || []).map((recipe: any) => {
          const userId = useAuthStore.getState().user?.id;
          return {
            ...recipe,
            likesCount: recipe.likes?.length || 0,
            isLiked: recipe.likes?.some((like: any) => like.userId === userId) || false,
          };
      });

      set({ userRecipes: recipes, hasLoadedUserRecipes: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  searchRecipes: async (name: string) => {
    if (!name.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    
    set({ isSearching: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      
      const response = await fetch(`${API_BASE_URL}/recipes/search/${encodeURIComponent(name)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          set({ searchResults: [], isSearching: false });
          return;
        }
        throw new Error(data.message || 'Failed to search recipes');
      }

      // Handle both single recipe and array response
      const results = Array.isArray(data.recipe) ? data.recipe : data.recipe ? [data.recipe] : [];
      set({ searchResults: results, isSearching: false });
    } catch (error: any) {
      set({ isSearching: false, error: error.message, searchResults: [] });
    }
  },

  fetchRecipes: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/recipes?page=${page}&limit=${limit}`, {
        headers
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recipes');
      }

      const newRecipes = (data.recipes || []).map((recipe: any) => {
        const userId = useAuthStore.getState().user?.id;
        return {
          ...recipe,
          likesCount: recipe.likes?.length || 0,
          isLiked: recipe.likes?.some((like: any) => like.userId === userId) || false,
        };
      });
      console.log(JSON.stringify(newRecipes,null,2));
      if (page === 1) {
        // set recipe count and isLiked
          set({ recipes: newRecipes, isLoading: false });
      } else {
          set((state) => ({ 
              recipes: [...state.recipes, ...newRecipes],
              isLoading: false 
          }));
      }
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  fetchRecipeById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/recipes/recipe/${id}`, {
        headers
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recipe details');
      }

      const recipeData = data.recipe;
      const userId = useAuthStore.getState().user?.id;
      const enrichedRecipe = {
          ...recipeData,
          likesCount: recipeData.likes?.length || 0,
          isLiked: recipeData.likes?.some((like: any) => like.userId === userId) || false,
      };

      set({ currentRecipe: enrichedRecipe, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  createRecipe: async (recipeData) => {
    console.log(recipeData);
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
          throw new Error("Unauthorized");
      }

      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            ...recipeData,
            instructions: [recipeData.instructions]
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create recipe');
      }

        set((state) => ({ 
          recipes: [data.recipe, ...state.recipes],
          isLoading: false 
      }));

    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
