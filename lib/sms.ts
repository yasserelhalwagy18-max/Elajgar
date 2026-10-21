// SMS delivery via sms.ir "Verify" (ارسال سریع) API.
// Docs: https://sms.ir/rest-api/

const SMSIR_VERIFY_URL = 'https://api.sms.ir/v1/send/verify';

/**
 * Why an SMS could not be sent.
 *
 * The distinction matters: a misconfigured server and a rejected message
 * need completely different fixes, and the caller has to be able to tell them
 * apart from the log.
 */
export type SmsFailureReason = 'not-configured' | 'provider-rejected' | 'network-error';

export class SmsError extends Error {
  readonly reason: SmsFailureReason;
  /** The provider's own message, when there was one. */
  readonly providerMessage: string | null;

  constructor(reason: SmsFailureReason, message: string, providerMessage: string | null = null) {
    super(message);
    this.name = 'SmsError';
    this.reason = reason;
    this.providerMessage = providerMessage;
  }
}

/**
 * Send the OTP over SMS.
 *
 * Throws an `SmsError` with a `reason` so the route can answer with a
 * message that says what actually went wrong.
 */
export async function sendOtpSms(phoneNumber: string, code: string): Promise<void> {
  const apiKey = process.env.SMSIR_API_KEY;
  const templateId = Number(process.env.SMSIR_TEMPLATE_ID);
  const codeParam = process.env.SMSIR_CODE_PARAM || 'CODE';

  // A template id of "0" is not a template: `Number("")` is 0, so an empty
  // value has to be treated as "not configured" rather than as template 0.
  const hasTemplate = Number.isFinite(templateId) && templateId > 0;

  // Local development without credentials: log the code instead of sending.
  if (!apiKey || !hasTemplate) {
    if (process.env.NODE_ENV === 'production') {
      throw new SmsError(
        'not-configured',
        'SMSIR_API_KEY / SMSIR_TEMPLATE_ID are not configured',
      );
    }
    console.log(`[DEV SMS] OTP ${code} for ${phoneNumber}`);
    return;
  }

  let res: Response;
  try {
    res = await fetch(SMSIR_VERIFY_URL, {
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
  } catch (error) {
    // A timeout or a DNS failure: the message was never handed to the
    // provider, so this is not the provider's fault.
    throw new SmsError(
      'network-error',
      `sms.ir is unreachable: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const data = await res.json().catch(() => null);

  // sms.ir returns { status: 1, message, data } on success. A non-1 status
  // carries the reason in `message`, e.g. "کلید وب سرویس نامعتبر است" or
  // "شماره موبایل معتبر نیست".
  if (!res.ok || !data || data.status !== 1) {
    // Never log the code or the API key.
    const providerMessage =
      typeof data?.message === 'string' ? data.message : null;

    throw new SmsError(
      'provider-rejected',
      `sms.ir send failed: HTTP ${res.status}, status=${data?.status ?? 'none'}`,
      providerMessage,
    );
  }
}

/**
 * The message the user sees when the SMS could not be sent.
 *
 * A missing server configuration is reported as such: it is an operator
 * problem, not something the user can fix by tapping again.
 */
export function smsFailureMessage(error: unknown): string {
  if (error instanceof SmsError) {
    if (error.reason === 'not-configured') {
      return 'پیامک ارسال نشد: تنظیمات سرویس پیامک روی سرور کامل نیست. لطفاً با پشتیبانی تماس بگیرید.';
    }
    if (error.reason === 'network-error') {
      return 'ارتباط با سرویس پیامک برقرار نشد. لطفاً چند لحظه دیگر تلاش کنید.';
    }
  }

  return 'ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید';
}
