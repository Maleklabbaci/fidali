// ============================================
// FIDALI — Supabase Auto-generated Types
// Generated from schema.sql
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PlanType = 'starter' | 'pro' | 'premium'
export type MerchantStatus = 'pending' | 'active' | 'suspended'
export type ActivityType = 'join' | 'pts' | 'redeem'
export type PointsRuleType = 'visit' | 'da' | 'item' | 'custom'
export type PaymentMethod = 'baridimob' | 'ccp' | 'especes'
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected' | 'expired'
export type NotificationType = 'points_added' | 'reward_reached' | 'reward_redeemed' | 'welcome' | 'presence_refused'

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          updated_at?: string
        }
      }

      merchants: {
        Row: {
          id: string
          auth_user_id: string | null
          email: string
          password_hash: string
          name: string
          business_name: string
          sector: string
          phone: string | null
          logo_url: string | null
          plan: PlanType
          status: MerchantStatus
          welcome_message: string | null
          notifications_enabled: boolean
          email_notifications: boolean
          created_at: string
          updated_at: string
          validated_at: string | null
          last_login_at: string | null
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          email: string
          password_hash: string
          name: string
          business_name: string
          sector?: string
          phone?: string | null
          logo_url?: string | null
          plan?: PlanType
          status?: MerchantStatus
          welcome_message?: string | null
          notifications_enabled?: boolean
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
          validated_at?: string | null
          last_login_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          email?: string
          password_hash?: string
          name?: string
          business_name?: string
          sector?: string
          phone?: string | null
          logo_url?: string | null
          plan?: PlanType
          status?: MerchantStatus
          welcome_message?: string | null
          notifications_enabled?: boolean
          email_notifications?: boolean
          updated_at?: string
          validated_at?: string | null
          last_login_at?: string | null
        }
      }

      loyalty_cards: {
        Row: {
          id: string
          merchant_id: string
          business_name: string
          color1: string
          color2: string
          logo_emoji: string | null
          points_rule: string
          points_rule_type: PointsRuleType
          points_per_visit: number
          reward: string
          max_points: number
          welcome_message: string | null
          code: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          business_name: string
          color1?: string
          color2?: string
          logo_emoji?: string | null
          points_rule?: string
          points_rule_type?: PointsRuleType
          points_per_visit?: number
          reward?: string
          max_points?: number
          welcome_message?: string | null
          code: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          merchant_id?: string
          business_name?: string
          color1?: string
          color2?: string
          logo_emoji?: string | null
          points_rule?: string
          points_rule_type?: PointsRuleType
          points_per_visit?: number
          reward?: string
          max_points?: number
          welcome_message?: string | null
          code?: string
          is_active?: boolean
          updated_at?: string
        }
      }

      clients: {
        Row: {
          id: string
          name: string
          phone: string
          device_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          device_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          phone?: string
          device_token?: string | null
          updated_at?: string
        }
      }

      client_cards: {
        Row: {
          id: string
          client_id: string
          card_id: string
          points: number
          total_points_earned: number
          total_rewards_redeemed: number
          last_validation_at: string | null
          daily_validation_count: number
          last_validation_date: string | null
          presence_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          card_id: string
          points?: number
          total_points_earned?: number
          total_rewards_redeemed?: number
          last_validation_at?: string | null
          daily_validation_count?: number
          last_validation_date?: string | null
          presence_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          points?: number
          total_points_earned?: number
          total_rewards_redeemed?: number
          last_validation_at?: string | null
          daily_validation_count?: number
          last_validation_date?: string | null
          presence_code?: string | null
          updated_at?: string
        }
      }

      activities: {
        Row: {
          id: string
          merchant_id: string
          card_id: string
          client_id: string
          client_card_id: string | null
          type: ActivityType
          points_amount: number | null
          description: string | null
          validated_by: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          card_id: string
          client_id: string
          client_card_id?: string | null
          type: ActivityType
          points_amount?: number | null
          description?: string | null
          validated_by?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          type?: ActivityType
          points_amount?: number | null
          description?: string | null
        }
      }

      pending_presences: {
        Row: {
          id: string
          client_id: string
          client_card_id: string
          card_id: string
          merchant_id: string
          client_name: string
          client_phone: string
          status: string
          points_to_add: number | null
          created_at: string
          resolved_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          client_id: string
          client_card_id: string
          card_id: string
          merchant_id: string
          client_name: string
          client_phone: string
          status?: string
          points_to_add?: number | null
          created_at?: string
          resolved_at?: string | null
          expires_at?: string
        }
        Update: {
          status?: string
          points_to_add?: number | null
          resolved_at?: string | null
        }
      }

      payment_requests: {
        Row: {
          id: string
          merchant_id: string
          requested_plan: PlanType
          payment_method: PaymentMethod
          amount_dzd: number
          contact_name: string
          contact_phone: string
          contact_email: string | null
          status: PaymentStatus
          admin_notes: string | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          merchant_id: string
          requested_plan: PlanType
          payment_method: PaymentMethod
          amount_dzd: number
          contact_name: string
          contact_phone: string
          contact_email?: string | null
          status?: PaymentStatus
          admin_notes?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          requested_plan?: PlanType
          payment_method?: PaymentMethod
          amount_dzd?: number
          status?: PaymentStatus
          admin_notes?: string | null
          processed_at?: string | null
        }
      }

      notifications: {
        Row: {
          id: string
          merchant_id: string | null
          client_id: string | null
          type: NotificationType
          title: string
          message: string
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id?: string | null
          client_id?: string | null
          type: NotificationType
          title: string
          message: string
          data?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }

      saved_cards: {
        Row: {
          id: string
          client_id: string
          client_card_id: string
          card_id: string
          device_token: string
          device_type: string | null
          added_to_apple_wallet: boolean
          added_to_google_wallet: boolean
          created_at: string
          last_accessed_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          client_card_id: string
          card_id: string
          device_token: string
          device_type?: string | null
          added_to_apple_wallet?: boolean
          added_to_google_wallet?: boolean
          created_at?: string
          last_accessed_at?: string | null
        }
        Update: {
          device_type?: string | null
          added_to_apple_wallet?: boolean
          added_to_google_wallet?: boolean
          last_accessed_at?: string | null
        }
      }

      platform_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          value?: Json
          updated_at?: string
        }
      }

      audit_log: {
        Row: {
          id: string
          admin_id: string | null
          merchant_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_value: Json | null
          new_value: Json | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          merchant_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          description?: string | null
          created_at?: string
        }
        Update: never
      }
    }

    Views: {
      merchant_stats: {
        Row: {
          merchant_id: string
          business_name: string
          plan: PlanType
          status: MerchantStatus
          total_cards: number
          total_clients: number
          total_active_points: number
          total_points_distributed: number
          total_rewards: number
          created_at: string
        }
      }

      card_stats: {
        Row: {
          card_id: string
          merchant_id: string
          business_name: string
          code: string
          max_points: number
          client_count: number
          total_active_points: number
          total_points_earned: number
          rewards_redeemed: number
          avg_points_per_client: number
          created_at: string
        }
      }

      top_clients: {
        Row: {
          client_card_id: string
          client_id: string
          client_name: string
          client_phone: string
          merchant_id: string
          business_name: string
          points: number
          total_points_earned: number
          total_rewards_redeemed: number
          max_points: number
          progress_pct: number
          last_validation_at: string | null
          created_at: string
        }
      }

      platform_overview: {
        Row: {
          total_merchants: number
          active_merchants: number
          pending_merchants: number
          suspended_merchants: number
          starter_count: number
          pro_count: number
          premium_count: number
          total_cards: number
          total_clients: number
          total_points: number
          total_rewards: number
          activities_today: number
          activities_week: number
        }
      }

      daily_activity: {
        Row: {
          day: string
          merchant_id: string
          type: ActivityType
          count: number
          total_points: number
        }
      }

      pending_payments: {
        Row: {
          id: string
          merchant_id: string
          requested_plan: PlanType
          payment_method: PaymentMethod
          amount_dzd: number
          contact_name: string
          contact_phone: string
          contact_email: string | null
          status: PaymentStatus
          admin_notes: string | null
          created_at: string
          processed_at: string | null
          business_name: string
          merchant_name: string
          merchant_email: string
          current_plan: PlanType
        }
      }
    }

    Functions: {
      generate_card_code: {
        Args: { biz_name: string }
        Returns: string
      }
      generate_presence_code: {
        Args: Record<string, never>
        Returns: string
      }
      join_card: {
        Args: {
          p_card_code: string
          p_client_name: string
          p_client_phone: string
          p_device_token?: string | null
        }
        Returns: Json
      }
      validate_presence: {
        Args: {
          p_client_card_id: string
          p_points: number
          p_merchant_id: string
        }
        Returns: Json
      }
      redeem_reward: {
        Args: {
          p_client_card_id: string
          p_merchant_id: string
        }
        Returns: Json
      }
      get_merchant_dashboard: {
        Args: { p_merchant_id: string }
        Returns: Json
      }
      expire_pending_presences: {
        Args: Record<string, never>
        Returns: void
      }
    }

    Enums: {
      plan_type: PlanType
      merchant_status: MerchantStatus
      activity_type: ActivityType
      points_rule_type: PointsRuleType
      payment_method: PaymentMethod
      payment_status: PaymentStatus
      notification_type: NotificationType
    }
  }
}

