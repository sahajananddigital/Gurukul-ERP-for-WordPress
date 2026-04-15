import { StyleSheet, TouchableOpacity, Image, Alert, ScrollView, TextInput, ActivityIndicator, Share, View } from 'react-native';
import { Text } from '../../components/Themed';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import i18n from '../../services/i18n';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import * as Linking from 'expo-linking';

export default function ProfileScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const { user, login, logout, isLoading } = useAuth();
    const [locale, setLocale] = useState(i18n.locale);

    // Login Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const toggleLanguage = () => {
        const newLocale = i18n.locale === 'en' ? 'gu' : 'en';
        i18n.locale = newLocale;
        setLocale(newLocale); // Trigger re-render
    };

    const handleLogin = async () => {
        if (!username || !password) {
            setLoginError(i18n.t('invalidCredentials'));
            return;
        }

        try {
            setLoginError('');
            await login(username, password);
            // Alert.alert(i18n.t('loginSuccess'));
        } catch (error) {
            setLoginError(i18n.t('invalidCredentials'));
        }
    };

    const handleLogout = () => {
        Alert.alert(
            i18n.t('logout'),
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            i18n.t('deleteAccount'),
            'This action is permanent and will delete all your data. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Request Submitted', 'Your account deletion request has been received.') }
            ]
        );
    };

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: 'Check out the Gurukul ERP App! Download now to stay connected with Daily Darshan and Satsang.',
                url: 'https://gurukul.org', 
            });
        } catch (error) {
            console.error(error);
        }
    };

    const ActionRow = ({ title, icon, onPress, color, rightText }: any) => (
        <TouchableOpacity style={[styles.row, { borderBottomColor: Colors[colorScheme].border }]} onPress={onPress}>
            <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: color ? color + '20' : Colors[colorScheme].tint + '20' }]}>
                    <FontAwesome name={icon} size={18} color={color || Colors[colorScheme].tint} />
                </View>
                <Text style={[styles.rowTitle, color && { color }]}>{title}</Text>
            </View>
            <View style={styles.rowRight}>
                {rightText && <Text style={styles.rightText}>{rightText}</Text>}
                <FontAwesome name="angle-right" size={20} color={Colors[colorScheme].icon} />
            </View>
        </TouchableOpacity>
    );

    if (!user) {
        return (
            <ScrollView 
                contentContainerStyle={[styles.container, { backgroundColor: Colors[colorScheme].background, justifyContent: 'center' }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{i18n.t('login')}</Text>
                    <Text style={styles.subHeader}>Sign in to access your Gurukul profile</Text>
                </View>

                <View style={[styles.card, { backgroundColor: Colors[colorScheme].card }]}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{i18n.t('username')}</Text>
                        <TextInput
                            style={[styles.input, { color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border }]}
                            placeholder="Enter username"
                            placeholderTextColor="#999"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{i18n.t('password')}</Text>
                        <TextInput
                            style={[styles.input, { color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border }]}
                            placeholder="Enter password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

                    <TouchableOpacity 
                        style={[styles.loginButton, { backgroundColor: Colors[colorScheme].tint }]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>{i18n.t('signIn')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={toggleLanguage} style={styles.langToggle}>
                    <Text style={{ color: Colors[colorScheme].tint, fontWeight: '600' }}>
                        {i18n.t('changeLanguage')}: {i18n.locale.toUpperCase() === 'EN' ? 'GUJARATI' : 'ENGLISH'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{i18n.t('profile')}</Text>
            </View>

            {/* Profile Info Card */}
            <View style={[styles.card, { backgroundColor: Colors[colorScheme].card }]}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        <TouchableOpacity 
                            style={[styles.editAvatar, { backgroundColor: Colors[colorScheme].tint }]}
                            onPress={() => Alert.alert('Profile Picture', 'Upload functionality coming soon.')}
                        >
                            <FontAwesome name="camera" size={12} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName} numberOfLines={1}>{user.name}</Text>
                        <Text style={styles.profilePhone}>{user.phone}</Text>
                        <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={[styles.card, { backgroundColor: Colors[colorScheme].card, paddingVertical: 0 }]}>
                <ActionRow title="My Donations" icon="money" onPress={() => Alert.alert('Coming Soon', 'Donation history will be available here.')} />
                <ActionRow title="My Events" icon="calendar" onPress={() => Alert.alert('Coming Soon', 'Your registered events will appear here.')} />
            </View>

            <Text style={styles.sectionTitle}>Settings & Preferences</Text>
            <View style={[styles.card, { backgroundColor: Colors[colorScheme].card, paddingVertical: 0 }]}>
                <ActionRow title={i18n.t('editProfile')} icon="user" onPress={() => Alert.alert('Edit Profile', 'Profile editing will be enabled in the next update.')} />
                <ActionRow
                    title={i18n.t('changeLanguage')}
                    icon="language"
                    onPress={toggleLanguage}
                    rightText={i18n.locale.toUpperCase()}
                />
                <ActionRow title="Notifications" icon="bell" onPress={() => Alert.alert('Notifications', 'Notification settings are currently managed by system.')} rightText="On" />
            </View>

            <Text style={styles.sectionTitle}>Support</Text>
            <View style={[styles.card, { backgroundColor: Colors[colorScheme].card, paddingVertical: 0 }]}>
                <ActionRow title="Share App" icon="share-alt" onPress={handleShareApp} />
                <ActionRow title="Contact Us" icon="envelope" onPress={() => Linking.openURL('mailto:support@gurukul.org')} />
                <ActionRow title="About Gurukul" icon="info-circle" onPress={() => Linking.openURL('https://gurukul.org')} />
            </View>

            <View style={[styles.card, { backgroundColor: Colors[colorScheme].card, paddingVertical: 0, marginBottom: 10 }]}>
                <ActionRow title={i18n.t('logout')} icon="sign-out" onPress={handleLogout} color="#E63946" />
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                <Text style={styles.deleteButtonText}>{i18n.t('deleteAccount')}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.versionText}>Version 1.0.0 (Build 24)</Text>
                <Text style={styles.footerText}>© 2026 Sahajanand Digital</Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    header: {
        padding: 20,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold'
    },
    subHeader: {
        fontSize: 16,
        opacity: 0.6,
        marginTop: 5
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.5,
        marginLeft: 25,
        marginBottom: 10,
        marginTop: 10
    },
    card: {
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatarContainer: {
        marginRight: 20,
        position: 'relative'
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40
    },
    editAvatar: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    profileInfo: {
        justifyContent: 'center',
        flex: 1
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 2
    },
    profilePhone: {
        fontSize: 15,
        opacity: 0.7,
        marginBottom: 2
    },
    profileEmail: {
        fontSize: 14,
        opacity: 0.5
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 5,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '500'
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    rightText: {
        fontSize: 14,
        opacity: 0.5
    },
    deleteButton: {
        marginHorizontal: 20,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center'
    },
    deleteButtonText: {
        color: '#D93025',
        fontWeight: '600',
        fontSize: 16
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
        opacity: 0.7
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    loginButton: {
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    errorText: {
        color: '#D93025',
        marginBottom: 15,
        textAlign: 'center'
    },
    langToggle: {
        alignItems: 'center',
        marginTop: 10
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 30,
        opacity: 0.4
    },
    versionText: {
        fontSize: 12,
        marginBottom: 5
    },
    footerText: {
        fontSize: 12
    }
});
