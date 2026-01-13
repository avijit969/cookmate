import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../constants/Colors';

export default function ExploreScreen() {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            <View style={styles.content}>
                <Ionicons name="compass-outline" size={80} color={theme.tint} />
                <Text style={[styles.title, { color: theme.text }]}>Explore Coming Soon</Text>
                <Text style={[styles.subtitle, { color: theme.subtext }]}>We are cooking up something special for you to discover amazing new recipes!</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 24,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 24,
    },
});
