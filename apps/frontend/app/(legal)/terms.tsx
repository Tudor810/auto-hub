import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TermsOfServiceScreen() {
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
              <Text style={[styles.pageTitle, { color: theme.colors.text.main }]}>Termeni și Condiții</Text>
              <Text style={[styles.pageSubtitle, { color: theme.colors.text.muted }]}>Ultima actualizare: Aprilie 2026</Text>
            </View>
          </View>

          {/* CONTENT */}
          <View style={styles.textContent}>
            <Text style={[styles.introText, { color: theme.colors.text.main }]}>
              Bine ai venit pe AutoHub! Te rugăm să citești cu atenție acești termeni înainte de a utiliza platforma noastră pentru programări auto.
            </Text>

            <Section 
              title="1. Acceptarea Termenilor" 
              text="Prin crearea unui cont și utilizarea aplicației AutoHub, ești de acord să respecți acești Termeni și Condiții. Dacă nu ești de acord cu oricare dintre prevederi, te rugăm să nu utilizezi serviciile noastre."
            />
            
            <Section 
              title="2. Serviciile Oferite" 
              text="AutoHub acționează ca un intermediar între tine (utilizatorul) și service-urile auto partenere. Nu suntem responsabili pentru calitatea reparațiilor, pieselor sau serviciilor prestate direct de către locațiile partenere. Orice dispută legată de reparații se va rezolva direct cu service-ul respectiv."
            />

            <Section 
              title="3. Programări și Anulări" 
              text="Când faci o programare, te angajezi să te prezinți la locație la data și ora stabilită. Dacă nu poți onora programarea, te rugăm să o anulezi din aplicație cu cel puțin 24 de ore înainte. Service-urile își rezervă dreptul de a refuza clienții care au un istoric de neprezentări repetate."
            />

            <Section 
              title="4. Contul de Utilizator" 
              text="Ești responsabil pentru păstrarea confidențialității datelor tale de autentificare. Orice acțiune realizată de pe contul tău este considerată a fi făcută de tine. Ne rezervăm dreptul de a suspenda conturile care furnizează date false (ex. numere de înmatriculare fictive)."
            />

            <Section 
              title="5. Limitarea Răspunderii" 
              text="Aplicația este oferită 'ca atare'. Nu garantăm că funcționarea va fi neîntreruptă sau lipsită de erori. Estimările de preț și durată oferite de AI sau de service-uri sunt strict orientative și pot suferi modificări în urma unei constatări fizice la fața locului."
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800' },
  pageSubtitle: { fontSize: 13, marginTop: 4 },
  textContent: { gap: 24 },
  introText: { fontSize: 15, lineHeight: 24, fontWeight: '500', marginBottom: 8 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionText: { fontSize: 15, lineHeight: 24 },
});