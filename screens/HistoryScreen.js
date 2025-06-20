import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { subDays, startOfMonth, isWithinInterval } from 'date-fns';
import { lightColors, darkColors, getStyles } from '../theme';
import { formatCurrency } from '../utils';

const SummaryBox = ({ label, value, colors }) => {
  const styles = getStyles(colors);
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{formatCurrency(value)}</Text>
    </View>
  );
}

export default function HistoryScreen({ navigation }) { 
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);
  
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadAllData = async () => {
        setIsLoading(true);
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          const dataKeys = allKeys.filter(key => key.startsWith('@TagziApp:data_'));
          const dataPairs = await AsyncStorage.multiGet(dataKeys);
          
          const parsedData = dataPairs.map(pair => {
            if (!pair[1]) return null;
            const date = pair[0].split('_')[1];
            const dayData = JSON.parse(pair[1]);
            const toplamKazanc = (dayData.kazanclar || []).reduce((sum, item) => sum + item.tutar, 0);
            const baslangic = parseFloat(dayData.startKm) || 0;
            const bitis = parseFloat(dayData.endKm) || 0;
            const maliyetPerKm = parseFloat(dayData.yakitMaliyeti) || 0;
            const toplamKm = bitis > baslangic ? bitis - baslangic : 0;
            const yakitMasrafi = toplamKm * maliyetPerKm;
            const toplamEkstraMasraf = (dayData.ekstraMasraflar || []).reduce((sum, item) => sum + item.tutar, 0);
            const toplamMasraf = yakitMasrafi + toplamEkstraMasraf;
            const netKar = toplamKazanc - toplamMasraf;
            return { date, toplamKazanc, netKar };
          }).filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));
          setAllData(parsedData);
        } catch (e) { console.error("Failed to load history data", e); } 
        finally { setIsLoading(false); }
      };
      loadAllData();
    }, [])
  );
  
  const summary = useMemo(() => {
    const now = new Date();
    const last7DaysInterval = { start: subDays(now, 6), end: now };
    const thisMonthInterval = { start: startOfMonth(now), end: now };
    let totalEarnings = 0, last7DaysEarnings = 0, thisMonthEarnings = 0;
    for (const day of allData) {
      const dayDate = new Date(day.date);
      totalEarnings += day.toplamKazanc;
      if (isWithinInterval(dayDate, last7DaysInterval)) { last7DaysEarnings += day.toplamKazanc; }
      if (isWithinInterval(dayDate, thisMonthInterval)) { thisMonthEarnings += day.toplamKazanc; }
    }
    return { totalEarnings, last7DaysEarnings, thisMonthEarnings };
  }, [allData]);

  if (isLoading) {
    return <View style={styles.centeredContainer}><ActivityIndicator size="large" color={colors.green} /></View>;
  }

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem} 
      onPress={() => navigation.navigate('DayDetail', { date: item.date })}
    >
      <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      <View>
        <Text style={styles.earningsText}>Kazanç: {formatCurrency(item.toplamKazanc)}</Text>
        <Text style={[styles.netProfitText, { color: item.netKar >= 0 ? colors.green : colors.red }]}>Net Kâr: {formatCurrency(item.netKar)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.summaryContainer}>
        <SummaryBox label="Son 7 Gün" value={summary.last7DaysEarnings} colors={colors} />
        <SummaryBox label="Bu Ay" value={summary.thisMonthEarnings} colors={colors} />
        <SummaryBox label="Toplam" value={summary.totalEarnings} colors={colors} />
      </View>
      <FlatList
        data={allData}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.date}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz geçmiş bir kayıt bulunmuyor.</Text>}
      />
    </SafeAreaView>
  );
}