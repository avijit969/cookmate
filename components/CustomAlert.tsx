import { Feather } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useAppTheme } from '../constants/Colors';
import { useAlertStore } from '../store/alertStore';

const { width } = Dimensions.get('window');

const CustomAlert = () => {
    const {
        isVisible,
        type,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
        hide
    } = useAlertStore();

    const theme = useAppTheme();

    // Animations
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
        if (isVisible) {
            opacity.value = withTiming(1, { duration: 200 });
            scale.value = withSpring(1, { damping: 15 });
        } else {
            opacity.value = withTiming(0, { duration: 150 });
            scale.value = withTiming(0.8, { duration: 150 });
        }
    }, [isVisible]);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handleConfirm = async () => {
        if (onConfirm) {
            await onConfirm();
        }
        hide();
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        hide();
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <Feather name="check-circle" size={48} color={theme.tint} />;
            case 'error':
                return <Feather name="x-circle" size={48} color={theme.danger} />;
            case 'warning':
                return <Feather name="alert-triangle" size={48} color="#FFD700" />; // Gold
            case 'info':
            default:
                return <Feather name="info" size={48} color={theme.text} />;
        }
    };

    if (!isVisible && opacity.value === 0) return null;

    return (
        <Modal transparent visible={isVisible} animationType="none" onRequestClose={handleCancel}>
            <View style={styles.overlayWrapper}>
                <TouchableWithoutFeedback onPress={cancelText ? handleCancel : undefined}>
                    <Animated.View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }, overlayStyle]} />
                </TouchableWithoutFeedback>

                <View style={styles.centeredView}>
                    <Animated.View
                        style={[
                            styles.modalView,
                            {
                                backgroundColor: theme.card,
                                borderColor: theme.border,
                                borderWidth: 1
                            },
                            containerStyle
                        ]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: theme.inputBg }]}>
                            {getIcon()}
                        </View>

                        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                        <Text style={[styles.message, { color: theme.subtext }]}>{message}</Text>

                        <View style={styles.buttonContainer}>
                            {cancelText && (
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
                                    onPress={handleCancel}
                                >
                                    <Text style={[styles.buttonText, { color: theme.text }]}>{cancelText}</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton, { backgroundColor: theme.tint, flex: cancelText ? 1 : 0, width: cancelText ? undefined : '100%' }]}
                                onPress={handleConfirm}
                            >
                                <Text style={[styles.buttonText, { color: '#fff' }]}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlayWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    centeredView: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 20,
    },
    modalView: {
        width: width * 0.85,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        justifyContent: 'center',
    },
    button: {
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 24,
        elevation: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    confirmButton: {
        // Flex is handled dynamically
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomAlert;
