"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  MonitorPlay,
  PackageCheck,
  Save,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProductAction,
  type ProductActionResult,
  updateProductAction,
} from "@/modules/products/presentation/actions";
import type { ProductFormValues } from "@/modules/products/domain/types";
import { productFormSchema } from "@/modules/products/domain/schemas";
import { cn } from "@/shared/utils/cn";

type ProductFormProps = {
  defaultValues: ProductFormValues;
  mode: "create" | "edit";
};

type DeliveryMethod = "members_area" | "external_link" | "none";
type MembersAreaMode = "new" | "existing";

const deliveryOptions: Array<{
  description: string;
  icon: LucideIcon;
  label: string;
  value: DeliveryMethod;
}> = [
  {
    description:
      "Prepare a estrutura visual para liberar conteúdo dentro da Velto.",
    icon: MonitorPlay,
    label: "Área de membros da Velto",
    value: "members_area",
  },
  {
    description:
      "Use uma entrega fora da Velto quando o conteúdo já estiver hospedado.",
    icon: ExternalLink,
    label: "Link externo",
    value: "external_link",
  },
  {
    description:
      "Cadastre o produto agora e defina a entrega em uma próxima etapa.",
    icon: XCircle,
    label: "Sem entrega automática",
    value: "none",
  },
];

const membersAreaOptions: Array<{
  description: string;
  label: string;
  value: MembersAreaMode;
}> = [
  {
    description: "Estrutura visual inicial para uma futura área de membros.",
    label: "Criar nova área de membros",
    value: "new",
  },
  {
    description:
      "Preparado para conectar uma área existente em uma sprint futura.",
    label: "Usar área existente",
    value: "existing",
  },
];

function ProductFormStatus({ result }: { result: ProductActionResult | null }) {
  if (!result) {
    return null;
  }

  const isSuccess = result.status === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        isSuccess
          ? "border-success/25 bg-success/10 text-success"
          : "border-destructive/25 bg-destructive/10 text-destructive",
      )}
      role={isSuccess ? "status" : "alert"}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{result.message}</span>
    </div>
  );
}

