import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Lightbulb,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAuthenticatedUser } from "@/modules/auth/application/guards";

const insightGroups = [
  {
    icon: Target,
    title: "Sugestões para aumentar conversão",
    items: [
      "Priorize ofertas com promessa clara acima da dobra do checkout.",
      "Reduza campos opcionais quando o produto tiver ticket baixo.",
      "Use prova social próxima ao botão principal de compra.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Sugestões para melhorar checkout",
    items: [
      "Mantenha Pix e cartão visíveis sem troca de contexto.",
      "Exiba garantias e suporte antes da etapa de pagamento.",
      "Revise mensagens de erro para diminuir abandono.",
    ],
  },
  {
    icon: ArrowUpRight,
    title: "Sugestões para aumentar ticket médio",
    items: [
      "Teste order bump complementar ao produto principal.",
      "Crie bundles para produtos com o mesmo público.",
      "Ofereça upgrade com benefício mensurável antes da compra.",
    ],
  },
];

const alerts = [
  "Queda de vendas será destacada quando houver histórico real suficiente.",
  "Produtos sem vendas recentes podem receber recomendações de otimização.",
  "Métodos de pagamento com baixa aprovação entrarão em monitoramento.",
];

const questionHistory = [
  "Quais produtos merecem mais tráfego esta semana?",
  "Como melhorar a aprovação no checkout?",
  "Qual oferta tem maior potencial de ticket médio?",
];

export default async function SalesAiPage() {
  await requireAuthenticatedUser("/dashboard/ia-de-vendas");

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#030806] text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_22%_0%,rgba(43,224,146,0.20),transparent_34rem),radial-gradient(circle_at_78%_12%,rgba(59,130,246,0.12),transparent_30rem)]" />
      <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
          <Badge
            className="border-accent/30 bg-accent/10 text-accent"
            variant="outline"
          >
            MVP visual
          </Badge>
          <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_0.85fr] xl:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                IA de Vendas
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Camada visual para resumir métricas, levantar hipóteses e
                organizar próximas ações comerciais. A integração com IA real
                permanece fora desta sprint.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent/25 bg-accent/10 text-accent">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    Resumo inteligente das métricas
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Ainda não há motor de IA conectado. Esta área está pronta
                    para receber análises reais quando o módulo de inteligência
                    for priorizado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-accent" />
                Insights automáticos
              </CardTitle>
              <CardDescription className="text-slate-400">
                Exemplos de leitura para a experiência do MVP visual.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Concentre a análise em receita líquida, aprovação e ticket médio.",
                "Compare métodos de pagamento antes de alterar campanhas.",
                "Use produtos ativos como base para priorizar experimentos.",
              ].map((insight) => (
                <InsightLine icon={Lightbulb} key={insight} text={insight} />
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Alertas de queda de vendas
              </CardTitle>
              <CardDescription className="text-slate-400">
                Alertas visuais para orientar acompanhamento operacional.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {alerts.map((alert) => (
                <div
                  className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300"
                  key={alert}
                >
                  {alert}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          {insightGroups.map((group) => {
            const Icon = group.icon;

            return (
              <Card
                className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
                key={group.title}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Icon className="h-4 w-4 text-accent" />
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.items.map((item) => (
                    <InsightLine icon={Sparkles} key={item} text={item} />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquareText className="h-4 w-4 text-accent" />
                Conversar com a IA
              </CardTitle>
              <CardDescription className="text-slate-400">
                Campo visual sem processamento real nesta sprint.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="mb-4 flex items-start gap-3 rounded-lg bg-white/[0.04] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <Bot className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-300">
                    Quando a IA real for habilitada, você poderá perguntar sobre
                    quedas de venda, gargalos de checkout, produtos com maior
                    potencial e próximas ações.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    className="border-white/10 bg-background/70"
                    placeholder="Pergunte algo sobre suas vendas..."
                  />
                  <Button type="button">
                    <Send />
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <CardHeader>
              <CardTitle className="text-white">
                Histórico de perguntas
              </CardTitle>
              <CardDescription className="text-slate-400">
                Exemplos simulados para validar o fluxo visual.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {questionHistory.map((question) => (
                <div
                  className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-slate-300 transition-colors hover:border-accent/30 hover:bg-white/[0.045]"
                  key={question}
                >
                  {question}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

type InsightLineProps = {
  icon: typeof Sparkles;
  text: string;
};

function InsightLine({ icon: Icon, text }: InsightLineProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}
