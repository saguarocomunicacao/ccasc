# CCA Contabilidade — site institucional

Site estático (HTML, CSS, JS) da CCA Contabilidade, Consultoria e Assessoria.
Direção visual: "Almanaque Fiscal Vivo".

## Estrutura
- `index.html`, `servicos.html`, `sobre.html`, `contato.html`
- `assets/css/site.css` — sistema de design
- `assets/js/site.js` — marcador de vencimento, rail do ano, menu, formulário
- `assets/img/` — logo e ícones

## Rodar localmente
```bash
python3 -m http.server 8745
```
Depois abra http://localhost:8745

## Deploy
Automático via GitHub Actions: cada push na branch `main` publica em
`ccasc.dev.br` (document root do cPanel) por rsync sobre SSH.
