# Prompts ComfyUI — tuveuxun.expert

Generation locale 100% gratuite. Output : `assets/generated/tuveuxun/`.

## Setup recommande

| Element | Valeur |
|---|---|
| Sampler | DPM++ 2M Karras |
| Steps | 28-32 |
| CFG | 5.5-7 |
| Seed | -1 (random) ou fixe pour iterations |
| RAM ComfyUI | Fermer Ollama avant lancement |

---

## A. PORTRAITS NOIR & BLANC EQUIPE (6 images)

**Style commun a tous les portraits**

- **Format** : 1024 x 1280 (4:5 portrait) ou 1024 x 1024 (square pour cards equipe)
- **Checkpoint** : `Juggernaut XL v9` (best photoreal SDXL) — fallback `SDXL Base 1.0`
- **LoRA** : aucun (Juggernaut suffit) — sinon `add-detail-xl` faible weight 0.4
- **Negative prompt commun** :
```
color, cartoon, anime, illustration, painting, drawing, blurry, out of focus, distorted face, asymmetric eyes, extra limbs, deformed hands, malformed, bad anatomy, low quality, jpeg artifacts, watermark, text, signature, frame, border, cropped head
```

---

### 01 — Naïm(intervenant principal)

**Prompt positif** :
```
professional black and white portrait photography, 35-40 years old man, sharp focused gaze, mediterranean features, short dark hair, neatly trimmed stubble, dark minimalist turtleneck or tech-wear, soft studio rim lighting from upper left, neutral dark gray background, three-quarter angle, looking slightly off-camera with quiet confidence, 50mm lens, shallow depth of field, sharp focus on eyes, monochrome black and white, high contrast cinematic, Leica style, 8k, photorealistic
```

---

### 02 — Eddy (manager organisationnel)

**Prompt positif** :
```
professional black and white portrait photography, 40-45 years old man, calm assured smile, european features, clean shaven, slightly graying hair short and neat, charcoal blazer over open shirt, soft directional studio light, neutral gray gradient background, three-quarter angle, looking at camera with warmth, 50mm lens, sharp focus on eyes, monochrome black and white, executive editorial portrait, 8k, photorealistic
```

---

### 03 — Manon (lead full-stack)

**Prompt positif** :
```
professional black and white portrait photography, 30-35 years old woman, intelligent focused expression, european features, mid-length straight dark hair, no makeup natural look, simple dark sweater or blazer, soft window light from left, neutral background, three-quarter angle, looking slightly off-camera thoughtful, 50mm lens, sharp focus on eyes, monochrome black and white, editorial tech magazine style, 8k, photorealistic
```

---

### 04 — Alex (Growth Marketer)

**Prompt positif** :
```
professional black and white portrait photography, 28-32 years old androgynous person, calm intelligent gaze, short tousled hair, simple dark hoodie or tshirt, soft natural light, plain studio background, frontal slight angle, looking at camera with quiet intensity, 50mm lens, sharp focus, monochrome black and white, contemporary tech founder portrait, 8k, photorealistic
```

---

### 05 — June (cybersecurite Kali Linux)

**Prompt positif** :
```
professional black and white portrait photography, 30 years old woman, sharp piercing gaze, asymmetric short undercut hair partially shaved, septum nose ring, small geometric tattoo on neck, dark technical jacket, dramatic side lighting creating strong shadows, dark background, three-quarter angle, looking directly at camera with edge, 50mm lens, sharp focus on eyes, monochrome black and white, high contrast noir, hacker aesthetic, 8k, photorealistic
```

---

### 06 — Orland Opal (auteur IA · mentor)

**Prompt positif** :
```
professional black and white portrait photography, 60-65 years old man, wise contemplative expression, salt and pepper neatly trimmed beard, longer silver hair swept back, dark mandarin collar shirt or knit, soft Rembrandt lighting, dark studio background, three-quarter angle, looking off-camera reflective, 50mm lens, sharp focus on eyes with depth, monochrome black and white, mentor philosopher portrait, 8k, photorealistic
```

