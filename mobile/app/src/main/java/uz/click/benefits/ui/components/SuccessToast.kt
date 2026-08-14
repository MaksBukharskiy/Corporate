package uz.click.benefits.ui.components

import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.view.HapticFeedbackConstants
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
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
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import uz.click.benefits.data.AppToast
import uz.click.benefits.ui.theme.T

@Composable
fun SuccessToastHost(toast: AppToast?, onDone: () -> Unit) {
    var shown by remember { mutableStateOf<AppToast?>(null) }
    LaunchedEffect(toast) { if (toast != null) shown = toast }
    val current = shown
    if (current == null) return
    if (current.hero) {
        AnimatedVisibility(
            visible = toast != null,
            enter = fadeIn(tween(220)),
            exit = fadeOut(tween(280)),
            modifier = Modifier.fillMaxSize(),
        ) {
            HeroSuccess(current, onDone)
        }
    } else {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.BottomCenter) {
            AnimatedVisibility(
                visible = toast != null,
                enter = fadeIn() + slideInVertically { it / 2 } + scaleIn(initialScale = 0.92f),
                exit = fadeOut() + slideOutVertically { it / 3 } + scaleOut(targetScale = 0.94f),
                modifier = Modifier.navigationBarsPadding().padding(start = 20.dp, end = 20.dp, bottom = 28.dp),
            ) {
                MiniSuccess(current, onDone)
            }
        }
    }
}

@Composable
private fun HeroSuccess(toast: AppToast, onDone: () -> Unit) {
    val view = LocalView.current
    var popped by remember(toast.id) { mutableStateOf(false) }
    val tick by animateFloatAsState(
        if (popped) 1f else 0.15f,
        spring(dampingRatio = 0.42f, stiffness = Spring.StiffnessLow),
        label = "heroTick",
    )
    val title by animateFloatAsState(
        if (popped) 1f else 0.7f,
        spring(dampingRatio = 0.55f, stiffness = Spring.StiffnessMediumLow),
        label = "heroTitle",
    )
    LaunchedEffect(toast.id) {
        popped = true
        chirp(view)
        delay(1800)
        onDone()
    }
    Box(
        Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.88f))
            .clickable(onClick = onDone),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                Modifier
                    .size(108.dp)
                    .scale(tick)
                    .clip(CircleShape)
                    .background(Color(0xFF22C55E)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Outlined.Check, null, tint = Color.White, modifier = Modifier.size(56.dp))
            }
            Spacer(Modifier.height(22.dp))
            Text(
                toast.text,
                color = Color.White,
                fontFamily = T.sans,
                fontWeight = FontWeight.Black,
                fontSize = 40.sp,
                modifier = Modifier.scale(title),
            )
        }
    }
}

@Composable
private fun MiniSuccess(toast: AppToast, onDone: () -> Unit) {
    val view = LocalView.current
    var popped by remember(toast.id) { mutableStateOf(false) }
    val tick by animateFloatAsState(
        if (popped) 1f else 0.2f,
        spring(dampingRatio = 0.38f, stiffness = Spring.StiffnessMedium),
        label = "tick",
    )
    LaunchedEffect(toast.id) {
        popped = true
        chirp(view)
        delay(2200)
        onDone()
    }
    Row(
        Modifier
            .clip(RoundedCornerShape(22.dp))
            .background(Color(0xFF141416))
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier
                .size(30.dp)
                .scale(tick)
                .clip(CircleShape)
                .background(Color(0xFF22C55E)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Outlined.Check, null, tint = Color.White, modifier = Modifier.size(18.dp))
        }
        Spacer(Modifier.width(12.dp))
        Text(
            toast.text,
            color = Color.White,
            fontFamily = T.sans,
            fontWeight = FontWeight.SemiBold,
            fontSize = 15.sp,
        )
    }
}

private suspend fun chirp(view: android.view.View) {
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
