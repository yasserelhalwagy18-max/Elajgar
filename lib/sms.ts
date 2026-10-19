// SMS delivery via sms.ir "Verify" (ارسال سریع) API.
// Docs: https://sms.ir/rest-api/

const SMSIR_VERIFY_URL = 'https://api.sms.ir/v1/send/verify';

export async function sendOtpSms(phoneNumber: string, code: string): Promise<void> {
  const apiKey = process.env.SMSIR_API_KEY;
  const templateId = Number(process.env.SMSIR_TEMPLATE_ID);
  const codeParam = process.env.SMSIR_CODE_PARAM || 'CODE';

  // Local development without credentials: log the code instead of sending.
  if (!apiKey || !templateId) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMSIR_API_KEY / SMSIR_TEMPLATE_ID are not configured');
    }
    console.log(`[DEV SMS] OTP ${code} for ${phoneNumber}`);
    return;
  }

  const res = await fetch(SMSIR_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      mobile: phoneNumber,
      templateId,
      parameters: [{ name: codeParam, value: code }],
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = await res.json().catch(() => null);

  // sms.ir returns { status: 1, message, data } on success.
  if (!res.ok || !data || data.status !== 1) {
    // Never log the code or API key.
    throw new Error(
      `sms.ir send failed: HTTP ${res.status}, status=${data?.status}, message=${data?.message}`
    );
  }
}
