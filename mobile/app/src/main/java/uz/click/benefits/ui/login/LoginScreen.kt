package uz.click.benefits.ui.login

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.WorkOutline
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
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.ui.components.PartnerLeadOverlay
import uz.click.benefits.ui.components.PrimaryButton
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.heroBrush

@Composable
fun LoginScreen(store: AppStore) {
    var email by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var error by remember { mutableStateOf("") }
    var partnerOpen by remember { mutableStateOf(false) }

    Box(Modifier.fillMaxSize().background(C.bg)) {
        Box(Modifier.fillMaxWidth().height(280.dp).background(heroBrush()))
        Column(
            Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
        ) {
            Spacer(Modifier.height(28.dp))
            Box(
                Modifier
                    .padding(start = 3.dp)
                    .size(61.dp)
                    .clip(CircleShape)
                    .background(C.brand),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Outlined.WorkOutline, null, tint = C.white, modifier = Modifier.size(33.dp))
            }
            Spacer(Modifier.height(16.dp))
            Text(
                "Corporate",
                style = T.title.copy(fontSize = 33.sp),
                color = C.white,
                modifier = Modifier.padding(start = 3.dp),
            )
            Spacer(Modifier.height(68.dp))

            Field(email, { email = it }, "name@company.uz", KeyboardType.Email)
            Spacer(Modifier.height(14.dp))

            Label("Код доступа", bottom = 8.dp)
            CodeField(code) { code = it.filter { ch -> ch.isLetterOrDigit() || ch == '-' }.take(12).uppercase() }

            if (error.isNotEmpty()) {
                Spacer(Modifier.height(10.dp))
                Text(error, color = C.danger, fontFamily = T.sans, fontSize = 13.sp)
            }

            Spacer(Modifier.height(24.dp))
            PrimaryButton("Войти") {
                error = store.loginWithCode(email, code) ?: ""
            }

            Spacer(Modifier.height(33.dp))
            PartnerCtaButton { partnerOpen = true }
            Spacer(Modifier.height(16.dp))
        }
        AnimatedVisibility(
            visible = partnerOpen,
            modifier = Modifier.fillMaxSize(),
            enter = fadeIn() + slideInVertically { -it },
            exit = fadeOut() + slideOutVertically { -it },
        ) {
            PartnerLeadOverlay(store) { partnerOpen = false }
        }
    }
}

@Composable
private fun PartnerCtaButton(onClick: () -> Unit) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(C.card)
            .border(1.5.dp, C.brand, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            "Продвигать свои услуги",
            color = C.navy,
            fontFamily = T.sans,
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
private fun Label(text: String, bottom: Dp = 4.dp) {
    Text(
        text,
        color = C.muted,
        fontFamily = T.sans,
        fontSize = 16.sp,
        fontWeight = FontWeight.Medium,
        modifier = Modifier.padding(start = 6.dp, bottom = bottom),
    )
}

@Composable
private fun Field(
    value: String,
    onChange: (String) -> Unit,
    placeholder: String,
    keyboard: KeyboardType = KeyboardType.Text,
) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(C.card)
            .border(1.dp, C.line, RoundedCornerShape(16.dp))
            .padding(horizontal = 16.dp),
        contentAlignment = Alignment.CenterStart,
    ) {
        if (value.isEmpty()) Text(placeholder, style = T.body.copy(color = C.muted))
        BasicTextField(
            value = value,
            onValueChange = onChange,
            singleLine = true,
            textStyle = TextStyle(fontFamily = T.sans, fontSize = 16.sp, color = C.navy),
            keyboardOptions = KeyboardOptions(keyboardType = keyboard),
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun CodeField(value: String, onChange: (String) -> Unit) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(64.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(C.card)
            .border(2.dp, C.brand, RoundedCornerShape(18.dp))
            .padding(horizontal = 16.dp),
        contentAlignment = Alignment.Center,
    ) {
        if (value.isEmpty()) {
            Text(
                "XXXX-XXXX",
                color = C.muted,
                fontFamily = FontFamily.Monospace,
                fontSize = 22.sp,
                fontWeight = FontWeight.Medium,
                letterSpacing = 3.sp,
            )
        }
        BasicTextField(
            value = value,
            onValueChange = onChange,
            singleLine = true,
            textStyle = TextStyle(
                fontFamily = FontFamily.Monospace,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = C.navy,
                letterSpacing = 3.sp,
                textAlign = TextAlign.Center,
            ),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Ascii),
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
