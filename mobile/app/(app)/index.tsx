import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 flex-1">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-bold text-slate-900">Dashboard</Text>
          <TouchableOpacity onPress={logout} className="bg-red-100 px-4 py-2 rounded-lg">
            <Text className="text-red-600 font-semibold">Salir</Text>
          </TouchableOpacity>
        </View>
        
        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <Text className="text-lg text-slate-600">Bienvenido,</Text>
          <Text className="text-xl font-semibold text-slate-900 mt-1">
            {user?.email}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
