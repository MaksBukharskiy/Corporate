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
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsTopHeight
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.Category
import uz.click.benefits.data.Role
import uz.click.benefits.ui.admin.AdminOps
import uz.click.benefits.ui.admin.AdminOverview
import uz.click.benefits.ui.admin.AdminPartners
import uz.click.benefits.ui.admin.AdminPeople
import uz.click.benefits.ui.components.FloatingTabBar
import uz.click.benefits.ui.components.SuccessToastHost
import uz.click.benefits.ui.components.adminTabs
import uz.click.benefits.ui.components.employeeTabs
import uz.click.benefits.ui.components.merchantTabs
import uz.click.benefits.ui.employee.CoachChat
import uz.click.benefits.ui.employee.EmployeeBenefit
import uz.click.benefits.ui.employee.EmployeeCatalog
import uz.click.benefits.ui.employee.EmployeeCategory
import uz.click.benefits.ui.employee.EmployeeHome
import uz.click.benefits.ui.employee.EmployeeNotifications
import uz.click.benefits.ui.employee.EmployeeProfile
import uz.click.benefits.ui.employee.EmployeeRequestDetail
import uz.click.benefits.ui.employee.EmployeeRequests
import uz.click.benefits.ui.employee.EmployeeSaved
import uz.click.benefits.ui.employee.RedeemCardScreen
import uz.click.benefits.ui.employee.WalletScreen
import uz.click.benefits.ui.login.LoginScreen
import uz.click.benefits.ui.merchant.MerchantIncoming
import uz.click.benefits.ui.merchant.MerchantOffers
import uz.click.benefits.ui.merchant.MerchantRegister
import uz.click.benefits.ui.merchant.OfferForm
import uz.click.benefits.ui.onboarding.PreferencesScreen
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.ClickTheme

private fun isStackScreen(key: String) =
    key == "inbox" || key == "saved" || key == "wallet" ||
        key.startsWith("category/") || key.startsWith("offer/") || key.startsWith("request/") || key.startsWith("redeem/")

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
                    SuccessToastHost(store.toast, store::clearToast)
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
    var redeemOfferId by rememberSaveable { mutableStateOf<String?>(null) }
    var wallet by rememberSaveable { mutableStateOf(false) }

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
        wallet = false
        categoryKey = null
        offerId = null
        requestId = null
        redeemOfferId = null
    }

    fun openCategory(category: Category) {
        categoryKey = category.name
        inbox = false
        saved = false
        wallet = false
        offerId = null
        requestId = null
        redeemOfferId = null
    }

    fun openSaved() {
        saved = true
        inbox = false
        wallet = false
        offerId = null
        requestId = null
        redeemOfferId = null
    }

    fun openInbox() {
        inbox = true
        saved = false
        wallet = false
        offerId = null
        requestId = null
        redeemOfferId = null
    }

    fun openWallet() {
        wallet = true
        inbox = false
        saved = false
        offerId = null
        requestId = null
        redeemOfferId = null
        categoryKey = null
    }

    BackHandler(enabled = inbox || saved || wallet || categoryKey != null || offerId != null || requestId != null || redeemOfferId != null) {
        when {
            redeemOfferId != null -> redeemOfferId = null
            requestId != null -> requestId = null
            offerId != null -> offerId = null
            inbox -> inbox = false
            saved -> saved = false
            wallet -> wallet = false
            else -> categoryKey = null
        }
    }

    val overlay = when {
        store.session?.onboardingDone != true -> "onboarding"
        redeemOfferId != null -> "redeem/${redeemOfferId}"
        requestId != null -> "request/${requestId}"
        offerId != null -> "offer/${offerId}"
        inbox -> "inbox"
        saved -> "saved"
        wallet -> "wallet"
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
                    slideInHorizontally(tween(520, easing = FastOutSlowInEasing)) { if (entering) it else -it / 5 } + fadeIn(tween(420)) togetherWith
                        slideOutHorizontally(tween(420, easing = FastOutSlowInEasing)) { if (leaving) it else -it / 5 } + fadeOut(tween(320))
                } else {
                    fadeIn(tween(560, easing = FastOutSlowInEasing)) + slideInVertically(tween(560, easing = FastOutSlowInEasing)) { it / 10 } togetherWith
                        fadeOut(tween(360)) + slideOutVertically(tween(360, easing = FastOutSlowInEasing)) { -it / 14 }
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
                    onRedeem = { redeemOfferId = it },
                    onFind = { openCatalog() },
                )
                screen.startsWith("category/") -> EmployeeCategory(
                    store,
                    category = runCatching { Category.valueOf(screen.removePrefix("category/")) }.getOrDefault(Category.sport),
                    onBack = { categoryKey = null },
                    onOffer = { offerId = it },
                    onRedeem = { redeemOfferId = it },
                )
                screen == "wallet" -> WalletScreen(
                    store,
                    onBack = { wallet = false },
                    onSpend = { openCatalog(paid = true) },
                    onOffer = { offerId = it },
                    onRedeem = { redeemOfferId = it },
                )
                screen.startsWith("redeem/") -> RedeemCardScreen(
                    store,
                    screen.removePrefix("redeem/"),
                    onBack = { redeemOfferId = null },
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
                    onRedeem = { redeemOfferId = it },
                    onSubmitted = {
                        offerId = null
                        requestId = null
                        redeemOfferId = null
                        categoryKey = null
                        inbox = false
                        saved = false
                        wallet = false
                        catalogCategory = null
                        catalogPaid = null
                        tab = "home"
                    },
                )
                screen == "home" -> EmployeeHome(
                    store,
                    onAllRequests = { tab = "requests" },
                    onOffer = { offerId = it },
                    onRedeem = { redeemOfferId = it },
                    onRequest = { requestId = it },
                    onCategory = { openCategory(it) },
                    onSaved = { openSaved() },
                    onBell = { openInbox() },
                    onCatalog = { openCatalog() },
                    onWallet = { openWallet() },
                )
                screen == "catalog" -> EmployeeCatalog(
                    store,
                    onOffer = { offerId = it },
                    onRedeem = { redeemOfferId = it },
                    startCategory = catalogCategory?.let { runCatching { Category.valueOf(it) }.getOrNull() },
                    startPaid = when (catalogPaid) {
                        "paid" -> true
                        "free" -> false
                        else -> null
                    },
                    onSaved = { openSaved() },
                    onBell = { openInbox() },
                )
                screen == "you" -> CoachChat(store)
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
        if (offerId == null && requestId == null && redeemOfferId == null && !inbox && !saved && !wallet && categoryKey == null && store.session?.onboardingDone == true) {
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
