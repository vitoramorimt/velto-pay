"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  Loader2,
  RotateCcw,
  Send,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SalesAiChatMessage } from "@/modules/sales-ai/domain/types";
import { cn } from "@/shared/utils/cn";

type SalesAiChatProps = {
  configured: boolean;
};

type SalesAiResponse = {
  configured: boolean;
  message: string;
  model?: string;
};

const initialMessage: SalesAiChatMessage = {
  content:
    "Olá. Eu posso analisar produtos, vendas, checkouts, pedidos e financeiro da sua operação Velto Pay. Faça uma pergunta objetiva para começar.",
  role: "assistant",
};

export function SalesAiChat({ configured }: SalesAiChatProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<SalesAiChatMessage[]>([
    initialMessage,
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function sendMessage(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    setError(null);
    setDraft("");
    setLastUserMessage(trimmedMessage);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        content: trimmedMessage,
        role: "user",
      },
    ]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/sales-ai/chat", {
        body: JSON.stringify({
          history: messages,
          message: trimmedMessage,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as Partial<SalesAiResponse>;
      const answerMessage = data.message;

      if (!response.ok || !answerMessage) {
        throw new Error(data.message ?? "Falha ao consultar a IA.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          content: answerMessage,
          role: "assistant",
        },
      ]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível responder agora.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void sendMessage(draft);
  }

  return (
    <div className="grid min-h-[34rem] overflow-hidden rounded-lg border border-border/80 bg-card/90 shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border/80 bg-muted/35 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Chat com IA de Vendas</h2>
            <Badge
              className={cn(
                configured
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-warning/30 bg-warning/10 text-warning",
              )}
              variant="outline"
            >
              {configured ? "OpenAI ativa" : "Configuração pendente"}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter envia. Shift+Enter cria uma nova linha.
          </p>
          {!configured ? (
            <p className="mt-3 rounded-md border border-warning/25 bg-warning/10 px-3 py-2 text-sm leading-6 text-warning">
              A IA real ainda não está configurada neste ambiente. Configure
              OPENAI_API_KEY para ativar respostas com OpenAI.
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex max-h-[58dvh] min-h-0 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.map((message, index) => (
          <div
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
            key={`${message.role}-${index}`}
          >
            {message.role === "assistant" ? (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
                <Bot className="h-4 w-4" />
              </span>
            ) : null}
            <div
              className={cn(
                "max-w-[min(38rem,calc(100%-2.75rem))] whitespace-pre-wrap break-words rounded-lg px-4 py-3 text-sm leading-6",
                message.role === "user"
                  ? "bg-accent text-accent-foreground"
                  : "border border-border/80 bg-background/75 text-muted-foreground",
              )}
            >
              {message.content}
            </div>
            {message.role === "user" ? (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background/75 text-muted-foreground">
                <UserRound className="h-4 w-4" />
              </span>
            ) : null}
          </div>
        ))}

        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
            A IA está analisando seus dados...
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-border/80 bg-background/70 p-4 sm:p-5"
        onSubmit={handleSubmit}
      >
        {error ? (
          <div
            className="mb-3 flex flex-col gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <span className="flex min-w-0 items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{error}</span>
            </span>
            {lastUserMessage ? (
              <Button
                className="shrink-0"
                disabled={isLoading}
                onClick={() => void sendMessage(lastUserMessage)}
                size="sm"
                type="button"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
                Tentar novamente
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            className="min-h-24 flex-1 resize-none rounded-md border border-input bg-background/90 px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            maxLength={1200}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex.: Como posso melhorar a conversão dos meus produtos?"
            value={draft}
          />
          <Button
            className="h-11 w-full sm:w-auto"
            disabled={isLoading || draft.trim().length < 2}
            type="submit"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
