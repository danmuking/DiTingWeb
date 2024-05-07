import eventBus from '@/utils/eventBus'
import apis from '@/services/apis'
import type { MsgReadUnReadCountType } from '@/services/types'
import type { Method } from 'alova'
import type { FetchRequestInit } from 'alova/GlobalFetch'
import type { Ref } from 'vue'

const queue = new Set<number>()
let timer: number | null = null
let request: Method<
  Ref<unknown>,
  Ref<unknown>,
  MsgReadUnReadCountType[],
  unknown,
  FetchRequestInit,
  Response,
  Headers
> | null = null

const onAddReadCountTask = ({ msgId }: { msgId: number }) => {
  queue.add(msgId)
}
const onRemoveReadCountTask = ({ msgId }: { msgId: number }) => {
  queue.delete(msgId)
}
const task = () => {
  // // 10s 了上个请求还未完成就中断掉
  // request?.abort()
  // // 如果队列中有数据就开始请求
  // if (queue.size > 0) {
  //   // 开始新请求
  //   request = apis.getMsgReadCount({ params: { msgIds: [...queue] } })
  //   // 发送请求
  //   request.send().then((res) => {
  //     // 已读未读数
  //     const result = new Map<number, MsgReadUnReadCountType>()
  //     res.forEach((item) => result.set(item.msgId, item))
  //     eventBus.emit('onGetReadCount', result)
  //     request = null
  //   })
  // }
}

// 初始化监听
export const initListener = () => {
  eventBus.on('onAddReadCountTask', onAddReadCountTask)
  eventBus.on('onRemoveReadCountTask', onRemoveReadCountTask)
  clearQueue()
}

export const clearListener = () => {
  eventBus.off('onAddReadCountTask', onAddReadCountTask)
  eventBus.off('onRemoveReadCountTask', onRemoveReadCountTask)
  timer && clearInterval(timer)
}

export const clearQueue = () => {
  queue.clear()
  timer && clearInterval(timer)
}

export const readCountQueue = () => {
  task()
  timer = setInterval(task, 10000)
}
