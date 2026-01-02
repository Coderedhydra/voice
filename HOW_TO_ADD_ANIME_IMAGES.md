# How to Add Real Anime Character Images

## 🎨 Current Setup

The system now supports **TWO rendering modes**:
1. **Image Mode** (NEW) - Uses actual anime character images/sprites
2. **Canvas Mode** (OLD) - Hand-drawn canvas rendering

You can toggle between them with the button in the top-right corner!

## 📸 Where to Get Anime Character Images

### Option 1: Free Anime Character Generators
- **Picrew** (https://picrew.me) - Create custom anime characters
- **Charat** (https://charat.me) - Anime avatar maker
- **VRoid Studio** (https://vroid.com) - 3D anime character maker with 2D export

### Option 2: Visual Novel Assets
- **OpenGameArt** (https://opengameart.org) - Free game assets
- **Itch.io** (https://itch.io/game-assets/free/tag-visual-novel) - Visual novel character sprites
- **Kenney Assets** (https://kenney.nl) - Free game assets

### Option 3: AI Generation
- **Waifu Labs** (https://waifulabs.com) - AI anime character generator
- **Crypko** (https://crypko.ai) - AI anime girl generator
- **This Waifu Does Not Exist** (https://www.thiswaifudoesnotexist.net)

### Option 4: Commission or Purchase
- **VGen** (https://vgen.co) - Commission anime artists
- **Booth.pm** (https://booth.pm) - Japanese digital marketplace
- **Gumroad** - Digital asset marketplace

## 📁 How to Add Images

### Step 1: Get Your Images

You need images for different poses:
- `idle_soft.png` - Standing normally
- `lean_forward.png` - Leaning toward viewer
- `sway_hips.png` - Hip swaying pose
- `teasing_pose.png` - Playful/teasing
- `close_intimate_pose.png` - Very close up
- `slow_breathing.png` - Breathing pose
- `shy_cover.png` - Shy/covering
- `seductive_dance.png` - Dancing
- `bounce_chest.png` - Bouncing

**Recommended sizes**: 800x1200 to 1200x1800 pixels (2:3 ratio)

### Step 2: Option A - Use Local Images

1. Create a folder: `/workspace/public/character/`

```bash
mkdir -p /workspace/public/character
```

2. Copy your images there:
```bash
cp idle_soft.png /workspace/public/character/
cp lean_forward.png /workspace/public/character/
# ... etc
```

3. Update `AnimeCharacter.jsx`:

```javascript
const CHARACTER_SPRITES = {
  idle_soft: {
    url: '/character/idle_soft.png',
    alt: 'Idle pose',
  },
  lean_forward: {
    url: '/character/lean_forward.png',
    alt: 'Leaning forward',
  },
  // ... add all poses
};
```

### Step 2: Option B - Use Online Images (Imgur, etc.)

1. Upload your images to:
   - Imgur (https://imgur.com)
   - Cloudinary (https://cloudinary.com)
   - ImgBB (https://imgbb.com)

2. Get direct image links

3. Update `AnimeCharacter.jsx`:

```javascript
const CHARACTER_SPRITES = {
  idle_soft: {
    url: 'https://i.imgur.com/YOUR_IMAGE_ID.png',
    alt: 'Idle pose',
  },
  lean_forward: {
    url: 'https://i.imgur.com/ANOTHER_ID.png',
    alt: 'Leaning forward',
  },
  // ... etc
};
```

## 🎯 Quick Setup (Single Image for All Poses)

If you only have ONE anime character image, that's fine too!

1. Save your image as `/workspace/public/character/yuki.png`

2. Update `AnimeCharacter.jsx`:

```javascript
const SINGLE_CHARACTER_IMAGE = '/character/yuki.png';

const CHARACTER_SPRITES = {
  idle_soft: { url: SINGLE_CHARACTER_IMAGE, alt: 'Yuki' },
  lean_forward: { url: SINGLE_CHARACTER_IMAGE, alt: 'Yuki' },
  sway_hips: { url: SINGLE_CHARACTER_IMAGE, alt: 'Yuki' },
  teasing_pose: { url: SINGLE_CHARACTER_IMAGE, alt: 'Yuki' },
  close_intimate_pose: { url: SINGLE_CHARACTER_IMAGE, alt: 'Yuki' },
  slow_breathing: { url: SINGLE_CHARACTER_IMAGE, alt: 'Yuki' },
  shy_cover: { url: SINGLE_CHARACTER_IMAGE, alt: 'Yuki' },
  seductive_dance: { url: SINGLE_CHARACTER_IMAGE, alt: 'Yuki' },
  bounce_chest: { url: SINGLE_CHARACTER_IMAGE, alt: 'Yuki' },
};
```

The animations will still work - they'll scale/rotate/pulse the image!

## 🔧 File to Edit

**File**: `/workspace/app/waifu/components/AnimeCharacter.jsx`

**Line**: Look for `CHARACTER_SPRITES` object (around line 9)

## 📐 Image Requirements

### Best Results:
- **Format**: PNG with transparent background
- **Size**: 800-1200 pixels wide, 1200-1800 pixels tall
- **Style**: Anime/manga art style
- **Pose**: Full body or waist-up
- **Expression**: Friendly/seductive

### Acceptable:
- JPG images (but PNG is better)
- Different sizes (will auto-scale)
- Cropped images (waist-up, portrait)

## 🎨 Recommended Free Image

### Quick Test Image:

Use this free anime girl generator:
1. Go to https://waifulabs.com
2. Generate a character you like
3. Download the image
4. Save as `/workspace/public/character/yuki.png`
5. Update the code as shown above

## 🚀 Testing

1. **Restart the dev server**:
```bash
cd /workspace
npm run dev
```

2. **Open browser**: http://localhost:3000/waifu

3. **Click "Use Images"** button in top-right to switch to image mode

4. **Chat** and watch your anime character respond!

## 🎭 Advanced: Multiple Expressions

For best results, create images for different expressions:
- `yuki_smile.png`
- `yuki_blush.png`
- `yuki_wink.png`
- etc.

Then update the code to swap images based on `expression` prop.

## ❓ Troubleshooting

### Images not showing?
- Check file paths are correct
- Check Next.js can access `/public` folder
- Check image URLs are publicly accessible
- Open browser console (F12) for errors

### Images look bad?
- Use higher resolution images (1200px+)
- Use PNG format with transparency
- Ensure original art quality is good

### Still want better quality?
- Commission an artist on VGen or Fiverr
- Use AI generation tools (Stable Diffusion, NovelAI)
- Purchase character sprite packs

## 📝 Example: Full Setup

```bash
# 1. Create directory
mkdir -p /workspace/public/character

# 2. Download image (example)
curl -o /workspace/public/character/yuki.png "https://example.com/anime-girl.png"

# 3. Edit the file
nano /workspace/app/waifu/components/AnimeCharacter.jsx

# 4. Restart server
cd /workspace && npm run dev
```

Now you have a REAL anime character instead of canvas drawings! 🎀✨
