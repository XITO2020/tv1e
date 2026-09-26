# Bot Tv1E — backend tuveuxun.expert

Stack : Ollama (Qwen 2.5 3B Q5_K_M) + FastAPI + RAG inlined FAQ + nginx HTTPS

## Architecture

```
[Browser Next.js Chatbot.tsx]
        ↓ POST /chat { question }
[api.tuveuxun.expert (Nginx + Let's Encrypt + rate limit)]
        ↓ proxy
[FastAPI :8001 /chat]
        ├── slowapi rate limit (8/min/IP)
        ├── sanitize_input (strip injection patterns)
        ├── system prompt + FAQ.md inlined
        ↓
[Ollama :11434 Qwen 2.5 3B Q5_K_M]
        ↓ raw response
[filter_output (anti-leak, anti-jailbreak)]
        ↓ filtered response
[Browser <- JSON { answer, duration_ms }]
```

## Fichiers

- `main.py` — FastAPI app
- `faq.md` — source de verite (inlined dans le system prompt)
- `system_prompt.txt` — persona Tv1E + regles strictes
- `requirements.txt` — deps Python
- `deploy.sh` — script deploiement complet (Ollama + venv + systemd + nginx + certbot)

## Deployment KVM2

```bash
# Sur le VPS root
cd /tmp
git clone https://github.com/XITO2020/tuveuxun-expert-backend.git  # OU upload manuel
cd tuveuxun-expert-backend
chmod +x deploy.sh
./deploy.sh
```

## Test local (sans VPS)

```bash
# Pre-req : Ollama installe localement + Qwen pulled
ollama pull qwen2.5:3b-instruct-q5_K_M

cd backend/
python3 -m venv venv
source venv/bin/activate  # OU venv\Scripts\activate sur Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Test
curl -X POST http://127.0.0.1:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Quels sont vos tarifs ?"}'
```

## Variables d'environnement

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_URL` | `http://127.0.0.1:11434` | URL Ollama |
| `BOT_MODEL` | `qwen2.5:3b-instruct-q5_K_M` | Modele charge |
| `BOT_TEMPERATURE` | `0.5` | Creativite (0.2-0.7) |
| `BOT_MAX_TOKENS` | `400` | Tokens max generes |

## RAM / Performance

- Modele Qwen 2.5 3B Q5_K_M : ~3.5 Go RAM runtime
- FastAPI : ~300 Mo
- Latence : 1-2s par requete sur KVM2 (CPU only)
- Rate limit : 8 req/min/IP (slowapi) + Nginx rate zone

## Securite — 3 couches

1. **Sanitize input** : strip patterns "ignore instructions", "DAN mode", "you are now"
2. **System prompt strict** : refus pattern + perimetre verrouille via FAQ inlined
3. **Output filter** : detecte fuites prompt, api keys, mentions "I'm an AI language model"

## Logs

- Console + fichier `chat.log` dans le working dir (rotation manuelle si necessaire)
- Format : `[IP] Q · question | [IP] R (Xms) · answer`
- Patterns d'injection logges en WARNING

## Routes

- `GET /health` → `{"ok": true, "model": "qwen2.5:3b-..."}`
- `POST /chat` body `{"question": "..."}` → `{"answer": "...", "duration_ms": int}`
