<template>
  <div class="vditor-wrapper">
    <div ref="vditorContainer" class="vditor-container" style="min-height: 400px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '请输入内容...' },
  height: { type: Number, default: 400 }
})

const emit = defineEmits(['update:modelValue'])

const vditorContainer = ref(null)
let vditorInstance = null

onMounted(() => {
  // 确保 DOM 完全渲染后再初始化
  nextTick(() => {
    if (!vditorContainer.value) return

    // 如果容器高度为 0，延迟 50ms 再试一次（避免空白）
    if (vditorContainer.value.clientHeight === 0) {
      setTimeout(() => {
        if (vditorContainer.value && vditorContainer.value.clientHeight === 0) {
          vditorContainer.value.style.height = props.height + 'px'
        }
        initVditor()
      }, 50)
    } else {
      initVditor()
    }
  })
})

function initVditor() {
  if (vditorInstance) return
  vditorInstance = new Vditor(vditorContainer.value, {
    mode: 'sv',                // 分屏预览（左侧编辑，右侧预览）
    height: props.height,
    placeholder: props.placeholder,
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      'insert-before',
      'insert-after',
      '|',
      'upload',
      'record',
      'table',
      'math',            // 数学公式按钮
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      'preview',
      'outline',
      'devtools',
      '|',
      'fullscreen'
    ],
    upload: {
      // 上传接口（暂时占位，后续可实现）
      url: '/api/upload/image',
      accept: 'image/*',
      max: 10 * 1024 * 1024,          // 10MB
      fieldName: 'file',
      success: (editor, msg) => {
        // 上传成功回调，可替换为实际返回的图片URL
      }
    },
    counter: { enable: true, max: 20000 },
    cache: {
      enable: false
    },
    preview: {
      math: {
        engine: 'KaTeX'   // 预览时使用 KaTeX 渲染数学公式
      }
    },
    after: () => {
      // 如果传入了初始值，设置内容
      if (props.modelValue) {
        vditorInstance.setValue(props.modelValue)
      }
    },
    input: (value) => {
      // 用户输入时实时更新绑定值
      emit('update:modelValue', value)
    },
    sanitize: true       // Vditor 内置 HTML 净化（第一层防护）
  })
}

// 监听外部 modelValue 变化（如编辑已有帖子，未来可能用到）
watch(() => props.modelValue, (newVal) => {
  if (vditorInstance && newVal !== vditorInstance.getValue()) {
    vditorInstance.setValue(newVal)
  }
})

onBeforeUnmount(() => {
  if (vditorInstance) {
    vditorInstance.destroy()
    vditorInstance = null
  }
})
</script>

<style scoped>
.vditor-wrapper {
  border: 1px solid #d9e5df;
  border-radius: 10px;
  overflow: hidden;
}
.vditor-container {
  min-height: 400px;
}
</style>