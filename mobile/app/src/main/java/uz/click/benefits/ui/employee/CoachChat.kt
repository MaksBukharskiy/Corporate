package uz.click.benefits.ui.employee

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.MicNone
import androidx.compose.material.icons.outlined.Send
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.LinLlm
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CoachChat(store: AppStore) {
    val user = store.session
    val balance = user?.balance ?: 0
    val hello = remember(user?.id, balance) {
        "Lin. Отвечаю по внутренним данным Corporate. Баланс ${fmtPts(balance)} баллов. Что найти?"
    }
    val messages = remember { mutableStateListOf("assistant" to hello) }
    var draft by remember { mutableStateOf("") }
    var thinking by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val scroll = rememberScrollState()
    val faqs = remember {
        listOf(
            "Сколько у меня баллов?",
            "Что бесплатно?",
            "Спорт рядом",
            "Где мои заявки?",
            "Что пообедать?",
            "Есть йога?",
        )
    }

    fun send(text: String) {
        val clean = text.trim()
        if (clean.isEmpty() || thinking) return
        messages += "me" to clean
        draft = ""
        thinking = true
        scope.launch {
            val answerDeferred = async(Dispatchers.IO) { LinLlm.answer(clean, store) }
            delay(1800)
            val answer = answerDeferred.await()
            messages += "assistant" to answer
            thinking = false
        }
    }

    LaunchedEffect(messages.size, thinking) {
        scroll.animateScrollTo(scroll.maxValue, animationSpec = tween(720, easing = FastOutSlowInEasing))
    }

    Column(
        Modifier
            .fillMaxSize()
            .background(C.bg)
            .statusBarsPadding()
            .imePadding()
            .padding(bottom = 88.dp),
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(top = 13.dp, bottom = 0.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.size(32.dp).clip(CircleShape).background(C.brand), contentAlignment = Alignment.Center) {
                Text("L", color = C.white, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
            Spacer(Modifier.width(10.dp))
            Text("Lin", style = T.title.copy(fontSize = 24.sp))
        }
        Spacer(Modifier.height(15.dp))
        Column(Modifier.weight(1f).verticalScroll(scroll).padding(horizontal = 20.dp)) {
            messages.forEach { (who, text) ->
                val mine = who == "me"
                Box(
                    Modifier
                        .fillMaxWidth()
                        .padding(bottom = 10.dp),
                    contentAlignment = if (mine) Alignment.CenterEnd else Alignment.CenterStart,
                ) {
                    Text(
                        text,
                        color = if (mine) C.white else C.navy,
                        fontFamily = T.sans,
                        fontSize = 13.sp,
                        lineHeight = 19.sp,
                        modifier = Modifier
                            .clip(RoundedCornerShape(18.dp))
                            .background(if (mine) C.brand else C.card)
                            .padding(horizontal = 12.dp, vertical = 9.dp),
                    )
                }
            }
            if (thinking) {
                LinTypingDots()
            }
            if (messages.size <= 1 && !thinking) {
                Spacer(Modifier.height(6.dp))
                Column(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(18.dp))
                        .background(C.card)
                        .padding(12.dp),
                ) {
                    Text(
                        "Частые вопросы",
                        color = C.muted,
                        fontFamily = T.sans,
                        fontWeight = FontWeight.Medium,
                        fontSize = 11.sp,
                    )
                    Spacer(Modifier.height(10.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        faqs.forEach { q ->
                            Box(
                                Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(C.bg)
                                    .clickable { send(q) }
                                    .padding(horizontal = 10.dp, vertical = 7.dp),
                            ) {
                                Text(q, color = C.navy, fontFamily = T.sans, fontSize = 12.sp)
                            }
                        }
                    }
                }
                Spacer(Modifier.height(12.dp))
            }
        }
        Spacer(Modifier.height(8.dp))
        Row(
            Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.size(44.dp).clip(RoundedCornerShape(14.dp)).background(C.card), contentAlignment = Alignment.Center) {
                Icon(Icons.Outlined.Add, null, tint = C.navy)
            }
            Spacer(Modifier.width(8.dp))
            Row(
                Modifier
                    .weight(1f)
                    .height(44.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(C.card)
                    .padding(horizontal = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                BasicTextField(
                    value = draft,
                    onValueChange = { draft = it },
                    singleLine = true,
                    textStyle = TextStyle(color = C.navy, fontFamily = T.sans, fontSize = 15.sp),
                    cursorBrush = SolidColor(C.brand),
                    modifier = Modifier.weight(1f),
                    decorationBox = { inner ->
                        if (draft.isEmpty()) Text("Спросить…", color = C.muted, fontSize = 15.sp)
                        inner()
                    },
                )
                Icon(Icons.Outlined.MicNone, null, tint = C.muted, modifier = Modifier.size(20.dp))
            }
            Spacer(Modifier.width(8.dp))
            Box(
                Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(C.brand)
                    .clickable { send(draft) },
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Outlined.Send, null, tint = C.white, modifier = Modifier.size(20.dp))
            }
        }
    }
}

@Composable
private fun LinTypingDots() {
    val wave by rememberInfiniteTransition(label = "linDots").animateFloat(
        initialValue = 0f,
        targetValue = 3f,
        animationSpec = infiniteRepeatable(tween(900, easing = LinearEasing), RepeatMode.Restart),
        label = "wave",
    )
    Row(
        Modifier
            .padding(bottom = 10.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(C.card)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        repeat(3) { index ->
            val active = ((wave.toInt() + 3) % 3) == index
            val lift = if (active) (-4).dp else 0.dp
            val scale = if (active) 1.2f else 0.85f
            Box(
                Modifier
                    .offset(y = lift)
                    .size(7.dp)
                    .scale(scale)
                    .clip(CircleShape)
                    .background(if (active) C.brand else C.muted.copy(alpha = 0.55f)),
            )
        }
    }
}

private fun fmtPts(value: Int) = NumberFormat.getInstance(Locale("ru", "RU")).format(value)
