package uz.click.benefits.ui.employee

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.ui.draw.scale
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.ChevronLeft
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material.icons.outlined.CreditCard
import androidx.compose.material.icons.outlined.DirectionsCar
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.FitnessCenter
import androidx.compose.material.icons.outlined.ListAlt
import androidx.compose.material.icons.outlined.LocalHospital
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.School
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import uz.click.benefits.data.RequestStatus
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.BenefitRequest
import uz.click.benefits.data.Category
import uz.click.benefits.data.Offer
import uz.click.benefits.ui.components.PrimaryButton
import uz.click.benefits.ui.components.RatingStars
import uz.click.benefits.ui.components.SceneBackdrop
import uz.click.benefits.ui.components.ScreenHeader
import uz.click.benefits.ui.components.StatusBadge
import uz.click.benefits.ui.components.StatusTrack
import uz.click.benefits.ui.components.EntryQrCard
import uz.click.benefits.ui.components.hasEntryPass
import uz.click.benefits.ui.components.sceneRes
import uz.click.benefits.ui.components.heroRes
import uz.click.benefits.ui.components.sceneScrim
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.categoryAccent
import uz.click.benefits.ui.theme.homeWash
import uz.click.benefits.ui.theme.categoryLabel
import uz.click.benefits.ui.theme.requestRank
import uz.click.benefits.ui.theme.statusLabel
import java.text.NumberFormat
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.TextStyle as DateTextStyle
import java.time.temporal.TemporalAdjusters
import java.util.Locale

@Composable
fun EmployeeHome(
    store: AppStore,
    onAllRequests: () -> Unit,
    onOffer: (String) -> Unit,
    onRedeem: (String) -> Unit = {},
    onRequest: (String) -> Unit = {},
    onCategory: (Category) -> Unit,
    onSaved: () -> Unit,
    onBell: () -> Unit,
    onCatalog: () -> Unit,
    onWallet: () -> Unit,
) {
    val user = store.session ?: return
    val live = store.requests.filter { it.employeeId == user.id }.sortedBy { requestRank(it.status) }.take(2)
    val recommended = store.recommendedOffers().ifEmpty { store.employeeOffers("", null) }
        .sortedByDescending { store.isSaved(it.id) }
        .take(4)
    val featured = recommended.firstOrNull()
    Box(Modifier.fillMaxSize().background(C.bg)) {
        Box(Modifier.fillMaxWidth().height(200.dp).background(homeWash()))
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .statusBarsPadding()
                .padding(horizontal = 20.dp)
                .padding(top = 11.dp, bottom = 120.dp),
        ) {
        ScreenHeader(
            "Главная",
            unread = store.unreadCount() > 0,
            showAdd = true,
            onAdd = onCatalog,
            onSaved = onSaved,
            onBell = onBell,
        )
        Spacer(Modifier.height(14.dp))
        CorporateMiniCard(store, onOpen = onWallet)
        Spacer(Modifier.height(18.dp))
        featured?.let { offer ->
            FeaturedCard(offer, onClick = { onOffer(offer.id) }, onRedeem = { onRedeem(offer.id) })
        }
        Spacer(Modifier.height(36.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Category.entries.forEach { cat ->
                item { CategoryTile(cat) { onCategory(cat) } }
            }
        }
        Spacer(Modifier.height(22.dp))
        if (live.isNotEmpty()) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Заявки", style = T.section)
                Text("Все", color = C.brand, fontFamily = T.sans, fontWeight = FontWeight.Medium, modifier = Modifier.clickable(onClick = onAllRequests))
            }
            Spacer(Modifier.height(10.dp))
            live.forEach { req ->
                val offer = store.offer(req.offerId)
                Column(
                    Modifier
                        .fillMaxWidth()
                        .padding(bottom = 10.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(C.card)
                        .clickable { onRequest(req.id) }
                        .padding(14.dp),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(offer?.title ?: "", fontFamily = T.sans, fontWeight = FontWeight.SemiBold, color = C.navy)
                            Text(req.createdAt, style = T.caption)
                        }
                        StatusBadge(req.status)
                    }
                    Spacer(Modifier.height(12.dp))
                    StatusTrack(req.status)
                }
            }
            Spacer(Modifier.height(16.dp))
        }
        Text("Для вас", style = T.section, modifier = Modifier.padding(start = 20.dp))
        Spacer(Modifier.height(12.dp))
        recommended.chunked(2).forEachIndexed { row, pair ->
            var shown by remember { mutableStateOf(false) }
            LaunchedEffect(pair.map { it.id }.joinToString()) {
                delay(row * 90L)
                shown = true
            }
            AnimatedVisibility(
                visible = shown,
                enter = fadeIn(tween(520)) + slideInVertically(tween(520)) { it / 5 },
            ) {
                Row(Modifier.fillMaxWidth().padding(bottom = 18.dp), horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                    pair.forEach { offer ->
                        Box(Modifier.weight(1f)) { OfferModule(store, offer, framed = true, onClick = { onOffer(offer.id) }, onRedeem = { onRedeem(offer.id) }) }
                    }
                    if (pair.size == 1) Spacer(Modifier.weight(1f))
                }
            }
        }
        }
    }
}

