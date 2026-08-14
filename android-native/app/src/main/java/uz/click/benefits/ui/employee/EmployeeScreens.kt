package uz.click.benefits.ui.employee

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.TextStyle
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import uz.click.benefits.data.RequestStatus
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.Category
import uz.click.benefits.data.Offer
import uz.click.benefits.ui.components.PrimaryButton
import uz.click.benefits.ui.components.RatingStars
import uz.click.benefits.ui.components.ScreenHeader
import uz.click.benefits.ui.components.StatusBadge
import uz.click.benefits.ui.components.StatusTrack
import uz.click.benefits.ui.components.EntryQrCard
import uz.click.benefits.ui.components.hasEntryPass
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.categoryAccent
import uz.click.benefits.ui.theme.homeWash
import uz.click.benefits.ui.theme.categoryHero
import uz.click.benefits.ui.theme.categoryLabel
import uz.click.benefits.ui.theme.roleDescription
import uz.click.benefits.ui.theme.roleTitle
import uz.click.benefits.ui.theme.statusLabel
import java.text.NumberFormat
import java.util.Locale

@Composable
fun EmployeeHome(
    store: AppStore,
    onAllRequests: () -> Unit,
    onOffer: (String) -> Unit,
    onRequest: (String) -> Unit = {},
    onCategory: (Category) -> Unit,
    onSaved: () -> Unit,
    onBell: () -> Unit,
    onCatalog: () -> Unit,
) {
    val user = store.session ?: return
    val company = store.company(user.companyId ?: "")
    val live = store.requests.filter { it.employeeId == user.id }.take(2)
    val recommended = store.recommendedOffers().ifEmpty { store.employeeOffers("", null) }.take(4)
    val featured = recommended.firstOrNull()
    Box(Modifier.fillMaxSize().background(C.bg)) {
        Box(Modifier.fillMaxWidth().height(200.dp).background(homeWash()))
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .statusBarsPadding()
                .padding(horizontal = 20.dp)
                .padding(top = 4.dp, bottom = 120.dp),
        ) {
        ScreenHeader(
            "Главная",
            unread = store.unreadCount() > 0,
            showAdd = true,
            onAdd = onCatalog,
            onSaved = onSaved,
            onBell = onBell,
        )
        Text(company?.name ?: "", style = T.caption)
        Spacer(Modifier.height(18.dp))
        featured?.let { offer ->
            FeaturedCard(offer, user.balance) { onOffer(offer.id) }
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
                MenuRow(offer?.title ?: "", req.createdAt, onClick = { onRequest(req.id) }) {
                    StatusBadge(req.status)
                }
            }
            Spacer(Modifier.height(16.dp))
        }
        Text("Для вас", style = T.section)
        Spacer(Modifier.height(12.dp))
        recommended.chunked(2).forEachIndexed { row, pair ->
            var shown by remember { mutableStateOf(false) }
            LaunchedEffect(pair.map { it.id }.joinToString()) {
                delay(row * 90L)
                shown = true
            }
            AnimatedVisibility(
                visible = shown,
                enter = fadeIn(tween(320)) + slideInVertically(tween(320)) { it / 5 },
            ) {
                Row(Modifier.fillMaxWidth().padding(bottom = 12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    pair.forEach { offer ->
                        Box(Modifier.weight(1f)) { OfferModule(store, offer, framed = true) { onOffer(offer.id) } }
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
    val offers = store.employeeOffers(query, category, paidFilter)
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = Modifier.fillMaxSize().background(C.bg),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 120.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
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
            OfferModule(store, offer) { onOffer(offer.id) }
        }
    }
}

@Composable
fun EmployeeBenefit(store: AppStore, offerId: String, onBack: () -> Unit, onSubmitted: (String) -> Unit) {
    val offer = store.offer(offerId)
    if (offer == null) {
        MissingStackScreen("Льгота не найдена", onBack)
        return
    }
    val merchant = store.merchant(offer.merchantId)
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(offer.id) { shown = true }
    Box(Modifier.fillMaxSize().background(C.bg)) {
        Box(Modifier.fillMaxWidth().height(280.dp).background(categoryHero(offer.category)))
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
                AnimatedVisibility(shown, enter = fadeIn(tween(400)) + slideInVertically(tween(400)) { it / 4 }) {
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
            AnimatedVisibility(shown, enter = fadeIn(tween(500)) + slideInVertically(tween(450)) { it / 6 }) {
                Column(Modifier.padding(horizontal = 20.dp)) {
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(22.dp))
                            .background(Brush.horizontalGradient(listOf(Color(0xFF1D4ED8), Color(0xFF2563EB))))
                            .padding(18.dp),
                    ) {
                        Column {
                            Text(if (offer.isFree) "Бесплатно для сотрудников" else "${fmt(offer.points)} баллов", color = C.white, fontFamily = T.sans, fontWeight = FontWeight.Bold, fontSize = 26.sp)
                            Text(
                                if (offer.isFree) "Баллы не списываются" else "Спишется с корпоративного баланса",
                                color = C.white.copy(0.85f),
                                fontSize = 13.sp,
                            )
                            if (offer.timeSlot.isNotBlank()) {
                                Spacer(Modifier.height(10.dp))
                                Box(Modifier.clip(RoundedCornerShape(12.dp)).background(Color.Black.copy(0.28f)).padding(horizontal = 12.dp, vertical = 6.dp)) {
                                    Text(offer.timeSlot, color = C.white, fontFamily = T.sans, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                }
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
            PrimaryButton(if (offer.isFree) "Записаться бесплатно" else "Получить за ${fmt(offer.points)} баллов") {
                val submitted = store.submitRequest(offer.id)
                if (submitted != null) onSubmitted(submitted.id)
            }
        }
    }
}

@Composable
fun EmployeeRequests(store: AppStore, onOpen: (String) -> Unit, onFind: () -> Unit, onSaved: () -> Unit, onBell: () -> Unit) {
    val user = store.session ?: return
    val items = store.requests.filter { it.employeeId == user.id }
    Column(Modifier.fillMaxSize().background(C.bg).verticalScroll(rememberScrollState()).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        ScreenHeader("Заявки", unread = store.unreadCount() > 0, onSaved = onSaved, onBell = onBell)
        if (items.isEmpty()) {
            Column(
                Modifier.fillMaxWidth().padding(top = 72.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(
                    Modifier.size(88.dp).clip(CircleShape).background(C.card),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Outlined.CalendarMonth, null, tint = C.muted, modifier = Modifier.size(40.dp))
                }
                Spacer(Modifier.height(20.dp))
                Text("Нет заявок", style = T.section, fontSize = 20.sp)
                Spacer(Modifier.height(6.dp))
                Text("Заявки, которые вы отправите, появятся здесь.", style = T.caption)
                Spacer(Modifier.height(22.dp))
                PrimaryButton("Найти льготу", modifier = Modifier.width(220.dp), onClick = onFind)
            }
            return
        }
        Text("Следите за статусом — карточки появляются с анимацией.", style = T.caption)
        Spacer(Modifier.height(14.dp))
        items.forEachIndexed { index, req ->
            var shown by remember { mutableStateOf(false) }
            LaunchedEffect(req.id) {
                delay(index * 80L)
                shown = true
            }
            AnimatedVisibility(
                visible = shown,
                enter = fadeIn(tween(320)) + slideInVertically(tween(320)) { it / 3 },
            ) {
                val offer = store.offer(req.offerId)
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(bottom = 10.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(C.card)
                        .clickable { onOpen(req.id) }
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        Modifier.size(44.dp).clip(CircleShape).background(C.brandSoft),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Outlined.NotificationsNone, null, tint = C.brand, modifier = Modifier.size(20.dp))
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(offer?.title ?: "", fontFamily = T.sans, fontWeight = FontWeight.SemiBold, color = C.navy)
                        Text(req.createdAt, style = T.caption)
                        Spacer(Modifier.height(10.dp))
                        StatusTrack(req.status)
                    }
                    Spacer(Modifier.width(8.dp))
                    StatusBadge(req.status)
                }
            }
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
    Column(Modifier.fillMaxSize().background(C.bg).statusBarsPadding()) {
        Row(
            Modifier
                .fillMaxWidth()
                .clickable(onClick = onBack)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Outlined.ChevronLeft, null, tint = C.brand)
            Text("Назад", fontFamily = T.sans, fontWeight = FontWeight.Medium, color = C.brand)
        }
        Column(Modifier.verticalScroll(rememberScrollState()).padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text(offer?.title ?: "", style = T.title.copy(fontSize = 26.sp))
            Spacer(Modifier.height(6.dp))
            Text(if (offer?.isFree == true) "Бесплатно" else "${fmt(offer?.points ?: 0)} баллов", color = C.brand, fontFamily = T.sans, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            StatusBadge(req.status)
            Spacer(Modifier.height(16.dp))
            StatusTrack(req.status, showLabels = true)
            if (req.status.hasEntryPass()) {
                Spacer(Modifier.height(18.dp))
                EntryQrCard(req)
            }
            Spacer(Modifier.height(22.dp))
            req.history.forEachIndexed { index, event ->
                val last = index == req.history.lastIndex
                Row {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(16.dp)) {
                        Box(Modifier.size(12.dp).clip(CircleShape).background(if (last) C.brand else C.brand.copy(0.45f)))
                        if (!last) {
                            Box(Modifier.width(2.dp).height(40.dp).background(C.brandSoft))
                        }
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.padding(bottom = 18.dp)) {
                        Text(statusLabel(event.status), fontFamily = T.sans, fontWeight = FontWeight.Medium, color = C.navy)
                        Text("${event.at} · ${event.note}", style = T.caption)
                    }
                }
            }
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
    Column(Modifier.fillMaxSize().background(C.bg).verticalScroll(scroll).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        ScreenHeader("Ещё", unread = store.unreadCount() > 0, onSaved = onSaved, onBell = onBell)
        Text(company?.name ?: "Corporate", style = T.caption)
        Spacer(Modifier.height(18.dp))
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(C.card).padding(vertical = 6.dp)) {
            SheetRow(Icons.Outlined.Person, "Профиль", user.jobTitle.ifBlank { "Ваш профиль в Corporate" }) { editing = true }
            SheetRow(Icons.Outlined.CreditCard, "Баланс", "${fmt(user.balance)} баллов на льготы", onClick = onBalance)
            SheetRow(Icons.Outlined.ListAlt, "Заявки", "Статус записей и списаний", onClick = onRequests)
            SheetRow(Icons.Outlined.BookmarkBorder, "Сохранённые", "Льготы, которые вы отметили", onClick = onSaved)
            SheetRow(Icons.Outlined.FavoriteBorder, "Интересы", "Подберём льготы под вас", onClick = store::reopenOnboarding)
            SheetRow(Icons.Outlined.Logout, "Выйти", "Завершить сессию", onClick = store::logout)
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
        Spacer(Modifier.height(12.dp))
        Text(roleTitle(user.role), style = T.caption)
        Text(roleDescription(user.role), style = T.caption)
        Text(company?.name ?: "", style = T.caption)
    }
}

@Composable
private fun FeaturedCard(offer: Offer, balance: Int, onClick: () -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(C.card)
            .clickable(onClick = onClick)
            .padding(16.dp),
    ) {
        Box(
            Modifier.size(42.dp).clip(RoundedCornerShape(12.dp)).background(categoryAccent(offer.category)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(categoryIcon(offer.category), null, tint = C.white, modifier = Modifier.size(22.dp))
        }
        Spacer(Modifier.height(12.dp))
        Text(offer.title, fontFamily = T.sans, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = C.navy)
        Text(offer.description, style = T.caption, maxLines = 2)
        Spacer(Modifier.height(14.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(32.dp).clip(CircleShape).background(C.bg), contentAlignment = Alignment.Center) {
                Icon(Icons.Outlined.ChevronRight, null, tint = C.muted, modifier = Modifier.size(18.dp))
            }
            Text("${fmt(balance)} баллов", color = C.brand, fontFamily = T.sans, fontWeight = FontWeight.SemiBold)
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
internal fun OfferModule(store: AppStore, offer: Offer, framed: Boolean = false, onClick: () -> Unit) {
    val saved = store.isSaved(offer.id)
    val scale by animateFloatAsState(
        if (saved) 1.12f else 1f,
        spring(stiffness = Spring.StiffnessMedium),
        label = "saveScale",
    )
    Column(
        Modifier
            .fillMaxWidth()
            .height(188.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(C.card)
            .then(
                if (framed) Modifier.border(1.dp, Color(0xFF3A3A3C), RoundedCornerShape(22.dp))
                else Modifier
            )
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Column {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                Box(
                    Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(categoryAccent(offer.category)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(categoryIcon(offer.category), null, tint = C.white, modifier = Modifier.size(20.dp))
                }
                Box(
                    Modifier.size(28.dp).scale(scale).clip(CircleShape).clickable { store.toggleSaved(offer.id) },
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        if (saved) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                        "Сохранить",
                        tint = if (saved) C.brand else C.muted,
                        modifier = Modifier.size(18.dp),
                    )
                }
            }
            Spacer(Modifier.height(12.dp))
            Text(offer.title, fontSize = 16.sp, fontFamily = T.sans, fontWeight = FontWeight.Bold, color = C.navy, maxLines = 2)
            Spacer(Modifier.height(4.dp))
            Text(
                if (offer.isFree) "Бесплатно для сотрудников" else "${fmt(offer.points)} баллов",
                color = C.muted,
                fontFamily = T.sans,
                fontSize = 12.sp,
            )
        }
        Box(
            Modifier.size(28.dp).clip(CircleShape).background(C.bg),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Outlined.ChevronRight, null, tint = C.muted, modifier = Modifier.size(16.dp))
        }
    }
}

@Composable
private fun SheetRow(icon: ImageVector, title: String, subtitle: String, onClick: () -> Unit) {
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
            Text(subtitle, style = T.caption)
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
private fun PriceBadge(offer: Offer) {
    val free = offer.isFree
    val bg = if (free) C.brandSoft else C.brand
    val fg = if (free) C.brandDark else C.white
    Text(
        if (free) "Бесплатно" else "${fmt(offer.points)} баллов",
        color = fg,
        fontFamily = T.sans,
        fontSize = 11.sp,
        fontWeight = FontWeight.Medium,
        modifier = Modifier
            .padding(top = 4.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(bg)
            .padding(horizontal = 8.dp, vertical = 3.dp),
    )
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
