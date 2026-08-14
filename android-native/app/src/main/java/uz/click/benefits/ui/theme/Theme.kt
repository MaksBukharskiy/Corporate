package uz.click.benefits.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.core.view.WindowCompat
import uz.click.benefits.data.Category
import uz.click.benefits.data.RequestStatus
import uz.click.benefits.data.Role

data class Palette(
    val brand: Color,
    val brandBright: Color,
    val brandMid: Color,
    val brandDark: Color,
    val brandSoft: Color,
    val navy: Color,
    val muted: Color,
    val bg: Color,
    val card: Color,
    val white: Color,
    val solid: Color,
    val line: Color,
    val gold: Color,
    val success: Color,
    val warning: Color,
    val danger: Color,
    val yellow: Color,
)

val LightColors = Palette(
    brand = Color(0xFF2563EB),
    brandBright = Color(0xFF3B82F6),
    brandMid = Color(0xFF1D4ED8),
    brandDark = Color(0xFF1E40AF),
    brandSoft = Color(0xFFDBEAFE),
    navy = Color(0xFF0F172A),
    muted = Color(0xFF64748B),
    bg = Color(0xFFEEF3FF),
    card = Color(0xFFFFFFFF),
    white = Color(0xFFFFFFFF),
    solid = Color(0xFF0F172A),
    line = Color(0xFFBFDBFE),
    gold = Color(0xFF2563EB),
    success = Color(0xFF2563EB),
    warning = Color(0xFF64748B),
    danger = Color(0xFFDC2626),
    yellow = Color(0xFF2563EB),
)

val DarkColors = Palette(
    brand = Color(0xFF246BFD),
    brandBright = Color(0xFF4C8DFF),
    brandMid = Color(0xFF1D4ED8),
    brandDark = Color(0xFF93C5FD),
    brandSoft = Color(0xFF1A2336),
    navy = Color(0xFFFFFFFF),
    muted = Color(0xFF8E8E93),
    bg = Color(0xFF000000),
    card = Color(0xFF1C1C1E),
    white = Color(0xFFFFFFFF),
    solid = Color(0xFF1C1C1E),
    line = Color(0xFF2C2C2E),
    gold = Color(0xFF246BFD),
    success = Color(0xFF246BFD),
    warning = Color(0xFF8E8E93),
    danger = Color(0xFFF87171),
    yellow = Color(0xFF246BFD),
)

val LocalPalette = staticCompositionLocalOf { DarkColors }

object C {
    val brand: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.brand
    val brandBright: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.brandBright
    val brandMid: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.brandMid
    val brandDark: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.brandDark
    val brandSoft: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.brandSoft
    val navy: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.navy
    val muted: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.muted
    val bg: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.bg
    val card: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.card
    val white: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.white
    val solid: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.solid
    val line: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.line
    val gold: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.gold
    val success: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.success
    val warning: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.warning
    val danger: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.danger
    val yellow: Color @Composable @ReadOnlyComposable get() = LocalPalette.current.yellow
}

object T {
    val sans = FontFamily.SansSerif
    val title: TextStyle
        @Composable @ReadOnlyComposable get() = TextStyle(
            fontFamily = sans,
            fontWeight = FontWeight.Bold,
            fontSize = 28.sp,
            letterSpacing = (-0.3).sp,
            color = C.navy,
        )
    val section: TextStyle
        @Composable @ReadOnlyComposable get() = TextStyle(
            fontFamily = sans,
            fontWeight = FontWeight.SemiBold,
            fontSize = 17.sp,
            color = C.navy,
        )
    val body: TextStyle
        @Composable @ReadOnlyComposable get() = TextStyle(
            fontFamily = sans,
            fontWeight = FontWeight.Normal,
            fontSize = 15.sp,
            color = C.navy,
        )
    val caption: TextStyle
        @Composable @ReadOnlyComposable get() = TextStyle(
            fontFamily = sans,
            fontWeight = FontWeight.Normal,
            fontSize = 13.sp,
            color = C.muted,
        )
    val button: TextStyle
        @Composable @ReadOnlyComposable get() = TextStyle(
            fontFamily = sans,
            fontWeight = FontWeight.Medium,
            fontSize = 15.sp,
        )
}

