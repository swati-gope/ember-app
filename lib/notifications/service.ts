// A single seam for every outbound reminder the app sends.
//
// Today, sendReminder() just logs to the console — the "Reminders via
// WhatsApp/SMS" phase is deliberately deferred until there are real
// sign-ups. When that phase kicks off, swap LoggingNotificationService
// below for a TwilioNotificationService that calls the Twilio API.
// Nothing that calls notificationService.sendReminder() needs to change.

export type ReminderChannel = "whatsapp" | "sms";

export interface ReminderPayload {
  to: string; // E.164 format, e.g. +14155552671
  channel: ReminderChannel;
  message: string;
}

export interface ReminderResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface NotificationService {
  sendReminder(payload: ReminderPayload): Promise<ReminderResult>;
}

class LoggingNotificationService implements NotificationService {
  async sendReminder(payload: ReminderPayload): Promise<ReminderResult> {
    console.log("[notifications] would send reminder:", payload);
    return { ok: true, id: "logged-" + Date.now() };
  }
}

/*
// Swap in when the Reminders phase kicks off:
import twilio from "twilio";

class TwilioNotificationService implements NotificationService {
  private client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  async sendReminder(payload: ReminderPayload): Promise<ReminderResult> {
    const from =
      payload.channel === "whatsapp"
        ? `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`
        : process.env.TWILIO_SMS_FROM;
    const to = payload.channel === "whatsapp" ? `whatsapp:${payload.to}` : payload.to;

    try {
      const msg = await this.client.messages.create({ from, to, body: payload.message });
      return { ok: true, id: msg.sid };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }
}
*/

export const notificationService: NotificationService =
  new LoggingNotificationService();