---

## B. CAROUSEL PIXEL ART — 12 IMAGES

**Style commun**

- **Format** : 768 x 1152 (2:3 portrait, matche les cards 300x450)
- **Checkpoint** : `SDXL Base 1.0`
- **LoRA** : `Pixel-Art-XL` weight 0.9 (essentiel) + optionnel `2D-Game-Sprite` 0.4
- **Steps** : 28-32
- **CFG** : 7-8
- **Negative prompt commun** :
```
blurry, photorealistic, 3d render, photo, smooth gradients, anti-aliasing, modern UI, vector art, cartoon, watermark, text, signature, deformed, low quality, noise, jpeg artifacts, modern photography
```

**Apres generation** : passer chaque image dans Photoshop/Aseprite ou nearest-neighbor downscale puis upscale x2 pour pixel-perfect crispness.

---

### 01 — Findor (agent prospection client)

**Prompt positif** :
```
16-bit pixel art, retro game illustration, an investigator agent in a vintage trench coat with magnifying glass standing in front of a wall of glowing server racks, holographic blue data streams floating around, finding hidden client leads, neon cyan and orange palette, isometric three-quarter view, clean pixel lines, vibrant saturated colors, dramatic lighting, retro futuristic detective aesthetic, vertical composition, pixel art masterpiece
```

---

### 02 — Scrappowin (hacker imprimant des billets)

**Prompt positif** :
```
16-bit pixel art, 1930s noir gangster era hacker scene Dick Tracy style, mysterious figure in fedora hat and pinstripe suit operating a vintage banknote printing press, fresh dollar bills and binary code overlapping, art deco room with stained glass window casting colored light, smoke from cigarette, green digital code raining over old machinery, neon teal accents, isometric view, vibrant retro game palette, vertical composition, pixel art masterpiece
```

---

### 03 — Studio-antiguo (generation image et video)

**Prompt positif** :
```
16-bit pixel art, retro 1980s creative studio room, vintage CRT monitors displaying AI-generated images and video timelines, film reels stacked, drawing tablet glowing, cassette tapes, neon palm trees through window, synthwave purple and teal palette, isometric view, vibrant pixel detail, nostalgic vaporwave aesthetic, vertical composition, pixel art masterpiece
```

---

### 04 — OpenClaw (stack LLM locale)

**Prompt positif** :
```
16-bit pixel art, large mechanical robotic claw descending from above grasping a glowing translucent brain made of flowing binary code and circuits, server farm background with blinking LED lights, electric blue and cyan glow, isometric view, dark dramatic atmosphere, retro tech illustration, vibrant pixel detail, vertical composition, pixel art masterpiece
```

---

### 05 — AgentCron (orchestrateur agents)

**Prompt positif** :
```
16-bit pixel art, ornate antique grandfather clock with golden gears, twelve different small AI robot agents emerging from each hour position around the clock face, each agent doing a different task, gothic library background with bookshelves, candle light warm orange and ticking blue energy, isometric view, vibrant pixel detail, retro fantasy tech, vertical composition, pixel art masterpiece
```

---

### 06 — MairieBot (chatbot citoyen mairie)

**Prompt positif** :
```
16-bit pixel art, beautiful French town hall mairie building with iconic clock tower and tricolor flag waving, cobblestone village square with small fountain, glowing cyan holographic chatbot avatars helping pixel-art citizens, warm sunset light, French village charm with subtle futuristic touches, vibrant retro game palette warm yellows blues whites, isometric three-quarter view, vertical composition, pixel art masterpiece
```

---

### 07 — Reportium (rapports metier auto)

**Prompt positif** :
```
16-bit pixel art, Victorian steampunk office, ornate brass typewriter automatically generating report papers that fly out and stack themselves neatly, brass gears turning, steam puffs, warm gas lamp light, cluttered cozy office desk with ink wells, sepia and brass palette with cyan magical glow, isometric view, vibrant pixel detail, vertical composition, pixel art masterpiece
```