@Composable
fun ClickTheme(dark: Boolean, content: @Composable () -> Unit) {
    val palette = if (dark) DarkColors else LightColors
    val view = LocalView.current
    SideEffect {
        val window = (view.context as? Activity)?.window ?: return@SideEffect
        WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !dark
    }
    androidx.compose.runtime.CompositionLocalProvider(LocalPalette provides palette) {
        MaterialTheme(
            colorScheme = if (dark) darkColorScheme(
                primary = palette.brand,
                onPrimary = palette.white,
                background = palette.bg,
                onBackground = palette.navy,
                surface = palette.card,
                onSurface = palette.navy,
            ) else lightColorScheme(
                primary = palette.brand,
                onPrimary = palette.white,
                background = palette.bg,
                onBackground = palette.navy,
                surface = palette.card,
                onSurface = palette.navy,
            ),
            typography = Typography(),
            content = content,
        )
    }
}

@Composable
@ReadOnlyComposable
fun heroBrush() = Brush.verticalGradient(
    listOf(Color(0xFF7B3CFF), Color(0xFF1A6B78), Color(0xFF000000)),
)

@Composable
@ReadOnlyComposable
fun homeWash() = Brush.verticalGradient(
    0f to Color(0xFF246BFD).copy(alpha = 0.22f),
    0.5f to Color(0xFF246BFD).copy(alpha = 0.07f),
    1f to Color.Transparent,
)

@Composable
@ReadOnlyComposable
fun primaryBtnBrush() = Brush.verticalGradient(listOf(C.brand, C.brand))

@Composable
@ReadOnlyComposable
fun avatarBrush() = Brush.verticalGradient(listOf(C.brandSoft, C.brandSoft))

@Composable
@ReadOnlyComposable
fun categoryHero(category: Category) = Brush.verticalGradient(
    when (category) {
        Category.sport -> listOf(Color(0xFFFFD60A), Color(0xFFFF6B35), Color(0xFFC026D3), Color(0xFF000000))
        Category.food -> listOf(Color(0xFFFFB020), Color(0xFFFF6B35), Color(0xFF7C2D12), Color(0xFF000000))
        Category.education -> listOf(Color(0xFF60A5FA), Color(0xFF2563EB), Color(0xFF1E1B4B), Color(0xFF000000))
        Category.health -> listOf(Color(0xFFFF9EC8), Color(0xFFFF4D8D), Color(0xFF701A3D), Color(0xFF000000))
        Category.transport -> listOf(Color(0xFF5EEAD4), Color(0xFF0D9488), Color(0xFF134E4A), Color(0xFF000000))
        Category.events -> listOf(Color(0xFF86EFAC), Color(0xFF22C55E), Color(0xFF14532D), Color(0xFF000000))
    }
)

@Composable
@ReadOnlyComposable
fun statusColors(status: RequestStatus) = when (status) {
    RequestStatus.pending -> C.brandSoft to C.brand
    RequestStatus.approved -> C.brand to C.white
    RequestStatus.in_progress -> C.brandSoft to C.brandDark
    RequestStatus.completed -> C.brandSoft to C.brandDark
    RequestStatus.rejected -> Color(0xFF3A1A1A) to C.danger
}

fun statusLabel(status: RequestStatus) = when (status) {
    RequestStatus.pending -> "На рассмотрении"
    RequestStatus.approved -> "Одобрена"
    RequestStatus.in_progress -> "В работе"
    RequestStatus.completed -> "Завершена"
    RequestStatus.rejected -> "Отклонена"
}

fun categoryAccent(category: Category) = when (category) {
    Category.sport -> Color(0xFF8B7CFF)
    Category.food -> Color(0xFFFF8A4C)
    Category.education -> Color(0xFF4C8DFF)
    Category.health -> Color(0xFFFF6B9D)
    Category.transport -> Color(0xFF2DD4BF)
    Category.events -> Color(0xFF4ADE80)
}

fun categoryLabel(category: Category) = when (category) {
    Category.sport -> "Спорт"
    Category.food -> "Еда"
    Category.education -> "Обучение"
    Category.health -> "Здоровье"
    Category.transport -> "Транспорт"
    Category.events -> "Ивенты"
}

fun roleTitle(role: Role) = when (role) {
    Role.employee -> "Сотрудник"
    Role.merchant -> "Партнёр-мерчант"
    Role.admin -> "Администратор"
}

fun roleDescription(role: Role) = when (role) {
    Role.employee -> "Вы сотрудник компании. Получаете корпоративные баллы, записываетесь на бесплатные сервисы для команды и оформляете платные льготы."
    Role.merchant -> "Вы представляете партнёра. Публикуете предложения, принимаете и отклоняете заявки сотрудников."
    Role.admin -> "Вы управляете платформой: компании, сотрудники, партнёры и операции по баллам."
}
