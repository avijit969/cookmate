import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { useRecipeStore } from '../../store/recipeStore';

export default function CreateRecipeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { createRecipe, isLoading } = useRecipeStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [image, setImage] = useState(''); // Text input for URL
    const [ingredients, setIngredients] = useState([
        { name: '', quantity: '', unit: '', type: 'Other' }
    ]);

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
        if (!title || !description || !instructions || !image) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        // Validate ingredients
        const validIngredients = ingredients.filter(i => i.name && i.quantity);
        if (validIngredients.length === 0) {
            Alert.alert('Error', 'Please add at least one ingredient');
            return;
        }

        try {
            await createRecipe({
                title,
                description,
                instructions,
                image,
                ingredients: validIngredients
            });
            Alert.alert('Success', 'Recipe created successfully!');
            router.push('/(tabs)');
            setTitle('');
            setDescription('');
            setInstructions('');
            setImage('');
            setIngredients([{ name: '', quantity: '', unit: '', type: 'Other' }]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create recipe');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Create New Recipe</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Recipe Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Grandma's Apple Pie"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Image URL</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="https://example.com/image.jpg"
                            value={image}
                            onChangeText={setImage}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tell us about this dish..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.label}>Ingredients</Text>
                            <TouchableOpacity onPress={addIngredient} style={styles.addButtonSmall}>
                                <Ionicons name="add" size={18} color="#fff" />
                                <Text style={styles.addButtonSmallText}>Add</Text>
                            </TouchableOpacity>
                        </View>

                        {ingredients.map((ing, index) => (
                            <View key={index} style={styles.ingredientRow}>
                                <TextInput
                                    style={[styles.input, styles.ingInputMain]}
                                    placeholder="Ingredient"
                                    value={ing.name}
                                    onChangeText={(t) => updateIngredient(index, 'name', t)}
                                />
                                <TextInput
                                    style={[styles.input, styles.ingInputQty]}
                                    placeholder="Qty"
                                    value={ing.quantity}
                                    onChangeText={(t) => updateIngredient(index, 'quantity', t)}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={[styles.input, styles.ingInputUnit]}
                                    placeholder="Unit"
                                    value={ing.unit}
                                    onChangeText={(t) => updateIngredient(index, 'unit', t)}
                                />
                                {ingredients.length > 1 && (
                                    <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeBtn}>
                                        <Ionicons name="trash-outline" size={20} color="#FF5252" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Instructions</Text>
                        <TextInput
                            style={[styles.input, styles.textAreaLarge]}
                            placeholder="Step by step instructions..."
                            value={instructions}
                            onChangeText={setInstructions}
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
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
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
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
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#333',
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
        backgroundColor: '#F59E0B',
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
        backgroundColor: '#1a1a1a',
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
});
