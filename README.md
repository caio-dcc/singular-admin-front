# Singular — Frontend (React + Vite)

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173. Espera o backend (`../backend`) rodando em http://localhost:4000 — se não encontrar, cai de volta pros dados de exemplo locais (login, Kanban/Tabela e o resto da UI continuam funcionando, só sem persistência).

Para apontar para uma API em outro endereço, crie um `.env` com `VITE_API_BASE=https://sua-api.com/api`.

## Estrutura

```
src/
  App.jsx      - toda a UI e o estado (componente único, como no protótipo original)
  Hoverable.jsx - reproduz os estados de hover do design
  api.js        - chamadas fetch para o backend
  data.js       - textos PT/EN, cores de status, tema, e dados semente de fallback
  style.js      - helper que converte uma string CSS em objeto de estilo React
public/
  singular-selo-1c.png
```

## Notas

- Mesma fidelidade visual do protótipo original: fundo animado em canvas, cores, tipografia (Domine), todas as interações (Scrum/Kanban, busca/filtros, modais, player de música com YouTube IFrame API, playlists).
- Login não valida contra o backend — é só transição de tela local, como no protótipo. Para autenticação real, adicione um endpoint no backend e chame-o em `onSubmit`.
- Player do YouTube: se os embeds forem bloqueados no ambiente (sandbox), o app detecta e mostra "player indisponível" sem travar a UI.
