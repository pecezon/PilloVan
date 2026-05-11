import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getDayFromDate, getTimeFromDate } from '../utils/dateUtils';

export default function TripCard({ trip, onClick }: { trip: any; onClick: () => void }) {
  const tourists = trip?.users
    ?.filter((u: any) => u.user?.role === "TOURIST")
    .map((u: any) => u.user?.firstName)
    .join(", ");

  return (
    <TouchableOpacity 
      className="bg-white shadow-sm shadow-black/5 rounded-2xl p-5 w-full flex-row justify-between mb-4 border border-gray-100 active:bg-gray-50/50"
      onPress={onClick}
    >
      <View className="flex-1 pr-3 justify-center">
        <Text className="text-[17px] font-bold text-gray-900 mb-1 tracking-tight">{trip?.tour?.name}</Text>
        <Text className="text-gray-500 text-sm font-medium" numberOfLines={1}>
          <Text className="font-semibold text-gray-700">Tourists:</Text> {tourists?.slice(0, 25)}{tourists?.length > 25 ? '...' : ''}
        </Text>
      </View>
      <View className="items-end justify-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
        <Text className="text-blue-600 font-bold text-[13px] uppercase tracking-wide">{getDayFromDate(trip?.pickup_time)}</Text>
        <Text className="text-gray-900 font-bold text-sm mt-0.5">{getTimeFromDate(trip?.pickup_time)}</Text>
      </View>
    </TouchableOpacity>
  );
}
