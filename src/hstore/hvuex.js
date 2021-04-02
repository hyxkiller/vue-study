
let Vue

class Store {
  constructor(ops) {
    this.$options = ops
    // Vue.util.defineReactive(this, '_vm', ops.state)
    this._mutations = ops.mutations
    this._actions = ops.actions

    const computed = {}
    for(let [k, fn] of Object.entries(ops.getters)) {
      computed[k] = () => fn(this.state)
    }

    this._vm = new Vue({
      data: {
        $$state: ops.state,
      },
      computed
    })
  }

  get getters() {
    return this._vm
  }

  commit = (type, payload) => {
    const func = this._mutations[type]
    if (!func) {
      console.error('没有这个mutation');
      return
    }
    // func.call(this, this.state, payload)
    func(this.state, payload)
  }

  dispatch = (type, payload) => {
    const func = this._actions[type]
    if (!func) {
      console.error('没有这个mutation');
      return
    }
    func(this, payload)
  }

  get state() {
    // 用new Vue响应式_vm
    return this._vm._data.$$state
    // 用Vue.util.defineReactive响应式_vm
    // return this._vm
  }

  set state(v) {
    console.error('不能修改state');
  }

}

function install(_Vue) {
  Vue = _Vue
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store
      }
    },
  })
}

export default {
  Store,
  install
}