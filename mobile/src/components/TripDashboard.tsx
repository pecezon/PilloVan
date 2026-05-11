import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import TripCard from './TripCard';
import TripModal from './TripModal';
import TripListModal from './TripListModal';
import { useAuth } from '../contexts/AuthContext';
import { useActiveTrips, useInactiveTrips } from '../api/trips';

export default function TripDashboard() {
  const { user } = useAuth();
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [listModalType, setListModalType] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const { isPending: isPendingActive, error: errorActive, data: activeTrips } = useActiveTrips(user?.id);
  const { isPending: isPendingInactive, error: errorInactive, data: inactiveTrips } = useInactiveTrips(user?.id);

  const openTrip = (trip: any) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const openListModal = (type: 'ACTIVE' | 'INACTIVE') => {
    setListModalType(type);
    setIsListModalOpen(true);
  };

  return (
    <View className="flex-1 bg-gray-50 mt-4 rounded-t-[40px] p-6 shadow-2xl border-t border-gray-200">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Active Section */}
        <View className="mb-8">
          <Text className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Active</Text>
          <View className="h-[1px] bg-gray-200 mb-5" />
          
          {isPendingActive && <ActivityIndicator size="small" color="#2563eb" className="my-4" />}
          {errorActive && <Text className="text-red-500 text-center my-2 font-medium">Error loading active trips</Text>}
          {activeTrips?.length === 0 && <Text className="text-gray-500 text-center my-4 font-medium">No active trips found</Text>}
          
          {activeTrips?.slice(0, 2).map((trip: any) => (
            <TripCard key={trip.id} trip={trip} onClick={() => openTrip(trip)} />
          ))}

          {activeTrips && activeTrips.length > 2 && (
            <TouchableOpacity 
              className="bg-blue-50 p-3.5 rounded-2xl mt-1 items-center border border-blue-100 active:bg-blue-100"
              onPress={() => openListModal('ACTIVE')}
            >
              <Text className="text-blue-700 font-bold text-[15px]">Show All Active ({activeTrips.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Inactive Section */}
        <View className="mb-8">
          <Text className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Inactive</Text>
          <View className="h-[1px] bg-gray-200 mb-5" />
          
          {isPendingInactive && <ActivityIndicator size="small" color="#2563eb" className="my-4" />}
          {errorInactive && <Text className="text-red-500 text-center my-2 font-medium">Error loading inactive trips</Text>}
          {inactiveTrips?.length === 0 && <Text className="text-gray-500 text-center my-4 font-medium">No inactive trips found</Text>}
          
          {inactiveTrips?.slice(0, 2).map((trip: any) => (
            <TripCard key={trip.id} trip={trip} onClick={() => openTrip(trip)} />
          ))}

          {inactiveTrips && inactiveTrips.length > 2 && (
            <TouchableOpacity 
              className="bg-gray-100 p-3.5 rounded-2xl mt-1 items-center border border-gray-200 active:bg-gray-200"
              onPress={() => openListModal('INACTIVE')}
            >
              <Text className="text-gray-700 font-bold text-[15px]">Show All Inactive ({inactiveTrips.length})</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="h-20" />
      </ScrollView>

      {isModalOpen && (
        <TripModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          trip={selectedTrip} 
        />
      )}

      {isListModalOpen && (
        <TripListModal
          visible={isListModalOpen}
          onClose={() => setIsListModalOpen(false)}
          trips={listModalType === 'ACTIVE' ? activeTrips : inactiveTrips}
          title={listModalType === 'ACTIVE' ? 'All Active Trips' : 'All Inactive Trips'}
          onSelectTrip={openTrip}
        />
      )}
    </View>
  );
}
