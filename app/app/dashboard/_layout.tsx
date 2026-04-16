import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme } from '../../components/useColorScheme';
import { Colors } from '../../constants/Colors';

export default function DashboardLayout() {
    const colorScheme = useColorScheme();
    const tintColor = Colors[colorScheme ?? 'light'].text;

    return (
        <Stack
            screenOptions={{
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <FontAwesome name="arrow-left" size={20} color={tintColor} />
                    </TouchableOpacity>
                ),
                headerTintColor: tintColor,
            }}
        >
            <Stack.Screen name="daily-darshan" options={{ title: 'Daily Darshan' }} />
            <Stack.Screen name="daily-quotes" options={{ title: 'Daily Quotes' }} />
            <Stack.Screen name="daily-updates" options={{ title: 'Daily Updates' }} />
            <Stack.Screen name="daily-satsang" options={{ title: 'Daily Satsang' }} />
            <Stack.Screen name="daily-program" options={{ title: 'Daily Program' }} />
            <Stack.Screen name="calendar" options={{ title: 'Calendar' }} />
            <Stack.Screen name="connect" options={{ title: 'Gurukul Connect' }} />
            <Stack.Screen name="donations" options={{ title: 'Donations' }} />
            <Stack.Screen name="ravi-sabha" options={{ title: 'Ravi Sabha' }} />
        </Stack>
    );
}
