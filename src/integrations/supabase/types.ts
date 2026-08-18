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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      article_views: {
        Row: {
          article_id: string
          updated_at: string
          views: number
        }
        Insert: {
          article_id: string
          updated_at?: string
          views?: number
        }
        Update: {
          article_id?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_name: string | null
          body: string | null
          category_id: string | null
          contributor_id: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_credit: string | null
          is_editors_pick: boolean
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          read_minutes: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          body?: string | null
          category_id?: string | null
          contributor_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_credit?: string | null
          is_editors_pick?: boolean
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          read_minutes?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          body?: string | null
          category_id?: string | null
          contributor_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_credit?: string | null
          is_editors_pick?: boolean
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          read_minutes?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string
          author_email: string
          author_name: string
          author_surname: string | null
          body: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["comment_status"]
          updated_at: string
        }
        Insert: {
          article_id: string
          author_email: string
          author_name: string
          author_surname?: string | null
          body: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["comment_status"]
          updated_at?: string
        }
        Update: {
          article_id?: string
          author_email?: string
          author_name?: string
          author_surname?: string | null
          body?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["comment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_handled: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_handled?: boolean
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_handled?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      contributors: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          is_published: boolean
          is_team: boolean
          linkedin_url: string | null
          name: string
          role_title: string | null
          slug: string
          sort_order: number
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_published?: boolean
          is_team?: boolean
          linkedin_url?: string | null
          name: string
          role_title?: string | null
          slug: string
          sort_order?: number
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_published?: boolean
          is_team?: boolean
          linkedin_url?: string | null
          name?: string
          role_title?: string | null
          slug?: string
          sort_order?: number
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      photographs: {
        Row: {
          caption: string | null
          created_at: string
          credit: string | null
          id: string
          image_url: string
          is_published: boolean
          sort_order: number
          taken_on: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          credit?: string | null
          id?: string
          image_url: string
          is_published?: boolean
          sort_order?: number
          taken_on?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          credit?: string | null
          id?: string
          image_url?: string
          is_published?: boolean
          sort_order?: number
          taken_on?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      approved_comments: {
        Row: {
          article_id: string | null
          author_name: string | null
          author_surname: string | null
          body: string | null
          created_at: string | null
          id: string | null
        }
        Insert: {
          article_id?: string | null
          author_name?: string | null
          author_surname?: string | null
          body?: string | null
          created_at?: string | null
          id?: string | null
        }
        Update: {
          article_id?: string | null
          author_name?: string | null
          author_surname?: string | null
          body?: string | null
          created_at?: string | null
          id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_view: { Args: { _article_id: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
      comment_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin"],
      comment_status: ["pending", "approved", "rejected"],
    },
  },
} as const
