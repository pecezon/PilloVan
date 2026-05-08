import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function LoginScreen() {
  const { loginWithGoogle, user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(app)" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-slate-800 tracking-tight">PilloVan</Text>
          <Text className="text-lg text-slate-500 mt-2 text-center">
            Plataforma de Coordinación Turística
          </Text>
        </View>

        <TouchableOpacity 
          className="w-full bg-slate-900 py-4 rounded-xl items-center flex-row justify-center gap-3"
          onPress={loginWithGoogle}
        >
          <Text className="text-white font-semibold text-lg">Continuar con Google</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
