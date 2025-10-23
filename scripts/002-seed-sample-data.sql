-- Insert sample clients
INSERT INTO clients (id, name, phone, email, created_at, updated_at) VALUES
  ('client_001', 'Maria Silva', '(11) 98765-4321', 'maria.silva@email.com', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP),
  ('client_002', 'João Santos', '(11) 97654-3210', 'joao.santos@email.com', CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP),
  ('client_003', 'Ana Costa', '(11) 96543-2109', 'ana.costa@email.com', CURRENT_TIMESTAMP - INTERVAL '2 months', CURRENT_TIMESTAMP),
  ('client_004', 'Pedro Oliveira', '(11) 95432-1098', NULL, CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP),
  ('client_005', 'Carla Souza', '(11) 94321-0987', 'carla.souza@email.com', CURRENT_TIMESTAMP - INTERVAL '3 weeks', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample maintenance orders
INSERT INTO maintenance_orders (id, client_id, equipment, service_title, description, value, internal_cost, status, opened_at, closed_at, next_reminder_at, next_reminder_step, created_at, updated_at) VALUES
  -- Maria Silva - completed maintenance from 6 months ago
  ('maint_001', 'client_001', 'Notebook Dell Inspiron 15', 'Troca de HD por SSD', 'Cliente relatou lentidão extrema. Realizada troca do HD mecânico por SSD 480GB. Instalado Windows 11 e drivers. Sistema operando normalmente.', 450.00, 280.00, 'CONCLUIDA', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP - INTERVAL '6 months' + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 weeks', 'M6', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP),
  
  -- João Santos - maintenance from 4 months ago, reminder at M4
  ('maint_002', 'client_002', 'PC Desktop Custom', 'Limpeza e troca de pasta térmica', 'Computador desligando sozinho. Realizada limpeza completa, troca de pasta térmica do processador e verificação de coolers. Problema resolvido.', 180.00, 35.00, 'CONCLUIDA', CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP - INTERVAL '4 months' + INTERVAL '1 day', CURRENT_TIMESTAMP, 'M4', CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP),
  
  -- Ana Costa - recent maintenance from 2 months ago
  ('maint_003', 'client_003', 'Notebook Lenovo IdeaPad', 'Formatação e instalação de programas', 'Notebook com vírus e lentidão. Realizada formatação completa, instalação do Windows 10, Office 2021 e antivírus. Backup dos arquivos importantes realizado.', 250.00, 0.00, 'CONCLUIDA', CURRENT_TIMESTAMP - INTERVAL '2 months', CURRENT_TIMESTAMP - INTERVAL '2 months' + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '2 months', 'M4', CURRENT_TIMESTAMP - INTERVAL '2 months', CURRENT_TIMESTAMP),
  
  -- Pedro Oliveira - maintenance from 1 month ago
  ('maint_004', 'client_004', 'PC Gamer', 'Upgrade de memória RAM', 'Cliente solicitou upgrade para melhorar performance em jogos. Instalados 16GB RAM DDR4 3200MHz (2x8GB). Testes realizados com sucesso.', 520.00, 380.00, 'CONCLUIDA', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP - INTERVAL '1 month' + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '3 months', 'M4', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP),
  
  -- Carla Souza - open maintenance from 3 weeks ago
  ('maint_005', 'client_005', 'Notebook HP Pavilion', 'Reparo de tela quebrada', 'Tela do notebook quebrada após queda. Aguardando chegada da peça para substituição. Cliente ciente do prazo de 7 dias úteis.', 680.00, 450.00, 'ABERTA', CURRENT_TIMESTAMP - INTERVAL '3 weeks', NULL, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '3 weeks', CURRENT_TIMESTAMP),
  
  -- Maria Silva - another maintenance from 3 months ago
  ('maint_006', 'client_001', 'Impressora HP LaserJet', 'Manutenção preventiva', 'Limpeza interna, troca de rolete e verificação geral. Impressora funcionando perfeitamente.', 150.00, 45.00, 'CONCLUIDA', CURRENT_TIMESTAMP - INTERVAL '3 months', CURRENT_TIMESTAMP - INTERVAL '3 months' + INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '1 month', 'M4', CURRENT_TIMESTAMP - INTERVAL '3 months', CURRENT_TIMESTAMP),
  
  -- João Santos - recent open maintenance
  ('maint_007', 'client_002', 'Notebook Acer Aspire', 'Não liga - diagnóstico', 'Notebook não liga. Em diagnóstico para identificar problema na placa-mãe ou fonte. Previsão de conclusão em 2 dias.', 80.00, 0.00, 'ABERTA', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