// ============================================
// HELPER TYPES (for frontend use)
// ============================================

export type Merchant = Database['public']['Tables']['merchants']['Row']
export type MerchantInsert = Database['public']['Tables']['merchants']['Insert']
export type MerchantUpdate = Database['public']['Tables']['merchants']['Update']

export type LoyaltyCard = Database['public']['Tables']['loyalty_cards']['Row']
export type LoyaltyCardInsert = Database['public']['Tables']['loyalty_cards']['Insert']
export type LoyaltyCardUpdate = Database['public']['Tables']['loyalty_cards']['Update']

export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']

export type ClientCard = Database['public']['Tables']['client_cards']['Row']
export type ClientCardInsert = Database['public']['Tables']['client_cards']['Insert']
export type ClientCardUpdate = Database['public']['Tables']['client_cards']['Update']

export type Activity = Database['public']['Tables']['activities']['Row']
export type ActivityInsert = Database['public']['Tables']['activities']['Insert']

export type PendingPresence = Database['public']['Tables']['pending_presences']['Row']
export type PaymentRequest = Database['public']['Tables']['payment_requests']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type MerchantStats = Database['public']['Views']['merchant_stats']['Row']
export type CardStats = Database['public']['Views']['card_stats']['Row']
export type TopClient = Database['public']['Views']['top_clients']['Row']
export type PlatformOverview = Database['public']['Views']['platform_overview']['Row']
export type DailyActivity = Database['public']['Views']['daily_activity']['Row']

