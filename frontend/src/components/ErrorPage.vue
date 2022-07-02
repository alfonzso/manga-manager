<template>
  <div class="box error-box" v-if="error">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
    <ul>
      <li v-for="error in errors" :key="error.id">{{ error }}</li>
    </ul>
    </p>
    <div class="error-header">Error {{ error.status }}: {{ error.statusText }}</div>
    <div class="error-body">
      <strong>Request:</strong>
      <br>
      - Method: {{ error.method }}
      <br>
      - URL: {{ error.url }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorPage',
  props: ['error', 'errors']
}
</script>