// 对应 promise 的 pending 状态
let isFlushPending = false
/**
 * promise.resolve()
 */
const resolvedPromise = Promise.resolve() as Promise<any>
/**
 * 当前的执行任务
 */
let currentFlushPromise: Promise<void> | null = null
/**
 * 待执行的任务队列
 */
const pendingPreFlushCbs: Function[] = []
/**
 * 队列预处理函数
 */
export function queuePreFlushCb(cb: Function) {
	queueCb(cb, pendingPreFlushCbs)
}
/**
 * 队列处理函数
 */
function queueCb(cb: Function, pendingQueue: Function[]) {
	pendingQueue.push(cb) //将所有回调函数放到队列中
	queueFlush() //依次执行队列中的函数
}
/**
 * 依次处理队列中执行函数
 */
function queueFlush() {
	if (!isFlushPending) {  //如果不在等待状态，就将当前的flush添加为处理队列
		isFlushPending = true
		currentFlushPromise = resolvedPromise.then(flushJobs)
	}
}
/**
 * 处理队列
 */
function flushJobs() {  //处理队列依次执行队列中的任务
	isFlushPending = false
	flushPreFlushCbs()
}
/**
 * 依次处理队列中的任务
 */
export function flushPreFlushCbs() {
	if (pendingPreFlushCbs.length) { //如果待执行的函数队列中有值
		// 去重
		let activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
		// 清空数据
		pendingPreFlushCbs.length = 0
		// 循环运行
		for (let i = 0; i < activePreFlushCbs.length; i++) {
			activePreFlushCbs[i]()
		}
	}
}
