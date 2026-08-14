package uz.click.benefits.data

import java.text.NumberFormat
import java.util.Locale

data class RagChunk(
    val id: String,
    val title: String,
    val body: String,
)

/**
 * RAG over AppStore corpus. Retrieval is local; LinLlm generates with a real model.
 */
object RagEngine {
    fun answer(query: String, store: AppStore): String {
        val chunks = corpus(store)
        val hits = retrieve(query, chunks, 4)
        return generate(query, hits, store)
    }

    fun contextFor(query: String, store: AppStore, k: Int = 6): String {
        val hits = retrieve(query, corpus(store), k)
        if (hits.isEmpty()) return corpus(store).take(4).joinToString("\n") { "• ${it.title}: ${it.body}" }
        return hits.joinToString("\n") { "• ${it.title}: ${it.body}" }
    }

    private fun corpus(store: AppStore): List<RagChunk> {
        val user = store.session
        val company = user?.companyId?.let { store.company(it) }
        val chunks = mutableListOf<RagChunk>()
        chunks += RagChunk(
            "policy",
            "Правила баллов",
            "Платные льготы списывают баллы с корпоративного баланса. Бесплатные льготы баллы не списывают. QR на карте баллов нужен чтобы обналичить списание. Пополнение баланса доступно с главной на мини-карте Corporate.",
        )
        chunks += RagChunk(
            "you",
            "Помощник Lin",
            "Lin отвечает только по внутренним данным Corporate: каталог льгот, заявки сотрудника, баланс, партнёры. Не выдумывает офферы вне каталога.",
        )
        if (user != null) {
            chunks += RagChunk(
                "me",
                "Сотрудник",
                "${user.name}, ${user.jobTitle.ifBlank { "сотрудник" }}. Компания ${company?.name ?: "Corporate"}. Баланс ${fmt(user.balance)} баллов.",
            )
            store.requests.filter { it.employeeId == user.id }.forEach { req ->
                val offer = store.offer(req.offerId)
                chunks += RagChunk(
                    req.id,
                    "Заявка ${offer?.title ?: req.id}",
                    "Статус: ${statusRu(req.status)}. Создана ${req.createdAt}. ${offer?.let { price(it) } ?: ""}",
                )
            }
        }
        store.employeeOffers("", null).forEach { offer ->
            val merchant = store.merchant(offer.merchantId)
            chunks += RagChunk(
                offer.id,
                offer.title,
                listOfNotNull(
                    catRu(offer.category),
                    offer.subsection.takeIf { it.isNotBlank() },
                    price(offer),
                    merchant?.name,
                    offer.address.takeIf { it.isNotBlank() },
                    offer.description,
                    if (offer.isFree) "бесплатно" else "платная льгота",
                ).joinToString(". "),
            )
        }
        store.merchants.filter { it.verified }.forEach { merchant ->
            chunks += RagChunk(
                merchant.id,
                merchant.name,
                "Партнёр в ${merchant.city}, категория ${catRu(merchant.category)}.",
            )
        }
        return chunks
    }

    private fun retrieve(query: String, chunks: List<RagChunk>, k: Int): List<RagChunk> {
        val terms = tokenize(query)
        if (terms.isEmpty()) return chunks.take(k)
        return chunks
            .map { chunk ->
                val hay = tokenize("${chunk.title} ${chunk.body}")
                val overlap = terms.sumOf { term -> hay.count { it == term || it.startsWith(term) || term.startsWith(it) } }
                val titleBoost = if (terms.any { tokenize(chunk.title).contains(it) }) 3 else 0
                chunk to overlap * 2 + titleBoost
            }
            .filter { it.second > 0 }
            .sortedByDescending { it.second }
            .take(k)
            .map { it.first }
    }

    private fun generate(query: String, hits: List<RagChunk>, store: AppStore): String {
        val q = query.lowercase()
        val user = store.session
        if (hits.isEmpty()) {
            return "В данных Corporate этого нет. Спросите про баланс, заявки, спорт, еду или бесплатные льготы."
        }
        if (listOf("баланс", "балл", "сколько").any { it in q } && user != null) {
            return "На корпоративной карте ${fmt(user.balance)} баллов. Пополнить можно с главной. Платные льготы списывают баллы, бесплатные — нет."
        }
        if (listOf("заявк", "статус", "работе").any { it in q }) {
            val lines = hits.filter { it.id.startsWith("r") }.take(3).map { "• ${it.title}: ${it.body}" }
            return if (lines.isEmpty()) "Активных заявок в выборке нет."
            else "Заявки по внутренним данным:\n${lines.joinToString("\n")}"
        }
        val offers = hits.filter { it.id.startsWith("o") }
        if (offers.isNotEmpty()) {
            val head = when {
                "бесплат" in q -> "Бесплатные и близкие льготы из каталога:"
                "спорт" in q || "зал" in q || "йог" in q -> "Спорт в каталоге Corporate:"
                "еда" in q || "обед" in q || "пицц" in q -> "Еда из внутреннего каталога:"
                else -> "По запросу «$query» в каталоге Corporate:"
            }
            return buildString {
                append(head)
                offers.take(3).forEach { append("\n• ${it.title} — ${it.body.take(120)}") }
            }
        }
        return hits.take(2).joinToString("\n") { "${it.title}: ${it.body}" }
    }

    private fun price(offer: Offer) = if (offer.isFree) "бесплатно" else "${fmt(offer.points)} баллов"

    private fun catRu(category: Category) = when (category) {
        Category.sport -> "спорт"
        Category.food -> "еда"
        Category.education -> "обучение"
        Category.health -> "здоровье"
        Category.transport -> "транспорт"
        Category.events -> "ивенты"
    }

    private fun statusRu(status: RequestStatus) = when (status) {
        RequestStatus.pending -> "ожидание"
        RequestStatus.approved -> "одобрена"
        RequestStatus.in_progress -> "в работе"
        RequestStatus.completed -> "завершена"
        RequestStatus.rejected -> "отклонена"
    }

    private fun tokenize(text: String) = text.lowercase()
        .replace(Regex("[^a-zа-яё0-9]+"), " ")
        .split(" ")
        .filter { it.length >= 3 }

    private fun fmt(value: Int) = NumberFormat.getInstance(Locale("ru", "RU")).format(value)
}
