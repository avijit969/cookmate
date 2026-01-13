import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function VerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { verify, isLoading } = useAuthStore();

    const [token, setToken] = useState('');

    const handleVerify = async () => {
        if (!token) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }

        try {
            await verify(token);
            Alert.alert('Success', 'Account verified!', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') }
            ]);
        } catch (error: any) {
            Alert.alert('Verification Failed', error.message || 'Invalid code');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark-outline" size={80} color="#F59E0B" />
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Verification</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to {params.email || 'your email'}
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="keypad-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="123456"
                            placeholderTextColor="#999"
                            value={token}
                            onChangeText={setToken}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
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
        backgroundColor: '#fff',
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
        backgroundColor: '#f5f5f5',
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
        backgroundColor: '#FFF8E1',
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
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
        height: 56,
        borderWidth: 1,
        borderColor: '#eee',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 20, // Larger font for code
        color: '#333',
        letterSpacing: 4, // Spacing for code
    },
    button: {
        backgroundColor: '#F59E0B',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F59E0B',
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
