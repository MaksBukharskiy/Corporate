import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Card, PrimaryButton } from '../ui'
import { USERS, colors } from '../theme'

export default function LoginScreen({ onLogin }) {
  const [login, setLogin] = useState('ali')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState('')

  function submit() {
    const user = USERS.find(
      (item) => item.login === login.trim().toLowerCase() && item.password === password
    )
    if (!user) {
      setError('Неверный логин или пароль')
      return
    }
    onLogin(user)
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>C</Text>
        </View>
        <Text style={styles.title}>Benefits</Text>
        <Text style={styles.subtitle}>Click</Text>
      </View>

      <Card style={styles.form}>
        <Text style={styles.label}>Логин</Text>
        <TextInput
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          placeholder="ali или admin"
          placeholderTextColor={colors.muted}
        />
        <Text style={[styles.label, { marginTop: 14 }]}>Пароль</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder="1234"
          placeholderTextColor={colors.muted}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={{ height: 16 }} />
        <PrimaryButton title="Войти" onPress={submit} />
      </Card>

      <View style={styles.quick}>
        <Pressable style={styles.quickBtn} onPress={() => onLogin(USERS[0])}>
          <Text style={styles.quickText}>Сотрудник · ali / 1234</Text>
        </Pressable>
        <Pressable style={styles.quickBtn} onPress={() => onLogin(USERS[1])}>
          <Text style={styles.quickText}>Админ · admin / 1234</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  form: {
    padding: 18,
  },
  label: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#fff',
  },
  error: {
    color: '#dc2626',
    marginTop: 10,
    fontSize: 13,
  },
  quick: {
    marginTop: 16,
    gap: 8,
  },
  quickBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickText: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '600',
  },
})
