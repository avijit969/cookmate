import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../constants/Colors';
import { useRecipeStore } from '../../store/recipeStore';
import { uploadImage } from '../../utils/imageUploader';

import { useAlertStore } from '../../store/alertStore';

export default function CreateRecipeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { createRecipe, isLoading } = useRecipeStore();
    const theme = useAppTheme();
    const alert = useAlertStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [image, setImage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [ingredients, setIngredients] = useState([
        { name: '', quantity: '', unit: '', type: 'Other' }
    ]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0].uri) {
                setIsUploading(true);
                try {
                    const url = await uploadImage(result.assets[0].uri);
                    setImage(url);
                } catch (error: any) {
                    alert.show({
                        type: 'error',
                        title: 'Upload Error',
                        message: error.message
                    });
                } finally {
                    setIsUploading(false);
                }
            }
        } catch (error) {
            alert.show({ type: 'error', title: 'Error', message: 'Failed to pick image' });
        }
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: '', unit: '', type: 'Other' }]);
    };

    const removeIngredient = (index: number) => {
        const newIngredients = [...ingredients];
        newIngredients.splice(index, 1);
        setIngredients(newIngredients);
    };

    const updateIngredient = (index: number, field: string, value: string) => {
        const newIngredients = [...ingredients];
        // @ts-ignore
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const handleCreate = async () => {
        console.log('handleCreate');
        if (!title || !description || !instructions || !image) {
            alert.show({ type: 'error', title: 'Error', message: 'Please fill in all required fields' });
            return;
        }

        // Validate ingredients
        const validIngredients = ingredients.filter(i => i.name && i.quantity);
        if (validIngredients.length === 0) {
            alert.show({ type: 'error', title: 'Error', message: 'Please add at least one ingredient' });
            return;
        }

        try {
            await createRecipe({
                title,
                description,
                instructions: instructions.split('\n'),
                image,
                ingredients: validIngredients
            });
            alert.show({
                type: 'success',
                title: 'Success',
                message: 'Recipe created successfully!',
                onConfirm: () => {
                    router.push('/(tabs)');
                    setTitle('');
                    setDescription('');
                    setInstructions('');
                    setImage('');
                    setIngredients([{ name: '', quantity: '', unit: '', type: 'Other' }]);
                }
            });
        } catch (error: any) {
            alert.show({ type: 'error', title: 'Error', message: error.message || 'Failed to create recipe' });
        }
    };

    const inputStyle = [styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }];

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Create New Recipe</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.formSection}>
                        <Text style={[styles.label, { color: theme.text }]}>Recipe Title</Text>
                        <TextInput
                            style={inputStyle}
                            placeholder="e.g. Grandma's Apple Pie"
                            placeholderTextColor={theme.subtext}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={[styles.label, { color: theme.text }]}>Recipe Image</Text>
                        <TouchableOpacity
                            style={[
                                styles.imagePicker,
                                { borderColor: theme.border, backgroundColor: theme.inputBg }
                            ]}
                            onPress={pickImage}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator color={theme.tint} />
                            ) : image ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: image }} style={styles.imagePreview} />
                                    <View style={styles.editIconOverlay}>
                                        <Ionicons name="pencil" size={16} color="#fff" />
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.placeholderContainer}>
                                    <Ionicons name="image-outline" size={40} color={theme.subtext} />
                                    <Text style={[styles.placeholderText, { color: theme.subtext }]}>Tap to upload cover image</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                        <TextInput
                            style={[inputStyle, styles.textArea]}
                            placeholder="Tell us about this dish..."
                            placeholderTextColor={theme.subtext}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.label, { color: theme.text }]}>Ingredients</Text>
                            <TouchableOpacity onPress={addIngredient} style={[styles.addButtonSmall, { backgroundColor: theme.tint }]}>
                                <Ionicons name="add" size={18} color="#fff" />
                                <Text style={styles.addButtonSmallText}>Add</Text>
                            </TouchableOpacity>
                        </View>

                        {ingredients.map((ing, index) => (
                            <View key={index} style={styles.ingredientRow}>
                                <TextInput
                                    style={[inputStyle, styles.ingInputMain]}
                                    placeholder="Ingredient"
                                    placeholderTextColor={theme.subtext}
                                    value={ing.name}
                                    onChangeText={(t) => updateIngredient(index, 'name', t)}
                                />
                                <TextInput
                                    style={[inputStyle, styles.ingInputQty]}
                                    placeholder="Qty"
                                    placeholderTextColor={theme.subtext}
                                    value={ing.quantity}
                                    onChangeText={(t) => updateIngredient(index, 'quantity', t)}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={[inputStyle, styles.ingInputUnit]}
                                    placeholder="Unit"
                                    placeholderTextColor={theme.subtext}
                                    value={ing.unit}
                                    onChangeText={(t) => updateIngredient(index, 'unit', t)}
                                />
                                {ingredients.length > 1 && (
                                    <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeBtn}>
                                        <Ionicons name="trash-outline" size={20} color={theme.danger} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={styles.formSection}>
                        <Text style={[styles.label, { color: theme.text }]}>Instructions</Text>
                        <TextInput
                            style={[inputStyle, styles.textAreaLarge]}
                            placeholder="Step by step instructions..."
                            placeholderTextColor={theme.subtext}
                            value={instructions}
                            onChangeText={setInstructions}
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.tint }]} // Use tint color for CTA
                        onPress={handleCreate}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Publish Recipe</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formSection: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    textAreaLarge: {
        height: 150,
        textAlignVertical: 'top',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addButtonSmallText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
        marginLeft: 4,
    },
    ingredientRow: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 8,
    },
    ingInputMain: {
        flex: 2,
    },
    ingInputQty: {
        flex: 1,
    },
    ingInputUnit: {
        flex: 1,
    },
    removeBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    imagePicker: {
        height: 200,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 14,
    },
    imagePreviewContainer: {
        width: '100%',
        height: '100%',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editIconOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 20,
    },
});
