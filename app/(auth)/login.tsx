import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
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
import { useAppTheme } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';

import { useAlertStore } from '../../store/alertStore';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();
    const theme = useAppTheme();
    const alert = useAlertStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            alert.show({ type: 'error', title: 'Error', message: 'Please fill in all fields' });
            return;
        }

        try {
            await login({ email, password });
            router.replace('/(tabs)');
        } catch (error: any) {
            alert.show({ type: 'error', title: 'Login Failed', message: error.message || 'Something went wrong' });
        }
    };

    const inputStyle = [styles.input, { color: theme.text }];
    const inputContainerStyle = [styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="restaurant" size={64} color={theme.tint} />
                    <Text style={[styles.title, { color: theme.text }]}>CookMate</Text>
                    <Text style={[styles.subtitle, { color: theme.subtext }]}>Welcome back, Chef!</Text>
                </View>

                <View style={styles.form}>
                    <View style={inputContainerStyle}>
                        <Ionicons name="mail-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                        <TextInput
                            style={inputStyle}
                            placeholder="Email Address"
                            placeholderTextColor={theme.subtext}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={inputContainerStyle}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                        <TextInput
                            style={inputStyle}
                            placeholder="Password"
                            placeholderTextColor={theme.subtext}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.subtext }]}>Don't have an account? </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.linkText, { color: theme.tint }]}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 8,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        height: 56,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    loginButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
