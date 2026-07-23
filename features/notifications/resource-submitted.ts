import "server-only";

import { getManagerEmails } from "@/features/admins/queries";
import { sendEmail } from "@/features/notifications/mailer";

export type SubmittedResource = {
    title: string;
    url: string;
    description: string | null;
    categoryName: string | null;
    submittedByEmail: string | null;
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function row(label: string, value: string): string {
    return `<tr>
        <td style="padding:4px 12px 4px 0;color:#080807;opacity:0.5;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:4px 0;color:#080807;font-size:13px;">${value}</td>
    </tr>`;
}

function buildHtml(resource: SubmittedResource, managerUrl: string): string {
    const title = escapeHtml(resource.title);
    const url = escapeHtml(resource.url);
    const rows = [
        row("Titre", `<strong>${title}</strong>`),
        row("Lien", `<a href="${url}" style="color:#2563eb;">${url}</a>`),
        resource.categoryName
            ? row("Catégorie", escapeHtml(resource.categoryName))
            : "",
        resource.description
            ? row("Description", escapeHtml(resource.description))
            : "",
        resource.submittedByEmail
            ? row("Soumis par", escapeHtml(resource.submittedByEmail))
            : "",
    ]
        .filter(Boolean)
        .join("");

    return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:520px;margin:0 auto;">
        <h1 style="font-size:18px;color:#080807;margin:0 0 4px;">Nouvelle ressource à valider</h1>
        <p style="font-size:13px;color:#080807;opacity:0.6;margin:0 0 16px;">
            Une ressource vient d'être soumise et attend votre validation.
        </p>
        <table style="border-collapse:collapse;margin-bottom:20px;">${rows}</table>
        <a href="${escapeHtml(managerUrl)}"
           style="display:inline-block;background:#080807;color:#fff;text-decoration:none;font-size:13px;padding:10px 18px;border-radius:4px;">
            Ouvrir l'espace manager
        </a>
    </div>`;
}

export async function notifyManagersOfNewResource(
    resource: SubmittedResource,
): Promise<void> {
    const recipients = await getManagerEmails();
    if (recipients.length === 0) return;

    const appUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    const managerUrl = appUrl ? `${appUrl}/manager` : "/manager";

    await sendEmail({
        to: recipients,
        subject: `Nouvelle ressource à valider : ${resource.title}`,
        html: buildHtml(resource, managerUrl),
    });
}
