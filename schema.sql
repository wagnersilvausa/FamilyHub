-- FamilyHub Database Schema
-- Complete schema with all features enabled

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- GASTOS (Expenses) Module
-- ==========================================

CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  valor DECIMAL(10, 2) NOT NULL,
  cartao TEXT NOT NULL,
  motivo TEXT NOT NULL,
  observacao TEXT,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  parcela_atual INTEGER DEFAULT 1,
  parcelas_total INTEGER DEFAULT 1,
  valor_parcela DECIMAL(10, 2),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'quitado', 'urgente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parcelas_futuras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gasto_id UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  mes_referencia TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'quitado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gastos_data ON gastos(data DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_cartao ON gastos(cartao);
CREATE INDEX IF NOT EXISTS idx_gastos_status ON gastos(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_gasto_id ON parcelas_futuras(gasto_id);

-- ==========================================
-- AGENDA (Schedule) Module
-- ==========================================

CREATE TABLE IF NOT EXISTS agenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agenda_data ON agenda(data ASC);
CREATE INDEX IF NOT EXISTS idx_agenda_tipo ON agenda(tipo);

-- ==========================================
-- SAUDE (Health) Module
-- ==========================================

CREATE TABLE IF NOT EXISTS saude_consultas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medico TEXT NOT NULL,
  data DATE NOT NULL,
  observacoes TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  dose TEXT NOT NULL,
  frequencia TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saude_consultas_data ON saude_consultas(data DESC);
CREATE INDEX IF NOT EXISTS idx_medicamentos_nome ON medicamentos(nome);

-- ==========================================
-- DOCUMENTOS (Documents) Module
-- ==========================================

CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  arquivo_url TEXT NOT NULL,
  tipo_arquivo TEXT,
  data DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_subcategoria ON documentos(subcategoria);

-- ==========================================
-- FOTOS (Photos) Module
-- ==========================================

CREATE TABLE IF NOT EXISTS fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT,
  descricao TEXT,
  foto_url TEXT NOT NULL,
  data DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fotos_data ON fotos(data DESC);

-- ==========================================
-- AUDIO (Voice Messages/Records) Module
-- ==========================================

CREATE TABLE IF NOT EXISTS audios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao TEXT,
  audio_url TEXT NOT NULL,
  modulo TEXT NOT NULL,
  duracao INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audios_modulo ON audios(modulo);
CREATE INDEX IF NOT EXISTS idx_audios_created ON audios(created_at DESC);

-- ==========================================
-- RELATORIO (Monthly Reports) Module
-- ==========================================

CREATE TABLE IF NOT EXISTS relatorios_mensais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mes_referencia TEXT NOT NULL UNIQUE,
  gasto_total DECIMAL(10, 2),
  numero_transacoes INTEGER,
  parcelamentos_abertos INTEGER,
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  data_fechamento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_relatorios_mes ON relatorios_mensais(mes_referencia DESC);

-- ==========================================
-- TRIGGERS for automatic updates
-- ==========================================

-- Update timestamp on gastos
CREATE OR REPLACE FUNCTION update_gastos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gastos_timestamp
BEFORE UPDATE ON gastos
FOR EACH ROW
EXECUTE FUNCTION update_gastos_timestamp();

-- Update timestamp on parcelas_futuras
CREATE OR REPLACE FUNCTION update_parcelas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_parcelas_timestamp
BEFORE UPDATE ON parcelas_futuras
FOR EACH ROW
EXECUTE FUNCTION update_parcelas_timestamp();

-- Update timestamp on agenda
CREATE OR REPLACE FUNCTION update_agenda_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agenda_timestamp
BEFORE UPDATE ON agenda
FOR EACH ROW
EXECUTE FUNCTION update_agenda_timestamp();

-- Update timestamp on saude_consultas
CREATE OR REPLACE FUNCTION update_saude_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_saude_timestamp
BEFORE UPDATE ON saude_consultas
FOR EACH ROW
EXECUTE FUNCTION update_saude_timestamp();

-- Update timestamp on medicamentos
CREATE OR REPLACE FUNCTION update_medicamentos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_medicamentos_timestamp
BEFORE UPDATE ON medicamentos
FOR EACH ROW
EXECUTE FUNCTION update_medicamentos_timestamp();

-- Update timestamp on documentos
CREATE OR REPLACE FUNCTION update_documentos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_documentos_timestamp
BEFORE UPDATE ON documentos
FOR EACH ROW
EXECUTE FUNCTION update_documentos_timestamp();

-- Update timestamp on fotos
CREATE OR REPLACE FUNCTION update_fotos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fotos_timestamp
BEFORE UPDATE ON fotos
FOR EACH ROW
EXECUTE FUNCTION update_fotos_timestamp();

-- Update timestamp on audios
CREATE OR REPLACE FUNCTION update_audios_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_audios_timestamp
BEFORE UPDATE ON audios
FOR EACH ROW
EXECUTE FUNCTION update_audios_timestamp();

-- Update timestamp on relatorios_mensais
CREATE OR REPLACE FUNCTION update_relatorios_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_relatorios_timestamp
BEFORE UPDATE ON relatorios_mensais
FOR EACH ROW
EXECUTE FUNCTION update_relatorios_timestamp();

-- ==========================================
-- FUNCTIONS for reports and analytics
-- ==========================================

-- Function to get monthly spending summary
CREATE OR REPLACE FUNCTION get_monthly_spending(mes TEXT)
RETURNS TABLE(
  total_gasto DECIMAL,
  numero_transacoes BIGINT,
  por_cartao JSON,
  por_motivo JSON,
  parcelamentos_abertos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(g.valor), 0)::DECIMAL as total_gasto,
    COUNT(g.id) as numero_transacoes,
    COALESCE(json_object_agg(g.cartao, SUM(g.valor)) FILTER (WHERE g.cartao IS NOT NULL), '{}'::json) as por_cartao,
    COALESCE(json_object_agg(g.motivo, COUNT(*)) FILTER (WHERE g.motivo IS NOT NULL), '{}'::json) as por_motivo,
    COUNT(pf.id) as parcelamentos_abertos
  FROM gastos g
  LEFT JOIN parcelas_futuras pf ON g.id = pf.gasto_id AND pf.status = 'pendente'
  WHERE TO_CHAR(g.data, 'YYYY-MM') = mes;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming events
CREATE OR REPLACE FUNCTION get_upcoming_events(dias_futuros INTEGER DEFAULT 30)
RETURNS TABLE(
  id UUID,
  titulo TEXT,
  tipo TEXT,
  data DATE,
  hora TIME,
  observacao TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.titulo,
    a.tipo,
    a.data,
    a.hora,
    a.observacao
  FROM agenda a
  WHERE a.data >= CURRENT_DATE AND a.data <= CURRENT_DATE + (dias_futuros || ' days')::INTERVAL
  ORDER BY a.data ASC, a.hora ASC;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Row Level Security (RLS) - Optional, can be enabled per need
-- ==========================================

-- Uncomment below to enable RLS
-- ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE parcelas_futuras ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE saude_consultas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE relatorios_mensais ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Sample Data (Optional - remove if not needed)
-- ==========================================

-- INSERT INTO gastos (valor, cartao, motivo, data, horario, status) VALUES
-- (150.00, 'Cartão 1', 'Alimentação', CURRENT_DATE, CURRENT_TIME, 'quitado'),
-- (89.90, 'Cartão 2', 'Mercado', CURRENT_DATE - INTERVAL '1 day', '14:30'::TIME, 'quitado');

-- INSERT INTO agenda (titulo, tipo, data, hora) VALUES
-- ('Consulta Médica', 'Saúde', CURRENT_DATE + INTERVAL '7 days', '10:00'::TIME),
-- ('Aniversário', 'Pessoal', CURRENT_DATE + INTERVAL '15 days', '00:00'::TIME);
