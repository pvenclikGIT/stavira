# 🏗️ Stavira

Stavební management pro Staviru s.r.o. — správa projektů, klientů, rozpočtů a etap stavby.

**Lokalita:** Praha-Vinoř a okolí (Kbely, Satalice, Letňany, Čakovice, Klánovice).

---

## 🚀 Tech stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** s vlastním design systémem
- **React Router 6** (HashRouter pro GitHub Pages)
- **localStorage** perzistence (žádný backend)
- **lucide-react** pro ikony

## 📦 Instalace

```bash
npm install
npm run dev
```

Aplikace poběží na [http://localhost:5173/stavira/](http://localhost:5173/stavira/).

## 🔑 Demo přihlášení

Aplikace má 4 demo profily:

| Role            | Jméno           | PIN  |
|-----------------|-----------------|------|
| Majitel         | Petr Venclík    | 1111 |
| Stavbyvedoucí   | Martin Kovář    | 2222 |
| Účetní          | Lenka Nováková  | 3333 |
| Klient          | Pavel Novák     | 4444 |

## 📋 Implementované moduly

- ✅ **Dashboard** — KPI, aktivní projekty, blížící se termíny, alerts
- ✅ **Projekty** — list, detail, etapy, rozpočet vs. skutečnost, časový postup
- ✅ **Klienti** — list, detail, propojení s projekty
- ✅ **Login** — výběr profilu + PIN

## 🛠️ Roadmap

Postupně budou doplněny tyto moduly:

- [ ] Etapy s drag & drop a editací
- [ ] Materiálový sklad
- [ ] Tým + docházka
- [ ] Ganttův diagram
- [ ] Zálohové faktury (30 % → průběžné → doplatek)
- [ ] Fotodeník stavby
- [ ] Vícepráce se schvalováním klientem
- [ ] Subdodavatelé
- [ ] Klientský portál (omezený přístup)

## 🚢 Nasazení na GitHub Pages

1. Vytvoř nový repo `stavira` na GitHubu (uživatel `pvenclikGIT`).
2. Spusť:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/pvenclikGIT/stavira.git
   git push -u origin main
   ```

3. V repo: **Settings → Pages → Source: GitHub Actions**.
4. Workflow `.github/workflows/deploy.yml` automaticky postaví a nasadí aplikaci.

URL: `https://pvenclikGIT.github.io/stavira/`

## 📁 Struktura projektu

```
src/
├── components/      # Reusable UI (Modal, Badge, ProgressBar…)
├── pages/           # Routovatelné obrazovky
├── context/         # AppContext (global state)
├── data/            # seed.js (demo data + konstanty)
├── hooks/           # useLocalStorage
├── utils/           # format.js (currency, dates)
├── App.jsx          # Router + Auth gate
└── main.jsx         # Entry point
```

## 💾 localStorage klíče

Všechna data jsou perzistovaná pod prefixem `stavira:v1:` (pro budoucí migrace).

```
stavira:v1:projects
stavira:v1:clients
stavira:v1:users
stavira:v1:currentUser
```

Reset dat: smazat localStorage v devtools nebo zavolat `resetAllData()` z `useApp()`.
