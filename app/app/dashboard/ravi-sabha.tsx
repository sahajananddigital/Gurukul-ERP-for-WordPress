import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator, View } from 'react-native';
import { Text, View as ThemedView } from '../../components/Themed';
import api from '../../services/api';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

export default function RaviSabhaScreen() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Reusing satsang endpoint as a base for Ravi Sabha
            const response = await api.get('/content/daily-satsang');
            setItems(response.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const openVideo = (url: string) => {
        if (url) {
            Linking.openURL(url);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]} 
            onPress={() => openVideo(item.video_url)}
        >
            <View style={styles.videoPlaceholder}>
                <Ionicons name="play-circle-outline" size={64} color="#fff" />
            </View>
            <View style={styles.content}>
                <Text style={styles.date}>{item.satsang_date}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Ravi Sabha' }} />
            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No Ravi Sabha recordings found</Text>}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 15 },
    card: { borderRadius: 12, marginBottom: 20, overflow: 'hidden', elevation: 3 },
    videoPlaceholder: { height: 200, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
    content: { padding: 15 },
    date: { fontSize: 12, color: '#888', marginBottom: 5 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    description: { fontSize: 14, color: '#444' },
    empty: { textAlign: 'center', marginTop: 50, opacity: 0.5 }
});
