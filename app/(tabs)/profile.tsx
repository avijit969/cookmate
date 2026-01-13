import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../constants/Colors';
import { useAlertStore } from '../../store/alertStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { uploadImage } from '../../utils/imageUploader';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  const alert = useAlertStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    alert.show({
      title: "Logout",
      message: "Are you sure you want to logout?",
      type: 'warning',
      confirmText: "Logout",
      cancelText: "Cancel",
      onConfirm: async () => {
        await logout();
        router.replace('/(auth)/login');
      }
    });
  };

  const toggleTheme = (val: boolean) => {
    setMode(val ? 'dark' : 'light');
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      alert.show({
        type: 'error',
        title: 'Error',
        message: 'Failed to pick image'
      });
    }
  };

  const handleUpload = async (uri: string) => {
    setIsUploading(true);
    try {
      const url = await uploadImage(uri);
      await updateProfile({ avatar: url });
      alert.show({
        type: 'success',
        title: 'Success',
        message: 'Profile picture updated!'
      });
    } catch (error: any) {
      alert.show({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update user'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header Profile Info */}
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} disabled={isUploading} style={styles.avatarContainer}>
            {isUploading ? (
              <View style={[styles.avatar, styles.placeholderAvatar, { backgroundColor: theme.card }]}>
                <ActivityIndicator color={theme.tint} />
              </View>
            ) : user?.avatar ? (
              <Image
                source={user.avatar}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar, { backgroundColor: theme.tint }]}>
                <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
            )}
            <View style={[styles.editBadge, { borderColor: theme.background, backgroundColor: theme.text }]}>
              <Feather name="edit-2" size={12} color={theme.background} />
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Unknown User'}</Text>
          <Text style={[styles.userEmail, { color: theme.subtext }]}>{user?.email || 'user@example.com'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Recipes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Likes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Saved</Text>
            </View>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Settings</Text>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.inputBg }]}>
                  <Feather name="moon" size={20} color={theme.text} />
                </View>
                <Text style={[styles.rowLabel, { color: theme.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={mode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.tint }}
                thumbColor={'#fff'}
              />
            </View>

            <TouchableOpacity style={[styles.row, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.inputBg }]}>
                  <Feather name="user" size={20} color={theme.text} />
                </View>
                <Text style={[styles.rowLabel, { color: theme.text }]}>Edit Profile</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row]}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.inputBg }]}>
                  <Feather name="bell" size={20} color={theme.text} />
                </View>
                <Text style={[styles.rowLabel, { color: theme.text }]}>Notifications</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.card, styles.logoutButton, { backgroundColor: theme.card }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color={theme.danger} />
            <Text style={[styles.logoutText, { color: theme.danger }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: theme.subtext }]}>v1.0.0</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  }
});