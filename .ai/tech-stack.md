Frontend - Astro z React dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testy - Kompleksowa strategia zapewnienia jakości:

- Testy jednostkowe:
  - Vitest jako framework testowy zoptymalizowany pod Vite/Astro, kompatybilny z API Jest
  - React Testing Library do testowania komponentów React z naciskiem na interakcje użytkownika
  - @testing-library/dom do testowania interakcji z DOM, niezależnie od frameworka
  - MSW (Mock Service Worker) do mockowania API w testach

- Testy End-to-End:
  - Playwright jako kompleksowe narzędzie wspierające wszystkie nowoczesne przeglądarki
  - Testy scenariuszy użytkownika od logowania po operacje CRUD w Supabase
  - Automatyczna weryfikacja dostępności (WCAG) w testach e2e
  - Integracja z GitHub Actions dla ciągłego testowania

- Testy wydajnościowe:
  - Lighthouse do audytu wydajności, dostępności i SEO
  - Web Vitals do monitorowania kluczowych metryk wydajnościowych
  - Performance API do precyzyjnych pomiarów wydajności w przeglądarce

CI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker
