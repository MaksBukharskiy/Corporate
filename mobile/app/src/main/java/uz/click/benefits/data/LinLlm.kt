package uz.click.benefits.data

import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Real local neural net via Ollama (qwen2.5:7b), grounded on Corporate RAG context.
 * Emulator reaches the Mac at 10.0.2.2:11434.
 */
object LinLlm {
    private const val MODEL = "qwen2.5:7b"
    private val endpoints = listOf(
        "http://10.0.2.2:11434/api/chat",
        "http://127.0.0.1:11434/api/chat",
    )

    fun answer(query: String, store: AppStore): String {
        val context = RagEngine.contextFor(query, store)
        val system = """
Ты Lin — нейросеть-помощник приложения Corporate.
Отвечай только по CONTEXT. Не выдумывай льготы, цены и статусы вне контекста.
Если ответа нет в CONTEXT, скажи коротко, что в данных Corporate этого нет.
Пиши по-русски, коротко, без markdown-заголовков.

CONTEXT:
$context
        """.trimIndent()
        return chat(system, query) ?: RagEngine.answer(query, store)
    }

    private fun chat(system: String, user: String): String? {
        val payload = JSONObject()
            .put("model", MODEL)
            .put("stream", false)
            .put(
                "messages",
                JSONArray()
                    .put(JSONObject().put("role", "system").put("content", system))
                    .put(JSONObject().put("role", "user").put("content", user)),
            )
            .put("options", JSONObject().put("temperature", 0.25).put("num_predict", 220))
            .toString()
            .toByteArray(Charsets.UTF_8)
        for (endpoint in endpoints) {
            val text = post(endpoint, payload) ?: continue
            if (text.isNotBlank()) return text
        }
        return null
    }

    private fun post(endpoint: String, payload: ByteArray): String? {
        val connection = (URL(endpoint).openConnection() as HttpURLConnection)
        return try {
            connection.requestMethod = "POST"
            connection.connectTimeout = 4000
            connection.readTimeout = 45000
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            connection.outputStream.use { it.write(payload) }
            if (connection.responseCode !in 200..299) return null
            val raw = connection.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
            JSONObject(raw).optJSONObject("message")?.optString("content")?.trim()?.takeIf { it.isNotEmpty() }
        } catch (_: Exception) {
            null
        } finally {
            connection.disconnect()
        }
    }
}