export function ProductForm({ defaultValues, mode }: ProductFormProps) {
  const [currentStep, setCurrentStep] = useState(mode === "create" ? 1 : 2);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("members_area");
  const [membersAreaMode, setMembersAreaMode] =
    useState<MembersAreaMode>("new");
  const [result, setResult] = useState<ProductActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProductFormValues>({
    defaultValues,
    resolver: zodResolver(productFormSchema),
  });

  function onSubmit(values: ProductFormValues) {
    setResult(null);

    startTransition(() => {
      if (mode === "create") {
        void createProductAction(values).then(setResult);
        return;
      }

      if (!defaultValues.id) {
        setResult({
          message: "Produto inválido.",
          status: "error",
        });
        return;
      }

      void updateProductAction({
        ...values,
        id: defaultValues.id,
      }).then(setResult);
    });
  }

  return (
    <Card className="overflow-hidden border-white/10 bg-[#050c09]/95 text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.26)]">
      <CardContent className="p-0">
        <div className="border-b border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge
                className="border-accent/30 bg-accent/10 text-accent"
                variant="outline"
              >
                {mode === "create" ? "Novo produto" : "Editar produto"}
              </Badge>
              <h2 className="mt-3 text-xl font-semibold text-white">
                {mode === "create"
                  ? "Configure o produto em poucos passos"
                  : "Atualize as informações do produto"}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/20 p-1 text-xs">
              <StepPill active={currentStep === 1} disabled={mode === "edit"}>
                1. Estrutura
              </StepPill>
              <StepPill active={currentStep === 2}>2. Detalhes</StepPill>
            </div>
          </div>
        </div>

        <form
          className="grid gap-6 p-4 sm:p-6"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <ProductFormStatus result={result} />

          <input type="hidden" {...form.register("slug")} />
          <input type="hidden" {...form.register("deliveryUrl")} />
          <input type="hidden" {...form.register("status")} />

          {currentStep === 1 ? (
            <div className="grid gap-6">
              <section className="grid gap-3">
                <SectionHeading
                  description="Para o MVP atual, produtos digitais usam pagamento único."
                  title="Tipo de pagamento"
                />
                <OptionCard
                  active
                  description="Venda única em BRL, sem recorrência ou assinatura real nesta fase."
                  icon={CreditCard}
                  label="Pagamento único"
                />
              </section>

              <section className="grid gap-3">
                <SectionHeading
                  description="Escolha como a entrega será representada agora. Nenhuma opção cria área de membros real ainda."
                  title="Entrega do conteúdo"
                />
                <div className="grid gap-3 lg:grid-cols-3">
                  {deliveryOptions.map((option) => (
                    <OptionCard
                      active={deliveryMethod === option.value}
                      description={option.description}
                      icon={option.icon}
                      key={option.value}
                      label={option.label}
                      onClick={() => setDeliveryMethod(option.value)}
                    />
                  ))}
                </div>
              </section>

              {deliveryMethod === "members_area" ? (
                <section className="grid gap-3">
                  <SectionHeading
                    description="Seleção visual para preparar o fluxo futuro de área de membros."
                    title="Área de membros"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    {membersAreaOptions.map((option) => (
                      <button
                        className={cn(
                          "rounded-lg border p-4 text-left transition-all",
                          membersAreaMode === option.value
                            ? "border-accent/40 bg-accent/10 shadow-[0_0_40px_rgba(25,205,139,0.12)]"
                            : "border-white/10 bg-white/[0.035] hover:border-accent/25 hover:bg-white/[0.055]",
                        )}
                        key={option.value}
                        onClick={() => setMembersAreaMode(option.value)}
                        type="button"
                      >
                        <p className="font-medium text-white">{option.label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
                <Button
                  asChild
                  className="border-white/10 bg-white/[0.035] text-white hover:bg-white/[0.07]"
                  variant="outline"
                >
                  <Link href="/dashboard/produtos">Cancelar</Link>
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setCurrentStep(2)}
                  type="button"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do produto</Label>
                  <Input
                    className="border-white/10 bg-black/20 text-white placeholder:text-slate-500"
                    id="name"
                    placeholder="Curso completo de marketing digital"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    className="min-h-32 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    id="description"
                    placeholder="Resumo objetivo do que o comprador receberá."
                    {...form.register("description")}
                  />
                  {form.formState.errors.description ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salesPageUrl">Página de vendas</Label>
                  <Input
                    className="border-white/10 bg-black/20 text-white placeholder:text-slate-500"
                    id="salesPageUrl"
                    placeholder="https://sua-pagina.com/oferta"
                    type="url"
                    {...form.register("salesPageUrl")}
                  />
                  <p className="text-xs leading-5 text-slate-500">
                    Opcional. Use a página pública onde a oferta será
                    apresentada.
                  </p>
                  {form.formState.errors.salesPageUrl ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.salesPageUrl.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_10rem]">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço</Label>
                    <Input
                      className="border-white/10 bg-black/20 text-white placeholder:text-slate-500"
                      id="price"
                      inputMode="decimal"
                      placeholder="197,00"
                      {...form.register("price")}
                    />
                    <p className="text-xs leading-5 text-slate-500">
                      Informe em reais, entre R$ 5,00 e R$ 50.000,00.
                    </p>
                    {form.formState.errors.price ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.price.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Input
                      className="border-white/10 bg-black/20 text-white"
                      disabled
                      id="currency"
                      value="BRL"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Produto vinculado ao seu produtor
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      A criação, edição e alteração de status continuam
                      protegidas pela sessão e pelo perfil de produtor da conta
                      logada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="border-white/10 bg-white/[0.035] text-white hover:bg-white/[0.07]"
                    variant="outline"
                  >
                    <Link href="/dashboard/produtos">Cancelar</Link>
                  </Button>
                  {mode === "create" ? (
                    <Button
                      className="border-white/10 bg-white/[0.035] text-white hover:bg-white/[0.07]"
                      onClick={() => setCurrentStep(1)}
                      type="button"
                      variant="outline"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                  ) : null}
                </div>

                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? <Loader2 className="animate-spin" /> : <Save />}
                  {mode === "create" ? "Criar produto" : "Salvar alterações"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function StepPill({
  active,
  children,
  disabled = false,
}: {
  active: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-md px-3 py-2 text-center font-medium",
        active ? "bg-accent text-accent-foreground" : "text-slate-500",
        disabled && "opacity-50",
      )}
    >
      {children}
    </span>
  );
}

function SectionHeading({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

type OptionCardProps = {
  active: boolean;
  description: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
};

function OptionCard({
  active,
  description,
  icon: Icon,
  label,
  onClick,
}: OptionCardProps) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "rounded-lg border p-4 text-left transition-all",
        active
          ? "border-accent/40 bg-accent/10 shadow-[0_0_40px_rgba(25,205,139,0.12)]"
          : "border-white/10 bg-white/[0.035] hover:border-accent/25 hover:bg-white/[0.055]",
      )}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
      type="button"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/20 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-white">{label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
    </button>
  );
}
