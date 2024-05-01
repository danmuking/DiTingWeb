// 创建一个 eventHub.js 文件
import mitt from 'mitt'
import type { Emitter } from 'mitt'
import type { MsgReadUnReadCountType } from '@/services/types'

type Events = {
  focusMsgInput?: void
  // ignoreCheck? 表示这个值是可选的
  onSelectPerson: { uid: number; ignoreCheck?: boolean }
  onAddReadCountTask: { msgId: number }
  onRemoveReadCountTask: { msgId: number }
  onGetReadCount: Map<number, MsgReadUnReadCountType>
}
// 事件总线
const eventHub: Emitter<Events> = mitt<Events>()
export default eventHub
