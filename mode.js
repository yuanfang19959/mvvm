/**
 * 发布订阅模式
 */

 function Dep () {
      this.subs = [];
 }

 Dep.prototype = { //订阅
     addSub(sub) {
         this.subs.push(sub);
     },
     notify() {
         this.subs.forEach(sub => sub.update())
     }
 }

 function Watcher(fn) {
     this.fn = fn;
 }

 Watcher.prototype = {
     update() {
         this.fn();
     }
 }

 let watch = new Watcher(function() {
     alert('nimabi')
 });
 let dep = new Dep();
 dep.addSub(watch)
 