package uz.click.benefits.ui.components

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.getValue
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Brush
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.AddBox
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.RequestStatus
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.statusColors
import uz.click.benefits.ui.theme.statusLabel

@Composable
fun PrimaryButton(
    title: String,
    modifier: Modifier = Modifier,
    variant: String = "brand",
    enabled: Boolean = true,
    onClick: () -> Unit,
) {
    val bg = when {
        !enabled -> C.line
        variant == "navy" -> C.solid
        variant == "ghost" -> C.card
        variant == "danger" -> C.danger
        else -> C.brand
    }
    val color = when {
        !enabled -> C.muted
        variant == "ghost" -> C.navy
        else -> C.white
    }
    Box(
        modifier
            .fillMaxWidth()
            .height(48.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(bg)
            .clickable(enabled = enabled, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(title, style = T.button, color = color)
    }
}

@Composable
fun StatusBadge(status: RequestStatus) {
    val (bg, fg) = statusColors(status)
    Text(
        statusLabel(status),
        color = fg,
        fontSize = 11.sp,
        fontFamily = T.sans,
        fontWeight = FontWeight.Medium,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(bg)
            .padding(horizontal = 10.dp, vertical = 4.dp)
    )
}

@Composable
fun ScreenHeader(
    title: String,
    light: Boolean = false,
    unread: Boolean = false,
    savedActive: Boolean = false,
    showAdd: Boolean = false,
    onAdd: (() -> Unit)? = null,
    onSaved: () -> Unit,
    onBell: () -> Unit,
) {
    val tint = if (light) Color.White else C.navy
    Row(
        Modifier
            .fillMaxWidth()
            .padding(top = if (light) 10.dp else 0.dp, bottom = if (light) 4.dp else 0.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            title,
            style = T.title.copy(fontSize = if (light) 24.sp else 28.sp),
            color = tint,
            maxLines = 1,
            modifier = Modifier.weight(1f).padding(end = 12.dp),
        )
        Row(
            horizontalArrangement = Arrangement.spacedBy(if (light) 8.dp else 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (showAdd && onAdd != null) {
                HeaderIcon(Icons.Outlined.AddBox, "Каталог", tint, onAdd, elevated = light)
            }
            HeaderIcon(
                if (savedActive) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                "Сохранённые",
                if (savedActive && !light) C.brand else tint,
                onSaved,
                elevated = light,
            )
            Box {
                HeaderIcon(
                    if (unread) Icons.Filled.Notifications else Icons.Outlined.NotificationsNone,
                    "Уведомления",
                    if (unread && !light) C.brand else tint,
                    onBell,
                    elevated = light,
                )
                if (unread) {
                    Box(
                        Modifier
                            .align(Alignment.TopEnd)
                            .padding(top = 4.dp, end = 4.dp)
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(if (light) Color.White else C.brand),
                        contentAlignment = Alignment.Center,
                    ) {
                        if (light) {
                            Box(Modifier.size(6.dp).clip(CircleShape).background(C.brand))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HeaderIcon(
    icon: ImageVector,
    label: String,
    tint: Color,
    onClick: () -> Unit,
    elevated: Boolean = false,
) {
    Box(
        Modifier
            .size(40.dp)
            .clip(CircleShape)
            .then(
                if (elevated) {
                    Modifier
                        .background(Color.Black.copy(alpha = 0.48f))
                        .border(1.dp, Color.White.copy(alpha = 0.22f), CircleShape)
                } else {
                    Modifier
                }
            )
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, label, tint = tint, modifier = Modifier.size(22.dp))
    }
}

@Composable
fun StatusTrack(status: RequestStatus, showLabels: Boolean = false) {
    val steps = listOf(
        RequestStatus.pending,
        RequestStatus.approved,
        RequestStatus.in_progress,
        RequestStatus.completed,
    )
    val current = when (status) {
        RequestStatus.rejected -> 0
        else -> steps.indexOf(status).coerceAtLeast(0)
    }
    val pulse by rememberInfiniteTransition(label = "trackPulse").animateFloat(
        initialValue = 0.55f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(900), RepeatMode.Reverse),
        label = "pulse",
    )
    Column(Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            steps.forEachIndexed { index, _ ->
                val on = status != RequestStatus.rejected && index <= current
                val active = index == current
                val rejectedFirst = status == RequestStatus.rejected && index == 0
                Box(
                    Modifier
                        .weight(1f)
                        .height(if (active || rejectedFirst) 10.dp else 8.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(
                            when {
                                rejectedFirst -> Brush.horizontalGradient(
                                    listOf(C.danger.copy(alpha = pulse), C.danger),
                                )
                                active && on -> Brush.horizontalGradient(
                                    listOf(
                                        C.brand.copy(alpha = 0.55f),
                                        C.brandBright.copy(alpha = pulse),
                                        C.brand.copy(alpha = 0.55f),
                                    ),
                                )
                                on -> Brush.horizontalGradient(listOf(C.brand, C.brandBright))
                                else -> Brush.horizontalGradient(listOf(C.brandSoft, Color(0xFF2A2A2E)))
                            },
                        ),
                )
            }
        }
        if (showLabels) {
            Spacer(Modifier.height(10.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                val shorts = listOf("Подана", "Одобрена", "В работе", "Готово")
                shorts.forEachIndexed { index, label ->
                    val active = index == current && status != RequestStatus.rejected
                    val on = index <= current && status != RequestStatus.rejected
                    Text(
                        label,
                        color = if (active) C.brandBright else if (on) C.brand else C.muted,
                        fontSize = 11.sp,
                        fontFamily = T.sans,
                        fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal,
                    )
                }
            }
        }
    }
}

@Composable
fun RatingStars(rating: String, modifier: Modifier = Modifier) {
    val value = rating.replace(',', '.').toFloatOrNull() ?: 0f
    val filled = ((value / 2f) + 0.4f).toInt().coerceIn(0, 5)
    Row(
        modifier
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF163024))
            .padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        repeat(5) { index ->
            Icon(
                if (index < filled) Icons.Filled.Star else Icons.Outlined.StarBorder,
                null,
                tint = Color(0xFF4ADE80),
                modifier = Modifier.size(13.dp),
            )
        }
        Text(
            rating,
            color = Color(0xFF4ADE80),
            fontFamily = T.sans,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            modifier = Modifier.padding(start = 4.dp),
        )
    }
}