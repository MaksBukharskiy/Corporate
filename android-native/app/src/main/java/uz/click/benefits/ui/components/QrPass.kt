package uz.click.benefits.ui.components

import android.graphics.Bitmap
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import uz.click.benefits.data.BenefitRequest
import uz.click.benefits.data.RequestStatus
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T

fun RequestStatus.hasEntryPass() = this == RequestStatus.approved ||
    this == RequestStatus.in_progress ||
    this == RequestStatus.completed

fun passPayload(request: BenefitRequest): String {
    val seed = request.id.hashCode().toUInt().toString(16).uppercase().padStart(6, '0').take(6)
    return "CORPORATE:${request.id}:$seed"
}

fun passCode(request: BenefitRequest): String {
    val seed = request.id.hashCode().toUInt().toString(16).uppercase().padStart(6, '0').take(6)
    return "CR-${request.id.uppercase()}-$seed"
}

fun qrBitmap(content: String, size: Int = 512): Bitmap {
    val matrix = QRCodeWriter().encode(
        content,
        BarcodeFormat.QR_CODE,
        size,
        size,
        mapOf(EncodeHintType.MARGIN to 1),
    )
    val pixels = IntArray(size * size) { i ->
        val x = i % size
        val y = i / size
        if (matrix[x, y]) 0xFF111111.toInt() else 0xFFFFFFFF.toInt()
    }
    return Bitmap.createBitmap(pixels, size, size, Bitmap.Config.ARGB_8888)
}

@Composable
fun EntryQrCard(request: BenefitRequest) {
    val payload = remember(request.id) { passPayload(request) }
    val code = remember(request.id) { passCode(request) }
    val bitmap = remember(payload) { qrBitmap(payload) }
    var ready by remember { mutableStateOf(false) }
    LaunchedEffect(request.id) { ready = true }
    val appear by animateFloatAsState(if (ready) 1f else 0.88f, spring(), label = "qrIn")
    val pulse by rememberInfiniteTransition(label = "qrPulse").animateFloat(
        initialValue = 0.55f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(1400), RepeatMode.Reverse),
        label = "framePulse",
    )
    val scan by rememberInfiniteTransition(label = "qrScan").animateFloat(
        initialValue = 0.08f,
        targetValue = 0.92f,
        animationSpec = infiniteRepeatable(tween(2200, easing = LinearEasing), RepeatMode.Restart),
        label = "scan",
    )
    val frame = Color(0xFF246BFD)
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Brush.verticalGradient(listOf(Color(0xFF121826), C.card)))
            .border(1.dp, Color(0xFF246BFD).copy(alpha = 0.35f), RoundedCornerShape(24.dp))
            .graphicsLayer { alpha = appear; scaleX = appear; scaleY = appear }
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Пропуск на вход", fontFamily = T.sans, fontWeight = FontWeight.Bold, color = C.white, fontSize = 17.sp)
        Text("Покажите QR на входе", style = T.caption)
        Spacer(Modifier.height(16.dp))
        Box(
            Modifier
                .size(236.dp)
                .drawBehind {
                    val stroke = 5.dp.toPx()
                    val arm = 28.dp.toPx()
                    val color = frame.copy(alpha = pulse)
                    val r = 18.dp.toPx()
                    drawRoundRect(
                        color = color.copy(alpha = 0.25f * pulse),
                        size = size,
                        cornerRadius = CornerRadius(r, r),
                        style = Stroke(width = 2.dp.toPx()),
                    )
                    fun corner(x: Float, y: Float, dx: Float, dy: Float) {
                        drawLine(color, Offset(x, y + dy * arm), Offset(x, y), stroke, StrokeCap.Round)
                        drawLine(color, Offset(x, y), Offset(x + dx * arm, y), stroke, StrokeCap.Round)
                    }
                    corner(stroke / 2, stroke / 2, 1f, 1f)
                    corner(size.width - stroke / 2, stroke / 2, -1f, 1f)
                    corner(stroke / 2, size.height - stroke / 2, 1f, -1f)
                    corner(size.width - stroke / 2, size.height - stroke / 2, -1f, -1f)
                }
                .padding(14.dp),
            contentAlignment = Alignment.Center,
        ) {
            Box(
                Modifier
                    .size(200.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White)
                    .border(2.dp, Color(0xFFE5E7EB), RoundedCornerShape(16.dp))
                    .padding(12.dp),
            ) {
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = "QR-пропуск",
                    modifier = Modifier.size(176.dp),
                )
                Box(
                    Modifier
                        .align(Alignment.TopStart)
                        .offset(y = (176.dp * scan))
                        .fillMaxWidth()
                        .height(3.dp)
                        .background(
                            Brush.verticalGradient(
                                listOf(Color.Transparent, Color(0xFF246BFD).copy(0.85f), Color.Transparent),
                            ),
                        ),
                )
            }
        }
        Spacer(Modifier.height(14.dp))
        Box(
            Modifier
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0xFF1A2744))
                .padding(horizontal = 14.dp, vertical = 8.dp),
        ) {
            Text(code, color = C.brandBright, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }
    }
}
