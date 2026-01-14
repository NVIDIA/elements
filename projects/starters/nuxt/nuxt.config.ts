// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('nve-')
    }
  },
  app: {
    head: {
      title: 'Elements + Nuxt',
      htmlAttrs: {
        lang: 'en',
        'nve-theme': 'dark',
        'nve-transition': 'auto'
      } as any
    }
  }
});
