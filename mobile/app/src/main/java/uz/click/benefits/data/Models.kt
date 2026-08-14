package uz.click.benefits.data

enum class Role { employee, merchant, admin }

enum class RequestStatus { pending, approved, in_progress, completed, rejected }

enum class Category { sport, food, education, health, transport, events }

enum class TxType { redeem, topup }

enum class ActivityKind { request, offer, event, promo }

data class ActivityItem(
    val id: String,
    val kind: ActivityKind,
    val title: String,
    val body: String,
    val time: String,
    val group: String,
    val unread: Boolean,
    val requestId: String? = null,
    val offerId: String? = null,
)

data class Company(
    val id: String,
    val name: String,
    val tenantId: String,
    val status: String,
)

data class User(
    val id: String,
    val role: Role,
    val name: String,
    val email: String,
    val companyId: String? = null,
    val merchantId: String? = null,
    val balance: Int = 0,
    val interestIds: List<String> = emptyList(),
    val onboardingDone: Boolean = false,
    val jobTitle: String = "",
)

data class Interest(
    val id: String,
    val title: String,
    val category: Category,
    val keywords: List<String>,
)

data class Merchant(
    val id: String,
    val name: String,
    val city: String,
    val category: Category,
    val verified: Boolean,
)

data class Offer(
    val id: String,
    val merchantId: String,
    val title: String,
    val description: String,
    val points: Int,
    val category: Category,
    val active: Boolean,
    val companyIds: List<String>,
    val placesLeft: Int? = null,
    val paid: Boolean = true,
    val subsection: String = "",
    val address: String = "",
    val metro: String = "",
    val timeSlot: String = "",
    val rating: String = "9.6",
    val distance: String = "2 км",
) {
    val isFree: Boolean get() = !paid || points == 0
}

data class HistoryEntry(
    val status: RequestStatus,
    val at: String,
    val note: String,
)

data class BenefitRequest(
    val id: String,
    val offerId: String,
    val employeeId: String,
    val companyId: String,
    val status: RequestStatus,
    val createdAt: String,
    val updatedAt: String,
    val history: List<HistoryEntry>,
)

data class Transaction(
    val id: String,
    val type: TxType,
    val amount: Int,
    val userId: String,
    val companyId: String?,
    val offerId: String?,
    val createdAt: String,
)

data class PartnerLead(
    val id: String,
    val company: String,
    val contact: String,
    val email: String,
    val note: String,
    val createdAt: String,
)

data class AppToast(
    val id: Long = System.currentTimeMillis(),
    val text: String,
    val hero: Boolean = false,
)
