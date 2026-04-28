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
      ingredients: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
          unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          unit: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          unit?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          carbs_g: number | null
          created_at: string | null
          custom_name: string | null
          fat_g: number | null
          id: string
          kcal: number | null
          logged_date: string
          meal_type: string
          notes: string | null
          protein_g: number | null
          recipe_id: string | null
          total_cost: number | null
          user_id: string
        }
        Insert: {
          carbs_g?: number | null
          created_at?: string | null
          custom_name?: string | null
          fat_g?: number | null
          id?: string
          kcal?: number | null
          logged_date: string
          meal_type?: string
          notes?: string | null
          protein_g?: number | null
          recipe_id?: string | null
          total_cost?: number | null
          user_id: string
        }
        Update: {
          carbs_g?: number | null
          created_at?: string | null
          custom_name?: string | null
          fat_g?: number | null
          id?: string
          kcal?: number | null
          logged_date?: string
          meal_type?: string
          notes?: string | null
          protein_g?: number | null
          recipe_id?: string | null
          total_cost?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_totals"
            referencedColumns: ["recipe_id"]
          },
          {
            foreignKeyName: "meal_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_entries: {
        Row: {
          created_at: string | null
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          id: string
          meal_plan_id: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          recipe_id: string
          servings: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          id?: string
          meal_plan_id: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          recipe_id: string
          servings?: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          id?: string
          meal_plan_id?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          recipe_id?: string
          servings?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_entries_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "daily_macro_summary"
            referencedColumns: ["meal_plan_id"]
          },
          {
            foreignKeyName: "meal_plan_entries_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_totals"
            referencedColumns: ["recipe_id"]
          },
          {
            foreignKeyName: "meal_plan_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          daily_carbs: number | null
          daily_fat: number | null
          daily_kcal: number | null
          daily_protein: number | null
          display_name: string | null
          id: string
          updated_at: string | null
          weekly_budget: number | null
        }
        Insert: {
          created_at?: string | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_kcal?: number | null
          daily_protein?: number | null
          display_name?: string | null
          id: string
          updated_at?: string | null
          weekly_budget?: number | null
        }
        Update: {
          created_at?: string | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_kcal?: number | null
          daily_protein?: number | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          weekly_budget?: number | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          carbs_per_unit: number | null
          created_at: string | null
          fat_per_unit: number | null
          id: string
          ingredient_id: string
          kcal_per_unit: number | null
          notes: string | null
          price_per_unit: number | null
          protein_per_unit: number | null
          quantity: number
          recipe_id: string
        }
        Insert: {
          carbs_per_unit?: number | null
          created_at?: string | null
          fat_per_unit?: number | null
          id?: string
          ingredient_id: string
          kcal_per_unit?: number | null
          notes?: string | null
          price_per_unit?: number | null
          protein_per_unit?: number | null
          quantity: number
          recipe_id: string
        }
        Update: {
          carbs_per_unit?: number | null
          created_at?: string | null
          fat_per_unit?: number | null
          id?: string
          ingredient_id?: string
          kcal_per_unit?: number | null
          notes?: string | null
          price_per_unit?: number | null
          protein_per_unit?: number | null
          quantity?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_totals"
            referencedColumns: ["recipe_id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time_mins: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_favourite: boolean | null
          prep_time_mins: number | null
          servings: number
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cook_time_mins?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_favourite?: boolean | null
          prep_time_mins?: number | null
          servings?: number
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cook_time_mins?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_favourite?: boolean | null
          prep_time_mins?: number | null
          servings?: number
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_items: {
        Row: {
          category: string | null
          created_at: string | null
          custom_item: string | null
          estimated_cost: number | null
          id: string
          ingredient_id: string | null
          is_checked: boolean | null
          list_id: string
          notes: string | null
          quantity: number
          sort_order: number | null
          unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          custom_item?: string | null
          estimated_cost?: number | null
          id?: string
          ingredient_id?: string | null
          is_checked?: boolean | null
          list_id: string
          notes?: string | null
          quantity: number
          sort_order?: number | null
          unit: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          custom_item?: string | null
          estimated_cost?: number | null
          id?: string
          ingredient_id?: string | null
          is_checked?: boolean | null
          list_id?: string
          notes?: string | null
          quantity?: number
          sort_order?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          generated_at: string | null
          id: string
          meal_plan_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          generated_at?: string | null
          id?: string
          meal_plan_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          generated_at?: string | null
          id?: string
          meal_plan_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: true
            referencedRelation: "daily_macro_summary"
            referencedColumns: ["meal_plan_id"]
          },
          {
            foreignKeyName: "shopping_lists_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: true
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spend_logs: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          description: string
          id: string
          spend_date: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          spend_date: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          spend_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_macro_summary: {
        Row: {
          day_cost: number | null
          day_of_week: Database["public"]["Enums"]["day_of_week"] | null
          meal_plan_id: string | null
          total_carbs_g: number | null
          total_fat_g: number | null
          total_kcal: number | null
          total_protein_g: number | null
          user_id: string | null
          week_start_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_totals: {
        Row: {
          carbs_per_serving_g: number | null
          cost_per_serving: number | null
          fat_per_serving_g: number | null
          kcal_per_serving: number | null
          protein_per_serving_g: number | null
          recipe_id: string | null
          servings: number | null
          title: string | null
          total_carbs_g: number | null
          total_cost: number | null
          total_fat_g: number | null
          total_kcal: number | null
          total_protein_g: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_spend_summary: {
        Row: {
          budget_remaining: number | null
          item_count: number | null
          meal_plan_id: string | null
          total_estimated_spend: number | null
          user_id: string | null
          week_start_date: string | null
          weekly_budget: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: true
            referencedRelation: "daily_macro_summary"
            referencedColumns: ["meal_plan_id"]
          },
          {
            foreignKeyName: "shopping_lists_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: true
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
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
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
    },
  },
} as const
