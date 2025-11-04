// src/screens/MedicationScreen.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  ToastAndroid,
  Alert,
  ImageBackground,
} from 'react-native';
import firebase, { auth, db } from '../firebase';
import { Picker } from '@react-native-picker/picker';
import { SettingsContext } from '../context/SettingsContext';
import { useTheme } from '../utils/theme';

const { width, height } = Dimensions.get('window');

/** -------- Top-level header component (stable identity) --------
 * Receives everything via props so it doesn't capture from closure.
 */
type HeaderProps = {
  // Search
  searchInput: string;
  setSearchInput: (s: string) => void;
  suggestions: string[];
  setSuggestions: (arr: string[]) => void;
  setSearchText: (s: string) => void;
  name: string;
  setName: (s: string) => void;

  // Dosage / schedule
  amount: number;
  setAmount: (n: number) => void;
  doseCount: number;
  setDoseCount: (n: number) => void;
  periodCount: number;
  setPeriodCount: (n: number) => void;
  periodUnit: 'day' | 'week';
  setPeriodUnit: (u: 'day' | 'week') => void;
  durationCount: number;
  setDurationCount: (n: number) => void;
  durationUnit: 'day' | 'week';
  setDurationUnit: (u: 'day' | 'week') => void;

  // Theme
  colors: any;
  typography: any;

  // Actions
  onAdd: () => void;
};

