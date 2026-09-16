#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────
# Material Symbols Outlined: self-hosted Subset neu erzeugen.
#
# Lädt für die unten gelisteten Icons ein winziges Subset (~200 KB statt
# ~4 MB Vollfont) von Google Fonts und legt es unter
# public/fonts/material-symbols-outlined.woff2 ab.
#
# Neue Icon-Namen (z. B. wenn im Admin/Code ein neues Icon verwendet wird)
# einfach in ICON_NAMES ergänzen und dieses Skript erneut ausführen.
#
# Aufruf:  bash scripts/generate-material-symbols.sh
# ────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/public/fonts/material-symbols-outlined.woff2"
UA="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36"

ICON_NAMES="add,add_circle,admin_panel_settings,ads_click,alarm,analytics,arrow_back,arrow_downward,arrow_forward,arrow_upward,article,attach_money,auto_awesome,auto_awesome_mosaic,backup,bar_chart,block,bolt,brunch_dining,brush,cake,calendar_today,campaign,cancel,card_membership,category,celebration,chair,chair_alt,chat_bubble,check,check_circle,chevron_left,chevron_right,circle,cleaning_services,close,cloud,cloud_off,cloud_upload,coffee,collections,content_copy,contrast,credit_card,dark_mode,delete,delete_forever,delivery_dining,description,design_services,desk,dinner_dining,done,done_all,download,dry_cleaning,edit,email,emoji_events,error,euro,event_seat,expand_less,expand_more,favorite,feed,filter_list,flatware,folder,folder_open,forum,group,groups,hd,help,high_quality,history,hourglass_empty,icecream,image,info,insights,inventory,inventory_2,key,keyboard_double_arrow_down,label,light_mode,liquor,list,live_tv,local_bar,local_cafe,local_dining,local_offer,local_pizza,local_shipping,location_on,lock,loop,loyalty,lunch_dining,map,meeting_room,menu,menu_book,mic,military_tech,more_horiz,more_vert,music_note,no_drinks,notes,notifications,notifications_active,offline_bolt,open_in_new,outdoor_grill,palette,pause,payments,people,person,person_add,phone,photo_camera,photo_library,pending,pending_actions,pie_chart,play_arrow,price_check,print,progress_activity,qr_code,qr_code_scanner,queue_music,radio_button_checked,receipt_long,refresh,remove,repeat,restaurant,restaurant_menu,room_service,save,schedule,search,send,sentiment_satisfied,settings,share,shopping_bag,shopping_cart,shuffle,signal_wifi_bad,skip_next,skip_previous,slideshow,smoking_rooms,sort,sports_bar,sports_esports,square,star,stars,store,storefront,subtitles,sync,table_bar,table_restaurant,task_alt,text_fields,thumb_up,timer,title,toggle_off,toggle_on,trending_up,tune,undo,upload,upload_file,verified,visibility,visibility_off,volume_off,volume_up,warning,warehouse,wash,whatshot,wifi_off,wine_bar,workspace_premium"

CSS_URL="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=${ICON_NAMES}&display=block"

echo "→ hole Google-Fonts-CSS …"
CSS="$(curl -fsS --max-time 60 -A "$UA" "$CSS_URL")"
FONT_URL="$(printf '%s' "$CSS" | grep -oE 'https://fonts.gstatic.com[^)]+' | head -1)"
[ -n "$FONT_URL" ] || { echo "FEHLER: keine Font-URL im CSS gefunden"; exit 1; }

echo "→ lade Subset …"
mkdir -p "$(dirname "$OUT")"
curl -fsS --max-time 120 -A "$UA" "$FONT_URL" -o "$OUT"
echo "✓ fertig: $OUT ($(wc -c < "$OUT") Bytes)"
