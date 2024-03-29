# CCAI Web Crawler

This is a puppeteer web crawler for the following public documentations:

- https://cloud.google.com/contact-center/ccai-platform/docs
- https://cloud.google.com/agent-assist/docs
- https://cloud.google.com/dialogflow/cx/docs

The data is stored as an .ndjson format (New Line Delimited JSON)

```json
{
  "link": "https://cloud.google.com/contact-center/ccai-platform/docs",
  "title": "CCAI Platform",
  "content": ".... content"
}
```

## How to run

```bash
npm install
npm run dev
```
