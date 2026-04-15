import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View } from 'react-native';
import { Text, View as ThemedView } from '../../components/Themed';
import api from '../../services/api';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

export default function DonationsScreen() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/donations');
            setItems(response.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.header}>
                <Text style={styles.donor}>{item.donor_name}</Text>
                <Text style={styles.amount}>₹{item.amount}</Text>
            </View>
            <Text style={styles.purpose}>{item.purpose}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Donations' }} />
            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No donations recorded</Text>}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 15 },
    card: { borderRadius: 12, marginBottom: 15, padding: 15, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    donor: { fontSize: 16, fontWeight: 'bold' },
    amount: { fontSize: 16, fontWeight: 'bold', color: '#27AE60' },
    purpose: { fontSize: 14, color: '#666', marginBottom: 5 },
    date: { fontSize: 12, color: '#999', textAlign: 'right' },
    empty: { textAlign: 'center', marginTop: 50, opacity: 0.5 }
});
