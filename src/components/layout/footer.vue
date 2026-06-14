<!-- src/components/layout/footer.vue -->
<template>
  <footer class="app-footer">
    <div class="footer-links">
      <router-link to="/legal/terms" target="_blank">使用条款</router-link>
      <router-link to="/legal/privacy" target="_blank">隐私政策</router-link>
      <br>
      <router-link to="/home/UserList">用户列表</router-link>
    </div>
    <div class="footer-copyright">
      © 2026 机电社. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
// 未来可在此添加更多页脚信息
</script>

<style scoped>
.app-footer {
  text-align: center;
  padding: 24px 0 30px;
  margin-top: 60px;
  border-top: 1px solid #eee;
  color: #8a9aa8;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.footer-links {
  margin-bottom: 10px;
}

.footer-links a {
  color: #8a9aa8;
  text-decoration: none;
  margin: 0 12px;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #42b983;
}

.footer-copyright {
  font-size: 0.85rem;
}
</style>