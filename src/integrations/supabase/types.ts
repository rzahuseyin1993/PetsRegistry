export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          attachment_urls: Json | null
          created_at: string
          id: string
          is_html: boolean
          is_read: boolean
          message: string
          recipient_id: string
          sender_id: string
          subject: string
        }
        Insert: {
          attachment_urls?: Json | null
          created_at?: string
          id?: string
          is_html?: boolean
          is_read?: boolean
          message: string
          recipient_id: string
          sender_id: string
          subject?: string
        }
        Update: {
          attachment_urls?: Json | null
          created_at?: string
          id?: string
          is_html?: boolean
          is_read?: boolean
          message?: string
          recipient_id?: string
          sender_id?: string
          subject?: string
        }
        Relationships: []
      }
      business_listing_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          listing_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          listing_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          listing_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "business_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      business_listings: {
        Row: {
          address: string | null
          category: string
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          is_approved: boolean
          is_featured: boolean
          is_paid: boolean
          name: string
          owner_id: string
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_approved?: boolean
          is_featured?: boolean
          is_paid?: boolean
          name: string
          owner_id: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_approved?: boolean
          is_featured?: boolean
          is_paid?: boolean
          name?: string
          owner_id?: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          created_at: string
          css_content: string
          gjs_data: Json
          html_content: string
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          css_content?: string
          gjs_data?: Json
          html_content?: string
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          css_content?: string
          gjs_data?: Json
          html_content?: string
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_reply: string | null
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          replied_at: string | null
          subject: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          replied_at?: string | null
          subject?: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          replied_at?: string | null
          subject?: string
        }
        Relationships: []
      }
      donation_packages: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donor_email: string | null
          donor_name: string | null
          id: string
          message: string | null
          package_id: string | null
          payment_id: string | null
          payment_method: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          message?: string | null
          package_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          message?: string | null
          package_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "donation_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      flyer_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          payment_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          payment_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          payment_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      flyer_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean
          name: string
          template_type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          template_type?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          template_type?: string
        }
        Relationships: []
      }
      lost_reports: {
        Row: {
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          last_seen_address: string | null
          last_seen_lat: number | null
          last_seen_lng: number | null
          pet_id: string
          reporter_id: string
          reward: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_seen_address?: string | null
          last_seen_lat?: number | null
          last_seen_lng?: number | null
          pet_id: string
          reporter_id: string
          reward?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_seen_address?: string | null
          last_seen_lat?: number | null
          last_seen_lng?: number | null
          pet_id?: string
          reporter_id?: string
          reward?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lost_reports_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          features: Json
          id: string
          is_active: boolean
          name: string
          plan_type: string
          price: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          plan_type?: string
          price?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          plan_type?: string
          price?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          payment_id: string | null
          plan_id: string
          starts_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          payment_id?: string | null
          plan_id: string
          starts_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          payment_id?: string | null
          plan_id?: string
          starts_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          payment_id: string | null
          payment_method: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          id: string
          is_active: boolean
          provider: string
          publishable_key: string | null
          secret_key: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          provider: string
          publishable_key?: string | null
          secret_key?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          is_active?: boolean
          provider?: string
          publishable_key?: string | null
          secret_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pet_adoptions: {
        Row: {
          admin_approved: boolean
          adopter_id: string | null
          adoption_fee: number | null
          created_at: string
          description: string | null
          id: string
          owner_id: string
          pet_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_approved?: boolean
          adopter_id?: string | null
          adoption_fee?: number | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          pet_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_approved?: boolean
          adopter_id?: string | null
          adoption_fee?: number | null
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          pet_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_adoptions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_health_records: {
        Row: {
          created_at: string
          height_cm: number | null
          id: string
          notes: string | null
          pet_id: string
          record_date: string
          temperature: number | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          height_cm?: number | null
          id?: string
          notes?: string | null
          pet_id: string
          record_date?: string
          temperature?: number | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          height_cm?: number | null
          id?: string
          notes?: string | null
          pet_id?: string
          record_date?: string
          temperature?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_health_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          pet_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          pet_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          pet_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "pet_images_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_vaccinations: {
        Row: {
          created_at: string
          date_given: string
          id: string
          next_due_date: string | null
          notes: string | null
          pet_id: string
          vaccine_name: string
          vet_name: string | null
        }
        Insert: {
          created_at?: string
          date_given: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id: string
          vaccine_name: string
          vet_name?: string | null
        }
        Update: {
          created_at?: string
          date_given?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string
          vaccine_name?: string
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: string | null
          breed: string | null
          color: string | null
          created_at: string
          id: string
          microchip_number: string | null
          name: string
          notes: string | null
          owner_id: string
          pet_code: string | null
          species: string
          status: string
          updated_at: string
          weight: string | null
        }
        Insert: {
          age?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          id?: string
          microchip_number?: string | null
          name: string
          notes?: string | null
          owner_id: string
          pet_code?: string | null
          species: string
          status?: string
          updated_at?: string
          weight?: string | null
        }
        Update: {
          age?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          id?: string
          microchip_number?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          pet_code?: string | null
          species?: string
          status?: string
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          race: string | null
          show_name: boolean
          show_phone: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          race?: string | null
          show_name?: boolean
          show_phone?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          race?: string | null
          show_name?: boolean
          show_phone?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_profile: { Args: { _user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
