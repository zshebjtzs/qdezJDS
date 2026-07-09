#!/bin/bash
# =============================================
# 数据库快速初始化脚本
# 用法：bash scripts/init-db.sh [sql文件路径]
# 示例：bash scripts/init-db.sh server/db/init.sql
# =============================================

set -e  # 遇到错误立即退出

# 数据库配置（从 .env 读取或手动填写）
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-qdezJDS_dbuser}"
DB_NAME="${DB_NAME:-qdez_JDS_db}"
SQL_FILE="${1:-server/db/init.sql}"
BACKUP_DIR="server/db/backups"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 SQL 文件是否存在
if [ ! -f "$SQL_FILE" ]; then
    log_error "SQL 文件不存在：$SQL_FILE"
    exit 1
fi

# 检查 MySQL 连接
mysql -h "$DB_HOST" -u "$DB_USER" -p -e "SELECT 1;" "$DB_NAME" &>/dev/null
if [ $? -ne 0 ]; then
    log_error "无法连接到数据库 $DB_NAME，请检查配置和密码。"
    exit 1
fi
log_info "数据库连接正常。"

# 自动备份
log_warn "即将导入 SQL 文件：$SQL_FILE，这可能会覆盖现有数据。"
read -p "确认继续？(y/n) " confirm
if [ "$confirm" != "y" ]; then
    log_info "已取消。"
    exit 0
fi

mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_before_init_$(date +%Y%m%d_%H%M%S).sql"
log_info "正在备份当前数据库到 $BACKUP_FILE ..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" > "$BACKUP_FILE"
log_info "备份完成。"

# 导入 SQL
log_info "正在导入 $SQL_FILE ..."
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < "$SQL_FILE"
log_info "导入成功！数据库已初始化。"

# 验证
log_info "当前表列表："
mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" -e "SHOW TABLES;"