import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';
interface IBody {
  to: {
    email: string;
    name: string;
  };
  from: {
    email: string;
    name: string;
  };
  subject: string;
  content: {
    type: string;
    value: string;
  }[];
}

const app = new Hono();

app.use('/*', cors());

app.post('/api/send-email', async (ctx) => {
  const body: IBody = await ctx.req.json();

  const { DKIM_PRIVATE_KEY } = env<{ DKIM_PRIVATE_KEY: string }>(ctx);

  const bodyToSend = {
    personalizations: [
      {
        to: [{ email: body.to.email, name: body.to.name }],
        dkim_domain: 'mauromamani.store',
        dkim_selector: 'mailchannels',
        dkim_private_key: DKIM_PRIVATE_KEY,
      },
    ],
    from: {
      email: body.from.email,
      name: body.from.name,
    },
    subject: body.subject,
    content: body.content,
  };

  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(bodyToSend),
  });

  const respText = await response.text();

  return new Response(respText || 'ok');
});

export default app;

// export default {
//   async fetch(
//     request: Request,
//     env: Env,
//     ctx: ExecutionContext
//   ): Promise<Response> {
//     if (request.method !== 'POST') {
//       return new Response('Method Not Allowed', { status: 405 });
//     }

//     const recipient = 'mauromamani.b@gmail.com';

//     const body = {
//       personalizations: [
//         {
//           to: [{ email: recipient, name: 'mauromamani' }],
//           dkim_domain: 'mauromamani.store',
//           dkim_selector: 'mailchannels',
//           dkim_private_key: env.DKIM_PRIVATE_KEY,
//         },
//       ],
//       from: {
//         email: 'info@mauromamani.store',
//         name: 'INFO',
//       },
//       subject: 'Look! No servers',
//       content: [
//         {
//           type: 'text/plain',
//           value: 'And no email service accounts and all for free too!',
//         },
//       ],
//     };

//     const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
//       method: 'POST',
//       headers: {
//         'content-type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     const respText = await response.text();

//     return new Response(respText || 'ok');
//   },
// };
