import { Stack } from 'expo-router';

export default function DashboardLayout() {
    return (
        <Stack>
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
