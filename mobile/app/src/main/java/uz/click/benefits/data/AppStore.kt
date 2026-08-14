package uz.click.benefits.data

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import java.time.LocalTime
import java.time.format.DateTimeFormatter

class AppStore : ViewModel() {
    var session by mutableStateOf<User?>(null)
        private set
    var companies by mutableStateOf(Seed.companies)
        private set
    var users by mutableStateOf(Seed.users)
        private set
    var merchants by mutableStateOf(Seed.merchants)
        private set
    var offers by mutableStateOf(Seed.offers)
        private set
    var requests by mutableStateOf(Seed.requests)
        private set
    var transactions by mutableStateOf(Seed.transactions)
        private set
    var partnerLeads by mutableStateOf(listOf<PartnerLead>())
        private set

    fun login(email: String, password: String): String? = loginWithCode(email, password)

    /** Employee access: email + invite code from external HR/service. No self-registration. */
    fun loginWithCode(email: String, code: String): String? {
        val invite = code.trim().uppercase().replace(" ", "")
        if (email.isBlank()) return "Укажите рабочую почту"
        if (invite.isBlank()) return "Введите код доступа"
        if (invite != "1234" && invite != "CORP-2026" && invite != "CORP2026") {
            return "Неверный код доступа"
        }
        val key = email.trim().lowercase()
        val user = users.find {
            it.email.equals(key, true) || it.email.substringBefore("@") == key
        } ?: return "Сотрудник с такой почтой не найден. Проверьте код у компании."
        session = user
        return null
    }

    fun register(name: String, email: String, password: String): String? {
        return "Регистрации нет — войдите с кодом от компании"
    }

    var darkTheme by mutableStateOf(true)
    var savedOfferIds by mutableStateOf(setOf("o8", "o1"))
        private set
    var readActivityIds by mutableStateOf(emptySet<String>())
        private set

    fun toggleSaved(offerId: String) {
        val adding = offerId !in savedOfferIds
        savedOfferIds = if (adding) savedOfferIds + offerId else savedOfferIds - offerId
        if (adding) ping("Сохранено")
    }

    var toast by mutableStateOf<AppToast?>(null)
        private set

    fun ping(text: String, hero: Boolean = false) {
        toast = AppToast(text = text, hero = hero)
    }

    fun clearToast() {
        toast = null
    }

    fun isSaved(offerId: String) = offerId in savedOfferIds

    fun activities(): List<ActivityItem> = Seed.activities.map { item ->
        if (item.id in readActivityIds) item.copy(unread = false) else item
    }

    fun unreadCount() = activities().count { it.unread }

    fun markRead(id: String) {
        readActivityIds = readActivityIds + id
    }

    fun markAllRead() {
        readActivityIds = activities().map { it.id }.toSet()
    }

    fun updateProfile(name: String, jobTitle: String) {
        val user = session ?: return
        val updated = user.copy(name = name.ifBlank { user.name }, jobTitle = jobTitle)
        session = updated
        users = users.map { if (it.id == user.id) updated else it }
    }

    fun logout() {
        session = null
    }

    fun now(): String {
        val time = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
        return "${java.time.LocalDate.now().dayOfMonth} авг, $time"
    }

    fun submitRequest(offerId: String): BenefitRequest? {
        val user = session ?: return null
        val companyId = user.companyId ?: return null
        val offer = offers.find { it.id == offerId } ?: return null
        val stamp = now()
        val request = BenefitRequest(
            id = "r${System.currentTimeMillis()}",
            offerId = offer.id,
            employeeId = user.id,
            companyId = companyId,
            status = RequestStatus.pending,
            createdAt = stamp,
            updatedAt = stamp,
            history = listOf(HistoryEntry(RequestStatus.pending, stamp, "Заявка создана")),
        )
        requests = listOf(request) + requests
        if (!offer.isFree) {
            transactions = listOf(
                Transaction("t${System.currentTimeMillis()}", TxType.redeem, offer.points, user.id, companyId, offer.id, stamp)
            ) + transactions
            ping("Куплено", hero = true)
        } else {
            ping("Записались", hero = true)
        }
        return request
    }

