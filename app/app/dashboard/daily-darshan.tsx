import React, { useEffect, useState, memo } from 'react';
import { StyleSheet, FlatList, Image, ActivityIndicator, View, Dimensions } from 'react-native';
import { Text, View as ThemedView } from '../../components/Themed';
import api from '../../services/api';
import { Stack } from 'expo-router';

// Get screen width for better responsive calculation
const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2; // Adjusting for list padding and gap

interface DarshanImageData {
    url: string;
}

interface DarshanItem {
    id: number | string;
    date: string;
    time: string;
    images: DarshanImageData[];
}

// Memoized Image Component to prevent flickers
const DarshanImage = memo(({ uri }: { uri: string }) => {
    const [error, setError] = useState(false);
    const fallback = require('../../assets/images/daily_darshan.png');

    return (
        <Image
            source={error ? fallback : { uri }}
            style={styles.image}
            onError={() => setError(true)}
        />
    );
});

export default function DailyDarshanScreen() {
    const [items, setItems] = useState<DarshanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const response = await api.get('/content/daily-darshan');
            setItems(response.data);
        } catch (e) {
            console.error("Fetch Error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderItem = ({ item }: { item: DarshanItem }) => (
        <View style={styles.card}>
            <Text style={styles.date}>{item.date} <Text style={styles.time}>({item.time})</Text></Text>
            <View style={styles.imageGrid}>
                {item.images.map((img, idx) => (
                    <DarshanImage key={`${item.id}-img-${idx}`} uri={img.url} />
                ))}
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Daily Darshan' }} />
            
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={() => {
                        setRefreshing(true);
                        fetchData();
                    }}
                    refreshing={refreshing}
                    // Optimization: Tell FlatList how high items are if possible
                    removeClippedSubviews={true} 
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 15 },
    card: { marginBottom: 24 },
    date: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    time: { fontWeight: 'normal', fontSize: 16, opacity: 0.7 },
    imageGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        rowGap: 10 
    },
    image: { 
        width: COLUMN_WIDTH, 
        height: COLUMN_WIDTH, 
        borderRadius: 12, 
        backgroundColor: '#f0f0f0' 
    }
});