import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    Platform
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RecipeCard from '../../components/RecipeCard';
import { useAppTheme } from '../../constants/Colors';
import { useRecipeStore } from '../../store/recipeStore';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const ExploreHeader = ({ theme, query, setQuery }: { theme: any, query: string, setQuery: (text: string) => void }) => (
    <View style={styles.headerContainer}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <Text style={[styles.pageTitle, { color: theme.text }]}>
                Discover
            </Text>
            <Text style={[styles.pageSubtitle, { color: theme.subtext }]}>
                Find your next favorite meal
            </Text>
        </Animated.View>

        <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
            <Ionicons name="search" size={20} color={theme.icon} style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search recipes, ingredients..."
                placeholderTextColor={theme.subtext}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
            />
            {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                    <Ionicons name="close-circle" size={20} color={theme.subtext} />
                </TouchableOpacity>
            )}
        </Animated.View>

        {query.trim().length === 0 && (
            <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.categoriesSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Now</Text>
            </Animated.View>
        )}
    </View>
);

export default function ExploreScreen() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {
        recipes,
        searchResults,
        searchRecipes,
        fetchRecipes,
        isLoading,
        isSearching,
        clearSearchResults
    } = useRecipeStore();

    const [query, setQuery] = useState('');

    // Effect handles debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.trim().length > 0) {
                searchRecipes(query);
            } else {
                clearSearchResults();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query, searchRecipes, clearSearchResults]);

    // Initial fetch for trending/feed
    useEffect(() => {
        fetchRecipes();
    }, []);

    const onRefresh = async () => {
        setQuery('');
        clearSearchResults();
        await fetchRecipes();
    };

    const dataToDisplay = query.trim().length > 0 ? searchResults : recipes;
    const isListLoading = query.trim().length > 0 ? isSearching : isLoading;

    // Separate empty state to avoid inline definition re-renders if complex, though not strictly necessary for keyboard issue
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            {!isListLoading && (
                <>
                    <Ionicons name="search-outline" size={64} color={theme.icon} opacity={0.5} />
                    <Text style={[styles.emptyText, { color: theme.subtext }]}>
                        {query.length > 0 ? `No results for "${query}"` : "Start exploring amazing recipes!"}
                    </Text>
                </>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Background Gradient Accent */}
            <LinearGradient
                colors={[theme.tint + '20', 'transparent']} // 20 hex = 12% opacity
                style={[styles.backgroundGradient, { paddingTop: insets.top }]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.3 }}
                pointerEvents="none"
            />

            <FlatList
                data={dataToDisplay}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Animated.View
                        entering={FadeInDown.delay(index * 100).springify()}
                        style={styles.cardWrapper}
                    >
                        <RecipeCard recipe={item} />
                    </Animated.View>
                )}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingTop: insets.top + 20 }
                ]}
                ListHeaderComponent={<ExploreHeader theme={theme} query={query} setQuery={setQuery} />}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={theme.tint} />
                }
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    headerContainer: {
        marginBottom: 24,
    },
    pageTitle: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 16,
        marginBottom: 24,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    categoriesSection: {
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    cardWrapper: {
        marginBottom: 0, // RecipeCard has its own bottom margin, but we might want to override or handle it.
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
});
