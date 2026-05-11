import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useCreateTour } from '../api/tours';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function NewTourModal({ visible, onClose }: Props) {
  const { user } = useAuth();
  const { mutate, isPending } = useCreateTour();

  const [tourData, setTourData] = useState({
    name: '',
    place: '',
    occupancy: '1',
    description: '',
  });

  const handleCreate = () => {
    if (!tourData.name || !tourData.place || !tourData.occupancy) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const payload = {
      ...tourData,
      occupancy: parseInt(tourData.occupancy, 10) || 1,
      companyId: user?.id || '',
    };

    mutate(payload, {
      onSuccess: () => {
        setTourData({ name: '', place: '', occupancy: '1', description: '' });
        Alert.alert('Success', 'Tour created successfully!');
        onClose();
      },
      onError: (err) => {
        console.error(err);
        Alert.alert('Error', 'Could not create tour.');
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-slate-900 rounded-t-3xl p-6 h-4/5 shadow-xl border-t border-slate-700">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-white">Create New Tour</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
              <Text className="text-slate-400 font-bold">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">Tour Name *</Text>
              <TextInput
                className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-sky-500"
                placeholder="Enter tour name"
                placeholderTextColor="#64748b"
                value={tourData.name}
                onChangeText={(t) => setTourData({ ...tourData, name: t })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">Place *</Text>
              <TextInput
                className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-sky-500"
                placeholder="Enter place"
                placeholderTextColor="#64748b"
                value={tourData.place}
                onChangeText={(t) => setTourData({ ...tourData, place: t })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">Occupancy *</Text>
              <TextInput
                className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-sky-500"
                placeholder="Number of people"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={tourData.occupancy}
                onChangeText={(t) => setTourData({ ...tourData, occupancy: t })}
              />
            </View>

            <View className="mb-6">
              <Text className="text-slate-300 font-semibold mb-2">Description</Text>
              <TextInput
                className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-sky-500"
                placeholder="Enter description"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={3}
                value={tourData.description}
                onChangeText={(t) => setTourData({ ...tourData, description: t })}
              />
            </View>

            <TouchableOpacity 
              className={`p-4 rounded-xl items-center ${isPending ? 'bg-slate-600' : 'bg-green-600'}`}
              onPress={handleCreate}
              disabled={isPending}
            >
              {isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Create Tour</Text>}
            </TouchableOpacity>
            <View className="h-10" />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