// ============================================
// PLAN LIMITS (matches platform_settings)
// ============================================

export const PLAN_LIMITS: Record<PlanType, { cards: number; clients: number }> = {
  starter: { cards: 1, clients: 10 },
  pro: { cards: 5, clients: 100 },
  premium: { cards: 999, clients: 99999 },
}

export const PLAN_PRICES: Record<PlanType, number> = {
  starter: 0,
  pro: 4500,
  premium: 9000,
}

export const SECTORS = [
  { value: 'restaurant', label: '🍕 Restaurant / Fast-food' },
  { value: 'cafe', label: '☕ Café / Salon de thé' },
  { value: 'boulangerie', label: '🥖 Boulangerie / Pâtisserie' },
  { value: 'boutique', label: '👗 Boutique / Prêt-à-porter' },
  { value: 'salon', label: '💇 Salon de coiffure / Beauté' },
  { value: 'pharmacie', label: '💊 Pharmacie' },
  { value: 'superette', label: '🛒 Supérette / Épicerie' },
  { value: 'ecommerce', label: '📦 E-commerce' },
  { value: 'gym', label: '💪 Salle de sport' },
  { value: 'librairie', label: '📚 Librairie / Papeterie' },
  { value: 'auto', label: '🚗 Auto / Station lavage' },
  { value: 'autre', label: '🏪 Autre commerce' },
] as const

export const CARD_COLORS = [
  { c1: '#FF6B35', c2: '#FF9A5C', name: 'Orange' },
  { c1: '#4D96FF', c2: '#6BBBFF', name: 'Bleu' },
  { c1: '#6BCB77', c2: '#9EE8A8', name: 'Vert' },
  { c1: '#C77DFF', c2: '#E0AAFF', name: 'Violet' },
  { c1: '#FF6B9D', c2: '#FFB3CD', name: 'Rose' },
  { c1: '#1A1A2E', c2: '#16213E', name: 'Noir' },
  { c1: '#FF9500', c2: '#FFCD00', name: 'Doré' },
  { c1: '#00B4D8', c2: '#90E0EF', name: 'Cyan' },
  { c1: '#E74C3C', c2: '#FF7675', name: 'Rouge' },
  { c1: '#2D3436', c2: '#636E72', name: 'Gris' },
] as const
