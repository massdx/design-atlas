import "server-only";

import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    if (!client) client = new Resend(apiKey);
    return client;
}

export type SendEmailInput = {
    to: string[];
    subject: string;
    html: string;
};

export async function sendEmail({
    to,
    subject,
    html,
}: SendEmailInput): Promise<{ sent: boolean; error?: string }> {
    const resend = getClient();
    if (!resend) {
        console.warn("[mailer] RESEND_API_KEY manquant, email ignoré");
        return { sent: false, error: "RESEND_API_KEY manquant" };
    }

    const from = process.env.RESOURCE_NOTIFY_FROM;
    if (!from) {
        console.warn("[mailer] RESOURCE_NOTIFY_FROM manquant, email ignoré");
        return { sent: false, error: "RESOURCE_NOTIFY_FROM manquant" };
    }

    if (to.length === 0) return { sent: false, error: "Aucun destinataire" };

    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
        console.error("[mailer] envoi échoué:", error);
        return { sent: false, error: error.message };
    }

    return { sent: true };
}
