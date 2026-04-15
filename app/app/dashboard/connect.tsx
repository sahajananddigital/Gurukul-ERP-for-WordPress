import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View } from 'react-native';
import { Text, View as ThemedView } from '../../components/Themed';
import api from '../../services/api';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

export default function ConnectScreen() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/crm/contacts');
            setItems(response.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.first_name?.[0]}{item.last_name?.[0]}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.type}>{item.type}</Text>
                <View style={styles.contactInfo}>
                    <Ionicons name="call-outline" size={14} color="#666" />
                    <Text style={styles.infoText}>{item.phone}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Gurukul Connect' }} />
            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No contacts found</Text>}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 15 },
    card: { flexDirection: 'row', borderRadius: 12, marginBottom: 15, padding: 15, elevation: 2, alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E67E22', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    content: { flex: 1 },
    name: { fontSize: 18, fontWeight: 'bold' },
    type: { fontSize: 12, color: '#E67E22', textTransform: 'uppercase', marginBottom: 5 },
    contactInfo: { flexDirection: 'row', alignItems: 'center' },
    infoText: { fontSize: 14, color: '#666', marginLeft: 5 },
    empty: { textAlign: 'center', marginTop: 50, opacity: 0.5 }
});
