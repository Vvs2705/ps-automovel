# Agendar Shorts no YouTube Studio pelo Chrome (Claude in Chrome)

Estado em 2026-11-09: **9 de 20 agendados** (EP01 10/11 12:00 até Calibragem 24/11 18:00). Parou no limite diário de envios de canal não verificado. Faltam, nesta ordem (`agenda.py` tem datas e horários): Gol 03 (26/11 20:00), Pneu sulco e data (27/11 18:00), Cores das luzes (28/11 18:00), Fluido de freio (01/12 12:00), Gol 04 (03/12 18:00), Ponto morto (04/12 18:00), Gol 05 (05/12 20:00), Gol 06 (08/12 20:00), Gol 07 (10/12 18:00), Gol 08 (11/12 18:00), Gol 09 (12/12 12:00). Gol 04–09 só depois de refeitos com ≥ 70 s.

## Método (o upload do Chrome aceita no máximo 10 MB por arquivo)
1. `python agenda.py "<VIDEOS PRONTOS>/PUBLICAR.md" agenda.json` monta título, descrição (+ "Narração com voz sintética; animação desenhada em código." + hashtags), data e hora.
2. `python servidor_videos.py "<VIDEOS PRONTOS>" 8765` serve a pasta só em 127.0.0.1, com CORS só para studio.youtube.com. Copiar `agenda.json` para a pasta como `.agenda.json` enquanto agenda; apagar depois e parar o servidor.
3. No Studio (canal **P.S Automóvel**, conferir antes): abrir "Enviar vídeos"; no console da página, `fetch` do arquivo em `http://127.0.0.1:8765/...` → `File` → `DataTransfer` → `input[type=file]` de `ytcp-uploads-file-picker` → evento `change`.
4. Detalhes por script: `#title-textarea #textbox` e `#description-textarea #textbox` (foco + `execCommand('insertText')`); rádios por `name`: `VIDEO_MADE_FOR_KIDS_NOT_MFK`, `VIDEO_PAID_PRODUCT_PLACEMENT_NO`, `VIDEO_HAS_ALTERED_CONTENT_YES` (abrir antes `#toggle-button` "Exibir configurações avançadas"); `#next-button` 3 vezes; `#second-container-expand-button` (Programar).
5. Data e hora precisam de teclado real: clicar `#datepicker-trigger`, focar o input de `ytcp-date-picker` e digitar "26 de nov. de 2026" + Enter; focar `#time-of-day-container input` e digitar "20:00" + Enter. Conferir o texto dos dois antes de clicar `#done-button`. Fuso: GMT-3 (padrão do Studio).
6. Fechar o aviso "Vídeo programado" ou "Processando vídeo" (botão Fechar) antes do próximo. Um vídeo por lote de ações (lote grande derrubou a conexão).
- Respostas adotadas (estratégia 1.5): não é para crianças; sem promoção paga; "Uso de IA: Sim" por causa da voz sintética realista.
- Melhorar nas próximas: descrições do "Falando de" dizem "fontes na ficha de fatos", que o público não vê; listar as fontes como nos informativos.
