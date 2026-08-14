package uz.click.benefits.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T

@Composable
fun PartnerLeadOverlay(store: AppStore, onDismiss: () -> Unit) {
    Column(
        Modifier
            .fillMaxSize()
            .background(C.card)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 16.dp),
    ) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(
                "Продвигать услуги",
                modifier = Modifier.weight(1f),
                fontFamily = T.sans,
                fontWeight = FontWeight.Bold,
                color = C.navy,
                fontSize = 24.sp,
            )
            Box(
                Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(C.bg)
                    .clickable(onClick = onDismiss),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Outlined.Close, "Закрыть", tint = C.navy, modifier = Modifier.size(22.dp))
            }
        }
        Spacer(Modifier.height(22.dp))
        PartnerLeadForm(store, showTitle = false)
    }
}

@Composable
fun PartnerLeadForm(store: AppStore, showTitle: Boolean = true) {
    var company by remember { mutableStateOf("") }
    var contact by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    var sent by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }

    Column(
        Modifier
            .fillMaxWidth()
            .then(
                if (showTitle) Modifier.clip(RoundedCornerShape(22.dp)).background(C.card).padding(16.dp)
                else Modifier
            ),
    ) {
        if (showTitle) {
            Text("Хотите сотрудничать?", fontFamily = T.sans, fontWeight = FontWeight.Bold, color = C.navy, fontSize = 17.sp)
            Spacer(Modifier.height(4.dp))
        }
        Text("Коротко о компании", fontFamily = T.sans, fontWeight = FontWeight.SemiBold, color = C.navy, fontSize = 16.sp)
        Spacer(Modifier.height(6.dp))
        Text("Вернёмся с оффером для сотрудников.", style = T.caption)
        if (sent) {
            Spacer(Modifier.height(20.dp))
            Text("Заявку приняли. Свяжемся с вами.", color = C.brand, fontFamily = T.sans, fontSize = 14.sp)
        } else {
            Spacer(Modifier.height(28.dp))
            MiniField("Компания", "Название", company) { company = it }
            Spacer(Modifier.height(16.dp))
            MiniField("Контакт", "Имя или телефон", contact) { contact = it }
            Spacer(Modifier.height(16.dp))
            MiniField("Email", "mail@company.uz", email, KeyboardType.Email) { email = it }
            Spacer(Modifier.height(16.dp))
            MiniField("Комментарий", "Чем занимаетесь", note) { note = it }
            if (error.isNotEmpty()) {
                Spacer(Modifier.height(10.dp))
                Text(error, color = C.danger, fontSize = 13.sp, fontFamily = T.sans)
            }
            Spacer(Modifier.height(20.dp))
            PrimaryButton("Отправить заявку") {
                error = store.submitPartnerLead(company, contact, email, note) ?: ""
                sent = error.isEmpty()
            }
        }
    }
}

@Composable
private fun MiniField(
    label: String,
    hint: String,
    value: String,
    type: KeyboardType = KeyboardType.Text,
    onChange: (String) -> Unit,
) {
        Row(
            Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                label,
                color = C.muted,
                fontFamily = T.sans,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                modifier = Modifier.width(128.dp),
            )
            Spacer(Modifier.width(8.dp))
        BasicTextField(
            value = value,
            onValueChange = onChange,
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = type),
            textStyle = TextStyle(color = C.navy, fontFamily = T.sans, fontSize = 15.sp),
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(12.dp))
                .background(C.bg)
                .padding(horizontal = 14.dp, vertical = 14.dp),
            decorationBox = { inner ->
                Box(contentAlignment = Alignment.CenterStart) {
                    if (value.isEmpty()) Text(hint, color = C.muted, fontFamily = T.sans, fontSize = 15.sp)
                    inner()
                }
            },
        )
    }
}
