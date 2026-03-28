# GOV-ARCHIVE - Quick Reference Guide

## Architecture at a Glance

### Component Stack
```
LoginModal → FensterManager → 8 Main Windows
                              ├── GovTerminal (Advanced command handler)
                              ├── FileExplorer (Virtual filesystem)
                              ├── SurveillanceCenter (Monitoring UI)
                              ├── ArchiveViewer (Timeline + Docs)
                              ├── DatabaseBrowser (SQL police DB) ← GitHub
                              ├── ExploitLab (Security templates) ← GitHub
                              ├── MailClient (Email sim)
                              └── DeepDesktop (Secret tier: 7 BA-III programs)
```

### Key Technologies
- **Frontend:** React 18 + Vite
- **State:** Zustand (lightweight)
- **UI:** Material-UI + TailwindCSS
- **Terminal:** XTerm.js (github) or custom (stable)
- **Maps:** React-Leaflet + D3.js (HIVE-MIND module)
- **Animation:** Framer Motion

## Feature Comparison Matrix

### Stable Version (Old)
- ✅ Basic terminal (static commands)
- ✅ File explorer
- ✅ Surveillance center
- ✅ Archive viewer
- ✅ HIVE-MIND map module
- ❌ Database browser
- ❌ Exploit lab
- ❌ Windows XP theme
- ❌ Advanced progress tracking

### GitHub Version (Advanced)
- ✅ Advanced terminal (async handlers, progress)
- ✅ All stable features
- ✅ DatabaseBrowser (POLIZEI-DB-NRW with 3 tables)
- ✅ ExploitLab (5 templates + vulnerability scanner)
- ✅ Windows XP authentic theme
- ✅ Enhanced APT installer (realistic 15-20sec)
- ✅ Zustand + React Query
- ✅ Organized state/ → features/ → ui/ structure

## Data Models

### Database Tables (Hardcoded)
```javascript
// POLIZEI-DB-NRW: German police database simulation
PERSONEN        → 8 suspects (names, addresses, status, case numbers)
FAHNDUNGEN      → 4 investigations (crime, priority, details)
AKTEN           → 5 case files (classification: VERTRAULICH/GEHEIM/STRENG GEHEIM)
```

### Terminal Flow States
```
null → "apt-confirm" → "deep-password" → normal command mode
```

### File System
```
/akten_2001.txt, /akte_4711.dos, /geheim/, /backup/
```

## Critical Commands (GitHub Terminal)

| Command | Purpose | Flow |
|---------|---------|------|
| `help` | Show all commands | Instant |
| `dbconnect` | Open database browser | 2-3 sec |
| `exploitlab` | Open exploit module | 1 sec |
| `apt install eternalblue` | Realistic package install | 15-20 sec (3 packages) |
| `securelogin` | Access BA-III deep system | Password gate |
| `secscan` / `smbscan` | Network security scan | 5-10 sec |
| `clear` | Clear terminal | Instant |

## Integration Opportunities

### 1. HIVE-MIND (Location Intelligence)
- Integrate map into DatabaseBrowser
- Geographic queries on suspect data
- Heatmap layers + transportation overlay
- Real-time location correlation

### 2. ENIGMA (Encryption Manager)
- Simulate BitLocker/LUKS operations
- Add encryption commands to terminal
- Create "encrypt drive" workflow
- Simulate recovery key generation

### 3. Network-main (If applicable)
- Virtual network topology
- IDS/IPS alerts
- Traffic analysis visuals

## Known Gaps

❌ **No data persistence** (localStorage/IndexedDB)
❌ **No audit logging** (despite "protokolliert" messages)
❌ **No complete search/filter** across databases
❌ **No user profiles** (single access level)
❌ **No report generation** (PDF/CSV export)
❌ **Limited keyboard navigation** (stable version)
❌ **Not scalable** (hardcoded data in components)

## Development Recommendations

### Priority 1: Foundation
```
1. Merge stable ← → github versions
2. Create data/fixtures/ directory
3. Implement localStorage persistence
4. Standardize component styling
```

### Priority 2: Enhancement
```
1. Integrate HIVE-MIND geolocation
2. Complete ExploitLab scenarios
3. Add audit logging system
4. Build search functionality
```

### Priority 3: Polish
```
1. Optimize performance (virtualization)
2. Add comprehensive keyboard shortcuts
3. Create tutorial/onboarding
4. Expand case file dataset (50+)
```

## File Structure (GitHub - Recommended)

```
src/
├── App.jsx                          # Root component
├── components/
│   ├── GovTerminal.jsx             # Terminal engine
│   ├── DatabaseBrowser.jsx         # SQL interface
│   ├── ExploitLab.jsx              # Security module
│   ├── FensterManager.jsx          # Window manager
│   ├── DeepDesktop.jsx             # Secret tier
│   ├── FileExplorer.jsx
│   ├── SurveillanceCenter.jsx
│   ├── ArchiveViewer.jsx
│   ├── MailClient.jsx
│   ├── HiveMindMap.jsx
│   └── [...20+ more components]
├── features/
│   ├── LocationForm.jsx
│   └── StatusChart.jsx
├── state/
│   └── hive.js                     # Zustand store
├── api/
│   ├── hive.js
│   └── queryProvider.js            # React Query
├── ui/
│   └── useNotification.js
├── utils/
├── assets/
├── styles.css
└── main.jsx
```

## Dependencies by Category

### Core UI
- react, react-dom, @mui/material, @emotion/*

### State Management
- zustand, @tanstack/react-query

### Visualization
- d3, cytoscape, react-leaflet, react-simple-maps

### Terminal
- xterm, react-console-emulator

### Utilities
- date-fns, fuse.js, uuid, localforage, pino, winston

### Build
- vite, tailwindcss, postcss

## Testing Data

### Sample Database Entries
```
Person: Müller, Hans (P-2024-001)
  Status: GESUCHT
  Delikt: Betrug (€45.000)
  Priority: HOCH
  Case: AZ-K-2024-1547 [VERTRAULICH]

Network: 192.168.1.247:1433 (Fake police DB)
CVEs: CVE-2017-0144 (EternalBlue)
      CVE-2019-0708 (BlueKeep)
      CVE-2021-44228 (Log4Shell)
```

## Next Steps for Development

1. **Review PROJECT_ANALYSIS.md** (comprehensive 12-section analysis)
2. **Choose primary version** (recommend GitHub)
3. **Plan data layer** (fixtures → persistence)
4. **Map feature integrations** (HIVE-MIND, ENIGMA)
5. **Set sprint schedule** (est. 4-8 weeks to production)

---

Generated: March 29, 2026
