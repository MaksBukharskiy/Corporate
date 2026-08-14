package uz.click.benefits.ui.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.ui.graphics.Color
import uz.click.benefits.ui.theme.homeWash
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.DirectionsCar
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material.icons.outlined.FitnessCenter
import androidx.compose.material.icons.outlined.LocalHospital
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.School
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.Category
import uz.click.benefits.data.Interest
import uz.click.benefits.data.Seed
import uz.click.benefits.ui.components.PrimaryButton
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.categoryAccent

@Composable
fun PreferencesScreen(store: AppStore) {
    var selected by remember { mutableStateOf(store.session?.interestIds?.toSet() ?: emptySet()) }
    val enough = selected.size >= 3

    Box(Modifier.fillMaxSize().background(C.bg)) {
        Box(Modifier.fillMaxWidth().height(220.dp).background(homeWash()))
        Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Column(Modifier.padding(horizontal = 20.dp, vertical = 16.dp)) {
            Text("Что вам интересно?", style = T.title.copy(fontSize = 28.sp))
            Spacer(Modifier.height(8.dp))
            Text("Отметьте минимум 3 темы — подберём льготы под вас", style = T.caption, fontSize = 15.sp)
            Spacer(Modifier.height(12.dp))
            Text(
                "Выбрано ${selected.size} из 3",
                color = C.brand,
                fontFamily = T.sans,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
            )
        }
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 16.dp),
        ) {
            items(Seed.interests, key = { it.id }) { interest ->
                InterestCard(
                    interest = interest,
                    selected = interest.id in selected,
                    onClick = {
                        selected = if (interest.id in selected) selected - interest.id else selected + interest.id
                    },
                )
            }
        }
        Column(
            Modifier
                .fillMaxWidth()
                .background(C.card)
                .navigationBarsPadding()
                .padding(16.dp),
        ) {
            PrimaryButton(
                title = if (enough) "Показать рекомендации" else "Выберите ещё ${3 - selected.size}",
                enabled = enough,
            ) {
                store.saveInterests(selected.toList())
            }
        }
        }
    }
}

@Composable
private fun InterestCard(interest: Interest, selected: Boolean, onClick: () -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .height(118.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(C.card)
            .border(1.dp, if (selected) C.brand else C.line, RoundedCornerShape(22.dp))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Box(
            Modifier.size(40.dp).clip(RoundedCornerShape(12.dp)).background(categoryAccent(interest.category)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(categoryIcon(interest.category), null, tint = C.white, modifier = Modifier.size(20.dp))
        }
        Text(
            interest.title,
            color = C.navy,
            fontFamily = T.sans,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
        )
    }
}

private fun categoryIcon(category: Category): ImageVector = when (category) {
    Category.sport -> Icons.Outlined.FitnessCenter
    Category.food -> Icons.Outlined.Restaurant
    Category.education -> Icons.Outlined.School
    Category.health -> Icons.Outlined.LocalHospital
    Category.transport -> Icons.Outlined.DirectionsCar
    Category.events -> Icons.Outlined.Event
}
