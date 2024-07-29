export class ReactiveEffect<T=any> {    
    // computed?:ComputedRefImpl<T>
    constructor(public fn:()=>T,public scheduler = null){

    }
    run(){ //响应性副作用执行时，将this赋值给activeEffect当前副作用
        return this.fn(); //run方法执行获得当前副作用中的函数
    }
}
/**
 * 响应性对象参数
 */
export interface ReactiveEffectOptions{
    lazy?: boolean
    /**
     * 调度器后有所变更
     */
}
export function triggerEffect(effect:ReactiveEffect) {
    
}

export function effect<T = any>(fn:()=>T,options?:ReactiveEffectOptions) {
    
}
export function track(target:object,key:unknown) {
    
}
export function trigger(target:object,key?:unknown) {
    
}