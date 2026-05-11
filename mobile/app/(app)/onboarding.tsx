import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { Picker } from '@react-native-picker/picker';

export default function OnboardingScreen() {
  const { user, logout } = useAuth();
  
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: 'MALE',
    age: '',
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('finishedOnboarding')
          .eq('auth_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error(error);
        }
        setHasOnboarded(data?.finishedOnboarding || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const isValid = profile.firstName.trim() !== '' && 
                  profile.lastName.trim() !== '' && 
                  profile.phone.trim() !== '' && 
                  profile.age.trim() !== '';

  const handleSubmit = async () => {
    if (!isValid || !user) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          gender: profile.gender,
          age: parseInt(profile.age, 10) || 0,
          finishedOnboarding: true,
        })
        .eq('auth_id', user.id);

      if (error) {
        Alert.alert("Error", "There was an error updating your profile.");
        console.error(error);
      } else {
        router.replace('/');
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (hasOnboarded) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <Text className="text-2xl font-bold text-white text-center mb-6">Complete Your Profile</Text>
            
            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">First Name</Text>
              <TextInput
                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 focus:border-sky-500"
                placeholder="Enter your first name"
                placeholderTextColor="#64748b"
                value={profile.firstName}
                onChangeText={(text) => setProfile({ ...profile, firstName: text })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">Last Name</Text>
              <TextInput
                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 focus:border-sky-500"
                placeholder="Enter your last name"
                placeholderTextColor="#64748b"
                value={profile.lastName}
                onChangeText={(text) => setProfile({ ...profile, lastName: text })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">Phone Number</Text>
              <TextInput
                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 focus:border-sky-500"
                placeholder="e.g. +52 123 456 7890"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 font-semibold mb-2">Gender</Text>
              <View className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                <Picker
                  selectedValue={profile.gender}
                  onValueChange={(itemValue) => setProfile({ ...profile, gender: itemValue })}
                  style={{ color: 'white' }}
                  dropdownIconColor="white"
                >
                  <Picker.Item label="Male" value="MALE" />
                  <Picker.Item label="Female" value="FEMALE" />
                  <Picker.Item label="Other" value="OTHER" />
                </Picker>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-slate-300 font-semibold mb-2">Age</Text>
              <TextInput
                className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 focus:border-sky-500"
                placeholder="Enter your age"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={profile.age}
                onChangeText={(text) => setProfile({ ...profile, age: text })}
              />
            </View>

            <TouchableOpacity 
              className={`p-4 rounded-xl items-center ${isValid ? 'bg-sky-500' : 'bg-slate-600'}`}
              disabled={!isValid || submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Complete Profile</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="p-4 mt-4 rounded-xl items-center border border-red-500/30 bg-red-500/10"
              onPress={logout}
            >
              <Text className="text-red-400 font-bold">Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
