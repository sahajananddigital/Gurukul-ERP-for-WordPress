import { StyleSheet, FlatList, TouchableOpacity, Image, View, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text, View as ThemedView } from '../../components/Themed';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import i18n from '../../services/i18n';
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../services/AuthContext';

// Image Assets
const Images = {
  daily_darshan: require('../../assets/images/daily_darshan.png'),
  daily_quotes: require('../../assets/images/daily_quotes.png'),
  daily_update: require('../../assets/images/daily_updates.png'),
  daily_satsang: require('../../assets/images/daily_satsang.png'),
  daily_program: require('../../assets/images/daily_program.png'),
  calendar: require('../../assets/images/calendar.png'),
};

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [gridItems, setGridItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [i18n.locale]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/content/dashboard');
      setGridItems(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const localImage = Images[item.id as keyof typeof Images];

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
        onPress={() => {
          // Alert.alert("Debug Link", item.route);
          console.log("Navigating to:", item.route);
          router.push(item.route);
        }}
      >
        <Image
          source={localImage}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{i18n.t('jaySwaminarayan')}</Text>
        <Text style={styles.subGreeting}>
          {i18n.t('welcome')}, {user ? user.name : 'User'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={gridItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 16,
    opacity: 0.8,
  },
  grid: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '70%',
  },
  cardContent: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: '30%',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