function MedsFormHeader(props: HeaderProps) {
  const {
    // search
    searchInput, setSearchInput, suggestions, setSuggestions, setSearchText, name, setName,
    // dosage/schedule
    amount, setAmount, doseCount, setDoseCount, periodCount, setPeriodCount, periodUnit, setPeriodUnit,
    durationCount, setDurationCount, durationUnit, setDurationUnit,
    // theme
    colors, typography,
    // actions
    onAdd,
  } = props;

  return (
    <View>
      {/* Search / Auto-complete */}
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <Text style={[styles.cardTitle, { fontSize: typography.fontSize, fontWeight: typography.fontWeight, color: typography.textColor }]}>
          Drug Name
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Search drug…"
          placeholderTextColor={colors.textSecondary}
          value={searchInput} // single source of truth
          onChangeText={setSearchInput}
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={false}
        />

        {searchInput.trim().length >= 2 && suggestions.length > 0 && (
          <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {suggestions.map(s => (
              <Pressable
                key={s}
                onPress={() => {
                  setName(s);
                  setSearchInput(s);               // keep same value source
                  setSearchText(s.toLowerCase());  // keep query state in sync
                  setSuggestions([]);              // hide dropdown
                }}
                style={[styles.suggestionItem, { borderColor: colors.separator }]}
              >
                <Text style={[styles.suggestionText, { fontSize: typography.fontSize, color: typography.textColor }]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Dosage & schedule inputs */}
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <Text style={[styles.cardTitle, { fontSize: typography.fontSize, fontWeight: typography.fontWeight, color: typography.textColor }]}>
          Amount (units per dose)
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          keyboardType="number-pad"
          placeholderTextColor={colors.textSecondary}
          value={String(amount)}
          onChangeText={t => setAmount(+t || 1)}
        />

        <Text style={[styles.cardTitle, { fontSize: typography.fontSize, fontWeight: typography.fontWeight, color: typography.textColor }]}>
          Frequency
        </Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.smallInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            keyboardType="number-pad"
            placeholderTextColor={colors.textSecondary}
            value={String(doseCount)}
            onChangeText={t => setDoseCount(+t || 1)}
          />
          <Text style={[styles.centerText, { fontSize: typography.fontSize, color: typography.textColor }]}>
            per
          </Text>
          <TextInput
            style={[styles.smallInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            keyboardType="number-pad"
            placeholderTextColor={colors.textSecondary}
            value={String(periodCount)}
            onChangeText={t => setPeriodCount(+t || 1)}
          />
          <Picker
            selectedValue={periodUnit}
            style={styles.picker}
            onValueChange={v => setPeriodUnit(v as any)}
          >
            <Picker.Item label="day" value="day" />
            <Picker.Item label="week" value="week" />
          </Picker>
        </View>

        <Text style={[styles.cardTitle, { fontSize: typography.fontSize, fontWeight: typography.fontWeight, color: typography.textColor }]}>
          Duration
        </Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.smallInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            keyboardType="number-pad"
            placeholderTextColor={colors.textSecondary}
            value={String(durationCount)}
            onChangeText={t => setDurationCount(+t || 1)}
          />
          <Picker
            selectedValue={durationUnit}
            style={styles.picker}
            onValueChange={v => setDurationUnit(v as any)}
          >
            <Picker.Item label="day" value="day" />
            <Picker.Item label="week" value="week" />
          </Picker>
        </View>
      </View>

      {/* Add medication button */}
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <Pressable
          onPress={onAdd}
          style={[styles.addButton, { backgroundColor: colors.success }]}
        >
          <Text style={[styles.addButtonText, { fontSize: typography.fontSize, fontWeight: typography.fontWeight, color: colors.card }]}>
            Add Medication
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionHeader, { fontSize: typography.fontSize + 2, fontWeight: typography.fontWeight, color: typography.textColor }]}>
        Your Medications
      </Text>
    </View>
  );
}

/** ------------------------------ Screen ------------------------------ */
export default function MedicationScreen() {
  // Avoid unused settings var
  const { settings: _settings } = useContext(SettingsContext);
  const { colors, typography, backgroundImage } = useTheme();
  const uid = auth.currentUser!.uid;
  const medsRef = db.collection('users').doc(uid).collection('medications');

  // Search state: one source of truth for the input
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [name, setName] = useState('');

  // Dosage / schedule
  const [amount, setAmount] = useState(1);
  const [doseCount, setDoseCount] = useState(1);
  const [periodCount, setPeriodCount] = useState(1);
  const [periodUnit, setPeriodUnit] = useState<'day' | 'week'>('day');
  const [durationCount, setDurationCount] = useState(1);
  const [durationUnit, setDurationUnit] = useState<'day' | 'week'>('day');

  // Current medications
  const [medList, setMedList] = useState<{ id: string; data: any }[]>([]);

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert(msg);
  };

  // Subscribe to meds, remove expired
  useEffect(() => {
    const unsubscribe = medsRef.orderBy('createdAt', 'desc').onSnapshot(
      snap => {
        const now = Date.now();
        const live: { id: string; data: any }[] = [];
        snap.docs.forEach(doc => {
          const data = doc.data();
          if (data.expiresAt) {
            const exp = (data.expiresAt as firebase.firestore.Timestamp).toMillis();
            if (exp < now) {
              medsRef.doc(doc.id).delete().catch(console.error);
              return;
            }
          }
          live.push({ id: doc.id, data });
        });
        setMedList(live);
      },
      err => console.error(err)
    );
    return () => unsubscribe();
  }, []);

  // Debounce searchInput → searchText for Firestore
  useEffect(() => {
    const q = searchInput.trim().toLowerCase();
    if (q.length < 2) {
      setSearchText('');
      return;
    }
    const t = setTimeout(() => {
      setSearchText(q);
    }, 150);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch suggestions
  useEffect(() => {
    if (searchText.length < 2) {
      setSuggestions([]);
      return;
    }
    db.collection('drugs')
      .orderBy('name')
      .startAt(searchText)
      .endAt(searchText + '\uf8ff')
      .limit(10)
      .get()
      .then(snap => {
        const names = snap.docs.map(d => d.data().name as string);
        setSuggestions(names);
      })
      .catch(err => {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      });
  }, [searchText]);

  // Interaction check
  async function checkInteractions(drugNameLower: string) {
    const interactions: { other: string; message?: string }[] = [];
    if (!drugNameLower || medList.length === 0) return interactions;
    for (const med of medList) {
      const other = (med.data?.name || '').toLowerCase();
      if (!other || other === drugNameLower) continue;
      const id1 = `${drugNameLower}_${other}`;
      const id2 = `${other}_${drugNameLower}`;
      let doc: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData> | null = null;
      try {
        const doc1 = await db.collection('ddi').doc(id1).get();
        if (doc1.exists) doc = doc1;
        else {
          const doc2 = await db.collection('ddi').doc(id2).get();
          if (doc2.exists) doc = doc2;
        }
      } catch (error) {
        console.error('Error querying ddi collection for', id1, '/', id2, error);
        continue;
      }
      if (doc && doc.exists) {
        const data: any = doc.data();
        interactions.push({ other, message: data?.interaction });
      }
    }
    return interactions;
  }

  const addMedication = async () => {
    if (!name) {
      showToast('Please select a drug name.');
      return;
    }

    try {
      const interactions = await checkInteractions(name.toLowerCase());
      if (interactions.length > 0) {
        const lines = interactions.map(({ other, message }) => `${name} + ${other}: ${message || 'Unknown interaction'}`);
        Alert.alert('Drug interaction warning', lines.join('\n'));
      }
    } catch (err) {
      console.error('Error checking interactions:', err);
    }

    const now = Date.now();
    const days = durationUnit === 'week' ? durationCount * 7 : durationCount;
    const expiresAt = firebase.firestore.Timestamp.fromMillis(now + days * 24 * 60 * 60 * 1000);
    await medsRef.add({
      name,
      amount,
      doseCount,
      periodCount,
      periodUnit,
      durationCount,
      durationUnit,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      expiresAt,
    });

    // Reset form
    setName('');
    setSearchInput('');
    setSearchText('');
    setAmount(1);
    setDoseCount(1);
    setPeriodCount(1);
    setPeriodUnit('day');
    setDurationCount(1);
    setDurationUnit('day');
    setSuggestions([]);
  };

  const removeMedication = (id: string) => {
    medsRef.doc(id).delete().catch(console.error);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ImageBackground source={backgroundImage} style={styles.background} imageStyle={styles.bgImage}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Stable, top-level header above the list */}
          <MedsFormHeader
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            setSearchText={setSearchText}
            name={name}
            setName={setName}
            amount={amount}
            setAmount={setAmount}
            doseCount={doseCount}
            setDoseCount={setDoseCount}
            periodCount={periodCount}
            setPeriodCount={setPeriodCount}
            periodUnit={periodUnit}
            setPeriodUnit={setPeriodUnit}
            durationCount={durationCount}
            setDurationCount={setDurationCount}
            durationUnit={durationUnit}
            setDurationUnit={setDurationUnit}
            colors={colors}
            typography={typography}
            onAdd={addMedication}
          />

          <FlatList
            keyboardShouldPersistTaps="always"
            data={medList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const d = item.data;
              return (
                <View style={[styles.medCard, { backgroundColor: colors.card }]}>
                  <View style={styles.medText}>
                    <Text style={[styles.medName, { fontSize: typography.fontSize, fontWeight: typography.fontWeight, color: typography.textColor }]}>
                      {d.name}
                    </Text>
                    <Text style={[styles.medDetail, { fontSize: typography.fontSize - 2, color: colors.textSecondary }]}>
                      {d.amount} unit(s) — {d.doseCount} per {d.periodCount} {d.periodUnit}(s) for {d.durationCount} {d.durationUnit}(s)
                    </Text>
                  </View>
                  <Pressable style={[styles.removeButton, { backgroundColor: colors.danger }]} onPress={() => removeMedication(item.id)}>
                    <Text style={[styles.removeText, { fontSize: typography.fontSize, fontWeight: typography.fontWeight, color: colors.card }]}>Remove</Text>
                  </Pressable>
                </View>
              );
            }}
            contentContainerStyle={[styles.listContainer, { paddingHorizontal: 16 }]}
          />
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  background: { flex: 1, width, height },
  bgImage: { opacity: 0.6, resizeMode: 'cover' },
  flex: { flex: 1 },

  scroll: { padding: 16, paddingBottom: 32 },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  suggestions: {
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {},
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  smallInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    width: 64,
    textAlign: 'center',
    marginRight: 8,
  },
  centerText: { marginHorizontal: 8 },
  picker: { flex: 1, marginLeft: 8 },
  addButton: { paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  addButtonText: {},
  sectionHeader: { marginBottom: 12, marginTop: 8 },

  medCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  medText: { flex: 1, marginRight: 12 },
  medName: {},
  medDetail: {},
  removeButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  removeText: {},
  listContainer: { paddingBottom: 32 },
});
