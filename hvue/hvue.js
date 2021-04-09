function defineReactive(obj, key, val) {
  observe(val)
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      console.log('get', val);
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        observe(newVal)
        val = newVal
        dep.notify()
      }
    }
  })
}

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  new Observer(obj)
}

class Observer {
  constructor(obj) {
    if (Array.isArray(obj)) {
      // todo
    } else {
      this.walk(obj)
    }
  }
  walk(obj) {
    Object.keys(obj).forEach(k => {
      defineReactive(obj, k, obj[k])
    })
  }
}

function proxy(vm) {
  Object.keys(vm.$data).forEach(k => {
    Object.defineProperty(vm, k, {
      get() {
        return vm.$data[k]
      },
      set(v) {
        vm.$data[k] = v
      }
    })
  })
}

class HVue {
  constructor(ops) {
    this.$options = ops
    this.$data = ops.data
    console.log(ops);
    // data响应式
    observe(this.$data)
    // 代理
    proxy(this)
    // 编译
    new Compile(ops.el, this)
  }
  // constructor({el, data, methods}) {
  //   this.$el = document.querySelector(el)
  //   this.$data = data
  //   this.$methods = methods
  // }
}

class Compile {
  constructor(el, vm) {
    this.$vm = vm
    this.$el = document.querySelector(el)
    if (this.$el) {
      this.compile(this.$el)
    }
  }
  compile(el) {
    el.childNodes.forEach(n => {
      if (this.isElement(n)) {
        // console.log("编译元素", n.nodeName);
        this.compileElement(n)
      } else if (this.isInter(n)) {
        // console.log('编译插值文本', n.textContent);
        this.compileText(n)
      }
      if (n.childNodes.length) {
        this.compile(n)
      }
    })
  }
  isElement(n) {
    // 普通元素
    return n.nodeType === 1
  }
  isInter(n) {
    // 插值判断
    return n.nodeType === 3 && /\{\{(.*)\}\}/.test(n.textContent)
  }
  compileElement(n) {
    const attrs = n.attributes
    Array.from(attrs).forEach(attr => {
      const attrName = attr.name
      const exp = attr.value
      // 处理指令
      if(this.isDir(attrName)) {
        const dir = attrName.substring(2)
        this[dir] && this[dir](n, exp)
      }
      // 处理事件
      if(this.isEvent(attrName)) {
        const dir = attrName.substring(1)
        this.eventHandler(n, exp, dir)
      }
    })
  }

  isEvent(name) {
    return name.startsWith('@')
  } 

  eventHandler(node, exp, dir) {
    const fn = this.$vm.$options?.methods[exp]
    node.addEventListener(dir, fn.bind(this.$vm))
  }

  isDir(name) {
    return name.startsWith('h-')
  }

  model(n, exp) {
    this.update(n, exp, 'model')
    n.addEventListener('input', e => {
      this.$vm[exp] = e.target.value
    })
  }

  modelUpdater(n, v) {
    n.value = v
  }

  compileText(n) {
    // n.textContent = this.$vm[RegExp.$1]
    this.update(n, RegExp.$1, 'text')
  }

  text(n, exp) {
    this.update(n, exp, 'text')
  }
  
  textUpdater(n, v) {
    n.textContent = v
  }

  html(n, exp) {
    this.update(n, exp, 'html')
  }

  htmlUpdater(n, v) {
    n.innerHTML = v
  }

  update(n, exp, dir) {
    // 执行指令函数
    const fn = this[dir+'Updater']
    fn && fn(n, this.$vm[exp])
    // 创建Watch实例
    new Watcher(this.$vm, exp, function(v) {
      fn && fn(n, v)
    })
  }

}

class Watcher {
  constructor(vm, k, updater) {
    this.vm = vm
    this.k = k
    this.updater = updater

    // 保存Watch引用
    Dep.target = this
    this.vm[this.k]
    Dep.target = null
  }
  update() {
    this.updater.call(this.vm, this.vm[this.k])
  }
}

class Dep {
  constructor() {
    this.deps = []
  }
  addDep(v) {
    this.deps.push(v)
  }
  notify() {
    this.deps.forEach(w => w.update())
  }
}