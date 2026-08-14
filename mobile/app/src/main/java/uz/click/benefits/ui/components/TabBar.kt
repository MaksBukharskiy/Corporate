package uz.click.benefits.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material.icons.outlined.MoreHoriz
import androidx.compose.material.icons.outlined.People
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Store
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import uz.click.benefits.ui.theme.C

data class TabItem(val key: String, val label: String, val icon: ImageVector)

@Composable
fun FloatingTabBar(
    tabs: List<TabItem>,
    selected: String,
    onSelect: (String) -> Unit,
) {
    val navBottom = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding()
    Column(
        Modifier
            .fillMaxWidth()
            .background(C.bg)
            .padding(bottom = (navBottom - 7.dp).coerceAtLeast(0.dp)),
    ) {
        Box(Modifier.fillMaxWidth().height(0.5.dp).background(C.line.copy(alpha = 0.4f)))
        Row(
            Modifier
                .fillMaxWidth()
                .padding(top = 8.dp, bottom = 6.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            tabs.forEach { tab ->
                val focused = tab.key == selected
                val scale by animateFloatAsState(
                    if (focused) 1f else 0.96f,
                    spring(stiffness = Spring.StiffnessMediumLow),
                    label = "tabScale",
                )
                val tint by animateColorAsState(
                    if (focused) C.brand else C.white,
                    label = "tabTint",
                )
                val pill by animateColorAsState(
                    if (focused) Color(0xFF1A2744) else Color.Transparent,
                    label = "tabPill",
                )
                Box(
                    Modifier
                        .height(36.dp)
                        .width(48.dp)
                        .scale(scale)
                        .clip(RoundedCornerShape(16.dp))
                        .background(pill)
                        .clickable { if (!focused) onSelect(tab.key) },
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(tab.icon, tab.label, tint = tint, modifier = Modifier.size(24.dp))
                }
            }
        }
    }
}

fun employeeTabs() = listOf(
    TabItem("home", "Главная", Icons.Outlined.Home),
    TabItem("catalog", "Каталог", Icons.Outlined.Search),
    TabItem("you", "Lin", Icons.Outlined.AutoAwesome),
    TabItem("requests", "Заявки", Icons.Outlined.CalendarMonth),
    TabItem("profile", "Ещё", Icons.Outlined.MoreHoriz),
)

fun merchantTabs() = listOf(
    TabItem("offers", "Офферы", Icons.Outlined.Inventory2),
    TabItem("incoming", "Заявки", Icons.Outlined.CalendarMonth),
    TabItem("register", "Ещё", Icons.Outlined.MoreHoriz),
)

fun adminTabs() = listOf(
    TabItem("overview", "Обзор", Icons.Outlined.Tune),
    TabItem("people", "Люди", Icons.Outlined.People),
    TabItem("partners", "Партнёры", Icons.Outlined.Store),
    TabItem("ops", "Операции", Icons.Outlined.CalendarMonth),
)
