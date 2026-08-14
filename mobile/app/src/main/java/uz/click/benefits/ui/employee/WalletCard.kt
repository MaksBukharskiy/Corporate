package uz.click.benefits.ui.employee

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ChevronLeft
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.QrCode2
import androidx.compose.material.icons.outlined.ShoppingBag
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.TxType
import uz.click.benefits.ui.components.qrBitmap
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T

@Composable
fun WalletScreen(
    store: AppStore,
    onBack: () -> Unit,
    onSpend: () -> Unit,
    onOffer: (String) -> Unit,
    onRedeem: (String) -> Unit,
) {
    val user = store.session
    if (user == null) {
        Box(Modifier.fillMaxSize().background(C.bg).clickable(onClick = onBack))
        return
    }
    var panel by remember { mutableStateOf<String?>(null) }
    val pan = remember(user.id) {
        val n = user.id.hashCode().toUInt().toString().padStart(4, '0').takeLast(4)
        "••••  ••••  ••••  $n"
    }
    val payload = remember(user.id, user.balance) { "CORPORATE:WALLET:${user.id}:${user.balance}" }
    val qr = remember(payload) { qrBitmap(payload) }
    val recs = store.recommendedOffers()
        .filter { it.isFree || it.points <= user.balance }
        .ifEmpty { store.employeeOffers("", null).filter { it.isFree || it.points <= user.balance } }
        .take(4)
    val txs = store.transactions.filter { it.userId == user.id }.take(5)

    Column(
        Modifier
            .fillMaxSize()
            .background(C.bg)
            .verticalScroll(rememberScrollState())
            .statusBarsPadding()
            .padding(horizontal = 20.dp)
            .padding(bottom = 32.dp),
    ) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(40.dp).clip(CircleShape).clickable(onClick = onBack), contentAlignment = Alignment.Center) {
                Icon(Icons.Outlined.ChevronLeft, "Назад", tint = C.navy, modifier = Modifier.size(26.dp))
            }
            Text("Карта", style = T.title.copy(fontSize = 22.sp))
        }
        Spacer(Modifier.height(20.dp))
        Box(
            Modifier
                .fillMaxWidth()
                .height(196.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFF0B1A3A), Color(0xFF246BFD), Color(0xFF111827)),
                    ),
                )
                .padding(22.dp),
        ) {
            Column(Modifier.fillMaxSize()) {
                Text("CORPORATE", color = C.white.copy(0.8f), fontFamily = T.sans, fontWeight = FontWeight.Bold, fontSize = 12.sp, letterSpacing = 2.sp)
                Spacer(Modifier.height(8.dp))
                Text(user.name, color = C.white, fontFamily = T.sans, fontWeight = FontWeight.Medium, fontSize = 16.sp)
                Spacer(Modifier.weight(1f))
                Text("${fmt(user.balance)} баллов", color = C.white, fontFamily = T.sans, fontWeight = FontWeight.Black, fontSize = 32.sp)
                Spacer(Modifier.height(10.dp))
                Text(pan, color = C.white.copy(0.7f), fontFamily = FontFamily.Monospace, fontSize = 14.sp)
            }
        }
        Spacer(Modifier.height(22.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            WalletAction("Пополнить", Icons.Outlined.Add, panel == "topup") { panel = if (panel == "topup") null else "topup" }
            WalletAction("Потратить", Icons.Outlined.ShoppingBag, false, onClick = onSpend)
            WalletAction("QR", Icons.Outlined.QrCode2, panel == "qr") { panel = if (panel == "qr") null else "qr" }
            WalletAction("История", Icons.Outlined.History, panel == "history") { panel = if (panel == "history") null else "history" }
        }
        AnimatedVisibility(
            visible = panel == "topup",
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically(),
        ) {
            Column {
                Spacer(Modifier.height(16.dp))
                Text("Сумма пополнения", style = T.section)
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    listOf(1000, 3000, 5000).forEach { amount ->
                        Box(
                            Modifier
                                .clip(RoundedCornerShape(14.dp))
                                .background(C.card)
                                .clickable { store.topUp(amount) }
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                        ) {
                            Text("+${fmt(amount)}", color = C.navy, fontFamily = T.sans, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                        }
                    }
                }
            }
        }
        AnimatedVisibility(
            visible = panel == "qr",
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically(),
        ) {
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                Spacer(Modifier.height(18.dp))
                Text("QR для списания", style = T.section, modifier = Modifier.align(Alignment.Start))
                Spacer(Modifier.height(12.dp))
                Box(
                    Modifier
                        .size(200.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White)
                        .padding(14.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Image(bitmap = qr.asImageBitmap(), contentDescription = "QR баллов", modifier = Modifier.size(172.dp))
                }
                Spacer(Modifier.height(10.dp))
                Text("Покажите QR, чтобы списать баллы", color = C.muted, fontFamily = T.sans, fontSize = 13.sp)
            }
        }
        AnimatedVisibility(
            visible = panel == "history",
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically(),
        ) {
            Column {
                Spacer(Modifier.height(16.dp))
                Text("Операции", style = T.section)
                Spacer(Modifier.height(10.dp))
                if (txs.isEmpty()) {
                    Text("Пока нет операций", style = T.caption)
                } else {
                    txs.forEach { tx ->
                        val offerTitle = tx.offerId?.let { store.offer(it)?.title }
                        val label = when (tx.type) {
                            TxType.topup -> "Пополнение"
                            TxType.redeem -> offerTitle ?: "Списание"
                        }
                        val amount = when (tx.type) {
                            TxType.topup -> "+${fmt(tx.amount)}"
                            TxType.redeem -> "−${fmt(tx.amount)}"
                        }
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .padding(bottom = 8.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(C.card)
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Column(Modifier.weight(1f)) {
                                Text(label, fontFamily = T.sans, fontWeight = FontWeight.SemiBold, color = C.navy)
                                Text(tx.createdAt, style = T.caption)
                            }
                            Text(amount, color = if (tx.type == TxType.topup) C.brand else C.navy, fontFamily = T.sans, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(28.dp))
        Text("Рекомендации", style = T.section)
        Spacer(Modifier.height(4.dp))
        Text("Льготы, которые подходят под ваши баллы", style = T.caption)
        Spacer(Modifier.height(12.dp))
        if (recs.isEmpty()) {
            Text("Пока нет подходящих предложений", style = T.caption)
        } else {
            recs.chunked(2).forEach { pair ->
                Row(Modifier.fillMaxWidth().padding(bottom = 18.dp), horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                    pair.forEach { offer ->
                        Box(Modifier.weight(1f)) {
                            OfferModule(store, offer, framed = true, onClick = { onOffer(offer.id) }, onRedeem = { onRedeem(offer.id) })
                        }
                    }
                    if (pair.size == 1) Spacer(Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun WalletAction(title: String, icon: ImageVector, selected: Boolean, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable(onClick = onClick)) {
        Box(
            Modifier
                .size(52.dp)
                .clip(CircleShape)
                .background(if (selected) C.brand else C.card),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, title, tint = if (selected) C.white else C.brand, modifier = Modifier.size(22.dp))
        }
        Spacer(Modifier.height(6.dp))
        Text(title, fontSize = 11.sp, fontFamily = T.sans, color = C.muted)
    }
}
