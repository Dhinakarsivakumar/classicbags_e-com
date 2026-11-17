package com.classicbags.listener;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.os.Bundle;
import android.util.Log;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class GPayNotificationListenerService extends NotificationListenerService {

    private static final String TAG = "GPayListener";
    private static final String WEBHOOK_URL = "http://10.220.210.247:3002/api/webhook/gpay";
    private static final String WEBHOOK_SECRET = "sec_cb_9843275685_live_hash";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null) return;

        String packageName = sbn.getPackageName();
        if (packageName == null) return;

        // Listen to Google Pay for Business and Google Pay
        if (!packageName.contains("paisa") && !packageName.contains("google.android.apps.walletnfcrel")) {
            return;
        }

        Bundle extras = sbn.getNotification().extras;
        if (extras == null) return;

        CharSequence titleCS = extras.getCharSequence("android.title");
        CharSequence textCS = extras.getCharSequence("android.text");
        String title = titleCS != null ? titleCS.toString() : "";
        String text = textCS != null ? textCS.toString() : "";
        String full = title + " " + text;

        Log.d(TAG, "Notification captured: " + full);

        parseAndDispatch(full);
    }

    private void parseAndDispatch(final String notificationText) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Pattern amountPat = Pattern.compile("(?:₹|Rs\\.?)\\s*([0-9,]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE);
                    Pattern utrPat = Pattern.compile("(?:UTR|Ref|UPI Ref)[:\\s]*([0-9]{10,14})", Pattern.CASE_INSENSITIVE);
                    Pattern fromPat = Pattern.compile("from\\s+([A-Za-z0-9\\s]+)(?:\\s*\\(|$)", Pattern.CASE_INSENSITIVE);

                    Matcher amountMat = amountPat.matcher(notificationText);
                    Matcher utrMat = utrPat.matcher(notificationText);
                    Matcher fromMat = fromPat.matcher(notificationText);

                    if (!amountMat.find()) {
                        Log.d(TAG, "No amount found in notification, skipping.");
                        return;
                    }

                    String rawAmount = amountMat.group(1).replace(",", "");
                    String utr = utrMat.find() ? utrMat.group(1) : ("UTR" + System.currentTimeMillis());
                    String sender = fromMat.find() ? fromMat.group(1).trim() : "Customer";

                    String jsonPayload = "{\"amount\":" + rawAmount +
                            ",\"utr\":\"" + utr + "\"" +
                            ",\"sender\":\"" + sender + "\"" +
                            ",\"rawNotification\":\"" + notificationText.replace("\"", "\\\"") + "\"" +
                            ",\"timestamp\":" + System.currentTimeMillis() + "}";

                    String signature = hmacSha256(jsonPayload, WEBHOOK_SECRET);

                    URL url = new URL(WEBHOOK_URL);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setConnectTimeout(5000);
                    conn.setReadTimeout(5000);
                    conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                    conn.setRequestProperty("X-ClassicBags-Signature", signature);
                    conn.setDoOutput(true);

                    try (OutputStream os = conn.getOutputStream()) {
                        byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                        os.write(input, 0, input.length);
                    }

                    int code = conn.getResponseCode();
                    Log.i(TAG, "Webhook dispatched successfully! Response Code: " + code);
                    conn.disconnect();

                } catch (Exception e) {
                    Log.e(TAG, "Error processing webhook: " + e.getMessage());
                }
            }
        }).start();
    }

    private static String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
