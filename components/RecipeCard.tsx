import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../constants/Colors';
import { Recipe } from '../store/recipeStore';

interface RecipeCardProps {
    recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const router = useRouter();
    const theme = useAppTheme();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
        >
            <Image source={recipe.image} style={styles.image} contentFit="cover" transition={1000} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{recipe.title}</Text>
                    {/* You could add a save/heart button here */}
                </View>

                <Text style={[styles.description, { color: theme.subtext }]} numberOfLines={2}>
                    {recipe.description}
                </Text>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <View style={styles.userInfo}>
                        {recipe.createdBy?.avatar ? (
                            <Image source={{ uri: recipe.createdBy.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar, { backgroundColor: theme.inputBg }]}>
                                <Ionicons name="person" size={12} color={theme.icon} />
                            </View>
                        )}
                        <Text style={[styles.userName, { color: theme.subtext }]}>{recipe.createdBy?.name || 'Unknown Chef'}</Text>
                    </View>

                    <View style={styles.stats}>
                        {/* Example stats */}
                        <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={14} color={theme.icon} />
                            <Text style={[styles.statText, { color: theme.subtext }]}>20m</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        // Elevation can be subtle or removed in dark mode preference, but keeping simple for now
    },
    image: {
        width: '100%',
        height: 200,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 12,
        fontWeight: '600',
    },
    stats: {
        flexDirection: 'row',
        gap: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
    }
});
