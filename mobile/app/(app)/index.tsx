import { View, Text, SafeAreaView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import TripDashboard from '../../src/components/TripDashboard';
import CreationMenu from '../../src/components/CreationMenu';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { Redirect } from 'expo-router';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('finishedOnboarding, role')
          .eq('auth_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error(error);
        }
        setHasOnboarded(data?.finishedOnboarding || false);
        setRole(data?.role || 'TOURIST');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (hasOnboarded === false) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" />
      <View className="p-5 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-white tracking-tight">PilloVan</Text>
        <TouchableOpacity onPress={logout} className="bg-slate-800 px-4 py-2 rounded-xl">
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
      
      <Text className="text-center text-3xl font-bold text-white p-2 mb-2">Your Trips</Text>
      
      <TripDashboard />

      {(role === 'ADMIN' || role === 'COMPANY') && <CreationMenu />}
    </SafeAreaView>
  );
}