    fun setRequestStatus(id: String, status: RequestStatus, note: String) {
        val stamp = now()
        requests = requests.map { request ->
            if (request.id != id) request
            else request.copy(
                status = status,
                updatedAt = stamp,
                history = request.history + HistoryEntry(status, stamp, note),
            )
        }
    }

    fun upsertOffer(offer: Offer) {
        offers = if (offers.any { it.id == offer.id }) {
            offers.map { if (it.id == offer.id) offer else it }
        } else {
            listOf(offer.copy(id = "o${System.currentTimeMillis()}")) + offers
        }
    }

    fun registerMerchant(name: String, city: String) {
        merchants = listOf(
            Merchant(
                id = "m${System.currentTimeMillis()}",
                name = name.ifBlank { "New Merchant" },
                city = city.ifBlank { "Ташкент" },
                category = Category.food,
                verified = false,
            )
        ) + merchants
    }

    fun saveInterests(ids: List<String>) {
        val user = session ?: return
        val updated = user.copy(interestIds = ids, onboardingDone = true)
        session = updated
        users = users.map { if (it.id == user.id) updated else it }
    }

    fun reopenOnboarding() {
        val user = session ?: return
        val updated = user.copy(onboardingDone = false)
        session = updated
        users = users.map { if (it.id == user.id) updated else it }
    }

    fun selectedInterests(): List<Interest> {
        val ids = session?.interestIds.orEmpty()
        return Seed.interests.filter { it.id in ids }
    }

    fun recommendedOffers(): List<Offer> {
        val user = session ?: return emptyList()
        val available = employeeOffers("", null)
        val picked = selectedInterests()
        if (picked.isEmpty()) return available.take(4)
        val categories = picked.map { it.category }.toSet()
        val keywords = picked.flatMap { it.keywords }
        val historyCategories = requests
            .filter { it.employeeId == user.id }
            .mapNotNull { offer(it.offerId)?.category }
            .toSet()
        return available
            .map { offer ->
                var score = 0
                if (offer.category in categories) score += 4
                if (keywords.any { key ->
                    offer.title.contains(key, true) || offer.description.contains(key, true)
                }) score += 3
                if (offer.category in historyCategories) score += 2
                if (offer.isFree) score += 1
                offer to score
            }
            .filter { it.second > 0 }
            .sortedByDescending { it.second }
            .map { it.first }
    }

    fun topUp(amount: Int) {
        if (amount <= 0) return
        val user = session ?: return
        val updated = user.copy(balance = user.balance + amount)
        session = updated
        users = users.map { if (it.id == user.id) updated else it }
        transactions = listOf(
            Transaction("t${System.currentTimeMillis()}", TxType.topup, amount, user.id, user.companyId, null, now()),
        ) + transactions
        ping("Пополнено")
    }

    fun submitPartnerLead(company: String, contact: String, email: String, note: String): String? {
        if (company.isBlank() || email.isBlank()) return "Укажите компанию и email"
        partnerLeads = listOf(
            PartnerLead(
                id = "p${System.currentTimeMillis()}",
                company = company.trim(),
                contact = contact.trim(),
                email = email.trim(),
                note = note.trim(),
                createdAt = now(),
            ),
        ) + partnerLeads
        ping("Заявку приняли")
        return null
    }

    fun offer(id: String) = offers.find { it.id == id }
    fun user(id: String) = users.find { it.id == id }
    fun company(id: String) = companies.find { it.id == id }
    fun merchant(id: String) = merchants.find { it.id == id }
    fun request(id: String) = requests.find { it.id == id }

    fun employeeOffers(query: String, category: Category?, paid: Boolean? = null, savedOnly: Boolean = false): List<Offer> {
        val companyId = session?.companyId ?: return emptyList()
        return offers.filter { offer ->
            offer.active &&
                offer.companyIds.contains(companyId) &&
                (category == null || offer.category == category) &&
                (paid == null || offer.paid == paid) &&
                (!savedOnly || offer.id in savedOfferIds) &&
                offer.title.contains(query, ignoreCase = true)
        }
    }
}
