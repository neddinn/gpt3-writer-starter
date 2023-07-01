import { createParser } from 'eventsource-parser';

const url = 'https://api.openai.com/v1/chat/completions';
export const openAIStream = async (payload) => {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();


  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    method: 'POST',
    body: JSON.stringify(payload)
  });
  let counter = 0;

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event) {
        if (event.type === 'event') {
          const data = event.data;
          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json?.choices[0]?.delta?.content ?? '';
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e)
          }
        }
      }
      const parser = createParser(onParse);
      for await (let chunk of response.body) {
        parser.feed(decoder.decode(chunk))
      }
    }
  });
  return stream;
}
