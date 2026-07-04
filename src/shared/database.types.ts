export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          affiliate_id: string
          code: string
          commission_rate_bps: number
          cookie_window_days: number
          created_at: string
          id: string
          producer_id: string
          product_id: string
          status: Database["public"]["Enums"]["affiliate_link_status"]
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          code: string
          commission_rate_bps?: number
          cookie_window_days?: number
          created_at?: string
          id?: string
          producer_id: string
          product_id: string
          status?: Database["public"]["Enums"]["affiliate_link_status"]
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          code?: string
          commission_rate_bps?: number
          cookie_window_days?: number
          created_at?: string
          id?: string
          producer_id?: string
          product_id?: string
          status?: Database["public"]["Enums"]["affiliate_link_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["affiliate_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      checkouts: {
        Row: {
          created_at: string
          description: string | null
          headline: string | null
          id: string
          order_bump_enabled: boolean
          primary_color: string | null
          producer_id: string
          product_id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["checkout_status"]
          updated_at: string
          upsell_enabled: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          headline?: string | null
          id?: string
          order_bump_enabled?: boolean
          primary_color?: string | null
          producer_id: string
          product_id: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["checkout_status"]
          updated_at?: string
          upsell_enabled?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          headline?: string | null
          id?: string
          order_bump_enabled?: boolean
          primary_color?: string | null
          producer_id?: string
          product_id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["checkout_status"]
          updated_at?: string
          upsell_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "checkouts_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkouts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          affiliate_id: string
          amount_cents: number
          available_at: string | null
          commission_rate_bps: number
          created_at: string
          currency: string
          id: string
          order_id: string
          paid_at: string | null
          payment_id: string | null
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          amount_cents: number
          available_at?: string | null
          commission_rate_bps: number
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          paid_at?: string | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          amount_cents?: number
          available_at?: string | null
          commission_rate_bps?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          paid_at?: string | null
          payment_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          document: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount_cents: number
          available_at: string | null
          commission_id: string | null
          created_at: string
          currency: string
          description: string | null
          direction: Database["public"]["Enums"]["ledger_entry_direction"]
          entry_type: Database["public"]["Enums"]["ledger_entry_type"]
          id: string
          metadata: Json
          order_id: string | null
          payment_id: string | null
          producer_id: string
          withdrawal_id: string | null
        }
        Insert: {
          amount_cents: number
          available_at?: string | null
          commission_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          direction: Database["public"]["Enums"]["ledger_entry_direction"]
          entry_type: Database["public"]["Enums"]["ledger_entry_type"]
          id?: string
          metadata?: Json
          order_id?: string | null
          payment_id?: string | null
          producer_id: string
          withdrawal_id?: string | null
        }
        Update: {
          amount_cents?: number
          available_at?: string | null
          commission_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          direction?: Database["public"]["Enums"]["ledger_entry_direction"]
          entry_type?: Database["public"]["Enums"]["ledger_entry_type"]
          id?: string
          metadata?: Json
          order_id?: string | null
          payment_id?: string | null
          producer_id?: string
          withdrawal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_withdrawal_id_fkey"
            columns: ["withdrawal_id"]
            isOneToOne: false
            referencedRelation: "withdrawals"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          affiliate_id: string | null
          affiliate_link_id: string | null
          checkout_id: string
          created_at: string
          currency: string
          customer_id: string
          discount_cents: number
          external_reference: string | null
          id: string
          metadata: Json
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          producer_id: string
          product_id: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          affiliate_id?: string | null
          affiliate_link_id?: string | null
          checkout_id: string
          created_at?: string
          currency?: string
          customer_id: string
          discount_cents?: number
          external_reference?: string | null
          id?: string
          metadata?: Json
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          producer_id: string
          product_id: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          updated_at?: string
        }
        Update: {
          affiliate_id?: string | null
          affiliate_link_id?: string | null
          checkout_id?: string
          created_at?: string
          currency?: string
          customer_id?: string
          discount_cents?: number
          external_reference?: string | null
          id?: string
          metadata?: Json
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          producer_id?: string
          product_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_events: {
        Row: {
          aggregate_id: string | null
          aggregate_type: string
          attempts: number
          available_at: string
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          locked_at: string | null
          payload: Json
          processed_at: string | null
          status: Database["public"]["Enums"]["outbox_event_status"]
          updated_at: string
        }
        Insert: {
          aggregate_id?: string | null
          aggregate_type: string
          attempts?: number
          available_at?: string
          created_at?: string
          event_type: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          payload?: Json
          processed_at?: string | null
          status?: Database["public"]["Enums"]["outbox_event_status"]
          updated_at?: string
        }
        Update: {
          aggregate_id?: string | null
          aggregate_type?: string
          attempts?: number
          available_at?: string
          created_at?: string
          event_type?: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          payload?: Json
          processed_at?: string | null
          status?: Database["public"]["Enums"]["outbox_event_status"]
          updated_at?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          created_at: string
          event_type: string
          external_event_id: string | null
          id: string
          payload: Json
          payment_id: string | null
          processed_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          received_at: string
          status: Database["public"]["Enums"]["payment_event_status"]
        }
        Insert: {
          created_at?: string
          event_type: string
          external_event_id?: string | null
          id?: string
          payload?: Json
          payment_id?: string | null
          processed_at?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          received_at?: string
          status?: Database["public"]["Enums"]["payment_event_status"]
        }
        Update: {
          created_at?: string
          event_type?: string
          external_event_id?: string | null
          id?: string
          payload?: Json
          payment_id?: string | null
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          received_at?: string
          status?: Database["public"]["Enums"]["payment_event_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          external_payment_id: string | null
          fee_cents: number
          id: string
          idempotency_key: string | null
          method: Database["public"]["Enums"]["payment_method"]
          net_amount_cents: number
          order_id: string
          paid_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_checkout_url: string | null
          provider_environment: Database["public"]["Enums"]["payment_environment"]
          provider_payload: Json
          provider_reference: string | null
          raw_provider_status: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          external_payment_id?: string | null
          fee_cents?: number
          id?: string
          idempotency_key?: string | null
          method: Database["public"]["Enums"]["payment_method"]
          net_amount_cents: number
          order_id: string
          paid_at?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_checkout_url?: string | null
          provider_environment?: Database["public"]["Enums"]["payment_environment"]
          provider_payload?: Json
          provider_reference?: string | null
          raw_provider_status?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          external_payment_id?: string | null
          fee_cents?: number
          id?: string
          idempotency_key?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          net_amount_cents?: number
          order_id?: string
          paid_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_checkout_url?: string | null
          provider_environment?: Database["public"]["Enums"]["payment_environment"]
          provider_payload?: Json
          provider_reference?: string | null
          raw_provider_status?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          external_refund_id: string | null
          id: string
          order_id: string
          payment_id: string
          producer_id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_environment: Database["public"]["Enums"]["payment_environment"]
          provider_payload: Json
          reason: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          external_refund_id?: string | null
          id?: string
          order_id: string
          payment_id: string
          producer_id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_environment?: Database["public"]["Enums"]["payment_environment"]
          provider_payload?: Json
          reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          external_refund_id?: string | null
          id?: string
          order_id?: string
          payment_id?: string
          producer_id?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_environment?: Database["public"]["Enums"]["payment_environment"]
          provider_payload?: Json
          reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          brand_name: string | null
          company_name: string | null
          created_at: string
          document: string | null
          id: string
          status: Database["public"]["Enums"]["producer_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_name?: string | null
          company_name?: string | null
          created_at?: string
          document?: string | null
          id?: string
          status?: Database["public"]["Enums"]["producer_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_name?: string | null
          company_name?: string | null
          created_at?: string
          document?: string | null
          id?: string
          status?: Database["public"]["Enums"]["producer_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          currency: string
          delivery_url: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_cents: number
          producer_id: string
          product_type: Database["public"]["Enums"]["product_type"]
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          delivery_url?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_cents: number
          producer_id: string
          product_type?: Database["public"]["Enums"]["product_type"]
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          delivery_url?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          producer_id?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          external_transaction_id: string | null
          id: string
          order_id: string
          payment_id: string
          processed_at: string | null
          producer_id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_environment: Database["public"]["Enums"]["payment_environment"]
          provider_payload: Json
          status: Database["public"]["Enums"]["payment_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          id?: string
          order_id: string
          payment_id: string
          processed_at?: string | null
          producer_id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_environment?: Database["public"]["Enums"]["payment_environment"]
          provider_payload?: Json
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          external_transaction_id?: string | null
          id?: string
          order_id?: string
          payment_id?: string
          processed_at?: string | null
          producer_id?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_environment?: Database["public"]["Enums"]["payment_environment"]
          provider_payload?: Json
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          external_event_id: string | null
          id: string
          payload: Json
          processed_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_environment: Database["public"]["Enums"]["payment_environment"]
          received_at: string
          signature_valid: boolean
          status: Database["public"]["Enums"]["payment_event_status"]
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          external_event_id?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_environment?: Database["public"]["Enums"]["payment_environment"]
          received_at?: string
          signature_valid?: boolean
          status?: Database["public"]["Enums"]["payment_event_status"]
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          external_event_id?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_environment?: Database["public"]["Enums"]["payment_environment"]
          received_at?: string
          signature_valid?: boolean
          status?: Database["public"]["Enums"]["payment_event_status"]
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          fee_cents: number
          id: string
          net_amount_cents: number
          paid_at: string | null
          pix_key: string | null
          producer_id: string
          rejected_reason: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          fee_cents?: number
          id?: string
          net_amount_cents: number
          paid_at?: string | null
          pix_key?: string | null
          producer_id: string
          rejected_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          fee_cents?: number
          id?: string
          net_amount_cents?: number
          paid_at?: string | null
          pix_key?: string | null
          producer_id?: string
          rejected_reason?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_payment_webhook_event: {
        Args: {
          p_event_type: string
          p_external_event_id: string
          p_external_payment_id: string
          p_payload: Json
          p_provider: Database["public"]["Enums"]["payment_provider"]
          p_status: Database["public"]["Enums"]["payment_status"]
        }
        Returns: Json
      }
      create_checkout_payment_attempt: {
        Args: {
          p_checkout_slug: string
          p_customer_email: string
          p_customer_name: string
          p_environment: Database["public"]["Enums"]["payment_environment"]
          p_external_payment_id: string
          p_method: Database["public"]["Enums"]["payment_method"]
          p_provider: Database["public"]["Enums"]["payment_provider"]
          p_provider_checkout_url: string | null
          p_provider_payload: Json
          p_provider_reference: string
          p_raw_provider_status: string
          p_status: Database["public"]["Enums"]["payment_status"]
        }
        Returns: Json
      }
      create_pending_checkout_order: {
        Args: {
          p_checkout_slug: string
          p_customer_email: string
          p_customer_name: string
        }
        Returns: string
      }
      current_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      affiliate_link_status: "active" | "inactive"
      affiliate_status: "pending" | "approved" | "blocked"
      checkout_status: "draft" | "published" | "disabled"
      commission_status: "pending" | "available" | "paid" | "canceled"
      ledger_entry_direction: "credit" | "debit"
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
        | "adjustment"
      order_status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "chargeback"
        | "canceled"
        | "cancelled"
        | "expired"
      outbox_event_status:
        | "pending"
        | "processing"
        | "processed"
        | "failed"
        | "discarded"
      payment_environment: "development" | "sandbox" | "production"
      payment_event_status: "received" | "processed" | "failed"
      payment_method: "pix" | "credit_card" | "boleto"
      payment_provider:
        | "mercadopago"
        | "pagarme"
        | "stripe"
        | "asaas"
        | "manual"
      payment_status:
        | "pending"
        | "processing"
        | "paid"
        | "authorized"
        | "failed"
        | "refunded"
        | "chargeback"
        | "canceled"
        | "cancelled"
      producer_status: "pending" | "approved" | "rejected" | "blocked"
      product_status: "draft" | "active" | "inactive" | "archived"
      product_type: "one_time"
      transaction_type:
        | "payment"
        | "authorization"
        | "capture"
        | "refund"
        | "chargeback"
        | "cancellation"
      user_role: "admin" | "producer" | "affiliate" | "support"
      user_status: "active" | "pending" | "disabled"
      withdrawal_status:
        | "requested"
        | "processing"
        | "paid"
        | "rejected"
        | "canceled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      affiliate_link_status: ["active", "inactive"],
      affiliate_status: ["pending", "approved", "blocked"],
      checkout_status: ["draft", "published", "disabled"],
      commission_status: ["pending", "available", "paid", "canceled"],
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
      withdrawal_status: [
        "requested",
        "processing",
        "paid",
        "rejected",
        "canceled",
      ],
    },
  },
} as const
