package uz.click.benefits.ui.employee

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CardGiftcard
import androidx.compose.material.icons.outlined.ChevronLeft
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material.icons.outlined.FitnessCenter
import androidx.compose.material.icons.outlined.LocalOffer
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import kotlinx.coroutines.delay
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.ActivityItem
import uz.click.benefits.data.ActivityKind
import uz.click.benefits.data.AppStore
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T

private val Filters = listOf("Все", "Заявки", "Льготы", "Ивенты", "Промо")

@Composable
fun EmployeeNotifications(
    store: AppStore,
    onBack: () -> Unit,
    onOpen: (ActivityItem) -> Unit,
    onExplore: () -> Unit,
) {
    var filter by remember { mutableStateOf("Все") }
    val items = store.activities().filter { item ->
        when (filter) {
            "Заявки" -> item.kind == ActivityKind.request
            "Льготы" -> item.kind == ActivityKind.offer
            "Ивенты" -> item.kind == ActivityKind.event
            "Промо" -> item.kind == ActivityKind.promo
            else -> true
        }
    }
    val promo = store.activities().find { it.kind == ActivityKind.promo }
    val grouped = items.groupBy { it.group }

    Column(
        Modifier
            .fillMaxSize()
            .background(Color.Black)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(bottom = 32.dp),
    ) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier.size(40.dp).clip(CircleShape).clickable(onClick = onBack),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Outlined.ChevronLeft, "Назад", tint = C.white, modifier = Modifier.size(26.dp))
            }
            Text("Уведомления", style = T.title, color = C.white)
        }
        Spacer(Modifier.height(12.dp))
        LazyRow(
            Modifier.padding(start = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            items(Filters) { chip ->
                val selected = filter == chip
                Text(
                    chip,
                    color = C.white,
                    fontFamily = T.sans,
                    fontSize = 14.sp,
                    fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (selected) C.brandSoft else Color(0xFF1C1C1E))
                        .border(1.dp, if (selected) C.brand else Color(0xFF3A3A3C), RoundedCornerShape(20.dp))
                        .clickable { filter = chip }
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                )
            }
            item { Spacer(Modifier.width(12.dp)) }
        }
        if (promo != null && (filter == "Все" || filter == "Промо")) {
            Spacer(Modifier.height(16.dp))
            Row(
                Modifier
                    .padding(horizontal = 20.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF1F3D2B))
                    .clickable {
                        store.markRead(promo.id)
                        onOpen(promo)
                    }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    Modifier.size(48.dp).clip(CircleShape).background(Color(0xFF8B7CFF)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Outlined.FitnessCenter, null, tint = C.white, modifier = Modifier.size(22.dp))
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(promo.title, fontFamily = T.sans, fontWeight = FontWeight.Bold, color = C.white, fontSize = 15.sp)
                    Text(promo.body, style = T.caption, maxLines = 2)
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "Смотреть планы",
                        color = C.white,
                        fontFamily = T.sans,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp,
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(C.brand)
                            .clickable {
                                store.markRead(promo.id)
                                onExplore()
                            }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                    )
                }
            }
        }
        grouped.forEach { (group, rows) ->
            Spacer(Modifier.height(22.dp))
            Text(
                group,
                style = T.section,
                color = C.white,
                modifier = Modifier.padding(horizontal = 20.dp),
            )
            Spacer(Modifier.height(8.dp))
            rows.forEachIndexed { index, item ->
                var shown by remember(item.id) { mutableStateOf(false) }
                LaunchedEffect(item.id) {
                    delay(index * 50L)
                    shown = true
                }
                AnimatedVisibility(
                    visible = shown,
                    enter = fadeIn(tween(280)) + slideInVertically(tween(280)) { it / 4 },
                ) {
                    ActivityRow(item) {
                        store.markRead(item.id)
                        onOpen(item)
                    }
                }
            }
        }
        if (items.isEmpty()) {
            Spacer(Modifier.height(48.dp))
            Text("Пока нет уведомлений в этом разделе", style = T.caption, modifier = Modifier.padding(horizontal = 20.dp))
        }
    }
}

@Composable
private fun ActivityRow(item: ActivityItem, onClick: () -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Box(Modifier.width(12.dp).padding(top = 16.dp)) {
            if (item.unread) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(C.brand))
            }
        }
        Box(
            Modifier.size(44.dp).clip(CircleShape).background(Color(0xFF2C2C2E)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(kindIcon(item.kind), null, tint = C.white, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(item.title, fontFamily = T.sans, fontWeight = FontWeight.Bold, color = C.white, fontSize = 16.sp)
            Spacer(Modifier.height(4.dp))
            Text(item.body, color = C.muted, fontFamily = T.sans, fontSize = 14.sp, lineHeight = 20.sp)
            Spacer(Modifier.height(6.dp))
            Text(item.time, color = C.muted, fontFamily = T.sans, fontSize = 12.sp)
        }
    }
}

private fun kindIcon(kind: ActivityKind): ImageVector = when (kind) {
    ActivityKind.request -> Icons.Outlined.NotificationsNone
    ActivityKind.offer -> Icons.Outlined.LocalOffer
    ActivityKind.event -> Icons.Outlined.Event
    ActivityKind.promo -> Icons.Outlined.CardGiftcard
}