@Composable
fun EmployeeCatalog(
    store: AppStore,
    onOffer: (String) -> Unit,
    onRedeem: (String) -> Unit = {},
    startCategory: Category?,
    startPaid: Boolean?,
    onSaved: () -> Unit,
    onBell: () -> Unit,
) {
    var query by remember { mutableStateOf("") }
    var category by remember { mutableStateOf(startCategory) }
    var paidFilter by remember { mutableStateOf(startPaid) }
    LaunchedEffect(startCategory, startPaid) {
        category = startCategory
        paidFilter = startPaid
    }
    val offers = store.employeeOffers(query, category, paidFilter).sortedByDescending { store.isSaved(it.id) }
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = Modifier.fillMaxSize().background(C.bg),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 120.dp),
        horizontalArrangement = Arrangement.spacedBy(18.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item(span = { GridItemSpan(2) }) {
            Column(Modifier.statusBarsPadding().padding(top = 8.dp, bottom = 4.dp)) {
                ScreenHeader(
                    "Каталог",
                    unread = store.unreadCount() > 0,
                    savedActive = false,
                    onSaved = onSaved,
                    onBell = onBell,
                )
                Spacer(Modifier.height(14.dp))
                Row(
                    Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(C.card)
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Outlined.Search, "Поиск", tint = C.brand, modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(10.dp))
                    BasicTextField(
                        value = query,
                        onValueChange = { query = it },
                        singleLine = true,
                        textStyle = TextStyle(fontFamily = T.sans, fontSize = 15.sp, color = C.navy),
                        modifier = Modifier.weight(1f),
                        decorationBox = { inner ->
                            if (query.isEmpty()) Text("Зал, обед, ивент...", color = C.muted, fontSize = 15.sp)
                            inner()
                        }
                    )
                }
                Spacer(Modifier.height(14.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    QuickTile("Бесплатно", Icons.Outlined.StarBorder, Color(0xFF4ADE80), paidFilter == false, Modifier.weight(1f)) {
                        paidFilter = if (paidFilter == false) null else false
                        category = null
                    }
                    QuickTile("Платные", Icons.Outlined.CreditCard, Color(0xFF4C8DFF), paidFilter == true, Modifier.weight(1f)) {
                        paidFilter = if (paidFilter == true) null else true
                        category = null
                    }
                    QuickTile("Избранное", Icons.Outlined.BookmarkBorder, Color(0xFFFF6B9D), false, Modifier.weight(1f), onClick = onSaved)
                }
                Spacer(Modifier.height(14.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Category.entries.forEach { cat ->
                        item {
                            FilterSquare(cat, category == cat) {
                                category = if (category == cat) null else cat
                            }
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                Text("Типы льгот", style = T.section)
            }
        }
        if (offers.isEmpty()) {
            item(span = { GridItemSpan(2) }) {
                Column(Modifier.fillMaxWidth().padding(top = 40.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Outlined.Search, null, tint = C.muted, modifier = Modifier.size(40.dp))
                    Spacer(Modifier.height(12.dp))
                    Text("Ничего не найдено", style = T.section)
                    Text("Сбросьте фильтр или откройте весь каталог", style = T.caption)
                    Spacer(Modifier.height(16.dp))
                    PrimaryButton("Показать все", modifier = Modifier.width(200.dp)) {
                        query = ""
                        category = null
                        paidFilter = null
                    }
                }
            }
        }
        items(offers, key = { it.id }) { offer ->
            Box(Modifier.animateItem()) {
                OfferModule(store, offer, onClick = { onOffer(offer.id) }, onRedeem = { onRedeem(offer.id) })
            }
        }
    }
}

@Composable
fun EmployeeBenefit(store: AppStore, offerId: String, onBack: () -> Unit, onRedeem: (String) -> Unit = {}, onSubmitted: (String) -> Unit) {
    val offer = store.offer(offerId)
    if (offer == null) {
        MissingStackScreen("Льгота не найдена", onBack)
        return
    }
    val merchant = store.merchant(offer.merchantId)
    var shown by remember { mutableStateOf(false) }
    var boughtId by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(offer.id) { shown = true }
    Box(Modifier.fillMaxSize().background(C.bg)) {
        SceneBackdrop(
            resId = heroRes(offer),
            modifier = Modifier.fillMaxWidth().height(280.dp),
            overlay = sceneScrim(top = 0.28f, mid = 0.42f, bottom = 0.88f),
        )
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 140.dp)) {
            Column(Modifier.statusBarsPadding().padding(horizontal = 16.dp, vertical = 8.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier.size(40.dp).clip(CircleShape).background(Color.Black.copy(0.35f)).clickable(onClick = onBack),
                        contentAlignment = Alignment.Center,
                    ) { Icon(Icons.Outlined.ChevronLeft, "Назад", tint = C.white) }
                    Box(
                        Modifier.size(40.dp).clip(CircleShape).background(Color.Black.copy(0.35f)).clickable { store.toggleSaved(offer.id) },
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            if (store.isSaved(offer.id)) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                            "Сохранить",
                            tint = C.white,
                        )
                    }
                }
                Spacer(Modifier.height(28.dp))
                AnimatedVisibility(shown, enter = fadeIn(tween(560)) + slideInVertically(tween(560)) { it / 4 }) {
                    Column {
                        Text(categoryLabel(offer.category), color = C.white.copy(0.85f), fontFamily = T.sans, fontSize = 14.sp)
                        Text(
                            offer.title,
                            fontFamily = T.sans,
                            fontWeight = FontWeight.Black,
                            fontSize = if (offer.category == Category.events) 36.sp else 32.sp,
                            color = if (offer.category == Category.events) Color(0xFF86EFAC) else C.white,
                            lineHeight = 40.sp,
                        )
                        Spacer(Modifier.height(8.dp))
                        if (offer.rating.isNotBlank()) RatingStars(offer.rating)
                        Spacer(Modifier.height(6.dp))
                        Text(
                            "${merchant?.name ?: "Партнёр"} · ${offer.placesLeft ?: "∞"} мест",
                            color = C.white.copy(0.85f),
                            fontFamily = T.sans,
                            fontSize = 15.sp,
                        )
                    }
                }
            }
            Spacer(Modifier.height(20.dp))
            AnimatedVisibility(shown, enter = fadeIn(tween(640)) + slideInVertically(tween(600)) { it / 6 }) {
                Column(Modifier.padding(horizontal = 20.dp)) {
                    Column(
                        Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(22.dp))
                            .background(C.card)
                            .border(1.dp, Color(0xFF3A3A3C), RoundedCornerShape(22.dp))
                            .clickable { onRedeem(offer.id) }
                            .padding(18.dp),
                    ) {
                        Text(if (offer.isFree) "Бесплатно" else "${fmt(offer.points)} баллов", color = C.navy, fontFamily = T.sans, fontWeight = FontWeight.Bold, fontSize = 26.sp)
                        if (offer.timeSlot.isNotBlank()) {
                            Spacer(Modifier.height(10.dp))
                            Box(Modifier.clip(RoundedCornerShape(12.dp)).background(Color(0xFF2C2C2E)).padding(horizontal = 12.dp, vertical = 6.dp)) {
                                Text(offer.timeSlot, color = C.white, fontFamily = T.sans, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            }
                        }
                    }
                    Spacer(Modifier.height(14.dp))
                    Column(
                        Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(22.dp))
                            .background(C.card)
                            .border(1.dp, Color(0xFF3A3A3C), RoundedCornerShape(22.dp))
                            .padding(16.dp),
                    ) {
                        Text(merchant?.name ?: "Партнёр", fontFamily = T.sans, fontWeight = FontWeight.Bold, color = C.navy, fontSize = 18.sp)
                        if (offer.rating.isNotBlank()) {
                            Spacer(Modifier.height(6.dp))
                            RatingStars(offer.rating)
                        }
                        if (offer.address.isNotBlank()) Text(offer.address, style = T.caption)
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            if (offer.metro.isNotBlank()) Text("M  ${offer.metro}", color = Color(0xFF4ADE80), fontSize = 13.sp)
                            if (offer.distance.isNotBlank()) Text(offer.distance, style = T.caption)
                        }
                        if (offer.subsection.isNotBlank()) {
                            Spacer(Modifier.height(8.dp))
                            Text(offer.subsection, color = C.navy, fontFamily = T.sans, fontWeight = FontWeight.Medium)
                        }
                        Spacer(Modifier.height(10.dp))
                        Text(offer.description, color = C.muted, fontSize = 14.sp, lineHeight = 20.sp)
                    }
                }
            }
        }
        Box(Modifier.align(Alignment.BottomCenter).fillMaxWidth().background(C.bg).padding(16.dp, 16.dp, 16.dp, 28.dp)) {
            PrimaryButton(
                when {
                    boughtId != null -> "Готово"
                    offer.isFree -> "Записаться бесплатно"
                    else -> "Получить за ${fmt(offer.points)} баллов"
                },
            ) {
                val id = boughtId
                if (id != null) {
                    onSubmitted(id)
                } else {
                    val submitted = store.submitRequest(offer.id)
                    if (submitted != null) boughtId = submitted.id
                }
            }
        }
    }
}

