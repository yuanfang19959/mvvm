const log = console.log;
/**
 * 存放实例的一些参数
 * @param {Object} options 
 */
function MVVM(options = {}) {
    //将所有属性挂载在$options
    this.$options = options;
    let data = this._data = this.$options.data;

    // 观察实例的data
    observe(data);

    // 数据代理 使用vm.a 方式代替vm._data.a
    for (let key in data) {
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: true,
            get() {
                return this._data[key];
            },
            set(newVal) {
                this._data[key] = newVal
            }
        })
    }

    //编译实例
    new Compile(options.el, this);

}


/**
 * 观察者，观察对象并定义Object.defineProperty实现监听效果
 * @param {*} data 
 */
function Observe(data) {
    let dep = new Dep();
    for (let key in data) {
        let val = data[key]

        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                Dep.target && dep.addSub(Dep.target)
                log('我来取值了！')
                return val;
            },
            set(newVal) {
                if (newVal === val) return;
                log('不好意思来设置值了')
                val = newVal;

                // 这边新设置的属性可能是一个对象 所以需要继续监听
                observe(val);
                dep.notify();
            }
        })

    }
}

function observe(data) {
    if (!data || typeof data != 'object') return;
    return new Observe(data);
}

// 编译
function Compile(el, vm) {
    // el表示替换的范围
    vm.$el = document.querySelector(el);
    // 将$el中的内容插入到fragment中 其实是内存中。 
    let fragment = document.createDocumentFragment();
    while (child = vm.$el.firstChild) {
        fragment.appendChild(child)
    }

    replace(fragment);
    /**
     *用于替换和匹配dom节点中的{{}}
     * @param {*} fragment 
     */
    function replace(fragment) {
        //循环dom节点的每一层
        Array.from(fragment.childNodes).forEach(node => {
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/
            // 判断是不是文本节点，且含有{{}}
            if (node.nodeType === 3 && reg.test(text)) {
                log(RegExp.$1) //a.a vm.b
                let arr = RegExp.$1.split('.'); //[a,a]
                let val = vm;
                arr.forEach(key => {
                    val = val[key]
                })

                new Watcher(vm, RegExp.$1, function (newVal) {
                    node.textContent = text.replace(/\{\{(.*)\}\}/, newVal);
                })

                node.textContent = text.replace(/\{\{(.*)\}\}/, val);
            }

            //根据指令判断 'Z-model'
            if (node.nodeType === 1) {
                let nodeAttrs = node.attributes; //获取当前节点的属性
                Array.from(nodeAttrs).forEach(function(attr){
                    let attrName = attr.name;
                    let attrVal = attr.value;
                    if (attrName.indexOf('Z-') === 0) {
                        node.value = vm[attrVal];
                    }
                    new Watcher(vm, attrVal, function(newVal) {
                        node.value = newVal;
                    })
                    node.addEventListener('input',function(e){
                        let newVal = e.target.value;
                        vm[attrVal] = newVal;
                    })
                } )
            }

            if (node.childNodes) {
                replace(node);
            }
        })
    }

    vm.$el.appendChild(fragment)
}

function Dep() {
    this.subs = [];
}

Dep.prototype = {
    addSub(sub) {
        this.subs.push(sub);
    },
    notify() {
        this.subs.forEach(sub => sub.update())
    }
}

function Watcher(vm, exp, fn) {
    this.fn = fn;
    this.vm = vm;
    this.exp = exp;
    Dep.target = this;
    let val = vm;
    let arr = exp.split('.');
    arr.forEach(function (k) {
        val = val[k]
    })
    Dep.target = null;
}

Watcher.prototype = {

    update() {
        let val = this.vm;
        let arr = this.exp.split('.');
        arr.forEach(function (k) {
            val = val[k]
        })
        this.fn(val);
    }
}
