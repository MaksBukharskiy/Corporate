package uz.click.benefits.ui.login

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.ui.components.PrimaryButton
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.heroBrush

@Composable
fun LoginScreen(store: AppStore) {
    var mode by remember { mutableStateOf("login") }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("ali@click.uz") }
    var password by remember { mutableStateOf("1234") }
    var error by remember { mutableStateOf("") }

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
                Modifier.size(56.dp).clip(CircleShape).background(C.brand),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Outlined.WorkOutline, null, tint = C.white, modifier = Modifier.size(28.dp))
            }
            Spacer(Modifier.height(16.dp))
            Text("Corporate", style = T.title, color = C.white)
            Text("корпоративные льготы", style = T.caption, fontSize = 15.sp)
            Spacer(Modifier.height(28.dp))

        Row(
            Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(C.card),
        ) {
            Box(Modifier.weight(1f)) { ModeTab("Вход", mode == "login") { mode = "login"; error = "" } }
            Box(Modifier.weight(1f)) { ModeTab("Регистрация", mode == "register") { mode = "register"; error = "" } }
        }

        Spacer(Modifier.height(20.dp))

        if (mode == "register") {
            Label("Имя")
            Field(name, { name = it }, "Ali Karimov")
            Spacer(Modifier.height(12.dp))
        }
        Label("Email")
        Field(email, { email = it }, "ali@click.uz", KeyboardType.Email)
        Spacer(Modifier.height(12.dp))
        Label("Пароль")
        Field(password, { password = it }, "••••", password = true)

        if (error.isNotEmpty()) {
            Spacer(Modifier.height(10.dp))
            Text(error, color = C.danger, fontFamily = T.sans, fontSize = 13.sp)
        }

        Spacer(Modifier.height(24.dp))
        PrimaryButton(if (mode == "login") "Войти" else "Создать аккаунт") {
            error = if (mode == "login") store.login(email, password) ?: ""
            else store.register(name, email, password) ?: ""
        }

        Spacer(Modifier.height(24.dp))
        Text("Демо, пароль 1234", style = T.caption)
        Text("ali@click.uz — сотрудник", style = T.caption)
        Text("nodira@fitzone.uz — мерчант", style = T.caption)
        Text("admin@click.uz — админ", style = T.caption)
        }
    }
}

@Composable
private fun ModeTab(title: String, selected: Boolean, onClick: () -> Unit) {
    Box(
        Modifier
            .fillMaxWidth()
            .padding(4.dp)
            .height(40.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(if (selected) C.brand else C.card)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            title,
            color = if (selected) C.white else C.muted,
            fontFamily = T.sans,
            fontSize = 14.sp,
            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
        )
    }
}

@Composable
private fun Label(text: String) {
    Text(text, style = T.caption, modifier = Modifier.padding(bottom = 6.dp))
}

@Composable
private fun Field(
    value: String,
    onChange: (String) -> Unit,
    placeholder: String,
    keyboard: KeyboardType = KeyboardType.Text,
    password: Boolean = false,
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
            visualTransformation = if (password) PasswordVisualTransformation() else VisualTransformation.None,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
