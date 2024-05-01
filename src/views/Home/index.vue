<script setup lang="ts">

</script>

<template>
  <main class="home">
    <div class="wrapper" ref="container">
      <ToolBar />
      <RouterView />
    </div>
    <footer class="footer">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">闽ICP备2023004110号</a>
    </footer>
  </main>
</template>

<style lang="scss" src="./styles.scss" scoped />