@Composable
fun EmployeeRequests(store: AppStore, onOpen: (String) -> Unit, onFind: () -> Unit, onSaved: () -> Unit, onBell: () -> Unit) {
    val user = store.session ?: return
    val all = store.requests.filter { it.employeeId == user.id }
    val today = remember { LocalDate.now() }
    val thisMonday = remember(today) { today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)) }
    val weekCenter = 52
    val pagerState = rememberPagerState(initialPage = weekCenter) { weekCenter * 2 + 1 }
    val scope = rememberCoroutineScope()
    val weekStart = thisMonday.plusWeeks((pagerState.currentPage - weekCenter).toLong())
    var selected by remember { mutableStateOf(today) }
    val byDay = remember(all) {
        all.groupBy { parseRequestDate(it.createdAt) ?: today }
    }
    LaunchedEffect(pagerState.settledPage) {
        val start = thisMonday.plusWeeks((pagerState.settledPage - weekCenter).toLong())
        val end = start.plusDays(6)
        if (selected.isBefore(start) || selected.isAfter(end)) {
            selected = if (today in start..end) today else start
        }
    }
    val dayItems = byDay[selected].orEmpty().sortedBy { requestRank(it.status) }
    val monthTitle = remember(weekStart) {
        val end = weekStart.plusDays(6)
        val ru = Locale("ru", "RU")
        if (weekStart.month == end.month) {
            weekStart.month.getDisplayName(DateTextStyle.FULL_STANDALONE, ru)
                .replaceFirstChar { it.titlecase(ru) } + " ${weekStart.year}"
        } else {
            val a = weekStart.month.getDisplayName(DateTextStyle.SHORT, ru)
            val b = end.month.getDisplayName(DateTextStyle.SHORT, ru)
            "$a – $b ${end.year}"
        }
    }

    Column(
        Modifier
            .fillMaxSize()
            .background(C.bg)
            .statusBarsPadding()
            .padding(horizontal = 20.dp)
            .padding(top = 11.dp, bottom = 96.dp),
    ) {
        ScreenHeader("Заявки", unread = store.unreadCount() > 0, onSaved = onSaved, onBell = onBell)
        Spacer(Modifier.height(18.dp))
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(36.dp).clip(CircleShape).background(C.card).clickable {
                    scope.launch { pagerState.animateScrollToPage(pagerState.currentPage - 1) }
                },
                contentAlignment = Alignment.Center,
            ) { Icon(Icons.Outlined.ChevronLeft, "Назад", tint = C.navy, modifier = Modifier.size(22.dp)) }
            Text(
                monthTitle,
                modifier = Modifier.weight(1f),
                style = T.section,
                fontSize = 18.sp,
                textAlign = TextAlign.Center,
            )
            Box(
                Modifier.size(36.dp).clip(CircleShape).background(C.card).clickable {
                    scope.launch { pagerState.animateScrollToPage(pagerState.currentPage + 1) }
                },
                contentAlignment = Alignment.Center,
            ) { Icon(Icons.Outlined.ChevronRight, "Вперёд", tint = C.navy, modifier = Modifier.size(22.dp)) }
        }
        Spacer(Modifier.height(14.dp))
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxWidth().height(118.dp),
        ) { page ->
            val start = thisMonday.plusWeeks((page - weekCenter).toLong())
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                (0..6).forEach { offset ->
                    val day = start.plusDays(offset.toLong())
                    CalendarDayCell(
                        day = day,
                        active = day == selected,
                        isToday = day == today,
                        eventCount = byDay[day]?.size ?: 0,
                        onClick = { selected = day },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
        Spacer(Modifier.height(18.dp))
        Text(
            selectedDayLabel(selected, today),
            style = T.section,
            fontSize = 16.sp,
        )
        Spacer(Modifier.height(12.dp))
        Column(
            Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 28.dp),
        ) {
            if (dayItems.isEmpty()) {
                Column(
                    Modifier.fillMaxWidth().padding(top = 36.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Box(
                        Modifier.size(72.dp).clip(CircleShape).background(C.card),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Outlined.CalendarMonth, null, tint = C.muted, modifier = Modifier.size(32.dp))
                    }
                    Spacer(Modifier.height(14.dp))
                    Text("Нет заявок на этот день", style = T.caption, fontSize = 15.sp)
                    Spacer(Modifier.height(18.dp))
                    PrimaryButton("Найти льготу", modifier = Modifier.width(200.dp), onClick = onFind)
                }
            } else {
                dayItems.forEachIndexed { index, req ->
                    var shown by remember { mutableStateOf(false) }
                    LaunchedEffect(req.id, selected) {
                        shown = false
                        delay(index * 80L)
                        shown = true
                    }
                    AnimatedVisibility(
                        visible = shown,
                        enter = fadeIn(tween(420)) + slideInVertically(tween(420)) { it / 5 },
                    ) {
                        RequestDayRow(store, req) { onOpen(req.id) }
                    }
                }
            }
        }
    }
}

