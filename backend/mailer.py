"""
Envoi d'emails transactionnels pour tuveuxun.expert (accuse de reception lead +
notification a Naim). SMTP via un relais (Brevo recommande : smtp-relay.brevo.com).

Memes noms de variables que le reste de l'ecosysteme (lcoalhost / conspix / tbcity) :
    EMAIL_SERVER_HOST     ex. smtp-relay.brevo.com   (vide = aucun envoi)
    EMAIL_SERVER_PORT     ex. 587 (STARTTLS) ou 465 (SSL)
    EMAIL_SERVER_USER     login SMTP du compte Brevo
    EMAIL_SERVER_PASSWORD cle SMTP Brevo (PAS le mot de passe du compte)
    EMAIL_FROM            expediteur VALIDE dans Brevo (ex. contact@tuveuxun.expert)

Tout est optionnel : sans EMAIL_SERVER_HOST, rien n'est envoye (les leads restent
captes en base). Un echec SMTP n'est jamais propage : l'appelant tourne en
BackgroundTask, apres la reponse HTTP, donc la capture du lead n'est jamais bloquee.
Le port 465 -> SSL direct ; sinon STARTTLS (meme logique que conspix cote Node).
"""
import logging
import os
import smtplib
import ssl
from email.message import EmailMessage

logger = logging.getLogger("mailer")


def _host() -> str:
    return os.getenv("EMAIL_SERVER_HOST", "").strip()


def email_configured() -> bool:
    """Vrai seulement si le relais SMTP est entierement renseigne."""
    return bool(_host() and os.getenv("EMAIL_SERVER_USER") and os.getenv("EMAIL_SERVER_PASSWORD"))


def send_mail(to: str, subject: str, body: str, reply_to: str | None = None) -> bool:
    """Envoie un mail texte. Renvoie True si parti, False sinon (jamais d'exception)."""
    host = _host()
    if not host:
        return False
    port = int(os.getenv("EMAIL_SERVER_PORT", "587"))
    user = os.getenv("EMAIL_SERVER_USER", "")
    password = os.getenv("EMAIL_SERVER_PASSWORD", "")
    sender = os.getenv("EMAIL_FROM", "") or user

    # EmailMessage refuse les en-tetes malformes -> pas d'injection via `to`/`subject`
    # (par ailleurs `to` est deja valide par le schema Pydantic du lead).
    msg = EmailMessage()
    msg["From"] = sender
    msg["To"] = to
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)

    try:
        ctx = ssl.create_default_context()
        if port == 465:
            with smtplib.SMTP_SSL(host, port, timeout=15, context=ctx) as server:
                server.login(user, password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(host, port, timeout=15) as server:
                server.starttls(context=ctx)
                server.login(user, password)
                server.send_message(msg)
        return True
    except Exception as exc:  # deliverabilite non garantie : on log, on ne casse rien
        logger.warning("envoi email echoue (%s -> %s) : %s", subject, to, exc)
        return False
