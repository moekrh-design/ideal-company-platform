PROJECT_PATH="/var/www/systems/ideal-platform"
BACKUPS_DIR="${PROJECT_PATH}/snapshots"
LOG_FILE="/var/log/ideal-platform-snapshots.log"
MAX_SNAPSHOTS=30

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SNAPSHOT_NAME="${TIMESTAMP}_auto-daily"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

log "============================="
log "بدء النسخة الاحتياطية التلقائية اليومية"
log "الاسم: ${SNAPSHOT_NAME}"

mkdir -p "${BACKUPS_DIR}/${SNAPSHOT_NAME}"

[ -d "${PROJECT_PATH}/src" ] && cp -r "${PROJECT_PATH}/src" "${BACKUPS_DIR}/${SNAPSHOT_NAME}/src" && log "✅ تم نسخ src"
[ -d "${PROJECT_PATH}/server" ] && cp -r "${PROJECT_PATH}/server" "${BACKUPS_DIR}/${SNAPSHOT_NAME}/server" && log "✅ تم نسخ server"

for f in index.js package.json vite.config.js tailwind.config.js ecosystem.config.cjs; do
    [ -f "${PROJECT_PATH}/${f}" ] && cp "${PROJECT_PATH}/${f}" "${BACKUPS_DIR}/${SNAPSHOT_NAME}/${f}"
done
log "✅ تم نسخ الملفات الجذرية"

[ -f "${PROJECT_PATH}/data/platform.db" ] && cp "${PROJECT_PATH}/data/platform.db" "${BACKUPS_DIR}/${SNAPSHOT_NAME}/platform.db" && log "✅ تم نسخ قاعدة البيانات"

cat > "${BACKUPS_DIR}/${SNAPSHOT_NAME}/SNAPSHOT_INFO.md" << EOF
# نسخة احتياطية تلقائية يومية
## التاريخ: $(date '+%Y-%m-%d %H:%M:%S')
## الاسم: ${SNAPSHOT_NAME}
EOF

SIZE=$(du -sh "${BACKUPS_DIR}/${SNAPSHOT_NAME}" 2>/dev/null | cut -f1)
FILES=$(find "${BACKUPS_DIR}/${SNAPSHOT_NAME}" -type f | wc -l)
log "✅ مكتملة - الحجم: ${SIZE} | الملفات: ${FILES}"

TOTAL=$(ls -1 "${BACKUPS_DIR}/" 2>/dev/null | wc -l)
if [ "$TOTAL" -gt "$MAX_SNAPSHOTS" ]; then
    DELETE_COUNT=$((TOTAL - MAX_SNAPSHOTS))
    ls -1t "${BACKUPS_DIR}/" | tail -n "${DELETE_COUNT}" | while read old; do
        rm -rf "${BACKUPS_DIR}/${old}"
        log "   حُذف: ${old}"
    done
fi

REMAINING=$(ls -1 "${BACKUPS_DIR}/" 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "${BACKUPS_DIR}/" 2>/dev/null | cut -f1)
log "📊 النسخ المحفوظة: ${REMAINING} | الحجم الكلي: ${TOTAL_SIZE}"
log "============================="
