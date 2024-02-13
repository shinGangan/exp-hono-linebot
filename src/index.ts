import type { WebhookEvent } from "@line/bot-sdk";
import { Hono } from "hono";

const app = new Hono();

// test
app.get("*", (c) => c.text("Hello World!"));

/**
 * HonoでLINE Botを作りたい
 */
app.post("/api/webhook", async (c) => {
  const data = await c.req.json();
  const events: WebhookEvent[] = (data as any).events;
  const accessToken: string = c.env.LINE_CHANNEL_ACCESS_TOKEN;

  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        if (event.type === "message") {
          switch (event.message.type) {
            case "text":
              await textEventHandler(
                event.message.text,
                accessToken,
                event.replyToken,
              );
              break;
            default:
              throw Error("未対応のメッセージタイプです");
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
        }
        return c.json({ status: "error" });
      }
    }),
  );
  return c.json({ message: "ok" });
});

/**
 * テキストメッセージを処理しリプライを返す
 * @param event
 * @param accessToken
 * @returns
 */
const textEventHandler = async (
  reqText: string,
  accessToken: string,
  replyToken: string,
): Promise<void> => {
  let text = "";
  switch (reqText) {
    case "こんにちは":
      text = "こんにちは";
      break;
    case "ありがとう":
      text = "どういたしまして";
      break;
    default:
      text = "なんだい？";
      break;
  }

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: "text",
          text,
        },
      ],
    }),
  });
};

export default app;
