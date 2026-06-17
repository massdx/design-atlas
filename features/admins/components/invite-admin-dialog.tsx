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
} from "@/components/ui/custom-dialog";
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

export function InviteAdminDialog() {
    const mounted = useMounted();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isPending, startTransition] = useTransition();

    function submit() {
        const trimmed = email.trim();
        if (!trimmed) return;
        startTransition(async () => {
            const res = await inviteAdmin(trimmed, name);
            if ("error" in res) {
                toast.error(res.error);
                return;
            }
            toast.success(`Invitation envoyée à ${res.email}`);
            setEmail("");
            setName("");
            setOpen(false);
        });
    }

    const trigger = (
        <Button type="button" className={ADMIN_BUTTON_PRIMARY_CLASS}>
            <PlusIcon className="size-3.5" />
            Inviter un admin
        </Button>
    );

    if (!mounted) return trigger;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className={ADMIN_DIALOG_CONTENT_CLASS}>
                <DialogHeader>
                    <DialogTitle className="font-serif text-[22px] leading-none">
                        Inviter un admin
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-[#080807]/60">
                        L'accès sera activé dès sa première connexion avec cet email.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor="admin-email" className={ADMIN_LABEL_CLASS}>
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
                        <Label htmlFor="admin-name" className={ADMIN_LABEL_CLASS}>
                            Nom (optionnel)
                        </Label>
                        <Input
                            id="admin-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                        className={ADMIN_BUTTON_OUTLINE_CLASS}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={isPending || !email.trim()}
                        className={ADMIN_BUTTON_PRIMARY_CLASS}
                    >
                        {isPending ? "Envoi..." : "Inviter"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
