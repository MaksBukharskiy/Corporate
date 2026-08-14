package uz.click.benefits.ui.merchant

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChevronLeft
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.Category
import uz.click.benefits.data.Offer
import uz.click.benefits.data.RequestStatus
import uz.click.benefits.ui.components.PrimaryButton
import uz.click.benefits.ui.components.StatusBadge
import uz.click.benefits.ui.components.StatusTrack
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.categoryLabel

@Composable
fun MerchantOffers(store: AppStore, onEdit: (String?) -> Unit) {
    val merchant = store.merchant(store.session?.merchantId ?: "") ?: return
    val items = store.offers.filter { it.merchantId == merchant.id }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        Text("Кабинет мерчанта", color = C.muted, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text(merchant.name, fontSize = 30.sp, fontWeight = FontWeight.Medium, color = C.navy)
        Text("Управляйте предложениями компании.", color = C.muted, fontSize = 13.sp)
        Spacer(Modifier.height(14.dp))
        items.forEach { offer ->
            Column(
                Modifier.fillMaxWidth().padding(bottom = 10.dp).clip(RoundedCornerShape(22.dp)).background(C.card).clickable { onEdit(offer.id) }.padding(16.dp)
            ) {
                Text(offer.title, fontWeight = FontWeight.Medium, color = C.navy)
                Text(
                    "${categoryLabel(offer.category)} · ${if (offer.isFree) "бесплатно" else "${offer.points} баллов"}",
                    color = C.muted,
                    fontSize = 13.sp,
                )
                Text(if (offer.active) "Активен" else "Скрыт", color = if (offer.active) C.success else C.muted, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
        Spacer(Modifier.height(8.dp))
        PrimaryButton("Новое предложение") { onEdit(null) }
    }
}

@Composable
fun OfferForm(store: AppStore, offerId: String?, onBack: () -> Unit) {
    val existing = offerId?.let { store.offer(it) }
    var title by remember { mutableStateOf(existing?.title ?: "") }
    var points by remember { mutableStateOf((existing?.points ?: 1000).toString()) }
    var description by remember { mutableStateOf(existing?.description ?: "") }
    var active by remember { mutableStateOf(existing?.active ?: true) }
    var paid by remember { mutableStateOf(existing?.paid ?: true) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        Row(Modifier.clickable(onClick = onBack), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Outlined.ChevronLeft, null)
            Text("Назад", fontWeight = FontWeight.Bold)
        }
        Text(if (existing == null) "Новое предложение" else "Редактирование", fontSize = 30.sp, fontWeight = FontWeight.Medium, color = C.navy)
        Field("Название", title) { title = it }
        if (paid) Field("Баллы", points, KeyboardType.Number) { points = it }
        Field("Описание", description, multiline = true) { description = it }
        Row(
            Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(C.card).padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f).padding(end = 12.dp)) {
                Text("Платно", fontWeight = FontWeight.SemiBold, color = C.navy)
                Text("Выкл — бесплатно для сотрудников компании", color = C.muted, fontSize = 12.sp)
            }
            Switch(paid, { paid = it }, colors = SwitchDefaults.colors(checkedTrackColor = C.brand))
        }
        Spacer(Modifier.height(10.dp))
        Row(
            Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(C.card).padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("Видимость", fontWeight = FontWeight.SemiBold, color = C.navy)
            Switch(active, { active = it }, colors = SwitchDefaults.colors(checkedTrackColor = C.brand))
        }
        Spacer(Modifier.height(16.dp))
        PrimaryButton("Сохранить") {
            store.upsertOffer(
                Offer(
                    id = existing?.id ?: "",
                    merchantId = store.session?.merchantId ?: "m1",
                    title = title.ifBlank { "Без названия" },
                    description = description,
                    points = if (paid) points.toIntOrNull() ?: 0 else 0,
                    category = existing?.category ?: Category.sport,
                    active = active,
                    companyIds = existing?.companyIds ?: listOf("c1"),
                    placesLeft = existing?.placesLeft,
                    paid = paid,
                )
            )
            onBack()
        }
    }
}

@Composable
fun MerchantIncoming(store: AppStore) {
    val merchantId = store.session?.merchantId ?: return
    val offerIds = store.offers.filter { it.merchantId == merchantId }.map { it.id }
    val items = store.requests.filter { it.offerId in offerIds }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        Text("Входящие заявки", fontSize = 30.sp, fontWeight = FontWeight.Medium, color = C.navy)
        Spacer(Modifier.height(12.dp))
        items.forEach { req ->
            val offer = store.offer(req.offerId)
            val employee = store.user(req.employeeId)
            Column(Modifier.fillMaxWidth().padding(bottom = 10.dp).clip(RoundedCornerShape(22.dp)).background(C.card).padding(16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column(Modifier.weight(1f)) {
                        Text(offer?.title ?: "", fontWeight = FontWeight.Medium, color = C.navy)
                        Text("${employee?.name} · ${req.createdAt}", color = C.muted, fontSize = 13.sp)
                    }
                    StatusBadge(req.status)
                }
                Spacer(Modifier.height(12.dp))
                StatusTrack(req.status, showLabels = true)
                if (req.status == RequestStatus.pending) {
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(Modifier.weight(1f)) {
                            PrimaryButton("Одобрить") { store.setRequestStatus(req.id, RequestStatus.approved, "Мерчант подтвердил услугу") }
                        }
                        Box(Modifier.weight(1f)) {
                            PrimaryButton("Отклонить", variant = "danger") {
                                store.setRequestStatus(req.id, RequestStatus.rejected, "Нет свободных слотов")
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MerchantRegister(store: AppStore, onDone: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("Ташкент") }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        Text("Регистрация", fontSize = 30.sp, fontWeight = FontWeight.Medium, color = C.navy)
        Text("Заявка на нового партнёра. Сессия не переключается.", color = C.muted, fontSize = 13.sp)
        Field("Название", name) { name = it }
        Field("Город", city) { city = it }
        Spacer(Modifier.height(12.dp))
        PrimaryButton("Отправить") {
            store.registerMerchant(name, city)
            onDone()
        }
        Spacer(Modifier.height(10.dp))
        PrimaryButton("Выйти", variant = "ghost", onClick = store::logout)
    }
}

@Composable
private fun Field(label: String, value: String, keyboard: KeyboardType = KeyboardType.Text, multiline: Boolean = false, onChange: (String) -> Unit) {
    Text(label, color = C.muted, fontSize = 12.sp, modifier = Modifier.padding(top = 14.dp, bottom = 6.dp))
    Box(
        Modifier
            .fillMaxWidth()
            .height(if (multiline) 100.dp else 48.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(C.card)
            .padding(14.dp),
        contentAlignment = if (multiline) Alignment.TopStart else Alignment.CenterStart,
    ) {
        BasicTextField(
            value = value,
            onValueChange = onChange,
            keyboardOptions = KeyboardOptions(keyboardType = keyboard),
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
