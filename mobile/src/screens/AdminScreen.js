import { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { api } from '../api'
import { Card } from '../ui'
import { colors, formatPoints } from '../theme'

export default function AdminScreen({ user, onLogout }) {
  const [stats, setStats] = useState(null)
  const [companies, setCompanies] = useState([])
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    function loadAdmin() {
      Promise.all([api.getAdminStats(), api.getCompanies(), api.getTransactions()])
        .then(([statsData, companiesData, txData]) => {
          setStats(statsData)
          setCompanies(companiesData)
          setTransactions(txData)
        })
        .catch((e) => setError(e.message))
    }
    loadAdmin()
    const timer = setInterval(loadAdmin, 3000)
    return () => clearInterval(timer)
  }, [])

  const maxTop = Math.max(1, ...(stats?.topOffers || []).map((item) => item.count))

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.muted}>Администратор</Text>
        </View>
        <Pressable onPress={onLogout}>
          <Text style={styles.logout}>Выйти</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.grid}>
          {[
            ['Компании', stats?.totalCompanies],
            ['Сотрудники', stats?.totalEmployees],
            ['Заявки', stats?.totalApplications],
            ['Одобрено', stats?.approvedApplications],
          ].map(([label, value]) => (
            <Card key={label} style={styles.stat}>
              <Text style={styles.muted}>{label}</Text>
              <Text style={styles.statValue}>{value ?? '—'}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Компании</Text>
          {companies.map((company) => (
            <View key={company.id} style={styles.row}>
              <Image source={{ uri: company.logoUrl }} style={styles.logo} />
              <Text style={styles.rowTitle}>{company.name}</Text>
              <Text style={styles.muted}>{company.employeeCount}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Топ льгот</Text>
          {(stats?.topOffers || []).length === 0 && <Text style={styles.muted}>Нет данных</Text>}
          {(stats?.topOffers || []).map((item) => (
            <View key={item.title} style={{ marginBottom: 12 }}>
              <View style={styles.row}>
                <Text style={[styles.rowTitle, { flex: 1 }]}>{item.title}</Text>
                <Text style={styles.blue}>{item.count}</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.bar, { width: `${(item.count / maxTop) * 100}%` }]} />
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Транзакции</Text>
          {transactions.length === 0 && <Text style={styles.muted}>Транзакций пока нет</Text>}
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.tx}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{tx.employeeName}</Text>
                <Text style={styles.muted}>{tx.description}</Text>
              </View>
              <Text style={styles.blue}>-{formatPoints(tx.amount)}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  logout: { color: colors.blue, fontWeight: '600' },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  error: { color: '#dc2626' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: { width: '48%', padding: 14 },
  statValue: { fontSize: 28, fontWeight: '600', color: colors.text, marginTop: 6 },
  block: { padding: 16 },
  blockTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  logo: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#e2e8f0' },
  rowTitle: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text },
  blue: { color: colors.blue, fontWeight: '600' },
  barBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' },
  bar: { height: 6, backgroundColor: colors.blue },
  tx: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
