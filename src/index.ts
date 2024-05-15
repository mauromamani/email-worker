import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';

interface Env {
  [key: string]: unknown;
  DKIM_PRIVATE_KEY: string;
}

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

  const { DKIM_PRIVATE_KEY } = env<Env>(ctx);

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

// const aas = {
//   "to": {
//     "email": "rubencruz72@gmail.com",
//     "name": "Ruben Cruz"
//   },
//   "from": {
//     "email": "noreply@mauromamani.store",
//     "name": "Urgent"
//   },
//   "subject": "Notice!!!",
//   "content": [
//     {
//       "type": "text/html",
//       "value": "<h1 style='color:red;'>Hi Amigo</h1> <p>And no email service accounts and all for free too!</p>"

//     }
//   ]
// }

/*
------------------
 EXAMPLE OF BODY
------------------

{
  "to": {
    "email": "rubencruz72@gmail.com",
    "name": "Ruben Cruz"
  },
  "from": {
    "email": "noreply@mauromamani.store",
    "name": "Urgent"
  },
  "subject": "Notice!!!",
  "content": [
    {
      "type": "text/plain",
      "value": "And no email service accounts and all for free too!"
    }
  ]
}

*/