@Composable
private fun CalendarDayCell(
    day: LocalDate,
    active: Boolean,
    isToday: Boolean,
    eventCount: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val pulse by rememberInfiniteTransition(label = "dayPulse").animateFloat(
        initialValue = 0.82f,
        targetValue = 1.12f,
        animationSpec = infiniteRepeatable(tween(900), RepeatMode.Reverse),
        label = "dot",
    )
    val selectScale by animateFloatAsState(
        if (active) 1.04f else 1f,
        spring(dampingRatio = 0.55f, stiffness = Spring.StiffnessMediumLow),
        label = "dayScale",
    )
    Column(
        modifier
            .height(118.dp)
            .scale(selectScale)
            .clip(RoundedCornerShape(20.dp))
            .background(if (active) C.brand else C.card)
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            day.dayOfWeek.getDisplayName(DateTextStyle.SHORT, Locale("ru", "RU"))
                .take(2)
                .replaceFirstChar { it.titlecase(Locale("ru", "RU")) },
            color = if (active) C.white.copy(0.75f) else C.muted,
            fontFamily = T.sans,
            fontSize = 12.sp,
        )
        Text(
            "${day.dayOfMonth}",
            color = when {
                active -> C.white
                isToday -> C.brand
                else -> C.navy
            },
            fontFamily = T.sans,
            fontWeight = FontWeight.Bold,
            fontSize = 22.sp,
        )
        if (eventCount > 0) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(3.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                repeat(eventCount.coerceAtMost(3)) {
                    Box(
                        Modifier
                            .size(8.dp)
                            .scale(pulse)
                            .clip(CircleShape)
                            .background(if (active) C.white else C.brand),
                    )
                }
            }
        } else {
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun RequestDayRow(store: AppStore, req: BenefitRequest, onClick: () -> Unit) {
    val offer = store.offer(req.offerId)
    Column(
        Modifier
            .fillMaxWidth()
            .padding(bottom = 10.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(C.card)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(C.brandSoft),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Outlined.NotificationsNone, null, tint = C.brand, modifier = Modifier.size(20.dp))
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    offer?.title ?: "",
                    fontFamily = T.sans,
                    fontWeight = FontWeight.SemiBold,
                    color = C.navy,
                    fontSize = 15.sp,
                )
                Spacer(Modifier.height(2.dp))
                Text(req.createdAt, style = T.caption, fontSize = 12.sp)
            }
            Spacer(Modifier.width(8.dp))
            StatusBadge(req.status)
        }
        Spacer(Modifier.height(10.dp))
        StatusTrack(req.status)
    }
}

