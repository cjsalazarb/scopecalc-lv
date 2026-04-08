-- ScopeCalc LV — Schema completo
-- Ejecutar en Supabase SQL Editor

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT,
  location TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  disciplines TEXT[] DEFAULT '{}',
  floors INTEGER DEFAULT 1,
  display_unit TEXT DEFAULT 'ft' CHECK (display_unit IN ('ft','m')),
  notes TEXT,
  active_version_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  floor_number INTEGER,
  file_label TEXT,
  file_type TEXT CHECK (file_type IN ('dxf','pdf')),
  storage_path TEXT,
  scale_type TEXT CHECK (scale_type IN ('ratio','architectural','manual')),
  scale_ratio NUMERIC,
  scale_arch TEXT,
  scale_factor NUMERIC,
  scale_unit TEXT DEFAULT 'ft',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  discipline TEXT CHECK (discipline IN ('cctv','acs','intrusion','fire_alarm')),
  form_data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, discipline)
);

CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  description TEXT NOT NULL,
  unit TEXT DEFAULT 'ea',
  ref_price NUMERIC,
  last_quote_price NUMERIC,
  labor_hours_per_unit NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assemblies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  discipline TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assembly_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_id UUID REFERENCES assemblies(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES catalog_items(id),
  quantity NUMERIC NOT NULL DEFAULT 1,
  notes TEXT
);

CREATE TABLE labor_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline TEXT,
  item_type TEXT,
  base_hours NUMERIC NOT NULL,
  factor_retrofit NUMERIC DEFAULT 1.25,
  factor_occupied NUMERIC DEFAULT 1.15,
  factor_height NUMERIC DEFAULT 1.10,
  factor_night NUMERIC DEFAULT 1.20
);

CREATE TABLE estimate_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL DEFAULT 'V1',
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE estimate_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_version_id UUID REFERENCES estimate_versions(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES catalog_items(id),
  assembly_id UUID REFERENCES assemblies(id),
  description TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_material_cost NUMERIC DEFAULT 0,
  unit_labor_hours NUMERIC DEFAULT 0,
  override_note TEXT,
  source TEXT DEFAULT 'manual',
  snapshot_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  overhead_pct NUMERIC DEFAULT 10,
  contingency_pct NUMERIC DEFAULT 5,
  markup_pct NUMERIC DEFAULT 20,
  tax_pct NUMERIC DEFAULT 0,
  labor_rate_per_hr NUMERIC DEFAULT 65,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rfq_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_version_id UUID REFERENCES estimate_versions(id) ON DELETE CASCADE,
  vendor_name TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vendor_quote_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_package_id UUID REFERENCES rfq_packages(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES catalog_items(id),
  unit_price NUMERIC,
  lead_time_days INTEGER,
  notes TEXT
);

CREATE TABLE layer_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_file_id UUID REFERENCES project_files(id) ON DELETE CASCADE,
  layer_name TEXT,
  system_type TEXT,
  mapping_type TEXT CHECK (mapping_type IN ('cable_route','device','other'))
);

CREATE TABLE plan_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  project_file_id UUID REFERENCES project_files(id),
  floor INTEGER,
  cable_type TEXT,
  total_ft NUMERIC,
  drops_count INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  estimate_version_id UUID REFERENCES estimate_versions(id),
  export_type TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_system_scopes_updated
  BEFORE UPDATE ON system_scopes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pricing_rules_updated
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_projects" ON projects FOR ALL USING (TRUE);
CREATE POLICY "allow_all_catalog" ON catalog_items FOR ALL USING (TRUE);
