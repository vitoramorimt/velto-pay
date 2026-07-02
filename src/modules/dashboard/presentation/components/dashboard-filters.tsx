"use client";

import { useMemo, useState, useTransition } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DashboardFilters,
  DashboardProductOption,
} from "@/modules/dashboard/domain/types";

type DashboardFiltersProps = {
  filters: DashboardFilters;
  productOptions: DashboardProductOption[];
};

const defaultFilters: DashboardFilters = {
  method: "all",
  period: "30d",
  productId: "all",
  status: "all",
};

const periodOptions = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Últimos 90 dias", value: "90d" },
  { label: "Todo período", value: "all" },
];

const methodOptions = [
  { label: "Todos os métodos", value: "all" },
  { label: "Pix", value: "pix" },
  { label: "Cartão", value: "credit_card" },
  { label: "Boleto", value: "boleto" },
];

const statusOptions = [
  { label: "Todos os status", value: "all" },
  { label: "Aprovada", value: "paid" },
  { label: "Pendente", value: "pending" },
  { label: "Falhou", value: "failed" },
  { label: "Reembolsada", value: "refunded" },
  { label: "Chargeback", value: "chargeback" },
  { label: "Cancelada", value: "canceled" },
  { label: "Expirada", value: "expired" },
];

export function DashboardFilters({
  filters,
  productOptions,
}: DashboardFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useState(filters.period);
  const [productId, setProductId] = useState(filters.productId);
  const [method, setMethod] = useState(filters.method);
  const [status, setStatus] = useState(filters.status);

  const hasActiveFilters = useMemo(
    () =>
      period !== defaultFilters.period ||
      productId !== defaultFilters.productId ||
      method !== defaultFilters.method ||
      status !== defaultFilters.status,
    [method, period, productId, status],
  );

  function updateUrl(nextFilters: DashboardFilters) {
    const params = new URLSearchParams(searchParams.toString());
    const mappings = [
      ["periodo", nextFilters.period, defaultFilters.period],
      ["produto", nextFilters.productId, defaultFilters.productId],
      ["metodo", nextFilters.method, defaultFilters.method],
      ["status", nextFilters.status, defaultFilters.status],
    ];

    mappings.forEach(([key, value, defaultValue]) => {
      if (value === defaultValue) {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function applyFilters() {
    updateUrl({
      method,
      period,
      productId,
      status,
    });
  }

  function clearFilters() {
    setPeriod(defaultFilters.period);
    setProductId(defaultFilters.productId);
    setMethod(defaultFilters.method);
    setStatus(defaultFilters.status);
    updateUrl(defaultFilters);
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4 shadow-soft backdrop-blur-xl">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1.2fr_1fr_1fr_auto]">
        <FilterSelect
          label="Período"
          onValueChange={(value) =>
            setPeriod(value as DashboardFilters["period"])
          }
          options={periodOptions}
          value={period}
        />
        <FilterSelect
          label="Produto"
          onValueChange={setProductId}
          options={[
            { label: "Todos os produtos", value: "all" },
            ...productOptions.map((product) => ({
              label: product.name,
              value: product.id,
            })),
          ]}
          value={productId}
        />
        <FilterSelect
          label="Método"
          onValueChange={(value) =>
            setMethod(value as DashboardFilters["method"])
          }
          options={methodOptions}
          value={method}
        />
        <FilterSelect
          label="Status"
          onValueChange={(value) =>
            setStatus(value as DashboardFilters["status"])
          }
          options={statusOptions}
          value={status}
        />
        <div className="flex items-end gap-2">
          <Button
            className="w-full xl:w-auto"
            disabled={isPending}
            onClick={applyFilters}
            type="button"
          >
            <Filter />
            Aplicar
          </Button>
          <Button
            disabled={!hasActiveFilters || isPending}
            onClick={clearFilters}
            size="icon"
            type="button"
            variant="outline"
          >
            <RotateCcw />
            <span className="sr-only">Limpar filtros</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  onValueChange: (value: string) => void;
  options: Array<{
    label: string;
    value: string;
  }>;
  value: string;
};

function FilterSelect({
  label,
  onValueChange,
  options,
  value,
}: FilterSelectProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className="border-white/10 bg-background/70">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