private val monthRu = mapOf(
    "янв" to 1, "фев" to 2, "мар" to 3, "апр" to 4, "мая" to 5, "май" to 5,
    "июн" to 6, "июл" to 7, "авг" to 8, "сен" to 9, "окт" to 10, "ноя" to 11, "дек" to 12,
)

private fun parseRequestDate(stamp: String, year: Int = LocalDate.now().year): LocalDate? {
    val match = Regex("""(\d{1,2})\s+([а-яё]{3})""", RegexOption.IGNORE_CASE).find(stamp) ?: return null
    val day = match.groupValues[1].toIntOrNull() ?: return null
    val month = monthRu[match.groupValues[2].lowercase(Locale("ru", "RU"))] ?: return null
    return runCatching { LocalDate.of(year, month, day) }.getOrNull()
}

private fun selectedDayLabel(day: LocalDate, today: LocalDate): String {
    val ru = Locale("ru", "RU")
    return when (day) {
        today -> "Сегодня"
        today.minusDays(1) -> "Вчера"
        today.plusDays(1) -> "Завтра"
        else -> {
            val name = day.dayOfWeek.getDisplayName(DateTextStyle.FULL, ru).replaceFirstChar { it.titlecase(ru) }
            val mon = day.month.getDisplayName(DateTextStyle.SHORT, ru)
            "$name, ${day.dayOfMonth} $mon"
        }
    }
}

