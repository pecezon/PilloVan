import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  trips: any[];
  title: string;
  onSelectTrip: (trip: any) => void;
};

export default function TripListModal({ visible, onClose, trips, title, onSelectTrip }: Props) {
  const renderItem = ({ item }: { item: any }) => {
    let statusBg = 'bg-gray-100';
    let statusText = 'text-gray-700';
    
    if (item.status === 'PENDING') {
      statusBg = 'bg-amber-100';
      statusText = 'text-amber-700';
    } else if (item.status === 'IN_PROGRESS') {
      statusBg = 'bg-blue-100';
      statusText = 'text-blue-700';
    } else if (item.status === 'COMPLETED') {
      statusBg = 'bg-emerald-100';
      statusText = 'text-emerald-700';
    } else if (item.status === 'CANCELLED') {
      statusBg = 'bg-red-100';
      statusText = 'text-red-700';
    }

    return (
      <TouchableOpacity 
        className="flex-row items-center justify-between bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100"
        onPress={() => {
          onSelectTrip(item);
          onClose();
        }}
      >
        <View className="flex-1 mr-4">
          <Text className="text-gray-900 font-bold text-lg mb-1">{item.tour?.name || 'Unknown Tour'}</Text>
          <Text className="text-gray-500 font-medium">{new Date(item.pickup_time).toLocaleDateString()}</Text>
        </View>
        <View className={`px-3 py-1.5 rounded-full ${statusBg}`}>
          <Text className={`text-xs font-bold uppercase tracking-wider ${statusText}`}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-gray-50 mt-12 rounded-t-[32px] shadow-2xl overflow-hidden border-t border-gray-200">
        <View className="p-6 flex-1">
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-2xl font-black text-gray-900 tracking-tight">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-2.5 bg-gray-200/80 rounded-full">
              <Text className="text-gray-600 font-bold text-sm">✕</Text>
            </TouchableOpacity>
          </View>

          {trips?.length === 0 ? (
            <Text className="text-gray-500 text-center mt-10 font-medium">No trips found.</Text>
          ) : (
            <FlatList
              data={trips}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
