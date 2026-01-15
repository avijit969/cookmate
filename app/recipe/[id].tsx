import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Keyboard, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useAppTheme } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useInteractionStore } from '../../store/interactionStore';
import { useRecipeStore } from '../../store/recipeStore';
import { useAlertStore } from '../../store/alertStore';
import { timeAgo } from '../../utils/timeAgo';

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
        savedRecipes,
        updateComment,
        deleteComment,
        userLikes,
        fetchRecipeLikes
    } = useInteractionStore();
    const { user } = useAuthStore();
    const alert = useAlertStore();

    const theme = useAppTheme();
    const [commentText, setCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

    // Bottom Sheet
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['50%', '90%'], []);

    const handleOpenComments = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    const isSaved = savedRecipes.some(r => r.id === (typeof id === 'string' ? id : ''));
    const currentComments = id && typeof id === 'string' ? (comments[id] || []) : [];

    useEffect(() => {
        if (id && typeof id === 'string') {
            fetchRecipeById(id);
            fetchRecipeComments(id);
            fetchRecipeLikes(id);
        }
    }, [id]);

    const handleSubmitComment = async () => {
        if (!commentText.trim() || typeof id !== 'string') return;
        try {
            if (editingCommentId) {
                await updateComment(editingCommentId, id, commentText);
                setEditingCommentId(null);
            } else {
                await addComment(id, commentText);
            }
            setCommentText('');
            Keyboard.dismiss();
        } catch (e) {
            // Error handled in store
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (typeof id !== 'string') return;
        try {
            await deleteComment(commentId, id);
        } catch (e) {
            // Error handled in store
        }
    };

    const handleEditComment = (comment: any) => {
        setEditingCommentId(comment.id);
        setCommentText(comment.content);
        // Focus input (optional, requires ref)
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setCommentText('');
        Keyboard.dismiss();
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
                                onPress={() => { if (typeof id === 'string') toggleLike(id); }}
                                style={styles.actionBtn}
                            >
                                <Ionicons
                                    name={(userLikes[String(id)] ?? currentRecipe.isLiked) ? "heart" : "heart-outline"}
                                    size={28}
                                    color={(userLikes[String(id)] ?? currentRecipe.isLiked) ? theme.tint : "#fff"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { if (currentRecipe) toggleSave(currentRecipe); }}
                                style={styles.actionBtn}
                            >
                                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={28} color={isSaved ? theme.tint : "#fff"} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleOpenComments}>
                                <Ionicons name="chatbubble-outline" size={28} color="#fff" />
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

                    <TouchableOpacity style={styles.section} onPress={handleOpenComments}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.sectionTitle, { color: theme.text, borderLeftWidth: 0, paddingLeft: 0, marginBottom: 8 }]}>
                                Comments <Text style={{ fontSize: 16, color: theme.subtext, fontWeight: 'normal' }}>{currentComments.length}</Text>
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
                        </View>

                        {/* Preview First Comment */}
                        {currentComments.length > 0 ? (
                            <View style={[styles.commentPreview, { backgroundColor: theme.inputBg }]}>
                                <View style={styles.commentHeaderPreview}>
                                    {currentComments[0].user?.avatar ? (
                                        <Image source={{ uri: currentComments[0].user.avatar }} style={styles.previewAvatar} />
                                    ) : (
                                        <View style={[styles.previewAvatar, { backgroundColor: theme.subtext }]}>
                                            <Text style={{ color: '#fff', fontSize: 10 }}>{currentComments[0].user?.name?.[0]}</Text>
                                        </View>
                                    )}
                                    <Text style={[styles.commentPreviewText, { color: theme.text }]} numberOfLines={1}>
                                        {currentComments[0].content}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={{ color: theme.subtext }}>No comments yet. Tap to add one.</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                backgroundStyle={{ backgroundColor: theme.card }}
                handleIndicatorStyle={{ backgroundColor: theme.subtext }}
                keyboardBehavior="interactive" // Helps with keyboard handling
                android_keyboardInputMode="adjustResize"
            >
                <View style={[styles.bottomSheetHeader, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.bottomSheetTitle, { color: theme.text }]}>Comments ({currentComments.length})</Text>
                </View>

                <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
                    {/* Add Comment Input */}
                    <View style={styles.addCommentContainer}>
                        {user?.avatar ? (
                            <Image source={{ uri: user.avatar }} style={styles.currentUserAvatar} />
                        ) : (
                            <View style={[styles.currentUserAvatar, { backgroundColor: theme.tint }]}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
                            </View>
                        )}
                        <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg }]}>
                            <BottomSheetTextInput
                                style={[styles.commentInput, { color: theme.text }]}
                                placeholder="Add a comment..."
                                placeholderTextColor={theme.subtext}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                            />
                            {commentText.trim().length > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} >
                                    {editingCommentId && (
                                        <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                                            <Ionicons name="close-circle" size={24} color={theme.subtext} />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={() => { handleSubmitComment(); Keyboard.dismiss(); }} style={styles.sendButton}>
                                        <Ionicons name={editingCommentId ? "checkmark-circle" : "send"} size={editingCommentId ? 24 : 20} color={theme.tint} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.commentsList}>
                        {currentComments.map((comment) => (
                            <View key={comment.id} style={styles.commentItem}>
                                {comment.user?.avatar ? (
                                    <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
                                ) : (
                                    <View style={[styles.commentAvatar, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Ionicons name="person" size={12} color="#fff" />
                                    </View>
                                )}
                                <View style={styles.commentContentWrapper}>
                                    <View style={styles.commentHeader}>
                                        <Text style={[styles.commentUser, { color: theme.subtext }]}>
                                            {comment.user?.name || 'User'}
                                            <Text style={[styles.commentDate, { color: theme.subtext }]}> • {timeAgo(comment.createdAt)}</Text>
                                        </Text>
                                        {user?.name === comment.user?.name! && (
                                            <View style={styles.commentActions}>
                                                <TouchableOpacity onPress={() => handleEditComment(comment)} style={styles.commentActionBtn}>
                                                    <Ionicons name="pencil" size={16} color={theme.subtext} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => {
                                                    alert.show({
                                                        title: "Delete Comment",
                                                        message: "Are you sure you want to delete this comment?",
                                                        type: "warning",
                                                        confirmText: "Delete",
                                                        cancelText: "Cancel",
                                                        onConfirm: () => handleDeleteComment(comment.id)
                                                    });
                                                }} style={styles.commentActionBtn}>
                                                    <Ionicons name="trash" size={16} color={theme.subtext} />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.commentContent, { color: theme.text }]}>{comment.content}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </BottomSheetScrollView>
            </BottomSheet>
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
        bottom: 34,
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
        gap: 20,
    },
    commentItem: {
        flexDirection: 'row',
        gap: 12,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    commentContentWrapper: {
        flex: 1,
    },
    commentUser: {
        fontWeight: '600',
        fontSize: 13,
        marginBottom: 4,
    },
    commentDate: {
        fontSize: 12,
        fontWeight: '400',
    },
    commentContent: {
        fontSize: 14,
        lineHeight: 20,
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 24,
    },
    currentUserAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    commentInput: {
        flex: 1,
        fontSize: 14,
        minHeight: 36,
        paddingVertical: 8,
    },
    sendButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // New Styles for Review/BottomSheet
    commentPreview: {
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
    },
    commentHeaderPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    previewAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentPreviewText: {
        flex: 1,
        fontSize: 14,
    },
    bottomSheetHeader: {
        padding: 16,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bottomSheetContent: {
        padding: 16,
    },
    cancelButton: {
        padding: 4,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentActions: {
        flexDirection: 'row',
        gap: 12,
    },
    commentActionBtn: {
        padding: 4,
    },
});
