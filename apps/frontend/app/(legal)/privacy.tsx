import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const theme = useTheme<any>();
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';

  const Section = ({ title, text }: { title: string, text: string }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.main }]}>{title}</Text>
      <Text style={[styles.sectionText, { color: theme.colors.text.secondary }]}>{text}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.contentWrapper, 
          { width: maxWidth },
          isDesktop && {
            backgroundColor: theme.colors.surface,
            marginVertical: 40,
            borderRadius: 24,
            padding: 40,
            ...Platform.select({ web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any })
          }
        ]}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.main} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.pageTitle, { color: theme.colors.text.main }]}>Politica de Confidențialitate</Text>
              <Text style={[styles.pageSubtitle, { color: theme.colors.text.muted }]}>Ultima actualizare: Aprilie 2026</Text>
            </View>
          </View>

          {/* CONTENT */}
          <View style={styles.textContent}>
            <Text style={[styles.introText, { color: theme.colors.text.main }]}>
              La AutoHub, intimitatea ta este o prioritate. Această politică explică modul în care colectăm, folosim și protejăm datele tale personale atunci când utilizezi aplicația noastră.
            </Text>

            <Section 
              title="1. Ce date colectăm" 
              text="Colectăm date esențiale pentru a-ți putea oferi serviciile noastre: nume, adresă de e-mail, număr de telefon, locația aproximativă (dacă permiți accesul GPS) și informații despre autoturismul tău (marcă, model, număr de înmatriculare, VIN)."
            />
            
            <Section 
              title="2. Cum folosim datele tale" 
              text="Folosim informațiile tale pentru a facilita programările la service-urile auto, pentru a-ți trimite notificări (ex: ITP-ul expiră curând), pentru funcționarea asistentului AI (Magic Search) și pentru îmbunătățirea platformei."
            />

            <Section 
              title="3. Partajarea datelor cu terți" 
              text="În momentul în care faci o programare, transmitem service-ului selectat doar datele necesare pentru a onora programarea: numele tău, numărul de telefon și detaliile mașinii. Nu vindem datele tale către agenții de publicitate terțe."
            />

            <Section 
              title="4. Securitatea Datelor" 
              text="Ne angajăm să îți protejăm datele folosind măsuri de securitate tehnice și organizatorice adecvate, incluzând criptarea parolelor și conexiuni securizate (HTTPS) între aplicație și serverele noastre."
            />

            <Section 
              title="5. Drepturile tale (GDPR)" 
              text="Conform legislației europene, ai dreptul de a solicita accesul la datele tale, de a le rectifica, sau de a cere ștergerea completă a contului și a istoricului tău. Poți face acest lucru direct din secțiunea 'Profil' a aplicației sau contactându-ne pe e-mail."
            />
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  contentWrapper: { flex: 1, padding: 24, paddingTop: Platform.OS === 'android' ? 60 : 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, paddingRight: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800' },
  pageSubtitle: { fontSize: 13, marginTop: 4 },
  textContent: { gap: 24 },
  introText: { fontSize: 15, lineHeight: 24, fontWeight: '500', marginBottom: 8 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionText: { fontSize: 15, lineHeight: 24 },
});