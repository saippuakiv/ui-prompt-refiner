# ui-prompt-refiner

Iteratively refine rough UI descriptions into clear, actionable prompts through suggestion and merging.

## How it works

1. Type a rough UI idea (e.g. "a dropdown menu")
2. Press Enter or click **Improve** to get refined suggestions
3. Select a suggestion — it merges with your original input into a precise prompt
4. Repeat until satisfied, then copy the result

## Tech stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Claude (Haiku 4.5) via Anthropic API

## Setup

```bash
npm install
```

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=your-api-key
```

For development without API calls:

```
USE_MOCK=true
```

## Development

```bash
npm run dev
```

Open http://localhost:3000

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/suggestions` | POST | Generates 3-6 refined suggestions from a rough input |
| `/api/merge` | POST | Merges the original input with a selected suggestion |

Both routes share a rate limit of 10 requests per minute.

## Features

- Glassmorphism UI with smooth animations
- Keyboard navigation (arrow keys, Enter, Escape)
- Undo history
- Copy to clipboard
- Loading states with progress messages
- Error handling with retry
- Rate limiting
