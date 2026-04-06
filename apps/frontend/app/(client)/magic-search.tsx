import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    useWindowDimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import { useTheme, TextInput, HelperText, Snackbar, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import ErrorMessage from '@/components/ErrorMessage';
import { API_BASE_URL } from '@/utils/api';

// Standard Romanian Counties (Județe)
const ROMANIAN_COUNTIES = [
    'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila', 'Brașov',
    'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița',
    'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov',
    'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu',
    'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea'
];

export default function MagicSearchScreen() {
    const theme = useTheme<any>();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { token } = useAuth();

    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    const maxWidth = isDesktop ? 600 : '100%';

    // --- FORM STATE ---
    const [county, setCounty] = useState('');
    const [problemText, setProblemText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [errors, setErrors] = useState({ county: '', problem: '' });
    const [genError, setGenError] = useState('');
    const [clicked, setClicked] = useState(false);

    // --- MODAL STATE ---
    const [isCountyModalVisible, setCountyModalVisible] = useState(false);

    const validateCounty = (val: string) => !val ? 'Te rugăm să selectezi județul.' : '';
    const validateProblem = (val: string) => val.trim().length < 10 ? 'Te rugăm să oferi mai multe detalii despre problemă.' : '';

    // --- HANDLERS ---
    const handleMagicSearch = async () => {

        setClicked(true);
        const countyErr = validateCounty(county);
        const problemErr = validateProblem(problemText);

        setErrors({ county: countyErr, problem: problemErr });
        if (countyErr || problemErr) return;

        // 2. Start AI Search Loading State
        setIsSearching(true);

        try {
            // 3. Make the Fetch Request
            // Replace this URL with your actual backend endpoint
            const response = await fetch(`${API_BASE_URL}/api/magic-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Uncomment if your API requires a login token
                },
                credentials: 'include',
                body: JSON.stringify({
                    county: county,
                    problem: problemText
                })
            });

            if (!response.ok) {
                setGenError("Eroare");
                return
            }

            // 4. Parse the JSON response
            const data = await response.json();

            // 5. Handle Server Errors (e.g., 400 Bad Request, 500 Server Error)


            // 6. Success! Handle the AI data
            console.log("AI Results:", data);

            // Assuming your backend returns an array of service IDs or a search query string
            router.push({
                pathname: '/(client)/(tabs)/map',
                params: { magicResults: JSON.stringify(data.serviceIds) }
            });

        } catch (error: any) {
            // 7. Handle Network Errors (e.g., no internet connection)
            console.error("Magic Search Error:", error);
            setGenError(error.message || "A apărut o eroare de conexiune.");
        } finally {
            setIsSearching(false);
        }
    };

    // --- REUSABLE DROPDOWN ---
    const SelectInput = ({ label, value, placeholder, error, onPress }: any) => (
        <View style={{ marginBottom: error ? 0 : 16 }}>
            <Text style={[styles.inputLabel, { color: theme.colors.text.main }]}>{label}</Text>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                style={[
                    styles.fakeInput,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: error ? theme.colors.error : theme.colors.border?.medium || '#E5E7EB'
                    }
                ]}
            >
                <Text style={{ color: value ? theme.colors.text.main : (theme.colors.text.placeholder || '#9CA3AF'), fontSize: 16 }}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.text.placeholder || '#9CA3AF'} />
            </TouchableOpacity>
            {!!error && <HelperText type="error" style={styles.helperText}>{error}</HelperText>}
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={20}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={!isCountyModalVisible}
            >
                <View style={[
                    styles.contentWrapper, { width: maxWidth },
                    isDesktop && {
                        backgroundColor: theme.colors.surface,
                        marginVertical: 40,
                        borderRadius: 24,
                        padding: 40,
                        ...Platform.select({ web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any })
                    },
                    !isDesktop && { paddingTop: Math.max(insets.top + 20, 40) }
                ]}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text.main} />
                        </TouchableOpacity>
                    </View>

                    {/* TITLE AREA WITH MAGIC ICON */}
                    <View style={styles.stepHeaderCentered}>
                        <View style={[styles.iconCircle, { backgroundColor: "#F5F3FF" }]}>
                            <Ionicons name="sparkles" size={32} color="#8B5CF6" />
                        </View>
                        <Text style={[styles.stepTitle, { color: theme.colors.text.main }]}>Magic Search</Text>
                        <Text style={[styles.stepSubtitle, { color: theme.colors.text.muted }]}>
                            Descrie problema cu cuvintele tale, iar AI-ul nostru va găsi cel mai potrivit service pentru tine.
                        </Text>
                    </View>

                    {/* FORM */}
                    <View style={{ width: '100%', marginTop: 8 }}>

                        <SelectInput
                            label="Unde te afli?"
                            placeholder="Selectează județul"
                            value={county}
                            error={errors.county}
                            onPress={() => setCountyModalVisible(true)}
                        />

                        <View style={styles.inputWrapper}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text.main }]}>Ce problemă are mașina? *</Text>
                            <TextInput
                                mode="outlined"
                                placeholder="Ex: Când pun frână se aude un scârțâit puternic pe partea dreaptă față, iar volanul trepidează la peste 80km/h..."
                                value={problemText}
                                onChangeText={(text) => {
                                    setProblemText(text);
                                    if (clicked) setErrors({ ...errors, problem: validateProblem(text) });
                                }}
                                error={!!errors.problem}
                                multiline={true}
                                numberOfLines={6}
                                outlineColor={theme.colors.border?.medium || '#E5E7EB'}
                                activeOutlineColor="#8B5CF6" // Purple active state to match the magic theme
                                style={{ backgroundColor: theme.colors.surface, fontSize: 16, minHeight: 140, paddingTop: 12 }}
                            />
                            {!!errors.problem && <HelperText type="error" style={styles.helperText}>{errors.problem}</HelperText>}
                        </View>

                    </View>

                    <View style={{ flex: 1, minHeight: 40 }} />

                    {/* SUBMIT BUTTON */}
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            { backgroundColor: isSearching ? '#C4B5FD' : '#8B5CF6' } // Purple magic color
                        ]}
                        onPress={handleMagicSearch}
                        activeOpacity={0.8}
                        disabled={isSearching}
                    >
                        {isSearching ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.continueText}>Găsește service-ul ideal</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    {genError && <ErrorMessage message={genError} />}
                </View>

                {/* COUNTY SELECTION MODAL */}
                {isCountyModalVisible && (
                    <TouchableWithoutFeedback onPress={() => setCountyModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                                    <View style={styles.modalHeader}>
                                        <Text style={[styles.modalTitle, { color: theme.colors.text.main }]}>Alege Județul</Text>
                                        <TouchableOpacity onPress={() => setCountyModalVisible(false)} style={{ padding: 4 }}>
                                            <Ionicons name="close" size={24} color={theme.colors.text.muted} />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                                        <View style={styles.optionsList}>
                                            {ROMANIAN_COUNTIES.map(c => {
                                                const isSelected = county === c;
                                                return (
                                                    <TouchableOpacity
                                                        key={c}
                                                        style={[
                                                            styles.optionBtn,
                                                            { borderBottomColor: theme.colors.border?.light || '#F3F4F6' },
                                                            isSelected && { backgroundColor: 'rgba(139, 92, 246, 0.1)' } // Light purple
                                                        ]}
                                                        onPress={() => {
                                                            setCounty(c);
                                                            if (clicked)
                                                                setErrors({ ...errors, county: validateCounty(c) });
                                                            setCountyModalVisible(false);
                                                        }}
                                                    >
                                                        <Text style={[
                                                            styles.optionText,
                                                            { color: theme.colors.text.main },
                                                            isSelected && { color: '#8B5CF6', fontWeight: '700' }
                                                        ]}>
                                                            {c}
                                                        </Text>
                                                        {isSelected && <Ionicons name="checkmark" size={20} color="#8B5CF6" />}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                )}

            </KeyboardAwareScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    contentWrapper: { flex: 1, padding: 24 },

    // Header
    header: { marginBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)', justifyContent: 'center', alignItems: 'center' },

    // Top Section
    iconCircle: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    stepTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
    stepSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
    stepHeaderCentered: { alignItems: 'center', marginBottom: 32 },

    // Form Inputs
    inputWrapper: { marginBottom: 4 },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    helperText: { marginTop: 4, paddingHorizontal: 4 },

    // Fake Input for Dropdown
    fakeInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        borderWidth: 1,
        borderRadius: 8, // Matching React Native Paper default outline radius
        paddingHorizontal: 16,
    },

    // Modal
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContainer: { width: '90%', maxWidth: 400, maxHeight: '70%', borderRadius: 24, padding: 24, ...Platform.select({ web: { boxShadow: '0px 10px 40px rgba(0,0,0,0.3)' } as any }) },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    optionsList: { paddingBottom: 20 },
    optionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, paddingHorizontal: 8 },
    optionText: { fontSize: 16, fontWeight: '500' },

    // Footer Button
    continueButton: { flexDirection: 'row', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
    continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});