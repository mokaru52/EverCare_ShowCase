// src/screens/AddAppointment.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar, DateData, CalendarProps } from 'react-native-calendars';
import {
  getProviders,
  getSlots,
  saveBookedAppointment,
} from '../services/appointment/appointmentService';
import { addAppointmentToCalendar } from '../services/calendarService';
import type { Provider, Slot, Appointment } from '../types/appointment';
import Colors from '../styles/Colors';
import { SettingsContext } from '../context/SettingsContext';

const background = require('../assets/background.png');
const { width, height } = Dimensions.get('window');

// ---- stable font keys + safe defaults so useContext never throws ----
type FontKey = 'small' | 'medium' | 'large' | 'xlarge';
const FONT_SIZES: Record<FontKey, number> = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
};
const FALLBACK_SETTINGS = {
  fontSizeKey: 'medium' as FontKey,
  boldText: false,
  highContrast: false,
  darkMode: false,
};

export default function AddAppointment() {
  // SETTINGS (guard against undefined context)
  const ctx = useContext(SettingsContext);
  const settings = ctx?.settings ?? FALLBACK_SETTINGS;

  const fontSize   = FONT_SIZES[settings.fontSizeKey as FontKey];
  const fontWeight = settings.boldText ? '700' : '400';
  const textColor  = settings.highContrast ? '#000' : settings.darkMode ? Colors.white : Colors.blue;
  const bgColor    = settings.darkMode ? Colors.black : Colors.white;

  // STATE
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selProv, setSelProv] = useState<string>('');
  const [slotsByDay, setSlotsByDay] = useState<Record<string, Slot[]>>({});
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDay, setSelectedDay] = useState(today);

  // LOAD PROVIDERS once
  useEffect(() => {
    const list = getProviders();
    setProviders(list);
    if (list.length) setSelProv(list[0].id);
  }, []);

  // FETCH SLOTS — depends ONLY on provider (not on selectedDay)
  const fetchSlots = useCallback(async () => {
    if (!selProv) return;
    setLoading(true);
    try {
      const raw: Slot[] = await getSlots(selProv);
      const grouped: Record<string, Slot[]> = {};
      raw.forEach(s => {
        if (!s.startTime || !s.isAvailable) return;
        const day = s.startTime.split('T')[0];
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(s);
      });
      setSlotsByDay(grouped);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  }, [selProv]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // After slots change (initial load or provider switch), auto-pick a day if needed
  useEffect(() => {
    if (!Object.keys(slotsByDay).length) return;
    if (!slotsByDay[selectedDay]?.length) {
      const firstDay = Object.keys(slotsByDay).sort()[0];
      if (firstDay) setSelectedDay(firstDay);
    }
  }, [slotsByDay]); // not on selectedDay

  // BOOK slot (keep this hook above any return)
  const handleBook = useCallback(
    async (slot: Slot) => {
      const appt: Appointment = {
        provider: providers.find(p => p.id === selProv)!,
        doctor: { id: slot.doctorId, firstName: '', lastName: '', specialty: '', clinics: [] },
        slot,
      };
      try {
        await saveBookedAppointment(appt);
        await addAppointmentToCalendar(appt);

        // immediately remove from UI
        setSlotsByDay(prev => {
          const day = slot.startTime.split('T')[0];
          const filtered = (prev[day] || []).filter(s => s.slotId !== slot.slotId);
          if (!filtered.length) {
            const { [day]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [day]: filtered };
        });
      } catch (err) {
        console.error('Error booking slot:', err);
      }
    },
    [providers, selProv]
  );

  // MARKED DATES
  const markedDates: CalendarProps['markedDates'] = useMemo(() => {
    const marks: Record<string, any> = {};
    Object.entries(slotsByDay).forEach(([day, slots]) => {
      if (slots.length) marks[day] = { marked: true, dotColor: Colors.green };
    });
    marks[selectedDay] = { ...(marks[selectedDay] || {}), selected: true, selectedColor: Colors.green };
    return marks;
  }, [slotsByDay, selectedDay]);

  // EARLY RETURN AFTER all hooks defined
  if (loading && !Object.keys(slotsByDay).length) {
    return <ActivityIndicator style={{ flex: 1, marginTop: 50 }} />;
  }

  // RENDER
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <ImageBackground source={background} style={styles.background} imageStyle={styles.bgImage}>
        <Text style={[styles.label, { fontSize, fontWeight, color: textColor }]}>Provider:</Text>

        <Picker selectedValue={selProv} onValueChange={setSelProv} style={styles.picker}>
          {providers.map(p => (
            <Picker.Item key={p.id} label={p.name} value={p.id} />
          ))}
        </Picker>

        <Calendar
          markedDates={markedDates}
          onDayPress={(day: DateData) => setSelectedDay(day.dateString)} // yyyy-mm-dd
          theme={{
            todayTextColor: Colors.green,
            selectedDayBackgroundColor: Colors.green,
            dotColor: Colors.green,
          }}
        />

        <FlatList
          data={slotsByDay[selectedDay] || []}
          keyExtractor={item => item.slotId}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.slotItem} onPress={() => handleBook(item)}>
              <Text style={[styles.slotText, { fontSize, color: textColor }]}>
                {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {item.branch.name}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyDate}>
              <Text style={[styles.emptyText, { fontSize, color: textColor }]}>
                No slots available on this day
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1 },
  background:    { flex: 1, width, height },
  bgImage:       { opacity: 0.6, resizeMode: 'cover' },
  label:         { margin: 16, fontWeight: '600' },
  picker:        { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 6 },
  slotItem:      {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop:       12,
    borderRadius:    8,
    padding:         16,
    shadowColor:     '#000',
    shadowOpacity:   0.03,
    shadowRadius:    4,
    shadowOffset:    { width: 0, height: 1 },
    elevation:       1,
  },
  slotText:      {},
  emptyDate:     { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  emptyText:     {},
  listContainer: { flexGrow: 1, paddingBottom: 16 },
});
