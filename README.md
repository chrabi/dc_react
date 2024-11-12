# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

Aby uruchomić aplikację React, najpierw musimy skonfigurować projekt. Oto kroki jak to zrobić:

Najpierw stwórz nowy projekt Vite z React:

bashCopynpm create vite@latest datacenter-app -- --template react
cd datacenter-app

Zainstaluj potrzebne zależności. Stwórz plik package.json:

package.json ConfigurationClick to open code

Skonfiguruj Tailwind CSS. Stwórz plik tailwind.config.js:

tailwind.config.jsClick to open code

Stwórz plik postcss.config.js:

postcss.config.jsClick to open code

Teraz wykonaj instalację wszystkich zależności:

bashCopynpm install

Stwórz strukturę katalogów dla komponentów:

bashCopymkdir -p src/components/ui

Dodaj podstawowe style w src/index.css:

src/index.cssClick to open code

Zmodyfikuj src/App.jsx aby używał naszego komponentu:

src/App.jsxClick to open code

Wszystkie komponenty shadcn/ui (Card, Dialog, Select, etc.) muszą być zainstalowane. Możesz je zainstalować używając:

bashCopynpx shadcn-ui@latest init
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add input
npx shadcn-ui@latest add button
npx shadcn-ui@latest add slider

Skopiuj wcześniej wygenerowany kod komponentu DataCenterFloorPlan do pliku src/components/DataCenterFloorPlan.jsx
Teraz możesz uruchomić aplikację:

bashCopynpm run dev
Aplikacja powinna być dostępna pod adresem http://localhost:5173
Jeśli napotkasz jakieś błędy, sprawdź:

Czy wszystkie zależności zostały zainstalowane
Czy struktura katalogów jest poprawna
Czy wszystkie komponenty shadcn/ui zostały prawidłowo zainstalowane
Czy importy w komponentach wskazują na właściwe ścieżki

Możesz też użyć create-react-app zamiast Vite:
bashCopynpx create-react-app datacenter-app
cd datacenter-app
npm install [wszystkie-zaleznosci]
npm start
Ale Vite jest znacznie szybszy w developmencie.
