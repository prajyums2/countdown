# Setup Guide — Countdown Journey Tracker

## 1. Google Sheet Setup

### 1.1 Create the Sheet
1. Go to [sheets.new](https://sheets.new)
2. Rename it to something like "Countdown Journey Tracker"
3. Create **3 tabs** (sheets) named exactly:
   - `config`
   - `stations`
   - `milestones`

### 1.2 Tab: `config`
Paste this into row 1 (headers) and row 2 (data):

| key | value |
|---|---|
| start_location | Thrissur |
| end_location | Gurugram |
| train_boarding_date | 2026-08-04T12:00:00 |
| arrival_date | 2026-08-06T12:00:00 |

### 1.3 Tab: `stations`
Paste this as the header row:

| id | name | emoji | date_time | description | image_url | order_index | event_type | custom_message | spotify_url |
|---|---|---|---|---|---|---|---|---|---|

Then add your stations. Example data:

| id | name | emoji | date_time | description | image_url | order_index | event_type | custom_message | spotify_url |
|---|---|---|---|---|---|---|---|---|---|
| s1 | Board at Thrissur | 🚂 | 2026-08-04T12:00 | The adventure begins | | 1 | normal | | |
| s2 | Arrive Gurugram | 🏙️ | 2026-08-06T12:00 | Finally made it to you | | 2 | hug | My heart skipped a beat when I saw you | |
| s3 | Date Night — Cyber Hub | 🍝 | 2026-08-07T19:00 | Italian dinner + drinks | | 3 | date-night | Starters: Bruschetta\nMains: Truffle Pasta\nDessert: Tiramisu\n\nThen drinks at Soi 7 under the fairy lights. | https://open.spotify.com/embed/playlist/37i9dQZF1DX7KNKjOK0o9b |
| s4 | Her Birthday | 🎂 | 2026-08-09T00:00 | Happy Birthday my love | | 4 | birthday | Every year with you is a gift. But this one? This one we get to spend together. I love watching you become more of yourself every day. Here's to many more birthdays side by side. ♥ | https://open.spotify.com/embed/track/3ixi9Z9Vx1QN1hMlwi4AE1 |
| s5 | Sultanpur Escape | 🌿 | 2026-08-11T10:00 | Bird sanctuary + picnic | | 5 | normal | | |
| s6 | Cozy Staycation | 🏡 | 2026-08-13T12:00 | Homemade brunch + movies | | 6 | cozy | No plans, no rush. Just you, me, and a blanket. Let's order in, watch movies until we fall asleep, and wake up whenever we want. This is what I dream about. | |
| s7 | Mall of India | 🛍️ | 2026-08-15T16:00 | Shopping + arcade + ice cream | | 7 | date-night | Shopping list:\n- Something cute for her\n- Something silly for us\n- Ice cream (double scoop)\n- Arcade competition (loser buys dinner) | |
| s8 | Rooftop Finale | 🌃 | 2026-08-16T20:00 | Dinner with a view | | 8 | surprise | I love you more than all the city lights below us combined. And that's a lot of lights. This isn't goodbye — it's a promise. The next time we do this, it'll be from our own rooftop. | |
| s9 | Departure | 👋 | 2026-08-18T12:00 | Till next time | | 9 | departure | See you soon, my love. Distance is just a test of how far love can travel. And ours? It goes the whole way and back. Every goodbye makes the next hello that much sweeter. I'll be counting the days until I'm in your arms again. ♥ | |

### 1.4 Tab: `milestones`
Paste this as the header row:

| id | date | title | description | icon | image_url |
|---|---|---|---|---|---|

Example data:

| id | date | title | description | icon | image_url |
|---|---|---|---|---|---|
| m1 | 2026-06-15 | First Salary! 💸 | So incredibly proud of you for securing the bag. | salary | |
| m2 | 2026-07-01 | The H&M Haul 🛍️ | Bought completely with your own hard-earned money. Independent and stylish! | shopping | |

### Column Reference

**event_type** options:
| Value | Effect |
|---|---|
| `normal` | Standard modal with description + image |
| `hug` | Big animated hug emoji + warm message |
| `date-night` | Heart rain + Spotify embed + menu card |
| `birthday` | Confetti + candle cake + love letter + memories + Spotify |
| `cozy` | Blanket fort animation + movie list + cozy note |
| `surprise` | Gift box to open → reveals message + star rain |
| `departure` | Memory photo strip + promise letter |

**icon** options (milestones only): `salary` or `shopping`

---

## 2. Apps Script Deployment

### 2.1 Open Apps Script
1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any default code in the editor
3. Copy the entire contents of `scripts/Code.gs` and paste it in
4. Click the save icon (💾) or press `Ctrl + S`
5. Name the project: `Countdown Journey Tracker`

### 2.2 Deploy
1. Click **Deploy → New Deployment**
2. Click the gear icon (⚙️) next to "Select type" → choose **Web app**
3. Settings:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycbw.../exec
   ```

⚠️ **First time?** Google will ask you to review permissions. Click "Review Permissions" → choose your Google account → click "Advanced" → "Go to [your project]" → "Allow"

### 2.3 Update Your App
1. Open `.env` in your project
2. Paste the URL:
   ```
   APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_COPIED_ID/exec
   ```
3. Save and restart the dev server

---

## 3. ImgBB API Key (Image Uploads)

The app uses ImgBB for image uploads (free, no account required).

### Get your key:
1. Go to [imgbb.com](https://imgbb.com)
2. Click **Sign Up** (top right) and create a free account
3. Go to [API page](https://api.imgbb.com)
4. Copy your API key

### Update the key:
Open `src/lib/upload.ts` and replace the default key:

```typescript
const IMGBB_API_KEY = "your_actual_api_key_here";
```

---

## 4. Running the App

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 5. Admin Panel

Your app has a built-in admin panel for managing data:

1. Click the **⚙️ settings icon** (bottom-right corner)
2. Enter the **admin PIN** (default: `2026`)
3. Manage stations, milestones, and config in real-time
4. Upload images directly from the admin forms

**Change the PIN** in `.env`:
```
ADMIN_PIN=your_new_pin
NEXT_PUBLIC_ADMIN_PIN=your_new_pin
```

---

## 6. Deploy to Vercel (Production)

### 6.1 Prepare
1. Make sure `.env` has all values filled in
2. Update the ImgBB API key in `src/lib/upload.ts`

### 6.2 Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect your GitHub repo at https://vercel.com/new
```

### 6.3 Environment Variables on Vercel
In your Vercel project dashboard → **Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `APPS_SCRIPT_URL` | Your Google Apps Script web app URL |
| `ADMIN_PIN` | Your chosen admin PIN |
| `NEXT_PUBLIC_ADMIN_PIN` | Same as ADMIN_PIN (must be identical) |

---

## 7. Dev Time Slider

The **clock icon** (bottom-left) opens the time simulator — useful for testing all journey phases without waiting:

- Toggle **Override time** ON
- Drag the slider to any date
- Click station names to jump to that moment
- Press **Play** to auto-advance time
- Select speed: `1s = 1h`, `6h`, `1d`, or `7d`
- Click **Reset** to return to real time

---

## 8. Removing Dev Tools (Production)

When you're ready to go live, delete these files:

```
src/lib/dev-time.tsx
src/components/DevTimeSlider.tsx
```

Then remove from:

- `src/app/layout.tsx` — Remove `<DevTimeProvider>` wrapper
- `src/app/page.tsx` — Remove `<DevTimeSlider>` import + usage
- `src/components/HeroCountdown.tsx` — Replace `useNow()` with `new Date()`
- `src/components/StationsTrack.tsx` — Replace `useNow()` with `new Date()`
