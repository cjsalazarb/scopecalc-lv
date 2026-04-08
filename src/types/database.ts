// Placeholder — replace with generated types after running:
// npx supabase gen types typescript > src/types/database.ts

export type Database = {
  public: {
    Tables: {
      projects: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      project_files: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      system_scopes: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      catalog_items: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      assemblies: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      assembly_items: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      labor_templates: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      estimate_versions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      estimate_lines: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      pricing_rules: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      rfq_packages: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      vendor_quote_lines: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      layer_mappings: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      plan_measurements: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      export_jobs: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
