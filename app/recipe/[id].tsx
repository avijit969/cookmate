import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useInteractionStore } from '../../store/interactionStore';
import { useRecipeStore } from '../../store/recipeStore';

const { width } = Dimensions.get('window');

export default function RecipeDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { currentRecipe, isLoading, fetchRecipeById, error } = useRecipeStore();
    const {
        comments,
        addComment,
        fetchRecipeComments,
        toggleLike,
        toggleSave,
        savedRecipes
    } = useInteractionStore();
    const { user } = useAuthStore();

    const theme = useAppTheme();
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(false);

    const isSaved = savedRecipes.some(r => r.id === (typeof id === 'string' ? id : ''));
    const currentComments = id && typeof id === 'string' ? (comments[id] || []) : [];

    useEffect(() => {
        if (id && typeof id === 'string') {
            fetchRecipeById(id);
            fetchRecipeComments(id);
        }
    }, [id]);

    const handleSubmitComment = async () => {
        if (!commentText.trim() || typeof id !== 'string') return;
        try {
            await addComment(id, commentText);
            setCommentText('');
        } catch (e) {
            // Error handled in store
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    if (error || !currentRecipe) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ headerShown: true, headerTitle: '', headerTransparent: true, headerTintColor: theme.text }} />
                <Ionicons name="alert-circle-outline" size={64} color={theme.subtext} />
                <Text style={{ color: theme.text, fontSize: 18, marginTop: 16 }}>
                    {error || "Recipe not found"}
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 10 }}>
                    <Text style={{ color: theme.tint, fontSize: 16 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
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

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                onPress={() => { if (typeof id === 'string') { toggleLike(id); setIsLiked(!isLiked); } }}
                                style={styles.actionBtn}
                            >
                                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? theme.tint : "#fff"} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { if (typeof id === 'string') toggleSave(id); }}
                                style={styles.actionBtn}
                            >
                                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={28} color={isSaved ? theme.tint : "#fff"} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => {
                                if (currentRecipe) {
                                    Share.share({
                                        message: `Check out this recipe: ${currentRecipe.title}`,
                                        title: currentRecipe.title
                                    });
                                }
                            }}>
                                <Ionicons name="share-social-outline" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <Text style={[styles.description, { color: theme.subtext }]}>{currentRecipe.description}</Text>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text, borderLeftColor: theme.tint }]}>Ingredients</Text>
                        <View style={styles.ingredientsList}>
                            {currentRecipe.ingredients.map((ing, index) => (
                                <View key={index} style={styles.ingredientItem}>
                                    <View style={[styles.bullet, { backgroundColor: theme.tint }]} />
                                    <Text style={[styles.ingredientText, { color: theme.text }]}>
                                        <Text style={styles.bold}>{ing.quantity} {ing.unit} </Text>
                                        {ing.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text, borderLeftColor: theme.tint }]}>Instructions</Text>
                        <Text style={[styles.instructionsText, { color: theme.text }]}>{currentRecipe.instructions}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text, borderLeftColor: theme.tint }]}>Comments</Text>
                        <View style={styles.commentsList}>
                            {currentComments.map((comment) => (
                                <View key={comment.id} style={[styles.commentItem, { backgroundColor: theme.inputBg }]}>
                                    <View style={styles.commentHeader}>
                                        {comment.user?.avatar ? (
                                            <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
                                        ) : (
                                            <View style={[styles.commentAvatar, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                                                <Ionicons name="person" size={12} color="#fff" />
                                            </View>
                                        )}
                                        <Text style={[styles.commentUser, { color: theme.text }]}>{comment.user?.name || 'User'}</Text>
                                        <Text style={[styles.commentDate, { color: theme.subtext }]}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={[styles.commentContent, { color: theme.text }]}>{comment.content}</Text>
                                </View>
                            ))}
                            {currentComments.length === 0 && (
                                <Text style={{ color: theme.subtext, fontStyle: 'italic' }}>No comments yet. Be the first!</Text>
                            )}
                        </View>

                        <View style={styles.addCommentContainer}>
                            <TextInput
                                style={[styles.commentInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                                placeholder="Add a comment..."
                                placeholderTextColor={theme.subtext}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                            />
                            <TouchableOpacity onPress={handleSubmitComment} style={[styles.sendButton, { backgroundColor: theme.tint }]}>
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32, // Overlap the image slightly
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        borderLeftWidth: 4,
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
        marginRight: 12,
    },
    ingredientText: {
        fontSize: 16,
    },
    bold: {
        fontWeight: 'bold',
    },
    instructionsText: {
        fontSize: 16,
        lineHeight: 28,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 20,
    },
    actionBtn: {
        padding: 4,
    },
    commentsList: {
        marginBottom: 16,
        gap: 12,
    },
    commentItem: {
        padding: 12,
        borderRadius: 12,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    commentUser: {
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 8,
    },
    commentDate: {
        fontSize: 12,
        marginLeft: 'auto',
    },
    commentContent: {
        fontSize: 14,
        lineHeight: 20,
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    commentInput: {
        flex: 1,
        padding: 12,
        borderRadius: 24,
        fontSize: 14,
        minHeight: 48,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
