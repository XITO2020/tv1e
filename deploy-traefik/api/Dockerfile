FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ /app/
# shared/evolution (propositions de MAJ 120 EUR) est optionnel : le bot tourne
# sans (try/except dans main.py). A rebrancher plus tard si besoin.
# uvicorn en loopback ; le conteneur tourne en network_mode: host, donc
# Traefik (host) joint 127.0.0.1:8001 et le bot joint Ollama sur 127.0.0.1:11434.
CMD ["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001", "--workers", "1"]
