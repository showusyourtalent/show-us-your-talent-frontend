#!/bin/bash
# ============================================================
# Script de migration axios — à lancer UNE SEULE FOIS
# depuis la RACINE de votre projet frontend
# Usage : bash migrate-axios.sh
# ============================================================

set -e
ROOT="src"
TARGET="src/api/axios.js"

echo "🔍 Recherche de tous les imports axios..."

# Fichiers à corriger et leurs remplacements
declare -A REPLACEMENTS=(
  # Fichiers dans src/pages/  (profondeur 1 depuis src/)
  ["src/pages/Home.jsx"]="../api/axios"
  ["src/pages/Editions.jsx"]="../api/axios"
  ["src/pages/DiscussionsPage.jsx"]="../api/axios"
  ["src/pages/VoteDetailsPage.jsx"]="../api/axios"

  # Fichiers dans src/pages/Votes/  (profondeur 2)
  ["src/pages/Votes/Votes.jsx"]="../../api/axios"

  # Fichiers dans src/pages/dashboard/
  ["src/pages/dashboard/AdminDashboard.jsx"]="../../api/axios"
  ["src/pages/dashboard/PromoteurDashboard.jsx"]="../../api/axios"

  # Fichiers dans src/pages/promoteur/
  ["src/pages/promoteur/ValidationCandidatures.jsx"]="../../api/axios"
  ["src/pages/promoteur/GestionEditions.jsx"]="../../api/axios"
  ["src/pages/promoteur/EditionForm.jsx"]="../../api/axios"

  # Fichiers dans src/pages/candidat/
  ["src/pages/candidat/Postuler.jsx"]="../../api/axios"

  # Fichiers dans src/components/Layout/
  ["src/components/Layout/Header.jsx"]="../../api/axios"

  # Fichiers dans src/components/Chat/
  ["src/components/Chat/ChatModal.jsx"]="../../api/axios"
  ["src/components/Chat/ChatRoomList.jsx"]="../../api/axios"
  ["src/components/Chat/ChatMessage.jsx"]="../../api/axios"
  ["src/components/Chat/ChatNotificationBell.jsx"]="../../api/axios"

  # Fichiers dans src/components/Candidat/
  ["src/components/Candidat/VotesStats.jsx"]="../../api/axios"

  # Fichiers dans src/contexts/
  ["src/contexts/AuthContext.jsx"]="../api/axios"

  # Fichiers dans src/hooks/
  ["src/hooks/usePayment.js"]="../api/axios"

  # src/lib/axios.js et src/utils/axiosConfig.js seront supprimés
)

echo ""
echo "📝 Correction des imports..."

for FILE in "${!REPLACEMENTS[@]}"; do
  CORRECT_PATH="${REPLACEMENTS[$FILE]}"
  if [ -f "$FILE" ]; then
    # Remplace tout import qui pointe vers axiosConfig, lib/axios, utils/axiosConfig
    sed -i \
      -e "s|from '[./]*utils/axiosConfig'|from '$CORRECT_PATH'|g" \
      -e "s|from '[./]*lib/axios'|from '$CORRECT_PATH'|g" \
      -e "s|from '[./]*api/axios'|from '$CORRECT_PATH'|g" \
      "$FILE"
    echo "  ✅ $FILE → $CORRECT_PATH"
  else
    echo "  ⚠️  $FILE non trouvé (ignoré)"
  fi
done

echo ""
echo "🗑️  Suppression des fichiers axios dupliqués..."

# Supprimer les anciens fichiers (garder uniquement src/api/axios.js)
[ -f "src/lib/axios.js" ]           && rm "src/lib/axios.js"           && echo "  🗑️  src/lib/axios.js supprimé"
[ -f "src/utils/axiosConfig.js" ]   && rm "src/utils/axiosConfig.js"   && echo "  🗑️  src/utils/axiosConfig.js supprimé"
[ -f "src/pages/dashboard/api/axios.js" ] && rm "src/pages/dashboard/api/axios.js" && echo "  🗑️  src/pages/dashboard/api/axios.js supprimé"

echo ""
echo "🔎 Vérification finale — imports restants :"
grep -r "import.*from.*axios" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" | grep -v "src/api/axios.js" | grep -v "node_modules"

echo ""
echo "✅ Migration terminée !"
echo "   Seul fichier source : src/api/axios.js"
echo "   Lancez : npm run dev  pour vérifier"