package uz.click.benefits.ui.onboarding

import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.view.HapticFeedbackConstants
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
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
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.ui.unit.IntOffset
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.DirectionsCar
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material.icons.outlined.FitnessCenter
import androidx.compose.material.icons.outlined.LocalHospital
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.School
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.Category
import uz.click.benefits.data.Interest
import uz.click.benefits.data.Seed
import uz.click.benefits.ui.components.PrimaryButton
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.categoryAccent
import uz.click.benefits.ui.theme.homeWash

@Composable
fun PreferencesScreen(store: AppStore) {
    var selected by remember { mutableStateOf(store.session?.interestIds?.toSet() ?: emptySet()) }
    var phase by remember { mutableStateOf("pick") }
    val enough = selected.size in 3..6

    LaunchedEffect(phase) {
        when (phase) {
            "matching" -> {
                delay(2400)
                phase = "done"
            }
            "done" -> {
                delay(1200)
                store.saveInterests(selected.toList())
            }
        }
    }

    Box(Modifier.fillMaxSize().background(C.bg)) {
        Box(Modifier.fillMaxWidth().height(220.dp).background(homeWash()))
        Column(Modifier.fillMaxSize().statusBarsPadding()) {
            Column(Modifier.padding(horizontal = 20.dp, vertical = 16.dp)) {
                Text("Что вам интересно?", style = T.title.copy(fontSize = 28.sp))
                Spacer(Modifier.height(8.dp))
                Text("Отметьте от 3 до 6 тем — подберём льготы под вас", style = T.caption, fontSize = 15.sp)
                Spacer(Modifier.height(12.dp))
                Text(
                    "Выбрано ${selected.size} из 6",
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
                            if (phase == "pick") {
                                selected = when {
                                    interest.id in selected -> selected - interest.id
                                    selected.size >= 6 -> selected
                                    else -> selected + interest.id
                                }
                            }
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
                    title = when {
                        selected.size < 3 -> "Выберите ещё ${3 - selected.size}"
                        else -> "Показать рекомендации"
                    },
                    enabled = enough && phase == "pick",
                ) {
                    phase = "matching"
                }
            }
        }
        AnimatedVisibility(
            visible = phase != "pick",
            enter = fadeIn(tween(280)),
            exit = fadeOut(),
        ) {
            MatchingOverlay(done = phase == "done")
        }
    }
}

@Composable
private fun MatchingOverlay(done: Boolean) {
    val view = LocalView.current
    val orbit by rememberInfiniteTransition(label = "orbit").animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(tween(2200, easing = LinearEasing), RepeatMode.Restart),
        label = "angle",
    )
    val tick by animateFloatAsState(
        if (done) 1f else 0.2f,
        spring(dampingRatio = 0.42f, stiffness = Spring.StiffnessMedium),
        label = "tick",
    )
    LaunchedEffect(done) {
        if (!done) return@LaunchedEffect
        runCatching {
            val haptic = if (Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.CONFIRM else HapticFeedbackConstants.CONTEXT_CLICK
            view.performHapticFeedback(haptic)
        }
        runCatching {
            val tone = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 90)
            tone.startTone(ToneGenerator.TONE_PROP_ACK, 160)
            delay(180)
            tone.release()
        }
    }
    Box(
        Modifier.fillMaxSize().background(Color(0xF2000000)),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            if (!done) {
                Box(Modifier.size(96.dp), contentAlignment = Alignment.Center) {
                    Box(Modifier.size(18.dp).clip(CircleShape).background(C.brand))
                    listOf(0f, 120f, 240f).forEach { shift ->
                        val rad = Math.toRadians((orbit + shift).toDouble())
                        val r = 34.dp
                        Box(
                            Modifier
                                .offset {
                                    IntOffset(
                                        (cos(rad) * r.toPx()).roundToInt(),
                                        (sin(rad) * r.toPx()).roundToInt(),
                                    )
                                }
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF7AA2FF)),
                        )
                    }
                }
                Spacer(Modifier.height(22.dp))
                Text("Подбираем льготы", color = C.white, fontFamily = T.sans, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                Spacer(Modifier.height(6.dp))
                Text("под ваш выбор", color = C.muted, fontFamily = T.sans, fontSize = 15.sp)
            } else {
                Box(
                    Modifier
                        .size(88.dp)
                        .scale(tick)
                        .clip(CircleShape)
                        .background(Color(0xFF22C55E)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Outlined.Check, null, tint = Color.White, modifier = Modifier.size(42.dp))
                }
                Spacer(Modifier.height(22.dp))
                AnimatedVisibility(visible = true, enter = fadeIn() + scaleIn()) {
                    Text("Готово", color = C.white, fontFamily = T.sans, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                }
            }
        }
    }
}

@Composable
private fun InterestCard(interest: Interest, selected: Boolean, onClick: () -> Unit) {
    val selectedBg = Color(0xFF163A8C)
    Column(
        Modifier
            .fillMaxWidth()
            .height(118.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(if (selected) selectedBg else C.card)
            .border(1.5.dp, if (selected) Color(0xFF2456B8) else C.line, RoundedCornerShape(22.dp))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
            Box(
                Modifier
                    .size(30.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (selected) Color.White.copy(0.12f) else categoryAccent(interest.category).copy(alpha = 0.85f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(categoryIcon(interest.category), null, tint = C.white, modifier = Modifier.size(15.dp))
            }
            if (selected) {
                Box(
                    Modifier.size(20.dp).clip(CircleShape).background(Color.White.copy(0.9f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Outlined.Check, null, tint = selectedBg, modifier = Modifier.size(13.dp))
                }
            }
        }
        Text(
            interest.title,
            color = if (selected) C.white else C.navy,
            fontFamily = T.sans,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp,
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
