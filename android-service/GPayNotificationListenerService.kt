package com.classicbags.listener

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.security.SignatureException
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

class GPayNotificationListenerService : NotificationListenerService() {

    companion object {
        private const val TAG = "GPayListener"
        // Target packages: Google Pay Business & Personal UPI apps
        private val TARGET_PACKAGES = setOf(
            "com.google.android.apps.nbu.paisa.user",
            "com.google.android.apps.nbu.paisa.merchant"
        )
        private const val WEBHOOK_URL = "https://api.classicbags.thanjavur/webhook/gpay"
        private const val WEBHOOK_SECRET = "sec_cb_9843275685_live_hash"
    }

    private val httpClient = OkHttpClient()

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName
        if (!TARGET_PACKAGES.contains(packageName)) return

        val extras = sbn.notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val fullContent = "$title $text"

        Log.d(TAG, "Captured GPay Notification: $fullContent")

        // Parse amount, UTR, and sender name using regular expressions
        parseAndSendWebhook(fullContent)
    }

    private fun parseAndSendWebhook(notificationText: String) {
        val amountRegex = Regex("""(?:₹|Rs\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)""", RegexOption.IGNORE_CASE)
        val utrRegex = Regex("""(?:UTR|Ref|UPI Ref)[:\s]*([0-9]{10,14})""", RegexOption.IGNORE_CASE)
        val fromRegex = Regex("""from\s+([A-Za-z\s]+)(?:\s*\(|$)""", RegexOption.IGNORE_CASE)

        val amountMatch = amountRegex.find(notificationText)
        val utrMatch = utrRegex.find(notificationText)
        val fromMatch = fromRegex.find(notificationText)

        if (amountMatch == null) {
            Log.d(TAG, "Notification did not match payment pattern, skipping.")
            return
        }

        val rawAmount = amountMatch.groupValues[1].replace(",", "").toDoubleOrNull() ?: 0.0
        val utr = utrMatch?.groupValues?.get(1) ?: "UTR_${System.currentTimeMillis()}"
        val sender = fromMatch?.groupValues?.get(1)?.trim() ?: "Customer"

        val jsonPayload = JSONObject().apply {
            put("amount", rawAmount)
            put("utr", utr)
            put("sender", sender)
            put("rawNotification", notificationText)
            put("timestamp", System.currentTimeMillis())
        }.toString()

        // Generate HMAC-SHA256 signature
        val signature = computeHmacSha256(jsonPayload, WEBHOOK_SECRET)

        // Dispatch POST request to Webhook endpoint
        val requestBody = jsonPayload.toRequestBody("application/json; charset=utf-8".toMediaType())
        val request = Request.Builder()
            .url(WEBHOOK_URL)
            .addHeader("X-ClassicBags-Signature", signature)
            .post(requestBody)
            .build()

        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "Failed to send webhook to server: ${e.message}")
            }

            override fun onResponse(call: Call, response: Response) {
                Log.i(TAG, "Webhook delivered successfully! Status: ${response.code}")
            }
        })
    }

    private fun computeHmacSha256(data: String, key: String): String {
        return try {
            val sha256Hmac = Mac.getInstance("HmacSHA256")
            val secretKey = SecretKeySpec(key.toByteArray(Charsets.UTF_8), "HmacSHA256")
            sha256Hmac.init(secretKey)
            val signedBytes = sha256Hmac.doFinal(data.toByteArray(Charsets.UTF_8))
            signedBytes.joinToString("") { "%02x".format(it) }
        } catch (e: Exception) {
            throw SignatureException("Failed to calculate HMAC: " + e.message)
        }
    }
}
