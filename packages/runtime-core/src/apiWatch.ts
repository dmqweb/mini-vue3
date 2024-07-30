import { EMPTY_OBJ, hasChanged, isObject } from '@vue/shared'
import { ReactiveEffect } from 'packages/reactivity/src/effect'
import { isReactive } from 'packages/reactivity/src/reactive'
import { queuePreFlushCb } from './scheduler'
/**
 * watch 配置项属性
 */
export interface WatchOptions<Immediate = boolean> {
	immediate?: Immediate
	deep?: boolean
}
/**
 * 指定的 watch 函数
 * @param source 监听的响应性数据
 * @param cb 回调函数
 * @param options 配置对象
 */
export function watch(source, cb: Function, options?: WatchOptions) {
	return doWatch(source as any, cb, options)
}
function doWatch(
	source,
	cb: Function,
	{ immediate, deep }: WatchOptions = EMPTY_OBJ
) {
	let getter: () => any
	if (isReactive(source)) {  //判断source的数据类型，如果是响应式对象就将getter函数返回它
		getter = () => source
		deep = true //如果是响应式对象，就默认开启深度监听
	} else {
		getter = () => {} //否则就将getter返回值赋值为空对象
	}
	if (cb && deep) {  //如果有回调函数，并且配置对象中开启了深度监听
		const baseGetter = getter
		getter = () => traverse(baseGetter()) //防止深度监听的对象中存在递归调用
	}
	let oldValue = {} //旧值
	const job = () => {
		if (cb) {
			const newValue = effect.run() //如果有回调函数，就执行得到新值
			if (deep || hasChanged(newValue, oldValue)) { 
				cb(newValue, oldValue) //执行回调函数并传参
				oldValue = newValue //重新赋值旧值
			}
		}
	}
	// 调度器
	let scheduler = () => queuePreFlushCb(job) //调度器的作用是改变函数的执行顺序 
	const effect = new ReactiveEffect(getter, scheduler)
	if (cb) {
		if (immediate) {
			job()
		} else {
			oldValue = effect.run()
		}
	} else {
		effect.run()
	}
	return () => {
		effect.stop()
	}
}

/**
 * 依次执行 getter，从而触发依赖收集
 */
export function traverse(value: unknown, seen?: Set<unknown>) {
	if (!isObject(value)) { //如果不是对象，直接返回
		return value
	}
	seen = seen || new Set() 
	seen.add(value)
	for (const key in value as object) { //便利对象，使得对象属性被依赖收集
		traverse((value as any)[key], seen) //递归调用自身，使用seen set集合的作用是防止对象中递归引用造成死循环
	}
	return value
}
