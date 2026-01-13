import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRecipeStore } from '../../store/recipeStore';

const { width } = Dimensions.get('window');

export default function RecipeDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { currentRecipe, isLoading, fetchRecipeById } = useRecipeStore();

    useEffect(() => {
        if (id && typeof id === 'string') {
            fetchRecipeById(id);
        }
    }, [id]);

    if (isLoading || !currentRecipe) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#F59E0B" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTransparent: true,
                headerTitle: '',
                headerTintColor: '#fff',
                headerLeft: () => (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView style={styles.scrollView} bounces={false}>
                <View style={styles.imageContainer}>
                    <Image
                        source={currentRecipe.image}
                        style={styles.image}
                        contentFit="cover"
                        transition={1000}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.gradient}
                    />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{currentRecipe.title}</Text>
                        <View style={styles.metaRow}>
                            {currentRecipe.createdBy?.name && (
                                <View style={styles.authorBadge}>
                                    <Ionicons name="person-circle-outline" size={16} color="#ddd" />
                                    <Text style={styles.authorName}>{currentRecipe.createdBy.name}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.description}>{currentRecipe.description}</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        <View style={styles.ingredientsList}>
                            {currentRecipe.ingredients.map((ing, index) => (
                                <View key={index} style={styles.ingredientItem}>
                                    <View style={styles.bullet} />
                                    <Text style={styles.ingredientText}>
                                        <Text style={styles.bold}>{ing.quantity} {ing.unit} </Text>
                                        {ing.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Instructions</Text>
                        <Text style={styles.instructionsText}>{currentRecipe.instructions}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        height: 350,
        width: width,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginTop: 8,
    },
    titleContainer: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    authorName: {
        color: '#ddd',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        padding: 24,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32, // Overlap the image slightly
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 32,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
        paddingLeft: 12,
    },
    ingredientsList: {
        gap: 12,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F59E0B',
        marginRight: 12,
    },
    ingredientText: {
        fontSize: 16,
        color: '#444',
    },
    bold: {
        fontWeight: 'bold',
    },
    instructionsText: {
        fontSize: 16,
        color: '#444',
        lineHeight: 28,
    },
});
