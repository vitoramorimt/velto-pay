export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          affiliate_id: string;
          code: string;
          commission_rate_bps: number;
          cookie_window_days: number;
          created_at: string;
          id: string;
          producer_id: string;
          product_id: string;
          status: Database["public"]["Enums"]["affiliate_link_status"];
          updated_at: string;
        };
        Insert: {
          affiliate_id: string;
          code: string;
          commission_rate_bps?: number;
          cookie_window_days?: number;
          created_at?: string;
          id?: string;
          producer_id: string;
          product_id: string;
          status?: Database["public"]["Enums"]["affiliate_link_status"];
          updated_at?: string;
        };
        Update: {
          affiliate_id?: string;
          code?: string;
          commission_rate_bps?: number;
          cookie_window_days?: number;
          created_at?: string;
          id?: string;
          producer_id?: string;
          product_id?: string;
          status?: Database["public"]["Enums"]["affiliate_link_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "affiliate_links_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "affiliate_links_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "affiliate_links_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      affiliates: {
        Row: {
          created_at: string;
          id: string;
          status: Database["public"]["Enums"]["affiliate_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["affiliate_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["affiliate_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      checkouts: {
        Row: {
          badges: Json;
          created_at: string;
          description: string | null;
          headline: string | null;
          id: string;
          order_bump_enabled: boolean;
          primary_color: string | null;
          producer_id: string;
          product_id: string;
          published_at: string | null;
          slug: string;
          status: Database["public"]["Enums"]["checkout_status"];
          theme: string;
          updated_at: string;
          upsell_enabled: boolean;
        };
        Insert: {
          badges?: Json;
          created_at?: string;
          description?: string | null;
          headline?: string | null;
          id?: string;
          order_bump_enabled?: boolean;
          primary_color?: string | null;
          producer_id: string;
          product_id: string;
          published_at?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["checkout_status"];
          theme?: string;
          updated_at?: string;
          upsell_enabled?: boolean;
        };
        Update: {
          badges?: Json;
          created_at?: string;
          description?: string | null;
          headline?: string | null;
          id?: string;
          order_bump_enabled?: boolean;
          primary_color?: string | null;
          producer_id?: string;
          product_id?: string;
          published_at?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["checkout_status"];
          theme?: string;
          updated_at?: string;
          upsell_enabled?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "checkouts_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checkouts_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      checkout_offers: {
        Row: {
          amount_cents: number;
          badge_text: string | null;
          checkout_id: string;
          created_at: string;
          currency: string;
          description: string | null;
          id: string;
          metadata: Json;
          offer_type: Database["public"]["Enums"]["checkout_offer_type"];
          position: number;
          producer_id: string;
          status: Database["public"]["Enums"]["checkout_offer_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          badge_text?: string | null;
          checkout_id: string;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          metadata?: Json;
          offer_type: Database["public"]["Enums"]["checkout_offer_type"];
          position?: number;
          producer_id: string;
          status?: Database["public"]["Enums"]["checkout_offer_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          badge_text?: string | null;
          checkout_id?: string;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          metadata?: Json;
          offer_type?: Database["public"]["Enums"]["checkout_offer_type"];
          position?: number;
          producer_id?: string;
          status?: Database["public"]["Enums"]["checkout_offer_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checkout_offers_checkout_id_fkey";
            columns: ["checkout_id"];
            isOneToOne: false;
            referencedRelation: "checkouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checkout_offers_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      checkout_pixels: {
        Row: {
          checkout_id: string;
          config: Json;
          created_at: string;
          id: string;
          pixel_id: string;
          producer_id: string;
          provider: Database["public"]["Enums"]["checkout_pixel_provider"];
          status: Database["public"]["Enums"]["checkout_offer_status"];
          updated_at: string;
        };
        Insert: {
          checkout_id: string;
          config?: Json;
          created_at?: string;
          id?: string;
          pixel_id: string;
          producer_id: string;
          provider: Database["public"]["Enums"]["checkout_pixel_provider"];
          status?: Database["public"]["Enums"]["checkout_offer_status"];
          updated_at?: string;
        };
        Update: {
          checkout_id?: string;
          config?: Json;
          created_at?: string;
          id?: string;
          pixel_id?: string;
          producer_id?: string;
          provider?: Database["public"]["Enums"]["checkout_pixel_provider"];
          status?: Database["public"]["Enums"]["checkout_offer_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checkout_pixels_checkout_id_fkey";
            columns: ["checkout_id"];
            isOneToOne: false;
            referencedRelation: "checkouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checkout_pixels_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      checkout_tracking_events: {
        Row: {
          checkout_id: string;
          created_at: string;
          event_type: string;
          id: string;
          producer_id: string;
          referrer: string | null;
          session_id: string | null;
          user_agent: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_medium: string | null;
          utm_source: string | null;
          utm_term: string | null;
        };
        Insert: {
          checkout_id: string;
          created_at?: string;
          event_type?: string;
          id?: string;
          producer_id: string;
          referrer?: string | null;
          session_id?: string | null;
          user_agent?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          utm_term?: string | null;
        };
        Update: {
          checkout_id?: string;
          created_at?: string;
          event_type?: string;
          id?: string;
          producer_id?: string;
          referrer?: string | null;
          session_id?: string | null;
          user_agent?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          utm_term?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "checkout_tracking_events_checkout_id_fkey";
            columns: ["checkout_id"];
            isOneToOne: false;
            referencedRelation: "checkouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checkout_tracking_events_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      commissions: {
        Row: {
          affiliate_id: string;
          amount_cents: number;
          available_at: string | null;
          commission_rate_bps: number;
          created_at: string;
          currency: string;
          id: string;
          order_id: string;
          paid_at: string | null;
          payment_id: string | null;
          status: Database["public"]["Enums"]["commission_status"];
          updated_at: string;
        };
        Insert: {
          affiliate_id: string;
          amount_cents: number;
          available_at?: string | null;
          commission_rate_bps: number;
          created_at?: string;
          currency?: string;
          id?: string;
          order_id: string;
          paid_at?: string | null;
          payment_id?: string | null;
          status?: Database["public"]["Enums"]["commission_status"];
          updated_at?: string;
        };
        Update: {
          affiliate_id?: string;
          amount_cents?: number;
          available_at?: string | null;
          commission_rate_bps?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          order_id?: string;
          paid_at?: string | null;
          payment_id?: string | null;
          status?: Database["public"]["Enums"]["commission_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          created_at: string;
          document: string | null;
          email: string;
          id: string;
          name: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          document?: string | null;
          email: string;
          id?: string;
          name: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          document?: string | null;
          email?: string;
          id?: string;
          name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      coupon_redemptions: {
        Row: {
          coupon_id: string;
          created_at: string;
          customer_email: string;
          discount_cents: number;
          id: string;
          order_id: string;
          redeemed_at: string | null;
          status: Database["public"]["Enums"]["coupon_redemption_status"];
          updated_at: string;
        };
        Insert: {
          coupon_id: string;
          created_at?: string;
          customer_email: string;
          discount_cents: number;
          id?: string;
          order_id: string;
          redeemed_at?: string | null;
          status?: Database["public"]["Enums"]["coupon_redemption_status"];
          updated_at?: string;
        };
        Update: {
          coupon_id?: string;
          created_at?: string;
          customer_email?: string;
          discount_cents?: number;
          id?: string;
          order_id?: string;
          redeemed_at?: string | null;
          status?: Database["public"]["Enums"]["coupon_redemption_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          checkout_id: string | null;
          code: string;
          created_at: string;
          discount_type: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value: number;
          expires_at: string | null;
          id: string;
          max_redemptions: number | null;
          metadata: Json;
          producer_id: string;
          status: Database["public"]["Enums"]["coupon_status"];
          updated_at: string;
        };
        Insert: {
          checkout_id?: string | null;
          code: string;
          created_at?: string;
          discount_type: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value: number;
          expires_at?: string | null;
          id?: string;
          max_redemptions?: number | null;
          metadata?: Json;
          producer_id: string;
          status?: Database["public"]["Enums"]["coupon_status"];
          updated_at?: string;
        };
        Update: {
          checkout_id?: string | null;
          code?: string;
          created_at?: string;
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"];
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          max_redemptions?: number | null;
          metadata?: Json;
          producer_id?: string;
          status?: Database["public"]["Enums"]["coupon_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupons_checkout_id_fkey";
            columns: ["checkout_id"];
            isOneToOne: false;
            referencedRelation: "checkouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coupons_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      ledger_entries: {
        Row: {
          amount_cents: number;
          available_at: string | null;
          commission_id: string | null;
          created_at: string;
          currency: string;
          description: string | null;
          direction: Database["public"]["Enums"]["ledger_entry_direction"];
          entry_type: Database["public"]["Enums"]["ledger_entry_type"];
          id: string;
          metadata: Json;
          order_id: string | null;
          payment_id: string | null;
          producer_id: string;
          withdrawal_id: string | null;
        };
        Insert: {
          amount_cents: number;
          available_at?: string | null;
          commission_id?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          direction: Database["public"]["Enums"]["ledger_entry_direction"];
          entry_type: Database["public"]["Enums"]["ledger_entry_type"];
          id?: string;
          metadata?: Json;
          order_id?: string | null;
          payment_id?: string | null;
          producer_id: string;
          withdrawal_id?: string | null;
        };
        Update: {
          amount_cents?: number;
          available_at?: string | null;
          commission_id?: string | null;
          created_at?: string;
          currency?: string;
          description?: string | null;
          direction?: Database["public"]["Enums"]["ledger_entry_direction"];
          entry_type?: Database["public"]["Enums"]["ledger_entry_type"];
          id?: string;
          metadata?: Json;
          order_id?: string | null;
          payment_id?: string | null;
          producer_id?: string;
          withdrawal_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_entries_commission_id_fkey";
            columns: ["commission_id"];
            isOneToOne: false;
            referencedRelation: "commissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_entries_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_entries_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_entries_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_entries_withdrawal_id_fkey";
            columns: ["withdrawal_id"];
            isOneToOne: false;
            referencedRelation: "withdrawals";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          affiliate_id: string | null;
          affiliate_link_id: string | null;
          checkout_id: string;
          created_at: string;
          currency: string;
          customer_id: string;
          discount_cents: number;
          external_reference: string | null;
          id: string;
          metadata: Json;
          payment_method: Database["public"]["Enums"]["payment_method"] | null;
          producer_id: string;
          product_id: string;
          status: Database["public"]["Enums"]["order_status"];
          subtotal_cents: number;
          total_cents: number;
          updated_at: string;
        };
        Insert: {
          affiliate_id?: string | null;
          affiliate_link_id?: string | null;
          checkout_id: string;
          created_at?: string;
          currency?: string;
          customer_id: string;
          discount_cents?: number;
          external_reference?: string | null;
          id?: string;
          metadata?: Json;
          payment_method?: Database["public"]["Enums"]["payment_method"] | null;
          producer_id: string;
          product_id: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents: number;
          total_cents: number;
          updated_at?: string;
        };
        Update: {
          affiliate_id?: string | null;
          affiliate_link_id?: string | null;
          checkout_id?: string;
          created_at?: string;
          currency?: string;
          customer_id?: string;
          discount_cents?: number;
          external_reference?: string | null;
          id?: string;
          metadata?: Json;
          payment_method?: Database["public"]["Enums"]["payment_method"] | null;
          producer_id?: string;
          product_id?: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents?: number;
          total_cents?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_affiliate_id_fkey";
            columns: ["affiliate_id"];
            isOneToOne: false;
            referencedRelation: "affiliates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_affiliate_link_id_fkey";
            columns: ["affiliate_link_id"];
            isOneToOne: false;
            referencedRelation: "affiliate_links";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_checkout_id_fkey";
            columns: ["checkout_id"];
            isOneToOne: false;
            referencedRelation: "checkouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_preferences: {
        Row: {
          chargebacks_enabled: boolean;
          created_at: string;
          failed_payments_enabled: boolean;
          financial_enabled: boolean;
          id: string;
          pix_enabled: boolean;
          producer_id: string;
          refunds_enabled: boolean;
          sales_enabled: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          chargebacks_enabled?: boolean;
          created_at?: string;
          failed_payments_enabled?: boolean;
          financial_enabled?: boolean;
          id?: string;
          pix_enabled?: boolean;
          producer_id: string;
          refunds_enabled?: boolean;
          sales_enabled?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          chargebacks_enabled?: boolean;
          created_at?: string;
          failed_payments_enabled?: boolean;
          financial_enabled?: boolean;
          id?: string;
          pix_enabled?: boolean;
          producer_id?: string;
          refunds_enabled?: boolean;
          sales_enabled?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_preferences_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_subscriptions: {
        Row: {
          auth: string;
          created_at: string;
          enabled: boolean;
          endpoint: string;
          id: string;
          last_used_at: string | null;
          p256dh: string;
          platform: string | null;
          producer_id: string;
          updated_at: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          auth: string;
          created_at?: string;
          enabled?: boolean;
          endpoint: string;
          id?: string;
          last_used_at?: string | null;
          p256dh: string;
          platform?: string | null;
          producer_id: string;
          updated_at?: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          auth?: string;
          created_at?: string;
          enabled?: boolean;
          endpoint?: string;
          id?: string;
          last_used_at?: string | null;
          p256dh?: string;
          platform?: string | null;
          producer_id?: string;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_subscriptions_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          data: Json;
          event_type: Database["public"]["Enums"]["notification_event_type"];
          id: string;
          producer_id: string;
          read_at: string | null;
          sent_at: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          data?: Json;
          event_type: Database["public"]["Enums"]["notification_event_type"];
          id?: string;
          producer_id: string;
          read_at?: string | null;
          sent_at?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          data?: Json;
          event_type?: Database["public"]["Enums"]["notification_event_type"];
          id?: string;
          producer_id?: string;
          read_at?: string | null;
          sent_at?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      outbox_events: {
        Row: {
          aggregate_id: string | null;
          aggregate_type: string;
          attempts: number;
          available_at: string;
          created_at: string;
          event_type: string;
          id: string;
          last_error: string | null;
          locked_at: string | null;
          payload: Json;
          processed_at: string | null;
          status: Database["public"]["Enums"]["outbox_event_status"];
          updated_at: string;
        };
        Insert: {
          aggregate_id?: string | null;
          aggregate_type: string;
          attempts?: number;
          available_at?: string;
          created_at?: string;
          event_type: string;
          id?: string;
          last_error?: string | null;
          locked_at?: string | null;
          payload?: Json;
          processed_at?: string | null;
          status?: Database["public"]["Enums"]["outbox_event_status"];
          updated_at?: string;
        };
        Update: {
          aggregate_id?: string | null;
          aggregate_type?: string;
          attempts?: number;
          available_at?: string;
          created_at?: string;
          event_type?: string;
          id?: string;
          last_error?: string | null;
          locked_at?: string | null;
          payload?: Json;
          processed_at?: string | null;
          status?: Database["public"]["Enums"]["outbox_event_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          created_at: string;
          event_type: string;
          external_event_id: string | null;
          id: string;
          payload: Json;
          payment_id: string | null;
          processed_at: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          received_at: string;
          status: Database["public"]["Enums"]["payment_event_status"];
        };
        Insert: {
          created_at?: string;
          event_type: string;
          external_event_id?: string | null;
          id?: string;
          payload?: Json;
          payment_id?: string | null;
          processed_at?: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          received_at?: string;
          status?: Database["public"]["Enums"]["payment_event_status"];
        };
        Update: {
          created_at?: string;
          event_type?: string;
          external_event_id?: string | null;
          id?: string;
          payload?: Json;
          payment_id?: string | null;
          processed_at?: string | null;
          provider?: Database["public"]["Enums"]["payment_provider"];
          received_at?: string;
          status?: Database["public"]["Enums"]["payment_event_status"];
        };
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          external_payment_id: string | null;
          fee_cents: number;
          id: string;
          idempotency_key: string | null;
          method: Database["public"]["Enums"]["payment_method"];
          net_amount_cents: number;
          order_id: string;
          paid_at: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_checkout_url: string | null;
          provider_environment: Database["public"]["Enums"]["payment_environment"];
          provider_payload: Json;
          provider_reference: string | null;
          raw_provider_status: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          external_payment_id?: string | null;
          fee_cents?: number;
          id?: string;
          idempotency_key?: string | null;
          method: Database["public"]["Enums"]["payment_method"];
          net_amount_cents: number;
          order_id: string;
          paid_at?: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_checkout_url?: string | null;
          provider_environment?: Database["public"]["Enums"]["payment_environment"];
          provider_payload?: Json;
          provider_reference?: string | null;
          raw_provider_status?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          external_payment_id?: string | null;
          fee_cents?: number;
          id?: string;
          idempotency_key?: string | null;
          method?: Database["public"]["Enums"]["payment_method"];
          net_amount_cents?: number;
          order_id?: string;
          paid_at?: string | null;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_checkout_url?: string | null;
          provider_environment?: Database["public"]["Enums"]["payment_environment"];
          provider_payload?: Json;
          provider_reference?: string | null;
          raw_provider_status?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      refunds: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          external_refund_id: string | null;
          id: string;
          order_id: string;
          payment_id: string;
          producer_id: string;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_environment: Database["public"]["Enums"]["payment_environment"];
          provider_payload: Json;
          reason: string | null;
          refunded_at: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          external_refund_id?: string | null;
          id?: string;
          order_id: string;
          payment_id: string;
          producer_id: string;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_environment?: Database["public"]["Enums"]["payment_environment"];
          provider_payload?: Json;
          reason?: string | null;
          refunded_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          external_refund_id?: string | null;
          id?: string;
          order_id?: string;
          payment_id?: string;
          producer_id?: string;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_environment?: Database["public"]["Enums"]["payment_environment"];
          provider_payload?: Json;
          reason?: string | null;
          refunded_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "refunds_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "refunds_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      producers: {
        Row: {
          brand_name: string | null;
          company_name: string | null;
          created_at: string;
          document: string | null;
          id: string;
          status: Database["public"]["Enums"]["producer_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          brand_name?: string | null;
          company_name?: string | null;
          created_at?: string;
          document?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["producer_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          brand_name?: string | null;
          company_name?: string | null;
          created_at?: string;
          document?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["producer_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "producers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          created_at: string;
          currency: string;
          delivery_url: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
          price_cents: number;
          producer_id: string;
          product_type: Database["public"]["Enums"]["product_type"];
          slug: string;
          status: Database["public"]["Enums"]["product_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          delivery_url?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          price_cents: number;
          producer_id: string;
          product_type?: Database["public"]["Enums"]["product_type"];
          slug: string;
          status?: Database["public"]["Enums"]["product_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          delivery_url?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          price_cents?: number;
          producer_id?: string;
          product_type?: Database["public"]["Enums"]["product_type"];
          slug?: string;
          status?: Database["public"]["Enums"]["product_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          external_transaction_id: string | null;
          id: string;
          order_id: string;
          payment_id: string;
          processed_at: string | null;
          producer_id: string;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_environment: Database["public"]["Enums"]["payment_environment"];
          provider_payload: Json;
          status: Database["public"]["Enums"]["payment_status"];
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          external_transaction_id?: string | null;
          id?: string;
          order_id: string;
          payment_id: string;
          processed_at?: string | null;
          producer_id: string;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_environment?: Database["public"]["Enums"]["payment_environment"];
          provider_payload?: Json;
          status?: Database["public"]["Enums"]["payment_status"];
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          external_transaction_id?: string | null;
          id?: string;
          order_id?: string;
          payment_id?: string;
          processed_at?: string | null;
          producer_id?: string;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_environment?: Database["public"]["Enums"]["payment_environment"];
          provider_payload?: Json;
          status?: Database["public"]["Enums"]["payment_status"];
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["user_status"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      webhooks: {
        Row: {
          created_at: string;
          error_message: string | null;
          event_type: string;
          external_event_id: string | null;
          id: string;
          payload: Json;
          processed_at: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_environment: Database["public"]["Enums"]["payment_environment"];
          received_at: string;
          signature_valid: boolean;
          status: Database["public"]["Enums"]["payment_event_status"];
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          event_type: string;
          external_event_id?: string | null;
          id?: string;
          payload?: Json;
          processed_at?: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_environment?: Database["public"]["Enums"]["payment_environment"];
          received_at?: string;
          signature_valid?: boolean;
          status?: Database["public"]["Enums"]["payment_event_status"];
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          event_type?: string;
          external_event_id?: string | null;
          id?: string;
          payload?: Json;
          processed_at?: string | null;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_environment?: Database["public"]["Enums"]["payment_environment"];
          received_at?: string;
          signature_valid?: boolean;
          status?: Database["public"]["Enums"]["payment_event_status"];
        };
        Relationships: [];
      };
      platform_revenue: {
        Row: {
          created_at: string;
          gateway_fee_amount_cents: number;
          gross_amount_cents: number;
          id: string;
          net_amount_to_producer_cents: number;
          order_id: string | null;
          payment_id: string | null;
          platform_fee_amount_cents: number;
          producer_id: string;
          status: Database["public"]["Enums"]["payment_status"];
        };
        Insert: {
          created_at?: string;
          gateway_fee_amount_cents?: number;
          gross_amount_cents?: number;
          id?: string;
          net_amount_to_producer_cents?: number;
          order_id?: string | null;
          payment_id?: string | null;
          platform_fee_amount_cents?: number;
          producer_id: string;
          status?: Database["public"]["Enums"]["payment_status"];
        };
        Update: {
          created_at?: string;
          gateway_fee_amount_cents?: number;
          gross_amount_cents?: number;
          id?: string;
          net_amount_to_producer_cents?: number;
          order_id?: string | null;
          payment_id?: string | null;
          platform_fee_amount_cents?: number;
          producer_id?: string;
          status?: Database["public"]["Enums"]["payment_status"];
        };
        Relationships: [
          {
            foreignKeyName: "platform_revenue_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "platform_revenue_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: true;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "platform_revenue_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: {
          available_balance_cents: number;
          created_at: string;
          id: string;
          pending_balance_cents: number;
          producer_id: string;
          total_fees_paid_cents: number;
          total_received_cents: number;
          total_withdrawn_cents: number;
          updated_at: string;
        };
        Insert: {
          available_balance_cents?: number;
          created_at?: string;
          id?: string;
          pending_balance_cents?: number;
          producer_id: string;
          total_fees_paid_cents?: number;
          total_received_cents?: number;
          total_withdrawn_cents?: number;
          updated_at?: string;
        };
        Update: {
          available_balance_cents?: number;
          created_at?: string;
          id?: string;
          pending_balance_cents?: number;
          producer_id?: string;
          total_fees_paid_cents?: number;
          total_received_cents?: number;
          total_withdrawn_cents?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: true;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      wallet_transactions: {
        Row: {
          available_at: string | null;
          created_at: string;
          description: string | null;
          gateway_fee_amount_cents: number;
          gross_amount_cents: number;
          id: string;
          metadata: Json;
          net_amount_cents: number;
          order_id: string | null;
          payment_id: string | null;
          platform_fee_amount_cents: number;
          producer_id: string;
          status: Database["public"]["Enums"]["wallet_transaction_status"];
          type: Database["public"]["Enums"]["wallet_transaction_type"];
          updated_at: string;
          wallet_id: string;
          withdrawal_request_id: string | null;
        };
        Insert: {
          available_at?: string | null;
          created_at?: string;
          description?: string | null;
          gateway_fee_amount_cents?: number;
          gross_amount_cents?: number;
          id?: string;
          metadata?: Json;
          net_amount_cents?: number;
          order_id?: string | null;
          payment_id?: string | null;
          platform_fee_amount_cents?: number;
          producer_id: string;
          status: Database["public"]["Enums"]["wallet_transaction_status"];
          type: Database["public"]["Enums"]["wallet_transaction_type"];
          updated_at?: string;
          wallet_id: string;
          withdrawal_request_id?: string | null;
        };
        Update: {
          available_at?: string | null;
          created_at?: string;
          description?: string | null;
          gateway_fee_amount_cents?: number;
          gross_amount_cents?: number;
          id?: string;
          metadata?: Json;
          net_amount_cents?: number;
          order_id?: string | null;
          payment_id?: string | null;
          platform_fee_amount_cents?: number;
          producer_id?: string;
          status?: Database["public"]["Enums"]["wallet_transaction_status"];
          type?: Database["public"]["Enums"]["wallet_transaction_type"];
          updated_at?: string;
          wallet_id?: string;
          withdrawal_request_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wallet_transactions_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wallet_transactions_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wallet_transactions_withdrawal_request_id_fkey";
            columns: ["withdrawal_request_id"];
            isOneToOne: false;
            referencedRelation: "withdrawal_requests";
            referencedColumns: ["id"];
          },
        ];
      };
      withdrawal_requests: {
        Row: {
          amount_cents: number;
          bank_name: string | null;
          created_at: string;
          failed_reason: string | null;
          holder_document: string;
          holder_name: string;
          id: string;
          metadata: Json;
          pix_key: string;
          pix_key_type: Database["public"]["Enums"]["pix_key_type"];
          processed_at: string | null;
          producer_id: string;
          requested_at: string;
          status: Database["public"]["Enums"]["withdrawal_status"];
          updated_at: string;
          wallet_id: string;
        };
        Insert: {
          amount_cents: number;
          bank_name?: string | null;
          created_at?: string;
          failed_reason?: string | null;
          holder_document: string;
          holder_name: string;
          id?: string;
          metadata?: Json;
          pix_key: string;
          pix_key_type: Database["public"]["Enums"]["pix_key_type"];
          processed_at?: string | null;
          producer_id: string;
          requested_at?: string;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          updated_at?: string;
          wallet_id: string;
        };
        Update: {
          amount_cents?: number;
          bank_name?: string | null;
          created_at?: string;
          failed_reason?: string | null;
          holder_document?: string;
          holder_name?: string;
          id?: string;
          metadata?: Json;
          pix_key?: string;
          pix_key_type?: Database["public"]["Enums"]["pix_key_type"];
          processed_at?: string | null;
          producer_id?: string;
          requested_at?: string;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          updated_at?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "withdrawal_requests_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      withdrawal_settings: {
        Row: {
          created_at: string;
          default_bank_name: string | null;
          default_holder_document: string | null;
          default_holder_name: string | null;
          default_pix_key: string | null;
          default_pix_key_type:
            | Database["public"]["Enums"]["pix_key_type"]
            | null;
          id: string;
          producer_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_bank_name?: string | null;
          default_holder_document?: string | null;
          default_holder_name?: string | null;
          default_pix_key?: string | null;
          default_pix_key_type?:
            | Database["public"]["Enums"]["pix_key_type"]
            | null;
          id?: string;
          producer_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_bank_name?: string | null;
          default_holder_document?: string | null;
          default_holder_name?: string | null;
          default_pix_key?: string | null;
          default_pix_key_type?:
            | Database["public"]["Enums"]["pix_key_type"]
            | null;
          id?: string;
          producer_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "withdrawal_settings_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: true;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
      withdrawals: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          fee_cents: number;
          id: string;
          net_amount_cents: number;
          paid_at: string | null;
          pix_key: string | null;
          producer_id: string;
          rejected_reason: string | null;
          requested_at: string;
          status: Database["public"]["Enums"]["withdrawal_status"];
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          fee_cents?: number;
          id?: string;
          net_amount_cents: number;
          paid_at?: string | null;
          pix_key?: string | null;
          producer_id: string;
          rejected_reason?: string | null;
          requested_at?: string;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          fee_cents?: number;
          id?: string;
          net_amount_cents?: number;
          paid_at?: string | null;
          pix_key?: string | null;
          producer_id?: string;
          rejected_reason?: string | null;
          requested_at?: string;
          status?: Database["public"]["Enums"]["withdrawal_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "withdrawals_producer_id_fkey";
            columns: ["producer_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      apply_payment_webhook_event: {
        Args: {
          p_event_type: string;
          p_external_event_id: string;
          p_external_payment_id: string;
          p_payload: Json;
          p_provider: Database["public"]["Enums"]["payment_provider"];
          p_status: Database["public"]["Enums"]["payment_status"];
        };
        Returns: Json;
      };
      create_checkout_payment_attempt: {
        Args: {
          p_checkout_slug: string;
          p_customer_email: string;
          p_customer_name: string;
          p_environment: Database["public"]["Enums"]["payment_environment"];
          p_external_payment_id: string;
          p_method: Database["public"]["Enums"]["payment_method"];
          p_provider: Database["public"]["Enums"]["payment_provider"];
          p_provider_checkout_url: string | null;
          p_provider_payload: Json;
          p_provider_reference: string;
          p_raw_provider_status: string;
          p_status: Database["public"]["Enums"]["payment_status"];
        };
        Returns: Json;
      };
      create_premium_checkout_payment_attempt: {
        Args: {
          p_checkout_slug: string;
          p_coupon_code?: string | null;
          p_customer_email: string;
          p_customer_name: string;
          p_environment: Database["public"]["Enums"]["payment_environment"];
          p_external_payment_id: string;
          p_method: Database["public"]["Enums"]["payment_method"];
          p_order_bump_ids?: string[];
          p_provider: Database["public"]["Enums"]["payment_provider"];
          p_provider_checkout_url: string | null;
          p_provider_payload: Json;
          p_provider_reference: string;
          p_raw_provider_status: string;
          p_status: Database["public"]["Enums"]["payment_status"];
          p_utm_campaign?: string | null;
          p_utm_content?: string | null;
          p_utm_medium?: string | null;
          p_utm_source?: string | null;
          p_utm_term?: string | null;
        };
        Returns: Json;
      };
      create_pending_checkout_order: {
        Args: {
          p_checkout_slug: string;
          p_customer_email: string;
          p_customer_name: string;
        };
        Returns: string;
      };
      create_notification_for_payment_event: {
        Args: {
          p_payment_id: string;
          p_provider_event_type?: string | null;
          p_status: Database["public"]["Enums"]["payment_status"];
        };
        Returns: {
          body: string;
          event_type: Database["public"]["Enums"]["notification_event_type"];
          notification_id: string;
          producer_id: string;
          target_url: string;
          title: string;
          user_id: string;
        }[];
      };
      current_user_role: { Args: never; Returns: string };
      ensure_notification_preferences: {
        Args: {
          p_producer_id: string;
          p_user_id: string;
        };
        Returns: Database["public"]["Tables"]["notification_preferences"]["Row"];
      };
      ensure_wallet_for_producer: {
        Args: { p_producer_id: string };
        Returns: Database["public"]["Tables"]["wallets"]["Row"];
      };
      get_checkout_success_context: {
        Args: { p_provider_reference: string };
        Returns: Json;
      };
      is_admin: { Args: never; Returns: boolean };
      process_wallet_payment_event: {
        Args: {
          p_gateway_fee_amount_cents?: number;
          p_payment_id: string;
          p_platform_fee_fixed_amount_cents?: number;
          p_platform_fee_percentage?: number;
          p_settlement_days?: number;
          p_status: Database["public"]["Enums"]["payment_status"];
        };
        Returns: Json;
      };
      release_due_wallet_transactions: {
        Args: { p_producer_id: string };
        Returns: number;
      };
      request_wallet_withdrawal: {
        Args: {
          p_amount_cents: number;
          p_bank_name?: string | null;
          p_holder_document: string;
          p_holder_name: string;
          p_pix_key: string;
          p_pix_key_type: Database["public"]["Enums"]["pix_key_type"];
          p_producer_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      affiliate_link_status: "active" | "inactive";
      affiliate_status: "pending" | "approved" | "blocked";
      checkout_offer_status: "active" | "inactive";
      checkout_offer_type: "order_bump" | "upsell" | "downsell";
      checkout_pixel_provider:
        | "meta"
        | "google_analytics"
        | "google_tag_manager"
        | "tiktok";
      checkout_status: "draft" | "published" | "disabled";
      commission_status: "pending" | "available" | "paid" | "canceled";
      coupon_discount_type: "percentage" | "fixed";
      coupon_redemption_status: "reserved" | "redeemed" | "cancelled";
      coupon_status: "active" | "inactive";
      ledger_entry_direction: "credit" | "debit";
      ledger_entry_type:
        | "sale"
        | "platform_fee"
        | "producer_receivable"
        | "affiliate_commission"
        | "withdrawal"
        | "withdrawal_fee"
        | "refund"
        | "chargeback"
        | "hold"
        | "release"
        | "adjustment";
      notification_event_type:
        | "sale_approved"
        | "pix_created"
        | "pix_expired"
        | "payment_pending"
        | "payment_failed"
        | "payment_paid"
        | "refund_created"
        | "chargeback_created"
        | "order_created"
        | "customer_created"
        | "balance_available"
        | "withdrawal_requested"
        | "withdrawal_paid"
        | "withdrawal_failed";
      order_status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "chargeback"
        | "canceled"
        | "cancelled"
        | "expired";
      outbox_event_status:
        | "pending"
        | "processing"
        | "processed"
        | "failed"
        | "discarded";
      payment_environment: "development" | "sandbox" | "production";
      payment_event_status: "received" | "processed" | "failed";
      payment_method: "pix" | "credit_card" | "boleto";
      payment_provider:
        | "mercadopago"
        | "pagarme"
        | "stripe"
        | "asaas"
        | "manual";
      pix_key_type: "cpf" | "cnpj" | "email" | "phone" | "random";
      payment_status:
        | "pending"
        | "processing"
        | "paid"
        | "authorized"
        | "failed"
        | "refunded"
        | "chargeback"
        | "canceled"
        | "cancelled";
      producer_status: "pending" | "approved" | "rejected" | "blocked";
      product_status: "draft" | "active" | "inactive" | "archived";
      product_type: "one_time";
      transaction_type:
        | "payment"
        | "authorization"
        | "capture"
        | "refund"
        | "chargeback"
        | "cancellation";
      user_role: "admin" | "producer" | "affiliate" | "support";
      user_status: "active" | "pending" | "disabled";
      wallet_transaction_status:
        | "pending"
        | "available"
        | "processing"
        | "paid"
        | "failed"
        | "cancelled";
      wallet_transaction_type:
        | "sale"
        | "refund"
        | "chargeback"
        | "withdrawal"
        | "withdrawal_cancelled"
        | "platform_fee"
        | "adjustment";
      withdrawal_status:
        | "requested"
        | "processing"
        | "paid"
        | "rejected"
        | "canceled"
        | "failed"
        | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      affiliate_link_status: ["active", "inactive"],
      affiliate_status: ["pending", "approved", "blocked"],
      checkout_offer_status: ["active", "inactive"],
      checkout_offer_type: ["order_bump", "upsell", "downsell"],
      checkout_pixel_provider: [
        "meta",
        "google_analytics",
        "google_tag_manager",
        "tiktok",
      ],
      checkout_status: ["draft", "published", "disabled"],
      commission_status: ["pending", "available", "paid", "canceled"],
      coupon_discount_type: ["percentage", "fixed"],
      coupon_redemption_status: ["reserved", "redeemed", "cancelled"],
      coupon_status: ["active", "inactive"],
      ledger_entry_direction: ["credit", "debit"],
      ledger_entry_type: [
        "sale",
        "platform_fee",
        "producer_receivable",
        "affiliate_commission",
        "withdrawal",
        "withdrawal_fee",
        "refund",
        "chargeback",
        "hold",
        "release",
        "adjustment",
      ],
      notification_event_type: [
        "sale_approved",
        "pix_created",
        "pix_expired",
        "payment_pending",
        "payment_failed",
        "payment_paid",
        "refund_created",
        "chargeback_created",
        "order_created",
        "customer_created",
        "balance_available",
        "withdrawal_requested",
        "withdrawal_paid",
        "withdrawal_failed",
      ],
      order_status: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "chargeback",
        "canceled",
        "cancelled",
        "expired",
      ],
      outbox_event_status: [
        "pending",
        "processing",
        "processed",
        "failed",
        "discarded",
      ],
      payment_environment: ["development", "sandbox", "production"],
      payment_event_status: ["received", "processed", "failed"],
      payment_method: ["pix", "credit_card", "boleto"],
      payment_provider: ["mercadopago", "pagarme", "stripe", "asaas", "manual"],
      pix_key_type: ["cpf", "cnpj", "email", "phone", "random"],
      payment_status: [
        "pending",
        "processing",
        "paid",
        "authorized",
        "failed",
        "refunded",
        "chargeback",
        "canceled",
        "cancelled",
      ],
      producer_status: ["pending", "approved", "rejected", "blocked"],
      product_status: ["draft", "active", "inactive", "archived"],
      product_type: ["one_time"],
      transaction_type: [
        "payment",
        "authorization",
        "capture",
        "refund",
        "chargeback",
        "cancellation",
      ],
      user_role: ["admin", "producer", "affiliate", "support"],
      user_status: ["active", "pending", "disabled"],
      wallet_transaction_status: [
        "pending",
        "available",
        "processing",
        "paid",
        "failed",
        "cancelled",
      ],
      wallet_transaction_type: [
        "sale",
        "refund",
        "chargeback",
        "withdrawal",
        "withdrawal_cancelled",
        "platform_fee",
        "adjustment",
      ],
      withdrawal_status: [
        "requested",
        "processing",
        "paid",
        "rejected",
        "canceled",
        "failed",
        "cancelled",
      ],
    },
  },
} as const;
