import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RecipeCard from '../../components/RecipeCard';
import { useAppTheme } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useInteractionStore } from '../../store/interactionStore';
import { useRecipeStore } from '../../store/recipeStore';

export default function HomeScreen() {
  const { recipes, isLoading, fetchRecipes, error } = useRecipeStore();
  const { fetchSavedRecipes } = useInteractionStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  useEffect(() => {
    fetchRecipes();
    fetchSavedRecipes();
  }, []);

  const onRefresh = async () => {
    await fetchRecipes();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.greeting, { color: theme.text }]}>Hello, {user?.name?.split(' ')[0] || 'Chef'} 👋</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>What do you want to cook today?</Text>
      </View>
      {user?.avatar ? (
        <View style={styles.avatarPlaceholder}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        </View>
      ) : null}
    </View>
  );

  if (isLoading && recipes.length === 0) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={theme.tint} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={64} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No recipes found.</Text>
              <Text style={[styles.emptySubtext, { color: theme.subtext }]}>Be the first to share your culinary masterpiece!</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  }
});
