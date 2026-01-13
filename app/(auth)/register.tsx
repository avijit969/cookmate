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
    View
} from 'react-native';
import { useAppTheme } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';

import { useAlertStore } from '../../store/alertStore';

export default function RegisterScreen() {
    const router = useRouter();
    const { register, isLoading } = useAuthStore();
    const theme = useAppTheme();
    const alert = useAlertStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (!name || !email || !password) {
            alert.show({ type: 'error', title: 'Error', message: 'Please fill in all fields' });
            return;
        }

        try {
            await register({ name, email, password });
            router.push({ pathname: '/(auth)/verify', params: { email } });
        } catch (error: any) {
            console.log(error);
            alert.show({ type: 'error', title: 'Registration Failed', message: error.message || 'Something went wrong' });
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
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: theme.subtext }]}>Start your culinary journey!</Text>
                </View>

                <View style={styles.form}>
                    <View style={inputContainerStyle}>
                        <Ionicons name="person-outline" size={20} color={theme.icon} style={styles.inputIcon} />
                        <TextInput
                            style={inputStyle}
                            placeholder="Full Name"
                            placeholderTextColor={theme.subtext}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

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
                        style={[styles.button, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.subtext }]}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.linkText, { color: theme.tint }]}>Sign In</Text>
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
        justifyContent: 'center',
    },
    titleContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
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
    button: {
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
    buttonText: {
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
