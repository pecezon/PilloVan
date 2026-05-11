import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import NewTourModal from './NewTourModal';
import NewTripModal from './NewTripModal';

export default function CreationMenu() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [tourModalVisible, setTourModalVisible] = useState(false);
  const [tripModalVisible, setTripModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-sky-500 w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-sky-500/50 elevation-5"
        onPress={() => setMenuVisible(true)}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>

      <Modal visible={menuVisible} animationType="fade" transparent={true} onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-end" 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View className="bg-slate-900 rounded-t-3xl p-6 pb-12 border-t border-slate-700">
            <Text className="text-xl font-bold text-white mb-6 text-center">Create New</Text>
            
            <TouchableOpacity 
              className="bg-slate-800 p-4 rounded-xl flex-row items-center mb-4 border border-slate-700"
              onPress={() => {
                setMenuVisible(false);
                setTripModalVisible(true);
              }}
            >
              <Text className="text-2xl mr-4">🚌</Text>
              <Text className="text-white font-semibold text-lg">Trip</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-700"
              onPress={() => {
                setMenuVisible(false);
                setTourModalVisible(true);
              }}
            >
              <Text className="text-2xl mr-4">🗺️</Text>
              <Text className="text-white font-semibold text-lg">Tour</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <NewTourModal visible={tourModalVisible} onClose={() => setTourModalVisible(false)} />
      <NewTripModal visible={tripModalVisible} onClose={() => setTripModalVisible(false)} />
    </>
  );
}
