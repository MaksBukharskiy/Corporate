import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from './theme'

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function PrimaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primary, disabled && styles.disabled]}
    >
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  )
}

export function SecondaryButton({ title, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.secondary}>
      <Text style={styles.secondaryText}>{title}</Text>
    </Pressable>
  )
}

export function Badge({ text, tone = 'muted' }) {
  const map = {
    blue: { backgroundColor: colors.blueSoft, color: colors.blue },
    solid: { backgroundColor: colors.blue, color: '#fff' },
    muted: { backgroundColor: '#f1f5f9', color: colors.muted },
  }
  const palette = map[tone] || map.muted
  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: palette.color }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
  },
  primary: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  secondary: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.55,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
