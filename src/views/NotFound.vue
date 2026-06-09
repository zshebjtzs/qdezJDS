<script setup>
    import { useRouter } from 'vue-router'
    const router = useRouter()
    //返回主页
    const backToHomePage = () => {
        router.push('/')
    }
</script>


<template>
    <div class="not-found">
        <h1>404 NOT FOUND</h1>
        <h2>请不要乱输网页地址</h2>
        <button @click="backToHomePage">退回主页</button>
    </div>
    
</template>

<style scoped>
    .not-found {
        text-align: center;
        margin-top: 6rem;
    }
</style>