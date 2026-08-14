package uz.click.benefits

import android.os.Bundle
import android.graphics.Color as AndroidColor
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsTopHeight
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.Category
import uz.click.benefits.data.Role
import uz.click.benefits.ui.admin.AdminOps
import uz.click.benefits.ui.admin.AdminOverview
import uz.click.benefits.ui.admin.AdminPartners
import uz.click.benefits.ui.admin.AdminPeople
import uz.click.benefits.ui.components.FloatingTabBar
import uz.click.benefits.ui.components.adminTabs
import uz.click.benefits.ui.components.employeeTabs
import uz.click.benefits.ui.components.merchantTabs
import uz.click.benefits.ui.employee.EmployeeBenefit
import uz.click.benefits.ui.employee.EmployeeCatalog
import uz.click.benefits.ui.employee.EmployeeCategory
import uz.click.benefits.ui.employee.EmployeeHome
import uz.click.benefits.ui.employee.EmployeeNotifications
import uz.click.benefits.ui.employee.EmployeeProfile
import uz.click.benefits.ui.employee.EmployeeRequestDetail
import uz.click.benefits.ui.employee.EmployeeRequests
import uz.click.benefits.ui.employee.EmployeeSaved
import uz.click.benefits.ui.login.LoginScreen
import uz.click.benefits.ui.merchant.MerchantIncoming
import uz.click.benefits.ui.merchant.MerchantOffers
import uz.click.benefits.ui.merchant.MerchantRegister
import uz.click.benefits.ui.merchant.OfferForm
import uz.click.benefits.ui.onboarding.PreferencesScreen
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.ClickTheme

private fun isStackScreen(key: String) =
    key == "inbox" || key == "saved" || key.startsWith("category/") || key.startsWith("offer/") || key.startsWith("request/")

@Composable
private fun StatusBarScrim() {
    Column(
        Modifier
            .fillMaxWidth()
            .background(Color(0xFF0A0A0A)),
    ) {
        Spacer(Modifier.windowInsetsTopHeight(WindowInsets.statusBars))
        Box(Modifier.fillMaxWidth().height(1.dp).background(Color(0xFF1C1C1E)))
    }
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(AndroidColor.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(AndroidColor.BLACK),
        )
        setContent {
            val store: AppStore = viewModel()
            ClickTheme(dark = store.darkTheme) {
                Box(Modifier.fillMaxSize().background(C.bg)) {
                    when (store.session?.role) {
                        null -> LoginScreen(store)
                        Role.employee -> EmployeeRoot(store)
                        Role.merchant -> MerchantRoot(store)
                        Role.admin -> AdminRoot(store)
                    }
                    StatusBarScrim()
                }
            }
        }
    }
}

