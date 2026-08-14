package uz.click.benefits.ui.employee

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.ChevronLeft
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.Category
import uz.click.benefits.data.Offer
import uz.click.benefits.data.Seed
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.categoryAccent
import uz.click.benefits.ui.theme.categoryHero
import uz.click.benefits.ui.theme.categoryLabel
import uz.click.benefits.ui.components.RatingStars

@Composable
fun EmployeeCategory(
    store: AppStore,
    category: Category,
    onBack: () -> Unit,
    onOffer: (String) -> Unit,
) {
    val subsections = remember(category) { Seed.interests.filter { it.category == category }.map { it.title } }
    var subsection by remember(category) { mutableStateOf<String?>(null) }
    var byPartner by remember { mutableStateOf(false) }
    var day by remember { mutableStateOf(0) }
    val all = store.employeeOffers("", category)
    val offers = all.filter { subsection == null || it.subsection == subsection }
    val dates = listOf("Сегодня", "Сб 15", "Вс 16", "Пн 17", "Вт 18")
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(category) { shown = true }

    Box(Modifier.fillMaxSize().background(C.bg)) {
        Box(Modifier.fillMaxWidth().height(260.dp).background(categoryHero(category)))
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .statusBarsPadding()
                .padding(bottom = 32.dp),
        ) {
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(Modifier.size(40.dp).clip(CircleShape).clickable(onClick = onBack), contentAlignment = Alignment.Center) {
                    Icon(Icons.Outlined.ChevronLeft, "Назад", tint = C.white, modifier = Modifier.size(26.dp))
                }
            }
            AnimatedVisibility(shown, enter = fadeIn(tween(380)) + slideInVertically(tween(380)) { it / 5 }) {
                Column(Modifier.padding(horizontal = 20.dp)) {
                    Text(categoryLabel(category), style = T.title.copy(fontSize = 34.sp, color = C.white), color = C.white)
                    Text("${offers.size} льгот в разделе", color = C.white.copy(0.85f), fontFamily = T.sans, fontSize = 15.sp)
                }
            }
            Spacer(Modifier.height(16.dp))
            Row(
                Modifier
                    .padding(horizontal = 20.dp)
                    .fillMaxWidth()
                    .height(44.dp)
                    .clip(RoundedCornerShape(22.dp))
                    .background(Color(0xFF1C1C1E)),
            ) {
                ModeTab("По льготам", !byPartner, Modifier.weight(1f)) { byPartner = false }
                ModeTab("По партнёрам", byPartner, Modifier.weight(1f)) { byPartner = true }
            }
            Spacer(Modifier.height(14.dp))
            LazyRow(Modifier.padding(start = 20.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    SubChip("Все", subsection == null) { subsection = null }
                }
                subsections.forEach { name ->
                    item { SubChip(name, subsection == name) { subsection = name } }
                }
                item { Spacer(Modifier.width(12.dp)) }
            }
            if (category == Category.events) {
                Spacer(Modifier.height(12.dp))
                LazyRow(Modifier.padding(start = 20.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    dates.forEachIndexed { index, label ->
                        item {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.clickable { day = index },
                            ) {
                                Text(
                                    label,
                                    color = if (day == index) C.brand else C.muted,
                                    fontFamily = T.sans,
                                    fontWeight = if (day == index) FontWeight.SemiBold else FontWeight.Normal,
                                    fontSize = 14.sp,
                                )
                                if (day == index) {
                                    Spacer(Modifier.height(4.dp))
                                    Box(Modifier.width(28.dp).height(3.dp).clip(RoundedCornerShape(2.dp)).background(C.brand))
                                }
                            }
                        }
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
            Box(
                Modifier
                    .padding(horizontal = 20.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(22.dp))
                    .background(Brush.horizontalGradient(listOf(Color(0xFF1E40AF), Color(0xFF3B82F6))))
                    .padding(18.dp),
            ) {
                Column {
                    Text("Corporate", color = C.white, fontFamily = T.sans, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text("Льготы раздела «${categoryLabel(category)}»", color = C.white.copy(0.85f), fontSize = 13.sp)
                    Spacer(Modifier.height(10.dp))
                    Box(
                        Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(C.white)
                            .clickable {
                                offers.firstOrNull()?.let { onOffer(it.id) }
                            }
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                    ) {
                        Text("Смотреть цены", color = Color.Black, fontFamily = T.sans, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
            val cards = if (byPartner) offers.distinctBy { it.merchantId } else offers
            cards.forEachIndexed { index, offer ->
                var cardShown by remember(offer.id) { mutableStateOf(false) }
                LaunchedEffect(offer.id) {
                    kotlinx.coroutines.delay(80L * index)
                    cardShown = true
                }
                AnimatedVisibility(
                    visible = cardShown,
                    enter = fadeIn(tween(320)) + slideInVertically(tween(320)) { it / 5 },
                ) {
                    VenueCard(store, offer) { onOffer(offer.id) }
                }
            }
            if (cards.isEmpty()) {
                Text("В этом подразделе пока нет льгот", style = T.caption, modifier = Modifier.padding(20.dp))
            }
        }
    }
}

@Composable
private fun ModeTab(title: String, selected: Boolean, modifier: Modifier, onClick: () -> Unit) {
    Box(
        modifier
            .padding(4.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(if (selected) Color(0xFF2C2C2E) else Color.Transparent)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(title, color = C.white, fontFamily = T.sans, fontSize = 13.sp, fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal)
    }
}

@Composable
private fun SubChip(title: String, selected: Boolean, onClick: () -> Unit) {
    Text(
        title,
        color = C.white,
        fontFamily = T.sans,
        fontSize = 13.sp,
        fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(if (selected) C.brand else C.card)
            .border(1.dp, if (selected) C.brand else Color(0xFF3A3A3C), RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
    )
}

@Composable
private fun VenueCard(store: AppStore, offer: Offer, onClick: () -> Unit) {
    val merchant = store.merchant(offer.merchantId)
    val event = offer.category == Category.events
    val titleColor = if (event) Color(0xFF86EFAC) else C.navy
    Column(
        Modifier
            .padding(horizontal = 20.dp, vertical = 8.dp)
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(C.card)
            .border(1.dp, Color(0xFF3A3A3C), RoundedCornerShape(22.dp))
            .clickable(onClick = onClick),
    ) {
        Box(
            Modifier
                .fillMaxWidth()
                .height(if (event) 140.dp else 112.dp)
                .background(Brush.horizontalGradient(listOf(categoryAccent(offer.category), Color(0xFF1C1C1E)))),
        ) {
            Icon(
                categoryIcon(offer.category),
                null,
                tint = C.white.copy(0.9f),
                modifier = Modifier.align(Alignment.Center).size(if (event) 52.dp else 40.dp),
            )
            Box(
                Modifier
                    .align(Alignment.TopEnd)
                    .padding(10.dp)
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(0.4f))
                    .clickable { store.toggleSaved(offer.id) },
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    if (store.isSaved(offer.id)) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                    null,
                    tint = C.white,
                    modifier = Modifier.size(16.dp),
                )
            }
            if (offer.rating.isNotBlank()) {
                RatingStars(offer.rating, Modifier.align(Alignment.BottomStart).padding(10.dp))
            }
        }
        Column(Modifier.padding(14.dp)) {
            Text(
                offer.title,
                fontFamily = T.sans,
                fontWeight = FontWeight.Black,
                color = titleColor,
                fontSize = if (event) 22.sp else 18.sp,
                lineHeight = if (event) 26.sp else 22.sp,
            )
            Spacer(Modifier.height(4.dp))
            Text(merchant?.name ?: "Партнёр", color = C.muted, fontFamily = T.sans, fontSize = 13.sp)
            if (offer.address.isNotBlank()) {
                Spacer(Modifier.height(6.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(offer.address, style = T.caption, modifier = Modifier.weight(1f))
                    Text(offer.distance, style = T.caption)
                }
            }
            if (offer.metro.isNotBlank()) {
                Text("M  ${offer.metro}", color = Color(0xFF4ADE80), fontSize = 13.sp)
            }
            if (offer.subsection.isNotBlank() && offer.subsection != offer.title) {
                Spacer(Modifier.height(8.dp))
                Box(Modifier.clip(RoundedCornerShape(8.dp)).background(C.brandSoft).padding(horizontal = 8.dp, vertical = 3.dp)) {
                    Text(offer.subsection, color = C.brandBright, fontSize = 12.sp, fontFamily = T.sans, fontWeight = FontWeight.Medium)
                }
            }
            Spacer(Modifier.height(10.dp))
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                if (offer.timeSlot.isNotBlank()) {
                    Box(Modifier.clip(RoundedCornerShape(10.dp)).background(Color(0xFF2C2C2E)).padding(horizontal = 10.dp, vertical = 6.dp)) {
                        Text(offer.timeSlot, color = C.white, fontSize = 13.sp, fontFamily = T.sans, fontWeight = FontWeight.SemiBold)
                    }
                }
                Spacer(Modifier.weight(1f))
                Text(
                    if (offer.isFree) "Бесплатно" else "${fmt(offer.points)} баллов",
                    color = C.brand,
                    fontFamily = T.sans,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                )
                Icon(Icons.Outlined.ChevronRight, null, tint = C.brand, modifier = Modifier.size(18.dp))
            }
        }
    }
}