@Composable
fun EmployeeRequestDetail(store: AppStore, requestId: String, onBack: () -> Unit) {
    val req = store.request(requestId)
    if (req == null) {
        MissingStackScreen("Заявка не найдена", onBack)
        return
    }
    val offer = store.offer(req.offerId)
    val free = offer?.isFree == true
    Box(Modifier.fillMaxSize().background(C.bg)) {
        SceneBackdrop(
            resId = offer?.let { heroRes(it) } ?: sceneRes(Category.events),
            modifier = Modifier.fillMaxWidth().height(340.dp),
            overlay = sceneScrim(top = 0.28f, mid = 0.40f, bottom = 0.88f),
        )
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 120.dp),
        ) {
            Column(Modifier.statusBarsPadding().padding(horizontal = 16.dp, vertical = 8.dp)) {
                Box(
                    Modifier.size(40.dp).clip(CircleShape).background(Color.Black.copy(0.35f)).clickable(onClick = onBack),
                    contentAlignment = Alignment.Center,
                ) { Icon(Icons.Outlined.ChevronLeft, "Назад", tint = C.white) }
                Spacer(Modifier.height(72.dp))
                Text(
                    statusLabel(req.status),
                    color = C.white.copy(0.9f),
                    fontFamily = T.sans,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp,
                    letterSpacing = 1.2.sp,
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    offer?.title ?: "Заявка",
                    fontFamily = T.sans,
                    fontWeight = FontWeight.Black,
                    fontSize = 34.sp,
                    color = C.white,
                    lineHeight = 40.sp,
                )
                Spacer(Modifier.height(14.dp))
                Box(
                    Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (free) Color(0xFF163024) else Color.Black.copy(0.42f))
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                ) {
                    Text(
                        if (free) "Бесплатно" else "${fmt(offer?.points ?: 0)} баллов",
                        color = if (free) Color(0xFF86EFAC) else C.white,
                        fontFamily = T.sans,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                    )
                }
            }
            Spacer(Modifier.height(18.dp))
            Column(
                Modifier
                    .padding(horizontal = 20.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(22.dp))
                    .background(C.card)
                    .padding(16.dp),
            ) {
                StatusTrack(req.status, showLabels = true)
            }
            if (req.status.hasEntryPass()) {
                Spacer(Modifier.height(18.dp))
                Box(Modifier.padding(horizontal = 20.dp)) {
                    EntryQrCard(req)
                }
            }
        }
        Box(Modifier.align(Alignment.BottomCenter).fillMaxWidth().background(C.bg).padding(16.dp, 16.dp, 16.dp, 28.dp)) {
            PrimaryButton("Готово", onClick = onBack)
        }
    }
}

@Composable
fun EmployeeProfile(
    store: AppStore,
    onSaved: () -> Unit,
    onBell: () -> Unit,
    onBalance: () -> Unit,
    onRequests: () -> Unit,
) {
    val user = store.session ?: return
    val company = store.company(user.companyId ?: "")
    var name by remember { mutableStateOf(user.name) }
    var jobTitle by remember { mutableStateOf(user.jobTitle) }
    var editing by remember { mutableStateOf(false) }
    val scroll = rememberScrollState()
    LaunchedEffect(editing) { if (editing) scroll.animateScrollTo(scroll.maxValue) }
    Column(Modifier.fillMaxSize().background(C.bg).verticalScroll(scroll).statusBarsPadding().padding(horizontal = 20.dp).padding(top = 27.dp, bottom = 120.dp)) {
        ScreenHeader("Ещё", unread = store.unreadCount() > 0, onSaved = onSaved, onBell = onBell)
        Text(company?.name ?: "Corporate", style = T.caption)
        Spacer(Modifier.height(18.dp))
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(C.card).padding(vertical = 6.dp)) {
            SheetRow(Icons.Outlined.Person, "Профиль", user.jobTitle.takeIf { it.isNotBlank() }) { editing = true }
            SheetRow(Icons.Outlined.CreditCard, "Баланс", "${fmt(user.balance)} баллов", onClick = onBalance)
            SheetRow(Icons.Outlined.ListAlt, "Заявки", onClick = onRequests)
            SheetRow(Icons.Outlined.BookmarkBorder, "Сохранённые", onClick = onSaved)
            SheetRow(Icons.Outlined.FavoriteBorder, "Интересы", onClick = store::reopenOnboarding)
            SheetRow(Icons.Outlined.Logout, "Выйти", onClick = store::logout)
        }
        Spacer(Modifier.height(20.dp))
        Text("Тема", style = T.section)
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ThemeChip("Светлая", !store.darkTheme) { store.darkTheme = false }
            ThemeChip("Тёмная", store.darkTheme) { store.darkTheme = true }
        }
        Spacer(Modifier.height(20.dp))
        Text("О себе", style = T.section, color = if (editing) C.brand else C.navy)
        Spacer(Modifier.height(8.dp))
        Column(
            Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .border(1.dp, if (editing) C.brand else Color.Transparent, RoundedCornerShape(16.dp))
                .padding(if (editing) 12.dp else 0.dp)
        ) {
            ProfileField("Имя", name) { name = it }
            Spacer(Modifier.height(8.dp))
            ProfileField("Должность", jobTitle) { jobTitle = it }
            Spacer(Modifier.height(12.dp))
            PrimaryButton("Сохранить профиль") {
                store.updateProfile(name, jobTitle)
                editing = false
            }
        }
    }
}

