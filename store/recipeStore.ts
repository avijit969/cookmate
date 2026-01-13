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
}

interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  
  fetchRecipes: (page?: number, limit?: number) => Promise<void>;
  fetchRecipeById: (id: string) => Promise<void>;
  createRecipe: (recipeData: Omit<Recipe, 'id'>) => Promise<void>;
  setRecipes: (recipes: Recipe[]) => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  error: null,

  setRecipes: (recipes) => set({ recipes }),

  fetchRecipes: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/recipes?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recipes');
      }

      if (page === 1) {
          set({ recipes: data.recipes, isLoading: false });
      } else {
          set((state) => ({ 
              recipes: [...state.recipes, ...data.recipes],
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
      const response = await fetch(`${API_BASE_URL}/recipes/recipe/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recipe details');
      }

      set({ currentRecipe: data.recipe, isLoading: false });
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
