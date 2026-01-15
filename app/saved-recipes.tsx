import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { useAppTheme } from '../constants/Colors';
import { useInteractionStore } from '../store/interactionStore';

export default function SavedRecipesScreen() {
    const { savedRecipes, isLoading, fetchSavedRecipes } = useInteractionStore();
    const router = useRouter();
    const theme = useAppTheme();

    useEffect(() => {
        fetchSavedRecipes();
    }, []);

    const onRefresh = async () => {
        await fetchSavedRecipes();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: "Saved Recipes",
                    headerShown: true,
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                    headerLeft: () => (
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={theme.text}
                            onPress={() => router.back()}
                            style={{ marginRight: 16 }}
                        />
                    ),
                }}
            />

            {isLoading && savedRecipes.length === 0 ? (
                <View style={[styles.center, { flex: 1 }]}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    data={savedRecipes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <RecipeCard recipe={item} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={theme.tint} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bookmark-outline" size={64} color={theme.icon} />
                            <Text style={[styles.emptyText, { color: theme.text }]}>No saved recipes yet.</Text>
                            <Text style={[styles.emptySubtext, { color: theme.subtext }]}>
                                Save recipes you love to cook them later!
                            </Text>
                        </View>
                    }
                />
            )}
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
        paddingBottom: 40,
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