@Composable
private fun CorporateMiniCard(store: AppStore, onOpen: () -> Unit) {
    val user = store.session ?: return
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(Brush.linearGradient(listOf(Color(0xFF0B1A3A), Color(0xFF246BFD), Color(0xFF111827))))
            .clickable(onClick = onOpen)
            .padding(16.dp),
    ) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("CORPORATE", color = C.white.copy(0.75f), fontFamily = T.sans, fontWeight = FontWeight.Bold, fontSize = 11.sp, letterSpacing = 1.5.sp)
            Icon(Icons.Outlined.ChevronRight, null, tint = C.white.copy(0.7f), modifier = Modifier.size(18.dp))
        }
        Spacer(Modifier.height(6.dp))
        Text("${fmt(user.balance)} баллов", color = C.white, fontFamily = T.sans, fontWeight = FontWeight.Black, fontSize = 26.sp)
    }
}

@Composable
private fun FeaturedCard(offer: Offer, onClick: () -> Unit, onRedeem: () -> Unit) {
    SceneBackdrop(
        resId = sceneRes(offer),
        modifier = Modifier
            .fillMaxWidth()
            .height(220.dp)
            .clip(RoundedCornerShape(24.dp))
            .clickable(onClick = onClick),
        overlay = sceneScrim(top = 0.18f, mid = 0.32f, bottom = 0.84f),
    ) {
        Column(Modifier.align(Alignment.BottomStart).padding(16.dp)) {
            Text(offer.title, fontFamily = T.sans, fontWeight = FontWeight.Bold, fontSize = 22.sp, color = C.white)
            Spacer(Modifier.height(8.dp))
            Text(
                if (offer.isFree) "Бесплатно" else "${fmt(offer.points)} баллов",
                color = C.white,
                fontFamily = T.sans,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                modifier = Modifier.clickable(onClick = onRedeem),
            )
        }
    }
}

@Composable
private fun MenuRow(title: String, subtitle: String, onClick: () -> Unit, trailing: @Composable () -> Unit = {}) {
    Row(
        Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(C.card)
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, fontFamily = T.sans, fontWeight = FontWeight.SemiBold, color = C.navy)
            Text(subtitle, style = T.caption)
        }
        trailing()
        Icon(Icons.Outlined.ChevronRight, null, tint = C.muted, modifier = Modifier.size(18.dp))
    }
}

@Composable
internal fun OfferModule(store: AppStore, offer: Offer, framed: Boolean = false, onClick: () -> Unit, onRedeem: () -> Unit = {}) {
    val saved = store.isSaved(offer.id)
    val scale by animateFloatAsState(
        if (saved) 1.12f else 1f,
        spring(stiffness = Spring.StiffnessMedium),
        label = "saveScale",
    )
    SceneBackdrop(
        resId = sceneRes(offer),
        modifier = Modifier
            .fillMaxWidth()
            .height(188.dp)
            .clip(RoundedCornerShape(22.dp))
            .then(
                if (framed) Modifier.border(1.dp, Color(0xFF3A3A3C), RoundedCornerShape(22.dp))
                else Modifier
            )
            .clickable(onClick = onClick),
        overlay = sceneScrim(top = 0.28f, mid = 0.40f, bottom = 0.82f),
    ) {
        Column(
            Modifier.fillMaxSize().padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                Box(
                    Modifier.size(28.dp).scale(scale).clip(CircleShape).background(Color.Black.copy(0.4f)).clickable { store.toggleSaved(offer.id) },
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        if (saved) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                        "Сохранить",
                        tint = C.white,
                        modifier = Modifier.size(18.dp),
                    )
                }
            }
            Column {
                Text(offer.title, fontSize = 16.sp, fontFamily = T.sans, fontWeight = FontWeight.Bold, color = C.white, maxLines = 2)
                Spacer(Modifier.height(4.dp))
                Text(
                    if (offer.isFree) "Бесплатно" else "${fmt(offer.points)} баллов",
                    color = C.white.copy(0.88f),
                    fontFamily = T.sans,
                    fontSize = 12.sp,
                    modifier = Modifier.clickable(onClick = onRedeem),
                )
            }
        }
    }
}

