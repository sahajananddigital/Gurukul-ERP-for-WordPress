import React, { useEffect, useState, memo, useRef, useCallback } from 'react';
import { StyleSheet, FlatList, Image, ActivityIndicator, View, Dimensions, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Text, View as ThemedView } from '../../components/Themed';
import api from '../../services/api';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Get screen width for better responsive calculation
const { width, height } = Dimensions.get('window');
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
const DarshanImage = memo(({ uri, onPress }: { uri: string; onPress: () => void }) => {
    const [error, setError] = useState(false);
    const fallback = require('../../assets/images/daily_darshan.png');

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Image
                source={error ? fallback : { uri }}
                style={styles.image}
                onError={() => setError(true)}
            />
        </TouchableOpacity>
    );
});

export default function DailyDarshanScreen() {
    const [items, setItems] = useState<DarshanItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Viewer State
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerImages, setViewerImages] = useState<DarshanImageData[]>([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

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

    const openViewer = useCallback((images: DarshanImageData[], index: number) => {
        setViewerImages(images);
        setViewerIndex(index);
        setViewerVisible(true);
    }, []);

    const handleScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        if (index !== viewerIndex) {
            setViewerIndex(index);
        }
    };

    const goToPrev = () => {
        if (viewerIndex > 0) {
            flatListRef.current?.scrollToIndex({ index: viewerIndex - 1, animated: true });
        }
    };

    const goToNext = () => {
        if (viewerIndex < viewerImages.length - 1) {
            flatListRef.current?.scrollToIndex({ index: viewerIndex + 1, animated: true });
        }
    };

    const renderItem = ({ item }: { item: DarshanItem }) => (
        <View style={styles.card}>
            <Text style={styles.date}>{item.date} <Text style={styles.time}>({item.time})</Text></Text>
            <View style={styles.imageGrid}>
                {item.images.map((img, idx) => (
                    <DarshanImage 
                        key={`${item.id}-img-${idx}`} 
                        uri={img.url} 
                        onPress={() => openViewer(item.images, idx)}
                    />
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
                    removeClippedSubviews={true} 
                />
            )}

            {/* Full Screen Image Viewer Modal */}
            <Modal 
                visible={viewerVisible} 
                transparent={true} 
                animationType="fade"
                onRequestClose={() => setViewerVisible(false)}
            >
                <View style={styles.viewerContainer}>
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={() => setViewerVisible(false)}
                    >
                        <FontAwesome name="close" size={28} color="white" />
                    </TouchableOpacity>

                    <FlatList
                        ref={flatListRef}
                        data={viewerImages}
                        horizontal
                        pagingEnabled
                        initialScrollIndex={viewerIndex}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        getItemLayout={(_, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <ScrollView
                                contentContainerStyle={styles.scrollContent}
                                maximumZoomScale={5}
                                minimumZoomScale={1}
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                            >
                                <Image 
                                    source={{ uri: item.url }} 
                                    style={styles.fullImage} 
                                    resizeMode="contain"
                                />
                            </ScrollView>
                        )}
                    />

                    {/* Navigation Arrows */}
                    {viewerIndex > 0 && (
                        <TouchableOpacity 
                            style={[styles.navButton, styles.leftButton]} 
                            onPress={goToPrev}
                        >
                            <FontAwesome name="chevron-left" size={30} color="white" />
                        </TouchableOpacity>
                    )}

                    {viewerIndex < viewerImages.length - 1 && (
                        <TouchableOpacity 
                            style={[styles.navButton, styles.rightButton]} 
                            onPress={goToNext}
                        >
                            <FontAwesome name="chevron-right" size={30} color="white" />
                        </TouchableOpacity>
                    )}

                    {/* Image Counter */}
                    <View style={styles.counter}>
                        <Text style={styles.counterText}>
                            {viewerIndex + 1} / {viewerImages.length}
                        </Text>
                    </View>
                </View>
            </Modal>
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
    },
    viewerContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: width,
        height: height,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    navButton: {
        position: 'absolute',
        top: height / 2 - 30,
        zIndex: 10,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 40,
    },
    leftButton: {
        left: 10,
    },
    rightButton: {
        right: 10,
    },
    counter: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    counterText: {
        color: 'white',
        fontSize: 16,
    }
});