"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ADMIN_BUTTON_OUTLINE_CLASS,
    ADMIN_BUTTON_PRIMARY_CLASS,
    ADMIN_DIALOG_CONTENT_CLASS,
    ADMIN_INPUT_CLASS,
    ADMIN_LABEL_CLASS,
} from "@/features/admin/components/admin-styles";
import { inviteAdmin } from "@/features/admins/actions";
import { useMounted } from "@/hooks/use-mounted";
import { PlusIcon } from "@radix-ui/react-icons";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type InviteResult = {
    email: string;
    emailSent: boolean;
};

export function InviteAdminDialog() {
    const mounted = useMounted();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<InviteResult | null>(null);

    function reset() {
        setEmail("");
        setName("");
        setResult(null);
    }

    function submit() {
        const trimmedEmail = email.trim();
        const trimmedName = name.trim();
        if (!trimmedEmail || !trimmedName) return;
        startTransition(async () => {
            const res = await inviteAdmin(trimmedEmail, trimmedName);
            if ("error" in res) {
                toast.error(res.error);
                return;
            }
            setResult({ email: res.email, emailSent: res.emailSent });
            toast.success(`Admin créé : ${res.email}`);
        });
    }

    const trigger = (
        <Button type="button" className={ADMIN_BUTTON_PRIMARY_CLASS}>
            <PlusIcon className="size-3.5" />
            Ajouter un admin
        </Button>
    );

    if (!mounted) return trigger;

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) reset();
            }}
        >
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className={ADMIN_DIALOG_CONTENT_CLASS}>
                {result ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="font-serif text-[22px] leading-none">
                                Admin créé
                            </DialogTitle>
                            <DialogDescription className="text-[12px] text-[#080807]/60">
                                {result.emailSent ? (
                                    <>
                                        Un email a été envoyé à{" "}
                                        <span className="text-[#080807]">
                                            {result.email}
                                        </span>{" "}
                                        pour définir son mot de passe et activer son
                                        accès.
                                    </>
                                ) : (
                                    <>
                                        Le compte de{" "}
                                        <span className="text-[#080807]">
                                            {result.email}
                                        </span>{" "}
                                        est créé, mais l&apos;email de définition du
                                        mot de passe n&apos;a pas pu être envoyé.
                                        Demande-lui d&apos;utiliser &laquo; Mot de
                                        passe oublié &raquo; sur la page de
                                        connexion.
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={reset}
                                className={ADMIN_BUTTON_OUTLINE_CLASS}
                            >
                                Créer un autre admin
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setOpen(false)}
                                className={ADMIN_BUTTON_PRIMARY_CLASS}
                            >
                                Terminé
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="font-serif text-[22px] leading-none">
                                Ajouter un admin
                            </DialogTitle>
                            <DialogDescription className="text-[12px] text-[#080807]/60">
                                Le compte est créé et un email lui est envoyé pour
                                définir son mot de passe.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="admin-email"
                                    className={ADMIN_LABEL_CLASS}
                                >
                                    Email
                                </Label>
                                <Input
                                    id="admin-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            submit();
                                        }
                                    }}
                                    placeholder="email@exemple.com"
                                    autoFocus
                                    disabled={isPending}
                                    className={ADMIN_INPUT_CLASS}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="admin-name"
                                    className={ADMIN_LABEL_CLASS}
                                >
                                    Nom
                                </Label>
                                <Input
                                    id="admin-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            submit();
                                        }
                                    }}
                                    placeholder="Prénom Nom"
                                    disabled={isPending}
                                    className={ADMIN_INPUT_CLASS}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                                variant="outline"
                                className={ADMIN_BUTTON_OUTLINE_CLASS}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="button"
                                onClick={submit}
                                disabled={
                                    isPending || !email.trim() || !name.trim()
                                }
                                variant="default"
                                className={ADMIN_BUTTON_PRIMARY_CLASS}
                            >
                                {isPending ? "Création..." : "Créer l'admin"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
