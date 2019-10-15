/**
 * 观察者，观察对象并定义Object.defineProperty实现监听效果
 * @param {*} data 
 */
function Observe(data) {
    let dep = new Dep();
    for (let key in data) {
        let val = data[key]
        observe(val);
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
                dep.notify(); //设置新值 通知订阅者
            }
        })

    }
}

function observe(data) {
    if (!data || typeof data !== 'object') return;
    return new Observe(data);
}