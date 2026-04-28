# Theming guide

## Syfte

Vi använder theme-variabler för att göra det enkelt att ändra färger, fonter och andra designval på ett ställe.

Målet är att:
- slippa hårdkodade färger i komponenter
- få dark mode att fungera automatiskt
- kunna uppdatera hela appens design från `globals.css`

---

## Grundprincip

Vi delar upp ansvaret så här:

- `layout.tsx`  
  Laddar globala fonts och den övergripande app-strukturen.

- `globals.css`  
  Innehåller våra design tokens, till exempel:
  - färger
  - fonts
  - radius
  - dark mode-variabler

- komponenter  
  Använder Tailwind-klasser som bygger på våra tokens, till exempel:
  - `bg-background`
  - `text-foreground`
  - `bg-primary`
  - `border-border`

---

## Så fungerar det

I `globals.css` definierar vi light mode i `:root` och dark mode i `.dark`.

Exempel:

```css
:root {
  --background: #ffffff;
  --foreground: #111827;
  --primary: #4f46e5;
  --primary-foreground: #ffffff;
  --border: #e5e7eb;
}

.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
  --primary: #818cf8;
  --primary-foreground: #111827;
  --border: #374151;
}

Så när vi skriver css variabler i className skriver vi t.ex bg-background -> Vilket då hämtar sin färg från --background

