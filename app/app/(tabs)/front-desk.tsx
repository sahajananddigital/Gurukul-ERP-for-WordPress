import { StyleSheet, TouchableOpacity, FlatList, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text, View as ThemedView } from '../../components/Themed';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import i18n from '../../services/i18n';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function FrontDeskScreen() {
  const colorScheme = useColorScheme();

  const menuItems = [
    { id: 'connect', title: i18n.t('gurukulConnect'), icon: 'comments', route: '/dashboard/connect' },
    { id: 'events', title: i18n.t('gurukulEvents'), icon: 'star', route: '/dashboard/calendar' }, // Reusing calendar for events
    { id: 'ravi_sabha', title: i18n.t('raviSabha'), icon: 'book', route: '/dashboard/ravi-sabha' },
    { id: 'donations', title: 'Donations', icon: 'heart', route: '/dashboard/donations' },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
      onPress={() => {
        if (item.route) {
          router.push(item.route);
        } else {
          Alert.alert("Info", "This feature is coming soon!");
        }
      }}
    >
      <FontAwesome name={item.icon} size={32} color={Colors[colorScheme ?? 'light'].tint} style={{ marginBottom: 10 }} />
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('frontDesk')}</Text>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  grid: {
    padding: 10,
  },
  row: {
    justifyContent: 'flex-start',
    gap: 15
  },
  card: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});
