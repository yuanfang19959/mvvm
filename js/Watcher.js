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

/**
 * 发布过程
 * @param {*} vm 当前MVVM实例 
 * @param {*} exp 表达式 this.a.a
 * @param {Function} fn  函数
 */
function Watcher(vm, exp, fn) {
    this.fn = fn;
    this.vm = vm;
    this.exp = exp;

    // Dep.target 相当于即将订阅的目标
    // this 代表 当前watch实例
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
        let newVal = this.vm;
        let arr = this.exp.split('.');
        arr.forEach(function (k) {
            newVal = newVal[k]
        })
        this.fn(newVal);
    }
}