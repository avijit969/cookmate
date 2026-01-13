import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAppTheme } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';

import { useAlertStore } from '../../store/alertStore';

export default function VerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { verify, isLoading } = useAuthStore();
    const theme = useAppTheme();
    const alert = useAlertStore();

    const [token, setToken] = useState('');

    const handleVerify = async () => {
        if (!token) {
            alert.show({ type: 'error', title: 'Error', message: 'Please enter the verification code' });
            return;
        }

        try {
            await verify(token);
            alert.show({
                type: 'success',
                title: 'Success',
                message: 'Account verified!',
                onConfirm: () => router.replace('/(auth)/login')
            });
        } catch (error: any) {
            alert.show({ type: 'error', title: 'Verification Failed', message: error.message || 'Invalid code' });
        }
    };

    const inputStyle = [styles.input, { color: theme.text }];
    const inputContainerStyle = [styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.inputBg }]}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: theme.inputBg }]}>
                    <Ionicons name="shield-checkmark-outline" size={80} color={theme.tint} />
                </View>

                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Verification</Text>
                    <Text style={[styles.subtitle, { color: theme.subtext }]}>
                        Enter the 6-digit code sent to {params.email || 'your email'}
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={inputContainerStyle}>
                        <Ionicons name="keypad-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                        <TextInput
                            style={inputStyle}
                            placeholder="123456"
                            placeholderTextColor={theme.subtext}
                            value={token}
                            onChangeText={setToken}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Verify Account</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center', // Center content horizontally
        paddingTop: 40,
    },
    iconContainer: {
        marginBottom: 32,
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
        height: 56,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 20, // Larger font for code
        letterSpacing: 4, // Spacing for code
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
