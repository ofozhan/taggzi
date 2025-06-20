import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Alert, TouchableOpacity, Modal, TextInput, useColorScheme
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { lightColors, darkColors, getStyles } from '../theme';
import { formatCurrency } from '../utils';

const KayitItem_detail = ({ item, tip, onEdit, colors }) => {
    const styles = getStyles(colors);
    return (
        <View style={styles.kayitItem_detail}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.kayitTutar, { color: tip === 'kazanc' ? colors.green : colors.red }]}>
                    {tip === 'kazanc' ? '+ ' : '- '}{formatCurrency(item.tutar)}
                </Text>
                {item.not ? <Text style={styles.notText}>{item.not}</Text> : null}
            </View>
            <TouchableOpacity onPress={onEdit} style={styles.editButton_detail}>
                <Ionicons name="pencil-outline" size={20} color={colors.subtext} />
            </TouchableOpacity>
        </View>
    );
};
const OzetSatiri_detail = ({ label, deger, renk, colors }) => {
    const styles = getStyles(colors);
    return (
        <View style={styles.ozetSatiri}>
            <Text style={styles.ozetLabel}>{label}</Text>
            <Text style={[styles.ozetDeger, { color: renk || colors.text }]}>{deger}</Text>
        </View>
    );
};

export default function DayDetailScreen({ route, navigation }) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { date } = route.params; 
  const [dayData, setDayData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [editingItem, setEditingItem] = useState(null); 
  const [editTutar, setEditTutar] = useState(''); 
  const [editNot, setEditNot] = useState('');
  
  const handleDeleteDay = useCallback(() => { Alert.alert("Kaydı Sil", `${new Date(date).toLocaleDateString('tr-TR')} tarihli kaydı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`, [{ text: "İptal", style: "cancel" }, { text: "Evet, Sil", onPress: async () => { try { const storageKey = `@TagziApp:data_${date}`; await AsyncStorage.removeItem(storageKey); navigation.goBack(); } catch (e) { console.error("Failed to delete data", e); Alert.alert("Hata", "Kayıt silinirken bir sorun oluştu."); } }, style: "destructive", }]); }, [navigation, date]); 
  
  useLayoutEffect(() => { navigation.setOptions({ headerRight: () => (<TouchableOpacity onPress={handleDeleteDay} style={{ marginRight: 15 }}><Ionicons name="trash-outline" size={24} color={colors.red} /></TouchableOpacity>), headerStyle: { backgroundColor: colors.header }, headerTintColor: colors.text, }); }, [navigation, handleDeleteDay, colors]);
  
  const loadDayData = useCallback(async () => { setIsLoading(true); const storageKey = `@TagziApp:data_${date}`; try { const dataString = await AsyncStorage.getItem(storageKey); if (dataString) { const parsedData = JSON.parse(dataString); const toplamKazanc = (parsedData.kazanclar || []).reduce((sum, item) => sum + item.tutar, 0); const baslangic = parseFloat(parsedData.startKm) || 0; const bitis = parseFloat(parsedData.endKm) || 0; const maliyetPerKm = parseFloat(parsedData.yakitMaliyeti) || 0; const toplamKm = bitis > baslangic ? bitis - baslangic : 0; const yakitMasrafi = toplamKm * maliyetPerKm; const toplamEkstraMasraf = (parsedData.ekstraMasraflar || []).reduce((sum, item) => sum + item.tutar, 0); const toplamMasraf = yakitMasrafi + toplamEkstraMasraf; const netKar = toplamKazanc - toplamMasraf; setDayData({ ...parsedData, toplamKazanc, toplamMasraf, toplamKm, netKar, yakitMasrafi }); } } catch (e) { console.error("Failed to load day data", e); } finally { setIsLoading(false); } }, [date]);
  
  useEffect(() => { loadDayData(); }, [loadDayData]);

  const openEditModal = useCallback((item, tip) => { setEditingItem({ ...item, tip }); setEditTutar(item.tutar.toString()); setEditNot(item.not || ''); setIsModalVisible(true); }, []);
  const handleSaveChanges = useCallback(async () => { if (!editingItem || !editTutar) { Alert.alert("Hata", "Tutar boş bırakılamaz."); return; } const updatedDayData = JSON.parse(JSON.stringify(dayData)); const listToUpdate = editingItem.tip === 'kazanc' ? updatedDayData.kazanclar : updatedDayData.ekstraMasraflar; const itemIndex = listToUpdate.findIndex(item => item.id === editingItem.id); if (itemIndex > -1) { listToUpdate[itemIndex].tutar = parseFloat(editTutar.replace(',', '.')) || 0; listToUpdate[itemIndex].not = editNot; } try { const storageKey = `@TagziApp:data_${date}`; await AsyncStorage.setItem(storageKey, JSON.stringify(updatedDayData)); await loadDayData(); setIsModalVisible(false); setEditingItem(null); } catch (e) { console.error("Failed to save edited data", e); Alert.alert("Hata", "Değişiklikler kaydedilirken bir sorun oluştu."); } }, [editingItem, editTutar, editNot, dayData, date, loadDayData]);
  
  if (isLoading) { return <View style={styles.centeredContainer}><ActivityIndicator size="large" color={colors.green} /></View>; }
  if (!dayData) { return <View style={styles.centeredContainer}><Text style={styles.dateText_detail}>Bu tarihe ait veri bulunamadı.</Text></View>; }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.ozetKarti}>
          <OzetSatiri_detail label="Net Kâr:" deger={formatCurrency(dayData.netKar)} renk={dayData.netKar >= 0 ? colors.green : colors.red} colors={colors}/>
          <View style={styles.separator} />
          <OzetSatiri_detail label="Toplam Kazanç:" deger={formatCurrency(dayData.toplamKazanc)} colors={colors} />
          <OzetSatiri_detail label="Toplam Masraf:" deger={formatCurrency(dayData.toplamMasraf)} colors={colors} />
          <OzetSatiri_detail label="Toplam Yol:" deger={`${dayData.toplamKm.toFixed(1)} km`} colors={colors} />
        </View>
        <View style={styles.listelerContainer}>
          <View style={{ flex: 1 }}><Text style={styles.listeBaslik}>Kazançlar</Text>{dayData.kazanclar && dayData.kazanclar.length > 0 ? ( dayData.kazanclar.map(item => <KayitItem_detail key={item.id} item={item} tip="kazanc" onEdit={() => openEditModal(item, 'kazanc')} colors={colors}/>)) : ( <Text style={styles.emptyText}>Kazanç kaydı yok.</Text> )}</View>
          <View style={{ flex: 1 }}><Text style={styles.listeBaslik}>Ekstra Masraflar</Text>{dayData.ekstraMasraflar && dayData.ekstraMasraflar.length > 0 ? ( dayData.ekstraMasraflar.map(item => <KayitItem_detail key={item.id} item={item} tip="masraf" onEdit={() => openEditModal(item, 'masraf')} colors={colors}/>)) : ( <Text style={styles.emptyText}>Masraf kaydı yok.</Text> )}</View>
        </View>
      </ScrollView>
      <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kaydı Düzenle</Text>
            <TextInput style={styles.input} placeholder="Tutar" keyboardType="numeric" value={editTutar} onChangeText={setEditTutar} returnKeyType="done" />
            <TextInput style={styles.input} placeholder="Not (isteğe bağlı)" value={editNot} onChangeText={setEditNot} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveChanges}>
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}