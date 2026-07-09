#!/bin/bash
# =============================================
# 数据库迁移脚本模板
# 用法：bash scripts/migrate.sh [backup|up|down|status]
# =============================================

# 数据库配置（从 .env 读取或手动填写）
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-qdezJDS_dbuser}"
DB_NAME="${DB_NAME:-qdez_JDS_db}"
BACKUP_DIR="server/db/backups"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 MySQL 连接
check_connection() {
    mysql -h "$DB_HOST" -u "$DB_USER" -p -e "SELECT 1;" "$DB_NAME" &>/dev/null
    if [ $? -ne 0 ]; then
        log_error "无法连接到数据库 $DB_NAME，请检查配置和密码。"
        exit 1
    fi
    log_info "数据库连接正常。"
}

# 备份数据库
do_backup() {
    mkdir -p "$BACKUP_DIR"
    local filename="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    log_info "正在备份数据库到 $filename ..."
    mysqldump -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" > "$filename"
    if [ $? -eq 0 ]; then
        log_info "备份完成。"
    else
        log_error "备份失败，请检查权限或密码。"
        exit 1
    fi
}

# 执行迁移（示例：添加字段）
do_up() {
    log_warn "即将执行数据库结构变更。"
    read -p "确认执行迁移？(y/n) " confirm
    if [ "$confirm" != "y" ]; then
        log_info "已取消。"
        exit 0
    fi

    do_backup

    mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" <<EOF
-- 在此处编写迁移 SQL
-- 示例：ALTER TABLE users ADD COLUMN new_field VARCHAR(100) NULL AFTER bio;
SELECT 'Migration executed' AS status;
EOF
    log_info "迁移执行完毕。"
}

# 回滚（需手动编写回滚 SQL）
do_down() {
    log_error "回滚需要手动编写 SQL，请编辑脚本中的 do_down() 函数。"
    # 示例：ALTER TABLE users DROP COLUMN new_field;
}

# 查看当前表结构
do_status() {
    mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" -e "SHOW TABLES;"
    log_info "提示：使用 'DESCRIBE 表名;' 查看具体表结构。"
}

# 主逻辑
case "${1:-status}" in
    backup) check_connection && do_backup ;;
    up)     check_connection && do_up ;;
    down)   check_connection && do_down ;;
    status) check_connection && do_status ;;
    *)      echo "用法: $0 [backup|up|down|status]" ;;
esac