import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    useWindowDimensions,
    StatusBar,
    Linking,
    LayoutAnimation,
    UIManager
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';


export default function HelpSupportScreen() {
    const theme = useTheme<any>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    // --- Responsive Layout Logic ---
    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    const maxWidth = isDesktop ? 800 : '100%';

    // --- Accordion State ---
    // Stores the ID of the currently open FAQ. Null means all are closed.
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

    const toggleFaq = (id: string) => {
        // This tells React Native to smoothly animate the opening/closing!
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        // If you click the one that is already open, it closes it. Otherwise, it opens the new one.
        setExpandedFaq(prevId => prevId === id ? null : id);
    };

    // --- Data Structures ---
    const contactMethods = [
        {
            id: 'email',
            title: 'Email',
            value: 'support@autohub.ro',
            icon: 'mail-outline',
            color: '#3B82F6',
            bg: theme.dark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
            action: () => Linking.openURL('mailto:support@autohub.ro')
        },
        {
            id: 'phone',
            title: 'Telefon',
            value: '0800 123 456',
            icon: 'call-outline',
            color: '#10B981',
            bg: theme.dark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
            action: () => Linking.openURL('tel:0800123456')
        },
    ];

    // Added 'answer' text to the data
    const faqs = [
        {
            id: '1',
            question: 'Cum fac o programare?',
            answer: 'Din ecranul "Programări", apasă pe butonul "+" din dreapta jos, selectează service-ul dorit și alege o dată și o oră disponibilă.'
        },
        {
            id: '2',
            question: 'Pot anula o programare?',
            answer: 'Da, poți anula gratuit orice programare cu până la 24 de ore înainte de ora stabilită, direct din secțiunea Programările Mele.'
        },
        {
            id: '3',
            question: 'Cum adaug o mașină nouă?',
            answer: 'Accesează secțiunea "Garajul meu" și apasă butonul albastru "Adaugă". Vei avea nevoie de numărul de înmatriculare și detaliile de bază ale mașinii.'
        },
        {
            id: '4',
            question: 'Sunt un service auto, cum mă înregistrez?',
            answer: 'Ne bucurăm să lucrăm împreună! Trimite-ne un email la support@autohub.ro cu datele firmei tale și te vom contacta pentru crearea contului de partener.'
        },
    ];

    const navigation = useNavigation();

    return (
        <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: isDesktop ? 40 : insets.top + 20, paddingBottom: 40 }
                ]}
            >
                <View style={[
                    styles.contentWrapper,
                    { width: maxWidth },
                    isDesktop && {
                        backgroundColor: theme.colors.surface,
                        padding: 40,
                        borderRadius: 24,
                        ...Platform.select({
                            web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any,
                            default: { elevation: 4 }
                        }),
                    }
                ]}>

                    <TouchableOpacity
                        style={[styles.backButton, !isDesktop && { paddingHorizontal: 20 }]}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={28} color={theme.colors.text.main} />
                    </TouchableOpacity>

                    {/* HEADER SECTION */}
                    <View style={[styles.headerRow, !isDesktop && { paddingHorizontal: 20 }]}>
                        <Text style={[styles.pageTitle, { color: theme.colors.text.main }]}>Ajutor & Suport</Text>
                        <Text style={[styles.pageSubtitle, { color: theme.colors.text.muted }]}>
                            Suntem aici să te ajutăm
                        </Text>
                    </View>

                    <View style={[styles.sectionsContainer, !isDesktop && { paddingHorizontal: 20 }]}>

                        {/* CONTACT SECTION */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text.main }]}>Contactează-ne</Text>

                            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border?.light || '#F3F4F6' }]}>
                                {contactMethods.map((item, index) => {
                                    const isLast = index === contactMethods.length - 1;
                                    return (
                                        <View key={item.id}>
                                            <TouchableOpacity
                                                style={styles.contactRow}
                                                activeOpacity={0.7}
                                                onPress={item.action}
                                            >
                                                <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                                                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                                                </View>
                                                <View style={styles.textContainer}>
                                                    <Text style={[styles.contactTitle, { color: theme.colors.text.main }]}>{item.title}</Text>
                                                    <Text style={[styles.contactValue, { color: theme.colors.text.muted }]}>{item.value}</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.placeholder || '#D1D5DB'} />
                                            </TouchableOpacity>
                                            {!isLast && <View style={[styles.divider, { marginLeft: 76, backgroundColor: theme.colors.border?.light || '#F3F4F6' }]} />}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* FAQ SECTION */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text.main }]}>Întrebări frecvente</Text>

                            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border?.light || '#F3F4F6' }]}>
                                {faqs.map((faq, index) => {
                                    const isLast = index === faqs.length - 1;
                                    const isOpen = expandedFaq === faq.id; // Check if this specific FAQ is open

                                    return (
                                        <View key={faq.id}>
                                            <TouchableOpacity
                                                style={styles.faqRow}
                                                activeOpacity={0.7}
                                                onPress={() => toggleFaq(faq.id)}
                                            >
                                                <Text style={[
                                                    styles.faqText,
                                                    // Optional touch: Color the question primary when it's open!
                                                    { color: isOpen ? theme.colors.primary : theme.colors.text.main }
                                                ]}>
                                                    {faq.question}
                                                </Text>

                                                {/* Flips the chevron down/up depending on state */}
                                                <Ionicons
                                                    name={isOpen ? "chevron-up" : "chevron-down"}
                                                    size={20}
                                                    color={isOpen ? theme.colors.primary : (theme.colors.text.placeholder || '#D1D5DB')}
                                                />
                                            </TouchableOpacity>

                                            {/* THE ACCORDION CONTENT (Only renders if isOpen is true) */}
                                            {isOpen && (
                                                <View style={styles.faqAnswerContainer}>
                                                    <Text style={[styles.faqAnswerText, { color: theme.colors.text.muted }]}>
                                                        {faq.answer}
                                                    </Text>
                                                </View>
                                            )}

                                            {!isLast && <View style={[styles.divider, { backgroundColor: theme.colors.border?.light || '#F3F4F6' }]} />}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    scrollContent: { alignItems: 'center' },
    contentWrapper: { flex: 1, width: '100%' },
    headerRow: { marginBottom: 32 },
    pageTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
    pageSubtitle: { fontSize: 16, fontWeight: '500' },
    sectionsContainer: { width: '100%', gap: 32 },
    section: { width: '100%' },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 },
            android: { elevation: 2 },
            web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.02)' } as any,
        }),
    },
    contactRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    textContainer: { flex: 1, justifyContent: 'center' },
    contactTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
    contactValue: { fontSize: 14 },

    // Updated FAQ Styles
    faqRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    faqText: {
        fontSize: 16,
        fontWeight: '600', // Made slightly bolder so it feels like a header when open
        flex: 1,
        paddingRight: 16,
    },
    faqAnswerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20, // Pushes the text up away from the divider line
    },
    faqAnswerText: {
        fontSize: 15,
        lineHeight: 22,
    },
    backButton: {
        marginBottom: 16,
        alignSelf: 'flex-start',
        // On web, adding a pointer cursor makes it feel native
        ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
    },
    divider: { height: 1, width: '100%' },
});