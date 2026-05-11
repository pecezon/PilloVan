import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { useCreateTrip } from '../api/trips';
import { useCompanyTours } from '../api/tours';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function NewTripModal({ visible, onClose }: Props) {
  const { user } = useAuth();
  const { mutate, isPending: isCreating } = useCreateTrip();
  const { data: tours, isPending: isLoadingTours } = useCompanyTours(user?.id);

  const [tripData, setTripData] = useState({
    tour_id: '',
    pickup_time: new Date(),
    party_size: '1',
    pickup_location: '',
    dropoff_location: '',
    status: 'PENDING',
    participants_emails: [] as string[],
    whatsApp_group_link: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleAddEmail = () => {
    if (emailInput.trim() && emailInput.includes('@')) {
      setTripData({
        ...tripData,
        participants_emails: [...tripData.participants_emails, emailInput.trim()],
      });
      setEmailInput('');
    } else {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setTripData({
      ...tripData,
      participants_emails: tripData.participants_emails.filter((e) => e !== emailToRemove),
    });
  };

  const handleCreate = () => {
    if (!tripData.tour_id || !tripData.pickup_location || !tripData.dropoff_location || !tripData.party_size) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const payload = {
      ...tripData,
      pickup_time: tripData.pickup_time.toISOString(),
      party_size: parseInt(tripData.party_size, 10) || 1,
      companyId: user?.id || '',
    };

    mutate(payload, {
      onSuccess: () => {
        setTripData({
          tour_id: '',
          pickup_time: new Date(),
          party_size: '1',
          pickup_location: '',
          dropoff_location: '',
          status: 'PENDING',
          participants_emails: [],
          whatsApp_group_link: '',
        });
        Alert.alert('Success', 'Trip created successfully!');
        onClose();
      },
      onError: (err) => {
        console.error(err);
        Alert.alert('Error', 'Could not create trip.');
      }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-white rounded-t-[32px] p-6 h-5/6 shadow-2xl border-t border-gray-200">
          <View className="flex-row justify-between items-center mb-8 mt-2">
            <Text className="text-2xl font-black text-gray-900 tracking-tight">Create New Trip</Text>
            <TouchableOpacity onPress={onClose} className="p-2.5 bg-gray-100 rounded-full">
              <Text className="text-gray-500 font-bold text-sm">✕</Text>
            </TouchableOpacity>
          </View>

          {isLoadingTours ? (
            <ActivityIndicator size="large" color="#0ea5e9" />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-5">
                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Tour *</Text>
                <View className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                  <Picker
                    selectedValue={tripData.tour_id}
                    onValueChange={(itemValue) => setTripData({ ...tripData, tour_id: itemValue })}
                    style={{ color: '#111827' }}
                    dropdownIconColor="#6b7280"
                  >
                    <Picker.Item label="Select a tour..." value="" />
                    {tours?.map((tour: any) => (
                      <Picker.Item key={tour.id} label={tour.name} value={tour.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View className="mb-5">
                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Pickup Location *</Text>
                <TextInput
                  className="bg-gray-50 text-gray-900 p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="Enter pickup location"
                  placeholderTextColor="#9ca3af"
                  value={tripData.pickup_location}
                  onChangeText={(t) => setTripData({ ...tripData, pickup_location: t })}
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Dropoff Location *</Text>
                <TextInput
                  className="bg-gray-50 text-gray-900 p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="Enter dropoff location"
                  placeholderTextColor="#9ca3af"
                  value={tripData.dropoff_location}
                  onChangeText={(t) => setTripData({ ...tripData, dropoff_location: t })}
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Pickup Time *</Text>
                <TouchableOpacity 
                  className="bg-gray-50 p-4 rounded-2xl border border-gray-200 active:bg-gray-100"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className="text-gray-900 font-medium">{tripData.pickup_time.toLocaleString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={tripData.pickup_time}
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setTripData({ ...tripData, pickup_time: selectedDate });
                      }
                    }}
                  />
                )}
              </View>

              <View className="mb-5">
                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Party Size *</Text>
                <TextInput
                  className="bg-gray-50 text-gray-900 p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:bg-white"
                  placeholder="Enter party size"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={tripData.party_size}
                  onChangeText={(t) => setTripData({ ...tripData, party_size: t })}
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">WhatsApp Group Link</Text>
                <TextInput
                  className="bg-gray-50 text-gray-900 p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:bg-white"
                  placeholder="Enter link"
                  placeholderTextColor="#9ca3af"
                  value={tripData.whatsApp_group_link}
                  onChangeText={(t) => setTripData({ ...tripData, whatsApp_group_link: t })}
                />
              </View>

              <View className="mb-8 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <Text className="text-gray-700 font-bold mb-3 text-sm">Participants Emails</Text>
                <View className="flex-row gap-2 mb-4">
                  <TextInput
                    className="flex-1 bg-white text-gray-900 p-3.5 rounded-xl border border-gray-200 shadow-sm"
                    placeholder="Enter email"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={emailInput}
                    onChangeText={setEmailInput}
                  />
                  <TouchableOpacity 
                    className="bg-blue-600 px-5 justify-center rounded-xl shadow-sm shadow-blue-500/30 active:bg-blue-700"
                    onPress={handleAddEmail}
                  >
                    <Text className="text-white font-bold">Add</Text>
                  </TouchableOpacity>
                </View>

                {tripData.participants_emails.map((email, index) => (
                  <View key={index} className="flex-row items-center justify-between bg-white p-3 px-4 rounded-xl mb-2 shadow-sm border border-gray-100">
                    <Text className="text-gray-700 font-medium flex-1">{email}</Text>
                    <TouchableOpacity onPress={() => handleRemoveEmail(email)} className="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                      <Text className="text-red-600 font-bold text-xs uppercase tracking-wide">Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                className={`p-4 rounded-2xl items-center mb-10 shadow-sm ${isCreating ? 'bg-gray-400' : 'bg-blue-600 shadow-blue-500/30 active:bg-blue-700'}`}
                onPress={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg tracking-wide">Create Trip</Text>}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
