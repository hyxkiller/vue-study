let Vue
class VueRouter {
  constructor(ops) {
    this.$options = ops
    // Vue.util.defineReactive(this, 'current', window.location.pathname.slice() || '')
    Vue.util.defineReactive(this, 'current', window.location.hash.slice(1) || '')
    window.addEventListener('hashchange', () => {
      this.current = window.location.hash.slice(1) || ''
    })
  }
}

VueRouter.install = function (_Vue) {
  Vue = _Vue
  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router
      }
    },
  })

  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      }
    },
    render(h) {
      return h('a', { attrs: { href: '#' + this.to } }, this.$slots.default)
    }
  })
  Vue.component('router-view', {
    render(h) {
      const component = this.$router.$options.routes.find(x => x.path === this.$router.current)?.component || null
      return h(component)
    }
  })
}

export default VueRouter