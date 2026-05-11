import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { getDayFromDate, getTimeFromDate } from '../utils/dateUtils';
import { useUpdateTripStatus } from '../api/trips';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const items = [
  { key: "PENDING", color: "bg-orange-500" },
  { key: "IN_PROGRESS", color: "bg-blue-500" },
  { key: "COMPLETED", color: "bg-green-500" },
  { key: "CANCELLED", color: "bg-red-500" },
];

export default function TripModal({ trip, isOpen, onClose }: { trip: any, isOpen: boolean, onClose: () => void }) {
  const { mutate: updateTripStatus } = useUpdateTripStatus();
  const [selectedStatus, setSelectedStatus] = useState(trip?.status);
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (trip?.status) {
      setSelectedStatus(trip.status);
    }
  }, [trip?.status]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .single();
      setRole(data?.role);
    };
    fetchProfile();
  }, [user]);

  const handleStatusChange = (newStatus: string) => {
    updateTripStatus({ tripId: trip.id, status: newStatus }, {
      onSuccess: () => {
        setSelectedStatus(newStatus);
      }
    });
  };

  const tourists = trip?.users
    ?.filter((u: any) => u.user?.role === "TOURIST")
    .map((u: any) => `${u.user?.firstName} ${u.user?.lastName}`)
    .join(", ");

  const openWhatsApp = () => {
    if (trip?.whatsApp_group_link) {
      Linking.openURL(trip.whatsApp_group_link);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center p-6 bg-white border-b border-gray-100 shadow-sm z-10">
          <Text className="text-2xl font-black text-gray-900 tracking-tight">Trip Details</Text>
          <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full w-10 h-10 items-center justify-center active:bg-gray-200">
            <Text className="text-gray-500 font-bold">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="p-6">
          <View className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
            <View className="flex-row gap-3 mb-4 items-center">
              <Text className="text-lg font-bold text-gray-900">Tour:</Text>
              <Text className="text-[17px] font-medium text-gray-600 flex-1 leading-6" numberOfLines={2}>{trip?.tour?.name}</Text>
            </View>
            <View className="h-[1px] bg-gray-100 my-2" />
            
            <View className="gap-5 mt-4">
              <View>
                <Text className="font-bold text-gray-800 mb-1">Tourists:</Text>
                <Text className="text-gray-600 font-medium">{tourists || "None"}</Text>
              </View>
              <View>
                <Text className="font-bold text-gray-800 mb-1">Pickup Location:</Text>
                <Text className="text-gray-600 font-medium">{trip?.pickup_location}</Text>
              </View>
              <View>
                <Text className="font-bold text-gray-800 mb-1">Dropoff Location:</Text>
                <Text className="text-gray-600 font-medium">{trip?.dropoff_location}</Text>
              </View>
              <View>
                <Text className="font-bold text-gray-800 mb-1">Pickup Time:</Text>
                <Text className="text-blue-600 font-bold">
                  {getDayFromDate(trip?.pickup_time)} <Text className="text-gray-600 font-medium">at</Text> {getTimeFromDate(trip?.pickup_time)}
                </Text>
              </View>
              <View>
                <Text className="font-bold text-gray-800 mb-1">Party Size:</Text>
                <Text className="text-gray-600 font-medium">{trip?.party_size}</Text>
              </View>
              
              <View className="mt-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <Text className="font-bold text-gray-800 mb-3">Status:</Text>
                {(role === "ADMIN" || role === "COMPANY") ? (
                  <View className="flex-row flex-wrap gap-2">
                    {items.map(item => (
                      <TouchableOpacity 
                        key={item.key} 
                        onPress={() => handleStatusChange(item.key)}
                        className={`px-4 py-2.5 rounded-xl border ${selectedStatus === item.key ? item.color + ' border-transparent shadow-sm' : 'bg-white border-gray-200 active:bg-gray-50'}`}
                      >
                        <Text className={`font-bold tracking-wide text-xs uppercase ${selectedStatus === item.key ? 'text-white' : 'text-gray-600'}`}>
                          {item.key.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View className={`self-start px-4 py-2 rounded-xl shadow-sm ${items.find(i => i.key === selectedStatus)?.color || 'bg-gray-200'}`}>
                    <Text className="text-white font-bold tracking-wide text-xs uppercase">{selectedStatus?.replace('_', ' ')}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {trip?.whatsApp_group_link && (
            <TouchableOpacity 
              className="bg-[#25D366] p-4 rounded-2xl flex-row justify-center items-center shadow-sm shadow-green-500/20 active:bg-[#20bd5a]"
              onPress={openWhatsApp}
            >
              <Text className="text-white font-black text-[17px] tracking-wide">WhatsApp Group</Text>
            </TouchableOpacity>
          )}
          <View className="h-20" />
        </ScrollView>
      </View>
    </Modal>
  );
}
