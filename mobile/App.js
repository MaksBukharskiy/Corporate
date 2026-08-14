import { useState } from 'react'
import { Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native'
import LoginScreen from './src/screens/LoginScreen'
import EmployeeScreen from './src/screens/EmployeeScreen'
import AdminScreen from './src/screens/AdminScreen'
import { colors } from './src/theme'

export default function App() {
  const [user, setUser] = useState(null)

  return (
    <SafeAreaView style={[styles.root, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight }]}>
      <StatusBar barStyle="dark-content" />
      {!user && <LoginScreen onLogin={setUser} />}
      {user?.role === 'employee' && <EmployeeScreen user={user} onLogout={() => setUser(null)} />}
      {user?.role === 'admin' && <AdminScreen user={user} onLogout={() => setUser(null)} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
})
