package uz.click.benefits.ui.admin

import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.click.benefits.data.AppStore
import uz.click.benefits.data.TxType
import uz.click.benefits.ui.components.PrimaryButton
import uz.click.benefits.ui.theme.C
import uz.click.benefits.ui.theme.T
import uz.click.benefits.ui.theme.categoryLabel

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AdminOverview(store: AppStore) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        Text("Обзор", style = T.title.copy(fontSize = 28.sp))
        Spacer(Modifier.height(12.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Stat("Компании", store.companies.size)
            Stat("Офферы", store.offers.size)
            Stat("Заявки", store.requests.size)
            Stat("Операции", store.transactions.size)
        }
        Spacer(Modifier.height(16.dp))
        store.companies.forEach { company ->
            val employees = store.users.count { it.companyId == company.id }
            Column(Modifier.fillMaxWidth().padding(bottom = 10.dp).clip(RoundedCornerShape(22.dp)).background(C.card).padding(16.dp)) {
                Text(company.name, fontWeight = FontWeight.Medium, color = C.navy)
                Text("$employees сотрудников · ${company.tenantId}", color = C.muted, fontSize = 13.sp)
                Text(company.status, color = if (company.status == "Active") C.success else C.warning, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
        PrimaryButton("Выйти", variant = "navy", onClick = store::logout)
    }
}

@Composable
fun AdminPeople(store: AppStore) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        Text("Люди", fontSize = 30.sp, fontWeight = FontWeight.Medium, color = C.navy)
        Spacer(Modifier.height(12.dp))
        store.users.forEach { user ->
            Row(
                Modifier.fillMaxWidth().padding(bottom = 10.dp).clip(RoundedCornerShape(22.dp)).background(C.card).padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column {
                    Text(user.name, fontWeight = FontWeight.Medium, color = C.navy)
                    Text(user.email, color = C.muted, fontSize = 13.sp)
                }
                Box(Modifier.clip(CircleShape).background(C.brandSoft).padding(horizontal = 10.dp, vertical = 5.dp)) {
                    Text(user.role.name, color = C.brandDark, fontSize = 11.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

@Composable
fun AdminPartners(store: AppStore) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        Text("Партнёры", fontSize = 30.sp, fontWeight = FontWeight.Medium, color = C.navy)
        Spacer(Modifier.height(12.dp))
        store.merchants.forEach { merchant ->
            Row(
                Modifier.fillMaxWidth().padding(bottom = 10.dp).clip(RoundedCornerShape(22.dp)).background(C.card).padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column {
                    Text(merchant.name, fontWeight = FontWeight.Medium, color = C.navy)
                    Text("${merchant.city} · ${categoryLabel(merchant.category)}", color = C.muted, fontSize = 13.sp)
                }
                Text(
                    if (merchant.verified) "Verified" else "Review",
                    color = if (merchant.verified) C.success else C.warning,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                )
            }
        }
    }
}

@Composable
fun AdminOps(store: AppStore) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(20.dp).padding(bottom = 120.dp)) {
        Text("Операции", fontSize = 30.sp, fontWeight = FontWeight.Medium, color = C.navy)
        Spacer(Modifier.height(12.dp))
        store.transactions.forEach { tx ->
            val offer = tx.offerId?.let { store.offer(it) }
            val user = store.user(tx.userId)
            val title = offer?.title ?: if (tx.type == TxType.topup) "Пополнение" else "Операция"
            Row(
                Modifier.fillMaxWidth().padding(bottom = 10.dp).clip(RoundedCornerShape(22.dp)).background(C.card).padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(title, fontWeight = FontWeight.Medium, color = C.navy)
                    Text("${user?.name} · ${tx.createdAt}", color = C.muted, fontSize = 13.sp)
                }
                Text(
                    if (tx.type == TxType.redeem) "−${tx.amount}" else "+${tx.amount}",
                    color = if (tx.type == TxType.redeem) C.navy else C.success,
                    fontWeight = FontWeight.Medium,
                )
            }
        }
    }
}

@Composable
private fun Stat(label: String, value: Int) {
    Column(
        Modifier.fillMaxWidth(0.47f).clip(RoundedCornerShape(16.dp)).background(C.card).padding(16.dp)
    ) {
        Text(label, color = C.muted, fontSize = 13.sp)
        Text("$value", fontSize = 28.sp, fontWeight = FontWeight.Medium, color = C.brand)
    }
}
