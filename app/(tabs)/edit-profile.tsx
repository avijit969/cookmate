import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../constants/Colors';
import { useAlertStore } from '../../store/alertStore';
import { useAuthStore } from '../../store/authStore';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateProfile, isLoading } = useAuthStore();
    const alert = useAlertStore();
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();

    const [name, setName] = useState(user?.name || '');

    const handleSave = async () => {
        if (!name.trim()) {
            alert.show({
                type: 'error',
                title: 'Error',
                message: 'Name cannot be empty'
            });
            return;
        }

        if (name.trim() === user?.name) {
            router.back();
            return;
        }

        try {
            await updateProfile({ name: name.trim() });
            alert.show({
                type: 'success',
                title: 'Success',
                message: 'Profile updated successfully!'
            });
            router.back();
        } catch (error: any) {
            alert.show({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to update profile'
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.subtext }]}>Full Name</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                            <Feather name="user" size={20} color={theme.icon} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Enter your name"
                                placeholderTextColor={theme.subtext}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                autoFocus
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.subtext }]}>Email Address</Text>
                        <View style={[styles.inputContainer, styles.disabledInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Feather name="mail" size={20} color={theme.icon} style={styles.inputIcon} />
                            <Text style={[styles.inputText, { color: theme.subtext }]}>{user?.email || 'user@example.com'}</Text>
                            <Feather name="lock" size={16} color={theme.subtext} />
                        </View>
                        <Text style={[styles.hint, { color: theme.subtext }]}>Email cannot be changed</Text>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.tint }]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Feather name="check" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
    form: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
    },
    disabledInput: {
        opacity: 0.7,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginBottom: 32,
        height: 56,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
