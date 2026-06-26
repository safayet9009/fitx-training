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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          browser: string | null
          created_at: string
          id: string
          ip: string | null
          metadata: Json | null
          status: string
          target: string | null
        }
        Insert: {
          action: string
          admin_id: string
          browser?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          status?: string
          target?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          browser?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          status?: string
          target?: string | null
        }
        Relationships: []
      }
      admin_pins: {
        Row: {
          created_at: string
          pin_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          pin_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          pin_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          code: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          code: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          code?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      gym_centers: {
        Row: {
          address: string
          city: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          facilities: string[]
          id: string
          is_deleted: boolean
          monthly_fee: number
          name: string
          phone: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          facilities?: string[]
          id?: string
          is_deleted?: boolean
          monthly_fee: number
          name: string
          phone?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          facilities?: string[]
          id?: string
          is_deleted?: boolean
          monthly_fee?: number
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      gym_registrations: {
        Row: {
          amount: number | null
          center_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_deleted: boolean
          payment_method: string | null
          plan: string | null
          processed_at: string | null
          sender_number: string | null
          status: Database["public"]["Enums"]["registration_status"]
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          center_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          payment_method?: string | null
          plan?: string | null
          processed_at?: string | null
          sender_number?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          center_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          payment_method?: string | null
          plan?: string | null
          processed_at?: string | null
          sender_number?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_registrations_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "gym_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bmi: number | null
          created_at: string
          email: string
          height_cm: number | null
          id: string
          last_active_date: string | null
          level: number
          name: string
          phone: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          streak: number
          subscription_type: string
          updated_at: string
          weight_kg: number | null
          xp: number
        }
        Insert: {
          bmi?: number | null
          created_at?: string
          email: string
          height_cm?: number | null
          id: string
          last_active_date?: string | null
          level?: number
          name?: string
          phone?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          streak?: number
          subscription_type?: string
          updated_at?: string
          weight_kg?: number | null
          xp?: number
        }
        Update: {
          bmi?: number | null
          created_at?: string
          email?: string
          height_cm?: number | null
          id?: string
          last_active_date?: string | null
          level?: number
          name?: string
          phone?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          streak?: number
          subscription_type?: string
          updated_at?: string
          weight_kg?: number | null
          xp?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          expires_at: string
          id: string
          is_deleted: boolean
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          sender_number: string | null
          starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          expires_at: string
          id?: string
          is_deleted?: boolean
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          sender_number?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          expires_at?: string
          id?: string
          is_deleted?: boolean
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          sender_number?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories: number
          created_at: string
          distance_km: number | null
          duration_min: number
          exercise_name: string
          id: string
          user_id: string
          workout_type: Database["public"]["Enums"]["workout_type"]
          xp_earned: number
        }
        Insert: {
          calories?: number
          created_at?: string
          distance_km?: number | null
          duration_min?: number
          exercise_name: string
          id?: string
          user_id: string
          workout_type: Database["public"]["Enums"]["workout_type"]
          xp_earned?: number
        }
        Update: {
          calories?: number
          created_at?: string
          distance_km?: number | null
          duration_min?: number
          exercise_name?: string
          id?: string
          user_id?: string
          workout_type?: Database["public"]["Enums"]["workout_type"]
          xp_earned?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_has_pin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          _action: string
          _browser?: string
          _ip?: string
          _metadata?: Json
          _status?: string
          _target?: string
        }
        Returns: undefined
      }
      set_admin_pin: { Args: { _pin: string }; Returns: undefined }
      verify_admin_pin: { Args: { _pin: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      payment_method: "bkash" | "nagad" | "rocket"
      registration_status: "pending" | "approved" | "rejected"
      subscription_plan: "trial" | "monthly" | "quarterly" | "yearly"
      subscription_status: "pending" | "active" | "expired" | "rejected"
      workout_type: "gym" | "running" | "home"
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
      app_role: ["admin", "user"],
      payment_method: ["bkash", "nagad", "rocket"],
      registration_status: ["pending", "approved", "rejected"],
      subscription_plan: ["trial", "monthly", "quarterly", "yearly"],
      subscription_status: ["pending", "active", "expired", "rejected"],
      workout_type: ["gym", "running", "home"],
    },
  },
} as const