@Composable
private fun EmployeeRoot(store: AppStore) {
    var tab by rememberSaveable { mutableStateOf("home") }
    var offerId by rememberSaveable { mutableStateOf<String?>(null) }
    var requestId by rememberSaveable { mutableStateOf<String?>(null) }
    var inbox by rememberSaveable { mutableStateOf(false) }
    var saved by rememberSaveable { mutableStateOf(false) }
    var categoryKey by rememberSaveable { mutableStateOf<String?>(null) }
    var catalogCategory by rememberSaveable { mutableStateOf<String?>(null) }
    var catalogPaid by rememberSaveable { mutableStateOf<String?>(null) }

    fun openCatalog(category: Category? = null, paid: Boolean? = null) {
        catalogCategory = category?.name
        catalogPaid = when (paid) {
            true -> "paid"
            false -> "free"
            null -> null
        }
        tab = "catalog"
        inbox = false
        saved = false
        categoryKey = null
        offerId = null
        requestId = null
    }

    fun openCategory(category: Category) {
        categoryKey = category.name
        inbox = false
        saved = false
        offerId = null
        requestId = null
    }

    fun openSaved() {
        saved = true
        inbox = false
        offerId = null
        requestId = null
        store.clearSavedToast()
    }

    fun openInbox() {
        inbox = true
        saved = false
        offerId = null
        requestId = null
    }

    BackHandler(enabled = inbox || saved || categoryKey != null || offerId != null || requestId != null) {
        when {
            requestId != null -> requestId = null
            offerId != null -> offerId = null
            inbox -> inbox = false
            saved -> saved = false
            else -> categoryKey = null
        }
    }

    val overlay = when {
        store.session?.onboardingDone != true -> "onboarding"
        requestId != null -> "request/${requestId}"
        offerId != null -> "offer/${offerId}"
        inbox -> "inbox"
        saved -> "saved"
        categoryKey != null -> "category/${categoryKey}"
        else -> tab
    }

    Box(Modifier.fillMaxSize()) {
        AnimatedContent(
            targetState = overlay,
            transitionSpec = {
                val entering = isStackScreen(targetState)
                val leaving = isStackScreen(initialState)
                if (entering || leaving) {
                    slideInHorizontally(tween(280)) { if (entering) it else -it / 4 } + fadeIn(tween(220)) togetherWith
                        slideOutHorizontally(tween(240)) { if (leaving) it else -it / 4 } + fadeOut(tween(180))
                } else {
                    fadeIn(tween(180)) togetherWith fadeOut(tween(120))
                }
            },
            label = "employeeScreen",
        ) { screen ->
            when {
                screen == "onboarding" -> PreferencesScreen(store)
                screen == "inbox" -> EmployeeNotifications(
                    store,
                    onBack = { inbox = false },
                    onOpen = { item ->
                        when {
                            item.requestId != null -> requestId = item.requestId
                            item.offerId != null -> offerId = item.offerId
                        }
                    },
                    onExplore = { openCatalog() },
                )
                screen == "saved" -> EmployeeSaved(
                    store,
                    onBack = { saved = false },
                    onOffer = { offerId = it },
                    onFind = { openCatalog() },
                )
                screen.startsWith("category/") -> EmployeeCategory(
                    store,
                    category = runCatching { Category.valueOf(screen.removePrefix("category/")) }.getOrDefault(Category.sport),
                    onBack = { categoryKey = null },
                    onOffer = { offerId = it },
                )
                screen.startsWith("request/") -> EmployeeRequestDetail(
                    store,
                    screen.removePrefix("request/"),
                    onBack = { requestId = null },
                )
                screen.startsWith("offer/") -> EmployeeBenefit(
                    store,
                    screen.removePrefix("offer/"),
                    onBack = { offerId = null },
                    onSubmitted = { id ->
                        offerId = null
                        requestId = id
                    },
                )
                screen == "home" -> EmployeeHome(
                    store,
                    onAllRequests = { tab = "requests" },
                    onOffer = { offerId = it },
                    onRequest = { requestId = it },
                    onCategory = { openCategory(it) },
                    onSaved = { openSaved() },
                    onBell = { openInbox() },
                    onCatalog = { openCatalog() },
                )
                screen == "catalog" -> EmployeeCatalog(
                    store,
                    onOffer = { offerId = it },
                    startCategory = catalogCategory?.let { runCatching { Category.valueOf(it) }.getOrNull() },
                    startPaid = when (catalogPaid) {
                        "paid" -> true
                        "free" -> false
                        else -> null
                    },
                    onSaved = { openSaved() },
                    onBell = { openInbox() },
                )
                screen == "requests" -> EmployeeRequests(
                    store,
                    onOpen = { requestId = it },
                    onFind = { openCatalog() },
                    onSaved = { openSaved() },
                    onBell = { openInbox() },
                )
                else -> EmployeeProfile(
                    store,
                    onSaved = { openSaved() },
                    onBell = { openInbox() },
                    onBalance = { openCatalog(paid = true) },
                    onRequests = { tab = "requests" },
                )
            }
        }
        if (offerId == null && requestId == null && !inbox && !saved && categoryKey == null && store.session?.onboardingDone == true) {
            Box(Modifier.align(Alignment.BottomCenter)) {
                FloatingTabBar(employeeTabs(), tab) { key ->
                    if (key == "catalog") openCatalog() else {
                        catalogCategory = null
                        catalogPaid = null
                        tab = key
                    }
                }
            }
        }
        store.toastSavedId?.let { id ->
            val title = store.offer(id)?.title ?: "Льгота"
            LaunchedEffect(id) {
                delay(3200)
                store.clearSavedToast()
            }
            Row(
                Modifier
                    .align(Alignment.BottomCenter)
                    .navigationBarsPadding()
                    .padding(start = 16.dp, end = 16.dp, bottom = if (inbox || saved || offerId != null) 24.dp else 88.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(C.card)
                    .clickable { openSaved() }
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("В избранном: $title", color = C.navy, fontFamily = T.sans, fontSize = 14.sp, modifier = Modifier.weight(1f))
                Spacer(Modifier.width(8.dp))
                Text("Открыть", color = C.brand, fontFamily = T.sans, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            }
        }
    }
}

@Composable
private fun MerchantRoot(store: AppStore) {
    var tab by rememberSaveable { mutableStateOf("offers") }
    var formId by rememberSaveable { mutableStateOf<String?>(null) }
    var showForm by rememberSaveable { mutableStateOf(false) }

    BackHandler(enabled = showForm) { showForm = false }

    Box(Modifier.fillMaxSize()) {
        if (showForm) {
            OfferForm(store, formId) { showForm = false }
        } else when (tab) {
            "offers" -> MerchantOffers(store) { id ->
                formId = id
                showForm = true
            }
            "incoming" -> MerchantIncoming(store)
            else -> MerchantRegister(store) { tab = "offers" }
        }
        if (!showForm) {
            Box(Modifier.align(Alignment.BottomCenter)) {
                FloatingTabBar(merchantTabs(), tab) { tab = it }
            }
        }
    }
}

@Composable
private fun AdminRoot(store: AppStore) {
    var tab by rememberSaveable { mutableStateOf("overview") }
    Box(Modifier.fillMaxSize()) {
        when (tab) {
            "overview" -> AdminOverview(store)
            "people" -> AdminPeople(store)
            "partners" -> AdminPartners(store)
            else -> AdminOps(store)
        }
        Box(Modifier.align(Alignment.BottomCenter)) {
            FloatingTabBar(adminTabs(), tab) { tab = it }
        }
    }
}
