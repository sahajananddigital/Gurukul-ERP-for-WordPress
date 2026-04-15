import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// Set the key-value pairs for the different languages you want to support.
const translations = {
    en: {
        welcome: 'Hello',
        jaySwaminarayan: 'Jay Swaminarayan',
        dailyDarshan: 'Daily Darshan',
        dailyQuotes: 'Daily Quotes',
        dailyUpdate: 'Daily Update',
        dailySatsang: 'Daily Satsang',
        dailyProgram: 'Daily Program',
        calendar: 'Calendar',
        frontDesk: 'Front Desk',
        profile: 'My Profile',
        gurukulConnect: 'Gurukul Connect',
        gurukulEvents: 'Gurukul Events',
        raviSabha: 'Ravi Sabha',
        logout: 'Logout',
        changeLanguage: 'Change Language',
        editProfile: 'Edit Profile',
        deleteAccount: 'Delete Account',
        login: 'Login',
        username: 'Username',
        password: 'Password',
        signIn: 'Sign In',
        authenticating: 'Authenticating...',
        invalidCredentials: 'Invalid username or password',
        loginSuccess: 'Login successful',
    },
    gu: {
        welcome: 'નમસ્તે',
        jaySwaminarayan: 'જય સ્વામિનારાયણ',
        dailyDarshan: 'દૈનિક દર્શન',
        dailyQuotes: 'દૈનિક સુવિચાર',
        dailyUpdate: 'દૈનિક સમાચાર',
        dailySatsang: 'દૈનિક સત્સંગ',
        dailyProgram: 'દૈનિક કાર્યક્રમ',
        calendar: 'પંચાંગ',
        frontDesk: 'ફ્રન્ટ ડેસ્ક',
        profile: 'મારું પ્રોફાઇલ',
        gurukulConnect: 'ગુરુકુળ કનેક્ટ',
        gurukulEvents: 'ગુરુકુળ ઉત્સવ',
        raviSabha: 'રવિ સભા',
        logout: 'લોગ આઉટ',
        changeLanguage: 'ભાષા બદલો',
        editProfile: 'પ્રોફાઇલ સંપાદિત કરો',
        deleteAccount: 'ખાતું કાઢી નાખો',
        login: 'લોગિન',
        username: 'વપરાશકર્તા નામ',
        password: 'પાસવર્ડ',
        signIn: 'સાઇન ઇન',
        authenticating: 'પ્રમાણિત કરી રહ્યું છે...',
        invalidCredentials: 'ખોટું વપરાશકર્તા નામ અથવા પાસવર્ડ',
        loginSuccess: 'લોગિન સફળ',
    },
};

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0].languageCode ?? 'en';

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;

export default i18n;
