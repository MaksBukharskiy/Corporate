package uz.click.benefits.ui.employee

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.outlined.ChevronLeft
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.ui.components.qrBitmap
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import java.text.NumberFormat
import java.util.Locale

@Composable
fun RedeemCardScreen(store: AppStore, offerId: String, onBack: () -> Unit) {
    val offer = store.offer(offerId)
    val user = store.session
    if (offer == null || user == null) {
        Box(Modifier.fillMaxSize().background(C.bg).clickable(onClick = onBack))
        return
    }
    val points = if (offer.isFree) 0 else offer.points
    val payload = remember(offer.id, user.id) {
        "CORPORATE:PTS:${offer.id}:${user.id}:$points"
    }
    val qr = remember(payload) { qrBitmap(payload) }
    val pan = remember(offer.id) {
        val n = offer.id.hashCode().toUInt().toString().padStart(4, '0').takeLast(4)
        "••••  ••••  ••••  $n"
    }
    Column(
        Modifier
            .fillMaxSize()
            .background(C.bg)
            .verticalScroll(rememberScrollState())
            .statusBarsPadding()
            .padding(horizontal = 20.dp)
            .padding(bottom = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(40.dp).clip(CircleShape).clickable(onClick = onBack), contentAlignment = Alignment.Center) {
                Icon(Icons.Outlined.ChevronLeft, "Назад", tint = C.navy, modifier = Modifier.size(26.dp))
            }
            Text("Карта баллов", style = T.title.copy(fontSize = 22.sp))
        }
        Spacer(Modifier.height(24.dp))
        Box(
            Modifier
                .fillMaxWidth()
                .height(212.dp)
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
                Text(
                    if (points == 0) "Бесплатно" else "${fmtPts(points)} баллов",
                    color = C.white,
                    fontFamily = T.sans,
                    fontWeight = FontWeight.Black,
                    fontSize = 32.sp,
                )
                Spacer(Modifier.height(6.dp))
                Text(offer.title, color = C.white.copy(0.85f), fontFamily = T.sans, fontSize = 14.sp, maxLines = 1)
                Spacer(Modifier.height(10.dp))
                Text(pan, color = C.white.copy(0.7f), fontFamily = FontFamily.Monospace, fontSize = 14.sp)
            }
        }
        Spacer(Modifier.height(28.dp))
        Text("QR для списания", style = T.section)
        Spacer(Modifier.height(12.dp))
        Box(
            Modifier
                .size(220.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(Color.White)
                .padding(16.dp),
            contentAlignment = Alignment.Center,
        ) {
            Image(bitmap = qr.asImageBitmap(), contentDescription = "QR баллов", modifier = Modifier.size(188.dp))
        }
        Spacer(Modifier.height(12.dp))
        Text("Покажите QR, чтобы обналичить баллы", color = C.muted, fontFamily = T.sans, fontSize = 13.sp)
    }
}

private fun fmtPts(value: Int) = NumberFormat.getInstance(Locale("ru", "RU")).format(value)
