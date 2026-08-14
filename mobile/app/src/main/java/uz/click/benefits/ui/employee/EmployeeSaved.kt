package uz.click.benefits.ui.employee

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.ChevronLeft
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.ui.components.PrimaryButton
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T

@Composable
fun EmployeeSaved(
    store: AppStore,
    onBack: () -> Unit,
    onOffer: (String) -> Unit,
    onRedeem: (String) -> Unit = {},
    onFind: () -> Unit,
) {
    val items = store.employeeOffers("", null, savedOnly = true)
    Column(Modifier.fillMaxSize().background(C.bg).statusBarsPadding()) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier.size(40.dp).clip(CircleShape).clickable(onClick = onBack),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Outlined.ChevronLeft, "Назад", tint = C.navy, modifier = Modifier.size(26.dp))
            }
            Text("Избранное", style = T.title)
        }
        if (items.isEmpty()) {
            Column(
                Modifier.fillMaxSize().padding(horizontal = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Box(
                    Modifier.size(88.dp).clip(CircleShape).background(C.card),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Outlined.BookmarkBorder, null, tint = C.brand, modifier = Modifier.size(40.dp))
                }
                Spacer(Modifier.height(20.dp))
                Text("Пока пусто", style = T.section, fontSize = 20.sp)
                Spacer(Modifier.height(6.dp))
                Text("Отмечайте льготы закладкой — они появятся здесь.", style = T.caption)
                Spacer(Modifier.height(22.dp))
                PrimaryButton("Найти льготу", modifier = Modifier.width(220.dp), onClick = onFind)
            }
            return
        }
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 32.dp),
            horizontalArrangement = Arrangement.spacedBy(18.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            item(span = { GridItemSpan(2) }) {
                Text(
                    "${items.size} льготы",
                    color = C.muted,
                    fontFamily = T.sans,
                    fontWeight = FontWeight.Medium,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(bottom = 4.dp),
                )
            }
            items(items, key = { it.id }) { offer ->
                Box(Modifier.animateItem()) {
                    OfferModule(store, offer, framed = true, onClick = { onOffer(offer.id) }, onRedeem = { onRedeem(offer.id) })
                }
            }
        }
    }
}
