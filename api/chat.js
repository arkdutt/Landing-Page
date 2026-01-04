import fs from 'node:fs';
import path from 'node:path';

const FALLBACK_REPLY = 'Currently offline, I will get back to you soon.';
const SYSTEM_PROMPT_PATH = path.resolve(process.cwd(), 'system-prompt.txt');
const SITE_CONTEXT_PATH = path.resolve(process.cwd(), 'site-context.txt');

const loadSystemPrompt = () => {
   const envPrompt = process.env.SYSTEM_PROMPT;
   if (envPrompt && envPrompt.trim()) {
      return envPrompt.trim();
   }

   try {
      const filePrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8').trim();
      return filePrompt;
   } catch (error) {
      return '';
   }
};

const loadSiteContext = () => {
   const envContext = process.env.SITE_CONTEXT;
   if (envContext && envContext.trim()) {
      return envContext.trim();
   }

   try {
      const fileContext = fs.readFileSync(SITE_CONTEXT_PATH, 'utf8').trim();
      return fileContext;
   } catch (error) {
      return '';
   }
};

const sanitizeMessages = (messages) => {
   const cleaned = messages
      .filter((message) => message && typeof message === 'object')
      .map((message) => ({
         role: message.role === 'assistant' ? 'assistant' : 'user',
         content: typeof message.content === 'string' ? message.content.trim() : ''
      }))
      .filter((message) => message.content);

   if (!cleaned.length) {
      return [{ role: 'user', content: 'Tell me about yourself.' }];
   }

   return cleaned.slice(-10);
};

const sendFallback = (res, reason) => {
   if (reason) {
      console.warn('Chat fallback:', reason);
   }
   res.status(200).json({ reply: FALLBACK_REPLY });
};

export default async function handler(req, res) {
   if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
   }

   const apiKey = process.env.GROQ_API_KEY;
   if (!apiKey) {
      sendFallback(res, 'Missing GROQ_API_KEY');
      return;
   }

   const systemPrompt = loadSystemPrompt();
   if (!systemPrompt) {
      sendFallback(res, 'Missing SYSTEM_PROMPT or system-prompt.txt');
      return;
   }

   const siteContext = loadSiteContext();
   if (!siteContext) {
      sendFallback(res, 'Missing SITE_CONTEXT or site-context.txt');
      return;
   }

   let body = req.body;
   if (typeof body === 'string') {
      try {
         body = JSON.parse(body);
      } catch (error) {
         sendFallback(res, 'Invalid JSON body');
         return;
      }
   }

   const messages = Array.isArray(body?.messages) ? body.messages : [];
   const chatMessages = sanitizeMessages(messages);

   try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
         },
         body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            temperature: 0.4,
            max_tokens: 300,
            messages: [
               {
                  role: 'system',
                  content: `${systemPrompt}\n\nSite Context:\n${siteContext}`
               },
               ...chatMessages
            ]
         })
      });

      if (!response.ok) {
         const errorText = await response.text();
         console.error('Groq error:', response.status, errorText);
         sendFallback(res, `Groq request failed (${response.status})`);
         return;
      }

      const data = await response.json();
      const reply = (data?.choices?.[0]?.message?.content || '').trim();

      if (!reply) {
         sendFallback(res, 'Empty response from Groq');
         return;
      }

      res.status(200).json({ reply });
   } catch (error) {
      sendFallback(res, error?.message || 'Server error');
   }
}