@Composable
private fun SheetRow(icon: ImageVector, title: String, subtitle: String? = null, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(40.dp).clip(CircleShape).background(C.brandSoft), contentAlignment = Alignment.Center) {
            Icon(icon, null, tint = C.brand, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(title, fontFamily = T.sans, fontWeight = FontWeight.SemiBold, color = C.navy)
            if (!subtitle.isNullOrBlank()) Text(subtitle, style = T.caption)
        }
        Icon(Icons.Outlined.ChevronRight, null, tint = C.muted, modifier = Modifier.size(18.dp))
    }
}

@Composable
private fun QuickTile(title: String, icon: ImageVector, accent: Color, selected: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Column(
        modifier
            .height(92.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(C.card)
            .border(1.dp, if (selected) C.brand else Color.Transparent, RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(12.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Box(Modifier.size(32.dp).clip(RoundedCornerShape(10.dp)).background(accent.copy(alpha = 0.18f)), contentAlignment = Alignment.Center) {
            Icon(icon, null, tint = accent, modifier = Modifier.size(18.dp))
        }
        Text(title, color = C.navy, fontFamily = T.sans, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
    }
}

@Composable
private fun FilterSquare(category: Category, selected: Boolean, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(72.dp).clickable(onClick = onClick)) {
        Box(
            Modifier
                .size(56.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(if (selected) categoryAccent(category) else C.card),
            contentAlignment = Alignment.Center,
        ) {
            Icon(categoryIcon(category), null, tint = if (selected) C.white else categoryAccent(category), modifier = Modifier.size(22.dp))
        }
        Spacer(Modifier.height(6.dp))
        Text(categoryLabel(category), fontSize = 11.sp, fontFamily = T.sans, color = C.muted)
    }
}

@Composable
private fun ThemeChip(title: String, selected: Boolean, onClick: () -> Unit) {
    Box(
        Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (selected) C.brand else C.card)
            .border(1.dp, if (selected) C.brand else C.line, RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 10.dp),
    ) {
        Text(title, color = if (selected) C.white else C.navy, fontFamily = T.sans, fontWeight = FontWeight.Medium, fontSize = 14.sp)
    }
}

@Composable
private fun ProfileField(label: String, value: String, onChange: (String) -> Unit) {
    Text(label, style = T.caption, modifier = Modifier.padding(bottom = 6.dp))
    Box(
        Modifier
            .fillMaxWidth()
            .height(48.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(C.card)
            .border(1.dp, C.line, RoundedCornerShape(12.dp))
            .padding(horizontal = 14.dp),
        contentAlignment = Alignment.CenterStart,
    ) {
        BasicTextField(
            value = value,
            onValueChange = onChange,
            singleLine = true,
            textStyle = androidx.compose.ui.text.TextStyle(fontFamily = T.sans, fontSize = 15.sp, color = C.navy),
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun CategoryTile(category: Category, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(64.dp).clickable(onClick = onClick),
    ) {
        Box(
            Modifier.size(58.dp).clip(CircleShape).border(2.dp, C.brand, CircleShape).padding(3.dp).clip(CircleShape).background(categoryAccent(category)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(categoryIcon(category), null, tint = C.white, modifier = Modifier.size(22.dp))
        }
        Spacer(Modifier.height(6.dp))
        Text(categoryLabel(category), fontSize = 11.sp, fontFamily = T.sans, color = C.white)
    }
}

@Composable
private fun MissingStackScreen(message: String, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().background(C.bg).statusBarsPadding()) {
        Row(Modifier.padding(16.dp).clickable(onClick = onBack), verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Outlined.ChevronLeft, null, tint = C.brand)
            Text("Назад", fontFamily = T.sans, fontWeight = FontWeight.Medium, color = C.brand)
        }
        Text(message, style = T.caption, modifier = Modifier.padding(horizontal = 20.dp))
    }
}

internal fun categoryIcon(category: Category): ImageVector = when (category) {
    Category.sport -> Icons.Outlined.FitnessCenter
    Category.food -> Icons.Outlined.Restaurant
    Category.education -> Icons.Outlined.School
    Category.health -> Icons.Outlined.LocalHospital
    Category.transport -> Icons.Outlined.DirectionsCar
    Category.events -> Icons.Outlined.Event
}

internal fun fmt(value: Int) = NumberFormat.getInstance(Locale("ru", "RU")).format(value)
