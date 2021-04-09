function defineReactive(obj, key, val) {
  observe(val)

  Object.defineProperty(obj, key, {
    get() {
      console.log('get', val);
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        observe(newVal)
        console.log('set', newVal);
        val = newVal
      }
    }
  })
}

function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  Object.keys(obj).forEach(k => {
    defineReactive(obj, k, obj[k])
  })
}

function set(obj, key, val) {
  defineReactive(obj, key, val)
}


const obj = {
  a: 1,
  b: {
    c: 2
  }
}

// defineReactive(obj, 'a', 'haha')
observe(obj)
obj.a
obj.a = 'aaa'
obj.b
obj.b.c

set(obj, 'c', 3333)
obj.c
obj.c = 444