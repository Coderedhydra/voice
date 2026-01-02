#!/bin/bash

echo "========================================"
echo "  ANIME CHARACTER SETUP"
echo "========================================"
echo ""

# Create directory
echo "[1] Creating character directory..."
mkdir -p /workspace/public/character
echo "    ✅ Created /workspace/public/character/"

echo ""
echo "[2] Setting up default anime character..."
echo ""
echo "You have two options:"
echo ""
echo "  A) I have an anime character image"
echo "  B) Use a placeholder for now"
echo ""
read -p "Choose option (A/B): " choice

if [ "$choice" = "A" ] || [ "$choice" = "a" ]; then
    echo ""
    echo "Great! Please provide the path to your image:"
    read -p "Image path: " image_path
    
    if [ -f "$image_path" ]; then
        cp "$image_path" /workspace/public/character/yuki.png
        echo "    ✅ Copied image to /workspace/public/character/yuki.png"
        
        # Update the component
        echo ""
        echo "[3] Updating component..."
        sed -i "s|const FALLBACK_CHARACTER = '.*'|const FALLBACK_CHARACTER = '/character/yuki.png'|g" /workspace/app/waifu/components/AnimeCharacter.jsx
        echo "    ✅ Updated AnimeCharacter.jsx"
        
        echo ""
        echo "✅ SUCCESS! Your anime character is ready!"
        echo ""
        echo "Next steps:"
        echo "  1. Restart your server: bash ~/voice/local-waifu-live/start.sh"
        echo "  2. Go to http://localhost:3000/waifu"
        echo "  3. Click 'Use Images' button in top-right"
        echo ""
    else
        echo "    ❌ File not found: $image_path"
        exit 1
    fi
else
    echo ""
    echo "No problem! Using placeholder for now."
    echo ""
    echo "To add your own anime character later:"
    echo ""
    echo "  1. Get an anime character image from:"
    echo "     - https://waifulabs.com (free AI generator)"
    echo "     - https://picrew.me (character creator)"
    echo "     - Any anime girl PNG image you have"
    echo ""
    echo "  2. Save it as: /workspace/public/character/yuki.png"
    echo ""
    echo "  3. Run this script again with option A"
    echo ""
    echo "OR manually edit:"
    echo "  /workspace/app/waifu/components/AnimeCharacter.jsx"
    echo ""
fi

echo ""
echo "========================================"
echo "  RECOMMENDED ANIME IMAGE SOURCES"
echo "========================================"
echo ""
echo "🎨 Free AI Generators:"
echo "   • Waifu Labs: https://waifulabs.com"
echo "   • This Waifu Does Not Exist: https://thiswaifudoesnotexist.net"
echo "   • Crypko: https://crypko.ai"
echo ""
echo "🎮 Character Creators:"
echo "   • Picrew: https://picrew.me"
echo "   • Charat: https://charat.me"
echo ""
echo "📦 Asset Packs:"
echo "   • Itch.io VN Assets: https://itch.io/game-assets/tag-visual-novel"
echo "   • OpenGameArt: https://opengameart.org"
echo ""
echo "💡 TIP: Look for PNG images with transparent backgrounds!"
echo ""
echo "========================================"
