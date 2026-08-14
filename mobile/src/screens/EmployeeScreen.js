import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { api } from '../api'
import { Badge, Card, PrimaryButton, SecondaryButton } from '../ui'
import { CATEGORIES, STATUS_LABELS, colors, formatPoints } from '../theme'

export default function EmployeeScreen({ user, onLogout }) {
  const [tab, setTab] = useState('catalog')
  const [employee, setEmployee] = useState(null)
  const [offers, setOffers] = useState([])
  const [applications, setApplications] = useState([])
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const [employeeData, catalog, apps] = await Promise.all([
        api.getEmployee(user.employeeId),
        api.getCatalog(category || undefined),
        api.getApplications(user.employeeId),
      ])
      setEmployee(employeeData)
      setOffers(catalog)
      setApplications(apps)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 3000)
    return () => clearInterval(timer)
  }, [category])

  async function apply() {
    setLoading(true)
    setError('')
    try {
      await api.createApplication({ employeeId: user.employeeId, offerId: selected.id })
      setSelected(null)
      setTab('apps')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.muted}>Сотрудник</Text>
        </View>
        <Pressable onPress={onLogout}>
          <Text style={styles.logout}>Выйти</Text>
        </Pressable>
      </View>

      <Card style={styles.balance}>
        <Text style={styles.muted}>Баланс</Text>
        <Text style={styles.points}>
          {formatPoints(employee?.balance)}
          <Text style={styles.pointsUnit}> баллов</Text>
        </Text>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {tab === 'catalog' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cats}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[styles.cat, category === cat.id && styles.catActive]}
              >
                <Text style={[styles.catText, category === cat.id && styles.catTextActive]}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          {offers.map((offer) => (
            <Pressable key={offer.id} onPress={() => setSelected(offer)}>
              <Card style={styles.offer}>
                <Image source={{ uri: offer.imageUrl }} style={styles.offerImage} />
                <View style={styles.offerBody}>
                  <Text style={styles.muted}>{offer.merchantName}</Text>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.price}>{formatPoints(offer.pointsPrice)} баллов</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {applications.length === 0 && <Text style={styles.muted}>Заявок пока нет</Text>}
          {applications.map((app) => (
            <Card key={app.id} style={styles.appCard}>
              <View style={styles.appRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.offerTitle}>{app.offerTitle}</Text>
                  <Text style={styles.muted}>{app.merchantName} · {formatPoints(app.pointsPrice)}</Text>
                </View>
                <Badge
                  text={STATUS_LABELS[app.status]}
                  tone={app.status === 'APPROVED' ? 'solid' : 'blue'}
                />
              </View>
              {app.status === 'APPROVED' && (
                <View style={styles.qrBox}>
                  <Image source={{ uri: api.getQrUrl(app.id) }} style={styles.qr} />
                  <Text style={styles.qrCode}>{app.voucherCode}</Text>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      )}

      <View style={styles.tabs}>
        <Pressable style={styles.tab} onPress={() => setTab('catalog')}>
          <Text style={[styles.tabText, tab === 'catalog' && styles.tabActive]}>Каталог</Text>
        </Pressable>
        <Pressable style={styles.tab} onPress={() => setTab('apps')}>
          <Text style={[styles.tabText, tab === 'apps' && styles.tabActive]}>Заявки</Text>
        </Pressable>
      </View>

      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <Card style={styles.modal}>
            {selected && (
              <>
                <Image source={{ uri: selected.imageUrl }} style={styles.modalImage} />
                <View style={styles.modalBody}>
                  <Text style={styles.muted}>{selected.merchantName}</Text>
                  <Text style={styles.offerTitle}>{selected.title}</Text>
                  <Text style={styles.desc}>{selected.description}</Text>
                  <Text style={styles.price}>{formatPoints(selected.pointsPrice)} баллов</Text>
                  <PrimaryButton title={loading ? 'Отправка...' : 'Получить льготу'} onPress={apply} disabled={loading} />
                  <View style={{ height: 8 }} />
                  <SecondaryButton title="Закрыть" onPress={() => setSelected(null)} />
                </View>
              </>
            )}
            {loading && <ActivityIndicator color={colors.blue} style={{ marginBottom: 12 }} />}
          </Card>
        </View>
      </Modal>
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
  balance: { marginHorizontal: 20, marginTop: 8, padding: 16 },
  points: { fontSize: 32, fontWeight: '600', color: colors.text, marginTop: 4 },
  pointsUnit: { fontSize: 15, fontWeight: '500', color: colors.muted },
  error: { color: '#dc2626', paddingHorizontal: 20, marginTop: 8 },
  content: { padding: 20, paddingBottom: 32, gap: 12 },
  cats: { marginBottom: 4 },
  cat: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  catActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  catText: { color: '#475569', fontWeight: '600', fontSize: 13 },
  catTextActive: { color: '#fff' },
  offer: { overflow: 'hidden' },
  offerImage: { height: 140, width: '100%', backgroundColor: '#e2e8f0' },
  offerBody: { padding: 14 },
  offerTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 4 },
  price: { color: colors.blue, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  appCard: { padding: 14 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qrBox: { alignItems: 'center', marginTop: 12 },
  qr: { width: 140, height: 140, backgroundColor: '#fff' },
  qrCode: { marginTop: 8, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), color: colors.muted },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#fff',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { color: colors.muted, fontWeight: '600' },
  tabActive: { color: colors.blue },
  modalWrap: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modal: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, overflow: 'hidden' },
  modalImage: { height: 180, width: '100%' },
  modalBody: { padding: 16 },
  desc: { color: '#64748b', marginTop: 8, lineHeight: 20 },
})
