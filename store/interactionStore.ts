import { create } from 'zustand';
import { API_BASE_URL } from '../constants/config';
import { useAuthStore } from './authStore';
import { Recipe } from './recipeStore';

export interface Comment {
  id: string;
  content: string;
  userId: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
}

interface InteractionState {
  likes: Record<string, number>;
  userLikes: Record<string, boolean>;
  comments: Record<string, Comment[]>;
  savedRecipes: Recipe[];
  isLoading: boolean;
  error: string | null;

  toggleLike: (recipeId: string) => Promise<void>;
  fetchRecipeLikes: (recipeId: string) => Promise<void>;
  addComment: (recipeId: string, content: string) => Promise<void>;
  fetchRecipeComments: (recipeId: string) => Promise<void>;
  updateComment: (commentId: string, recipeId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, recipeId: string) => Promise<void>;
  toggleSave: (recipe: Recipe) => Promise<void>;
  fetchSavedRecipes: () => Promise<void>;
}

export const useInteractionStore = create<InteractionState>((set, get) => ({
  likes: {},
  userLikes: {},
  comments: {},
  savedRecipes: [],
  isLoading: false,
  error: null,

  toggleLike: async (recipeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`${API_BASE_URL}/interactions/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle like');
      }

      set((state) => ({
        userLikes: {
          ...state.userLikes,
          [recipeId]: data.liked
        },
        likes: {
            ...state.likes,
            [recipeId]: (state.likes[recipeId] || 0) + (data.liked ? 1 : -1)
        },
        isLoading: false
      }));

    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  fetchRecipeLikes: async (recipeId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/interactions/like/${recipeId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch likes');
      }

      set((state) => ({
        likes: {
          ...state.likes,
          [recipeId]: data.count
        }
      }));
    } catch (error: any) {
      console.error('Failed to fetch likes', error);
    }
  },

  addComment: async (recipeId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const user = useAuthStore.getState().user;
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`${API_BASE_URL}/interactions/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId, content }),
      });

      const data = await response.json();
      console.log(JSON.stringify(data,null,2));
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add comment');
      }

      set((state) => ({
        comments: {
          ...state.comments,
          [recipeId]: [{...data.comment,
            user:{
            name:user?.name,
            avatar:user?.avatar}}, ...(state.comments[recipeId]|| [])]
        },
        isLoading: false
      }));

    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  fetchRecipeComments: async (recipeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/interactions/comment/${recipeId}`);
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch comments');
      }

      set((state) => ({
        comments: {
          ...state.comments,
          [recipeId]: data.comments
        },
        isLoading: false
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  updateComment: async (commentId: string, recipeId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Unauthorized");

     const response = await fetch(`${API_BASE_URL}/interactions/comment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update comment');
      }

      set((state) => ({
        comments: {
          ...state.comments,
          [recipeId]: (state.comments[recipeId] || []).map(c => 
            c.id === commentId ? { ...c, content: data.comment.content } : c
          )
        },
        isLoading: false
      }));

    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  deleteComment: async (commentId: string, recipeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`${API_BASE_URL}/interactions/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete comment');
      }

      set((state) => ({
        comments: {
          ...state.comments,
          [recipeId]: (state.comments[recipeId] || []).filter(c => c.id !== commentId)
        },
        isLoading: false
      }));

    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  toggleSave: async (recipe: Recipe) => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`${API_BASE_URL}/interactions/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId: recipe.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle save');
      }
      const isSaved = data.saved;
      
      set((state) => ({
          isLoading: false,
          savedRecipes: isSaved 
            ? [...state.savedRecipes, recipe]
            : state.savedRecipes.filter(r => r.id !== recipe.id)
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  fetchSavedRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Unauthorized");

      const response = await fetch(`${API_BASE_URL}/interactions/save`, {
         headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch saved recipes');
      }
      console.log(JSON.stringify(data,null,2));
      set({ savedRecipes: data.recipes, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },
}));
