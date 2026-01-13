import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Recipe } from '../store/recipeStore';

interface RecipeCardProps {
    recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
        >
            <Image source={recipe.image} style={styles.image} contentFit="cover" transition={1000} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>{recipe.title}</Text>
                    {/* You could add a save/heart button here */}
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {recipe.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.userInfo}>
                        {recipe.createdBy?.avatar ? (
                            <Image source={{ uri: recipe.createdBy.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Ionicons name="person" size={12} color="#666" />
                            </View>
                        )}
                        <Text style={styles.userName}>{recipe.createdBy?.name || 'Unknown Chef'}</Text>
                    </View>

                    <View style={styles.stats}>
                        {/* Example stats */}
                        <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={14} color="#666" />
                            <Text style={styles.statText}>20m</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
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
        color: '#1a1a1a',
        flex: 1,
    },
    description: {
        fontSize: 14,
        color: '#666',
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
        borderTopColor: '#f5f5f5',
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
        backgroundColor: '#eee',
    },
    placeholderAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#444',
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
        color: '#666',
    }
});
