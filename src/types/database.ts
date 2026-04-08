export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          client: string | null
          location: string | null
          status: 'draft' | 'active' | 'closed'
          disciplines: string[]
          floors: number
          display_unit: 'ft' | 'm'
          notes: string | null
          active_version_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          client?: string | null
          location?: string | null
          status?: 'draft' | 'active' | 'closed'
          disciplines?: string[]
          floors?: number
          display_unit?: 'ft' | 'm'
          notes?: string | null
          active_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          client?: string | null
          location?: string | null
          status?: 'draft' | 'active' | 'closed'
          disciplines?: string[]
          floors?: number
          display_unit?: 'ft' | 'm'
          notes?: string | null
          active_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_files: {
        Row: {
          id: string
          project_id: string | null
          floor_number: number | null
          file_label: string | null
          file_type: 'dxf' | 'pdf' | null
          storage_path: string | null
          scale_type: 'ratio' | 'architectural' | 'manual' | null
          scale_ratio: number | null
          scale_arch: string | null
          scale_factor: number | null
          scale_unit: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          floor_number?: number | null
          file_label?: string | null
          file_type?: 'dxf' | 'pdf' | null
          storage_path?: string | null
          scale_type?: 'ratio' | 'architectural' | 'manual' | null
          scale_ratio?: number | null
          scale_arch?: string | null
          scale_factor?: number | null
          scale_unit?: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          floor_number?: number | null
          file_label?: string | null
          file_type?: 'dxf' | 'pdf' | null
          storage_path?: string | null
          scale_type?: 'ratio' | 'architectural' | 'manual' | null
          scale_ratio?: number | null
          scale_arch?: string | null
          scale_factor?: number | null
          scale_unit?: string
          uploaded_at?: string
        }
      }
      system_scopes: {
        Row: {
          id: string
          project_id: string | null
          discipline: 'cctv' | 'acs' | 'intrusion' | 'fire_alarm' | null
          form_data: Json
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          discipline?: 'cctv' | 'acs' | 'intrusion' | 'fire_alarm' | null
          form_data?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          discipline?: 'cctv' | 'acs' | 'intrusion' | 'fire_alarm' | null
          form_data?: Json
          updated_at?: string
        }
      }
      catalog_items: {
        Row: {
          id: string
          category: string
          brand: string | null
          model: string | null
          description: string
          unit: string
          ref_price: number | null
          last_quote_price: number | null
          labor_hours_per_unit: number
          is_active: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          brand?: string | null
          model?: string | null
          description: string
          unit?: string
          ref_price?: number | null
          last_quote_price?: number | null
          labor_hours_per_unit?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          brand?: string | null
          model?: string | null
          description?: string
          unit?: string
          ref_price?: number | null
          last_quote_price?: number | null
          labor_hours_per_unit?: number
          is_active?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      assemblies: {
        Row: {
          id: string
          name: string
          discipline: string | null
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          discipline?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          discipline?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      assembly_items: {
        Row: {
          id: string
          assembly_id: string | null
          catalog_item_id: string | null
          quantity: number
          notes: string | null
        }
        Insert: {
          id?: string
          assembly_id?: string | null
          catalog_item_id?: string | null
          quantity?: number
          notes?: string | null
        }
        Update: {
          id?: string
          assembly_id?: string | null
          catalog_item_id?: string | null
          quantity?: number
          notes?: string | null
        }
      }
      labor_templates: {
        Row: {
          id: string
          discipline: string | null
          item_type: string | null
          base_hours: number
          factor_retrofit: number
          factor_occupied: number
          factor_height: number
          factor_night: number
        }
        Insert: {
          id?: string
          discipline?: string | null
          item_type?: string | null
          base_hours: number
          factor_retrofit?: number
          factor_occupied?: number
          factor_height?: number
          factor_night?: number
        }
        Update: {
          id?: string
          discipline?: string | null
          item_type?: string | null
          base_hours?: number
          factor_retrofit?: number
          factor_occupied?: number
          factor_height?: number
          factor_night?: number
        }
      }
      estimate_versions: {
        Row: {
          id: string
          project_id: string | null
          version_label: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          version_label?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          version_label?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      estimate_lines: {
        Row: {
          id: string
          estimate_version_id: string | null
          catalog_item_id: string | null
          assembly_id: string | null
          description: string | null
          quantity: number
          unit_material_cost: number
          unit_labor_hours: number
          override_note: string | null
          source: string
          snapshot_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          estimate_version_id?: string | null
          catalog_item_id?: string | null
          assembly_id?: string | null
          description?: string | null
          quantity?: number
          unit_material_cost?: number
          unit_labor_hours?: number
          override_note?: string | null
          source?: string
          snapshot_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          estimate_version_id?: string | null
          catalog_item_id?: string | null
          assembly_id?: string | null
          description?: string | null
          quantity?: number
          unit_material_cost?: number
          unit_labor_hours?: number
          override_note?: string | null
          source?: string
          snapshot_data?: Json | null
          created_at?: string
        }
      }
      pricing_rules: {
        Row: {
          id: string
          project_id: string | null
          overhead_pct: number
          contingency_pct: number
          markup_pct: number
          tax_pct: number
          labor_rate_per_hr: number
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          overhead_pct?: number
          contingency_pct?: number
          markup_pct?: number
          tax_pct?: number
          labor_rate_per_hr?: number
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          overhead_pct?: number
          contingency_pct?: number
          markup_pct?: number
          tax_pct?: number
          labor_rate_per_hr?: number
          updated_at?: string
        }
      }
      rfq_packages: {
        Row: {
          id: string
          estimate_version_id: string | null
          vendor_name: string | null
          sent_at: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          estimate_version_id?: string | null
          vendor_name?: string | null
          sent_at?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          estimate_version_id?: string | null
          vendor_name?: string | null
          sent_at?: string | null
          status?: string
          created_at?: string
        }
      }
      vendor_quote_lines: {
        Row: {
          id: string
          rfq_package_id: string | null
          catalog_item_id: string | null
          unit_price: number | null
          lead_time_days: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          rfq_package_id?: string | null
          catalog_item_id?: string | null
          unit_price?: number | null
          lead_time_days?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          rfq_package_id?: string | null
          catalog_item_id?: string | null
          unit_price?: number | null
          lead_time_days?: number | null
          notes?: string | null
        }
      }
      layer_mappings: {
        Row: {
          id: string
          project_file_id: string | null
          layer_name: string | null
          system_type: string | null
          mapping_type: 'cable_route' | 'device' | 'other' | null
        }
        Insert: {
          id?: string
          project_file_id?: string | null
          layer_name?: string | null
          system_type?: string | null
          mapping_type?: 'cable_route' | 'device' | 'other' | null
        }
        Update: {
          id?: string
          project_file_id?: string | null
          layer_name?: string | null
          system_type?: string | null
          mapping_type?: 'cable_route' | 'device' | 'other' | null
        }
      }
      plan_measurements: {
        Row: {
          id: string
          project_id: string | null
          project_file_id: string | null
          floor: number | null
          cable_type: string | null
          total_ft: number | null
          drops_count: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          project_file_id?: string | null
          floor?: number | null
          cable_type?: string | null
          total_ft?: number | null
          drops_count?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          project_file_id?: string | null
          floor?: number | null
          cable_type?: string | null
          total_ft?: number | null
          drops_count?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      export_jobs: {
        Row: {
          id: string
          project_id: string | null
          estimate_version_id: string | null
          export_type: string | null
          file_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          estimate_version_id?: string | null
          export_type?: string | null
          file_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          estimate_version_id?: string | null
          export_type?: string | null
          file_path?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