---

### 08 — DocuSweep (classification documents)

**Prompt positif** :
```
16-bit pixel art, magical archive library room, hundreds of documents flying through the air sorting themselves into the correct shelves and drawers, a small android librarian conducting them like an orchestra, soft golden particles, towering bookshelves, mystical organized chaos, warm orange and teal magical palette, isometric view, vibrant pixel detail, vertical composition, pixel art masterpiece
```

---

### 09 — CortexLab (12 cortex 60 agents)

**Prompt positif** :
```
16-bit pixel art, futuristic neural science laboratory, twelve glowing brain cortex displays arranged in a circle connected by pulsing neon wires, holographic agent figures floating, scientist in lab coat at central console, dark high-tech room with cyan and electric purple glow, complex network of cables and screens, isometric view, vibrant pixel detail, vertical composition, pixel art masterpiece
```

---

### 10 — HyperFrames Studio (post-prod video)

**Prompt positif** :
```
16-bit pixel art, retro 1970s film editing suite, vintage video monitors showing video timelines and effects, multiple film cameras on tripods, director chair, stacked film reels, projector beam casting light through dust particles, warm amber and red palette with green editor monitors, isometric three-quarter view, vibrant pixel detail, cinema nostalgia, vertical composition, pixel art masterpiece
```

---

### 11 — TabascoCity (marketplace NFT)

**Prompt positif** :
```
16-bit pixel art, cyberpunk Mexican-inspired city skyline at night, neon-lit NFT art market stalls in foreground with pixelated artwork displayed, hot pepper neon sign glowing red, holographic crypto symbols floating, retrofuturistic adobe buildings with cybernetic upgrades, vibrant red orange and electric purple palette, isometric three-quarter view, atmospheric depth, vertical composition, pixel art masterpiece
```

---

### 12 — Memorial (BDD patrimoine documentaire)

**Prompt positif** :
```
16-bit pixel art, ancient mystical archive vault, floating crystal memory orbs glowing with stored knowledge, holographic historical documents drifting, mystical robed librarian android with glowing eyes, gothic stone room with stained glass, soft golden and deep blue palette with sparkling magical particles, isometric view, vibrant pixel detail, atmospheric depth, vertical composition, pixel art masterpiece
```

---

## Workflow conseille

1. **Lancer ComfyUI** via Pinokio (fermer Ollama avant)
2. **Charger un workflow SDXL standard** (ou DPM++ 2M Karras)
3. **Generer les portraits N&B** d'abord (6 images, ~3-5 min/image en 1024x1280)
4. **Switcher checkpoint** → SDXL Base + LoRA Pixel-Art-XL
5. **Generer les 12 pixel art** (768x1152, ~2-4 min/image)
6. **Post-process pixel art** : ouvrir dans Photoshop/Aseprite, nearest-neighbor downscale x0.5 puis x2 pour pixel-perfect

**Total estime** : ~50 min pour les 18 images en 1 batch.

## Output paths suggeres

```
assets/generated/tuveuxun/
├── team/
│   ├── naim.webp
│   ├── eddy.png
│   ├── manon.png
│   ├── alex.png
│   ├── june.png
│   └── orland-opal.png
└── carousel/
    ├── 01-findor.png
    ├── 02-scrappowin.png
    ├── 03-studio-antiguo.png
    ├── 04-openclaw.png
    ├── 05-agentcron.png
    ├── 06-mairiebot.png
    ├── 07-reportium.png
    ├── 08-docusweep.png
    ├── 09-cortexlab.png
    ├── 10-hyperframes-studio.png
    ├── 11-tabasco-city.png
    └── 12-memorial.png
```

Apres generation, integrer dans le site :
- Portraits → `public/team/*.png` puis remplacer le placeholder gradient des cards
- Pixel art → `public/carousel/*.png` puis remplacer le `<div style={{ background: p.grad }} />` par `<img src={`/carousel/${p.img}`} />`
