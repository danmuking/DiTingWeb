import { computed, reactive, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import cloneDeep from 'lodash/cloneDeep'
import { useRoute } from 'vue-router'
import apis from '@/services/apis'
import type { MarkItemType, MessageType, RevokedMsgType, SessionItem } from '@/services/types'
import { MarkEnum, MsgEnum, RoomTypeEnum } from '@/enums'
import { computedTimeBlock } from '@/utils/computedTime'
import { useCachedStore } from '@/stores/cached'
import { useUserStore } from '@/stores/user'
import { useGlobalStore } from '@/stores/global'
import { useGroupStore } from '@/stores/group'
import { useContactStore } from '@/stores/contacts'
import shakeTitle from '@/utils/shakeTitle'
import notify from '@/utils/notification'
export const pageSize = 20
// 标识是否第一次请求
let isFirstInit = false

export const useChatStore = defineStore('chat', () => {

  const route = useRoute()
  const cachedStore = useCachedStore()
  const userStore = useUserStore()
  const globalStore = useGlobalStore()
  const groupStore = useGroupStore()
  const contactStore = useContactStore()
  const sessionList = reactive<SessionItem[]>([]) // 会话列表
  const sessionOptions = reactive({ isLast: false, isLoading: false, cursor: '' })

  const currentRoomId = computed(() => globalStore.currentSession?.roomId)
  const currentRoomType = computed(() => globalStore.currentSession?.type)

  // 消息Map
  const messageMap = reactive<Map<number, Map<number, MessageType>>>(
    new Map([[currentRoomId.value, new Map()]]),
  ) 
  // 游标
  const messageOptions = reactive<
    Map<number, { isLast: boolean; isLoading: boolean; cursor: string }>
  >(new Map([[currentRoomId.value, { isLast: false, isLoading: false, cursor: '' }]]))

  // 回复消息映射
  const replyMapping = reactive<Map<number, Map<number, number[]>>>(
    new Map([[currentRoomId.value, new Map()]]),
  ) 

  const currentMessageMap = computed({
    get: () => {
      const current = messageMap.get(currentRoomId.value as number)
      if (current === undefined) {
        messageMap.set(currentRoomId.value, new Map())
      }
      return messageMap.get(currentRoomId.value as number)
    },
    set: (val) => {
      messageMap.set(currentRoomId.value, val as Map<number, MessageType>)
    },
  })

  const currentMessageOptions = computed({
    get: () => {
      const current = messageOptions.get(currentRoomId.value as number)
      if (current === undefined) {
        messageOptions.set(currentRoomId.value, { isLast: false, isLoading: true, cursor: '' })
      }
      return messageOptions.get(currentRoomId.value as number)
    },
    set: (val) => {
      messageOptions.set(
        currentRoomId.value,
        val as { isLast: boolean; isLoading: boolean; cursor: string },
      )
    },
  })

  const currentReplyMap = computed({
    get: () => {
      const current = replyMapping.get(currentRoomId.value as number)
      if (current === undefined) {
        replyMapping.set(currentRoomId.value, new Map())
      }
      return replyMapping.get(currentRoomId.value as number)
    },
    set: (val) => {
      replyMapping.set(currentRoomId.value, val as Map<number, number[]>)
    },
  })

  const isGroup = computed(() => currentRoomType.value === RoomTypeEnum.Group)

  /**
   * 获取当前会话信息
   */
  const currentSessionInfo = computed(() =>
    sessionList.find((session) => session.roomId === globalStore.currentSession.roomId),
  )

  const chatListToBottomAction = ref<() => void>() // 外部提供消息列表滚动到底部事件

  // const isStartCount = ref(false) // 是否开始计数
  // const newMsgCount = ref(0) // 新消息计数

  const newMsgCount = reactive<Map<number, { count: number; isStart: boolean }>>(
    new Map([
      [
        currentRoomId.value,
        {
          // 新消息计数
          count: 0,
          // 是否开始计数
          isStart: false,
        },
      ],
    ]),
  )

  // 当前会话的新消息计数
  const currentNewMsgCount = computed({
    get: () => {
      const current = newMsgCount.get(currentRoomId.value as number)
      if (current === undefined) {
        newMsgCount.set(currentRoomId.value, { count: 0, isStart: false })
      }
      return newMsgCount.get(currentRoomId.value as number)
    },
    set: (val) => {
      newMsgCount.set(currentRoomId.value, val as { count: number; isStart: boolean })
    },
  })

  watch(currentRoomId, (val, oldVal) => {
    if (oldVal !== undefined && val !== oldVal) {
      // 切换会话，滚动到底部
      chatListToBottomAction.value?.()
      // 切换的 rooms是空数据的话就请求消息列表
      if (!currentMessageMap.value || currentMessageMap.value.size === 0) {
        if (!currentMessageMap.value) {
          messageMap.set(currentRoomId.value as number, new Map())
        }
        getMsgList()
      }

      // 群组的时候去请求
      if (currentRoomType.value === RoomTypeEnum.Group) {
        groupStore.getGroupUserList(true)
        // groupStore.getCountStatistic()
        // cachedStore.getGroupAtUserBaseInfo()
      }
    }

    // 重置当前回复的消息
    currentMsgReply.value = {}
  })

  // 当前消息回复
  const currentMsgReply = ref<Partial<MessageType>>({})

  // 将消息列表转换为数组
  const chatMessageList = computed(() => [...(currentMessageMap.value?.values() || [])])

  // TODO: 未完成
  const getMsgList = async (size = pageSize) => {

    currentMessageOptions.value && (currentMessageOptions.value.isLoading = true)

    const data = await apis
      .getMsgList({
        params: {
          pageSize: size,
          cursor: currentMessageOptions.value?.cursor,
          roomId: currentRoomId.value,
        },
      })
      .send()
      .finally(() => {
        currentMessageOptions.value && (currentMessageOptions.value.isLoading = false)
      })
    
    // 数据不存在直接返回
    if (!data) return
    // 计算时间块
    const computedList = computedTimeBlock(data.data)

    /** 收集需要请求用户详情的 uid */
    const uidCollectYet: Set<number> = new Set() // 去重用
    computedList.forEach((msg) => {
      // TODO: 未完成
      // const replyItem = msg.message.body?.reply
      // if (replyItem?.id) {
      //   const messageIds = currentReplyMap.value?.get(replyItem.id) || []
      //   messageIds.push(msg.message.id)
      //   currentReplyMap.value?.set(replyItem.id, messageIds)

        // 查询被回复用户的信息，被回复的用户信息里暂时无 uid
        // collectUidItem(replyItem.uid)
      // }
      // 查询消息发送者的信息
      uidCollectYet.add(msg.fromUser.uid)
    })
    // 获取用户信息缓存
    cachedStore.getBatchUserInfo([...uidCollectYet])
    // 为保证获取的历史消息在前面
    const newList = [...computedList, ...chatMessageList.value]
    currentMessageMap.value?.clear() // 清空Map
    newList.forEach((msg) => {
      currentMessageMap.value?.set(msg.message.id, msg)
    })

    // 如果 currentMessageOptions.value 存在，更新其 cursor、isLast 和 isLoading 属性
    if (currentMessageOptions.value) {
      currentMessageOptions.value.cursor = data.cursor
      currentMessageOptions.value.isLast = data.isLast
      currentMessageOptions.value.isLoading = false
    }
  }

  const getSessionList = async (isFresh = false) => {
    // 如果不需要刷新，并且已经获取到了最后一条会话或者正在加载会话，直接返回
    if (!isFresh && (sessionOptions.isLast || sessionOptions.isLoading)) return
    // 设置正在加载会话的状态为 true
    sessionOptions.isLoading = true
    // 发送请求，获取会话列表
    const data = await apis
      .getSessionList({
        params: {
          pageSize: sessionList.length > pageSize ? sessionList.length : pageSize,
          cursor: isFresh || !sessionOptions.cursor ? undefined : sessionOptions.cursor,
        },
      })
      .send()
      .catch(() => {
        sessionOptions.isLoading = false
      })
    // 如果没有获取到数据，直接返回
    if (!data) return

    // 如果需要刷新，替换会话列表，否则将新的会话添加到会话列表的末尾
    isFresh
      ? sessionList.splice(0, sessionList.length, ...data.data)
      : sessionList.push(...data.data)
    // 更新游标、是否已经获取到最后一条会话和正在加载会话的状态
    sessionOptions.cursor = data.cursor
    sessionOptions.isLast = data.isLast
    sessionOptions.isLoading = false

    // 对会话列表进行排序和去重
    sortAndUniqueSessionList()

    // 将第一条会话的未读消息数量设置为 0
    sessionList[0].unreadCount = 0
    // 如果这是第一次初始化
    if (!isFirstInit) {
      // 设置为已经初始化
      isFirstInit = true
      // 设置当前会话的房间 ID 和类型为第一条会话的房间 ID 和类型
      globalStore.currentSession.roomId = data.data[0].roomId
      globalStore.currentSession.type = data.data[0].type
      // 用会话列表第一个去请求消息列表
      // TODO: 未完成
      getMsgList()
      // 如果当前房间的类型是群组，获取群组用户列表
      currentRoomType.value === RoomTypeEnum.Group && groupStore.getGroupUserList(true)
      // 如果用户已登录，初始化所有用户的基本信息
      userStore.isSign && cachedStore.initAllUserBaseInfo()
      // // 获取联系人列表
      // contactStore.getContactList(true)
    }
    
    
  }

  /** 会话列表去重并排序 */
  const sortAndUniqueSessionList = () => {
    // 创建一个空对象，用于存储会话列表中的会话项
    const temp: Record<string, SessionItem> = {}
    // debugger
    // 遍历会话列表
    sessionList.forEach((item) => (
      // 将每个会话项的 roomId 作为键，会话项本身作为值，存储到 temp 对象中
      // 如果有重复的 roomId，保留时间更新的，从而实现去重
      temp[item.roomId] = temp[item.roomId] ? (temp[item.roomId].lastTime > item.lastTime ? temp[item.roomId] : item) : item
      ))
    // 清空会话列表，然后将 temp 对象中的所有值（即去重后的会话项）添加到会话列表中
    sessionList.splice(0, sessionList.length, ...Object.values(temp))
    // 对会话列表进行排序
    // 比较函数使用每个会话项的 activeTime 属性
    // 如果前一个会话项的 activeTime 小于后一个会话项的 activeTime，前一个会话项会被排在后面
    // 从而实现按 activeTime 降序排序
    sessionList.sort((pre, cur) => cur.lastTime - pre.lastTime)
  }

  // 更新会话
  const updateSession = (roomId: number, roomProps: Partial<SessionItem>) => {
    const session = sessionList.find((item) => item.roomId === roomId)
    session && roomProps && Object.assign(session, roomProps)
    sortAndUniqueSessionList()
  }

  // 更新会话最后活跃时间
  const updateSessionLastActiveTime = (roomId: number, room?: SessionItem) => {
    const session = sessionList.find((item) => item.roomId === roomId)
    if (session) {
      Object.assign(session, { lastTime: Date.now() })
    } else if (room) {
      const newItem = cloneDeep(room)
      newItem.lastTime = Date.now()
      sessionList.unshift(newItem)
    }
    sortAndUniqueSessionList()
  }

  // 通过房间ID获取会话信息
  const getSession = (roomId: number): SessionItem => {
    return sessionList.find((item) => item.roomId === roomId) as SessionItem
  }


  // 当收到新消息是刷新数据
  const fresh = async ()=>{
    // 获取本地最新的会话
    const session = sessionList[0]
    // 请求所有时间大于等于最新会话时间的会话
    const data = await apis
      .getNewSessionList({
        params: {
          timestamp: session.lastTime,
        },
      })
      .send()
    if (!data) return
    // 将新会话添加到会话列表的最前面
    sessionList.unshift(...data)
    // 对会话列表进行排序和去重
    sortAndUniqueSessionList()

    // 更新会话对应的消息列表
    for (const sessionItem of data) {
      // 如果会话的消息有本地缓存
      if (messageMap.has(sessionItem.roomId)) {
        freshMsgList(sessionItem)
      }
    }
  }

  const freshMsgList = async (session: SessionItem) => {
    // 获取本地最新的消息
    const msgMap = messageMap.get(session.roomId)
    if(msgMap === undefined) return
    let id = 0
    for(const msg of msgMap.values()){
      if(msg.message.id > id){
        id = msg.message.id
      }
    }
    // 请求所有id大于等于最新消息id的消息
    const data = await apis
      .getNewMsgList({
        params: {
          msgId: id,
          roomId: session.roomId,
        },
      })
      .send()
    if (!data) return
    // 刷新消息列表
    for(const msg of data){
      pushMsg(msg)
    }
  }

  const pushMsg = async (msg: MessageType) => {
    const current = messageMap.get(msg.message.roomId)
    current?.set(msg.message.id, msg)
    // 获取用户信息缓存
    // 尝试取缓存user, 如果有 lastModifyTime 说明缓存过了，没有就一定是要缓存的用户了
    const uid = msg.fromUser.uid
    const cacheUser = cachedStore.userCachedList[uid]
    cachedStore.getBatchUserInfo([uid])

    // 发完消息就要刷新会话列表，
    // 如果当前会话已经置顶了，可以不用刷新
    if (globalStore.currentSession && globalStore.currentSession.roomId !== msg.message.roomId) {
      let result = undefined
      // 如果当前路由不是聊天，就开始拿会话详情，并手动新增一条会话记录
      if (route?.path && route?.path !== '/') {
        globalStore.currentSession.roomId = msg.message.roomId
        globalStore.currentSession.type = RoomTypeEnum.Single
      if (!current) {
        // result = await apis.sessionDetail({ id: msg.message.roomId }).send()
      }
      //   Router.push('/')
      }
      updateSessionLastActiveTime(msg.message.roomId, result)
    }

    // 如果收到的消息里面是艾特自己的就发送系统通知
    if (msg.message.body.atUidList?.includes(userStore.userInfo.uid) && cacheUser) {
      notify({
        name: cacheUser.name as string,
        text: msg.message.body.content,
        icon: cacheUser.avatar as string,
      })
    }

    // tab 在后台获得新消息，就开始闪烁！
    if (document.hidden && !shakeTitle.isShaking) {
      shakeTitle.start()
    }

    if (
      currentNewMsgCount.value &&
      currentNewMsgCount.value?.isStart &&
      typeof currentNewMsgCount.value.count === 'number'
    ) {
      currentNewMsgCount.value.count++
      return
    }

    // 聊天记录计数
    if (currentRoomId.value !== msg.message.roomId) {
      const item = sessionList.find((item) => item.roomId === msg.message.roomId)
      if (item) {
        item.unreadCount += 1
      }
      // 如果新消息的 roomId 和 当前显示的 room 的 Id 一致，就更新已读
    } else {
      // 且当前路由在 聊天 内
      if (route?.path && route?.path === '/') {
        // apis.markMsgRead({ roomId: currentRoomId.value }).send()
      }
    }

    // 如果当前路由不是聊天，就开始计数
    if (route?.path && route?.path !== '/') {
      globalStore.unReadMark.newMsgUnreadCount++
    }

    // 聊天列表滚动到底部
    setTimeout(() => {
      // 如果超过一屏了，不自动滚动到最新消息。
      chatListToBottomAction.value?.()
    }, 0)
  }

  // 过滤掉小黑子的发言
  const filterUser = (uid: number) => {
    if (typeof uid !== 'number') return
    for (const messages of messageMap.values()) {
      messages?.forEach((msg) => {
        if (msg.fromUser.uid === uid) {
          messages.delete(msg.message.id)
        }
      })
    }
  }

  const loadMore = async (size?: number) => {
    if (currentMessageOptions.value?.isLast || currentMessageOptions.value?.isLoading) return
    await getMsgList(size)
  }

  const clearNewMsgCount = () => {
    currentNewMsgCount.value && (currentNewMsgCount.value.count = 0)
  }

  // 查找消息在列表里面的索引
  const getMsgIndex = (msgId: number) => {
    if (!msgId || isNaN(Number(msgId))) return -1
    const keys = currentMessageMap.value ? Array.from(currentMessageMap.value.keys()) : []
    return keys.findIndex((key) => key === msgId)
  }

  // 更新点赞、举报数
  const updateMarkCount = (markList: MarkItemType[]) => {
    markList.forEach((mark: MarkItemType) => {
      const { msgId, markType, markCount } = mark

      const msgItem = currentMessageMap.value?.get(msgId)
      if (msgItem) {
        if (markType === MarkEnum.LIKE) {
          msgItem.message.messageMark.likeCount = markCount
        } else if (markType === MarkEnum.DISLIKE) {
          msgItem.message.messageMark.dislikeCount = markCount
        }
      }
    })
  }
  // 更新消息撤回状态
  const updateRecallStatus = (data: RevokedMsgType) => {
    const { msgId } = data
    const message = currentMessageMap.value?.get(msgId)
    if (message && typeof data.recallUid === 'number') {
      message.message.type = MsgEnum.RECALL
      const cacheUser = cachedStore.userCachedList[data.recallUid]
      // 如果撤回者的 id 不等于消息发送人的 id, 或者你本人就是管理员，那么显示管理员撤回的。
      if (data.recallUid !== message.fromUser.uid) {
        message.message.body = `管理员"${cacheUser.name}"撤回了一条成员消息` // 后期根据本地用户数据修改
      } else {
        // 如果被撤回的消息是消息发送者撤回，正常显示
        message.message.body = `"${cacheUser.name}"撤回了一条消息` // 后期根据本地用户数据修改
      }
    }
    // 更新与这条撤回消息有关的消息
    const messageList = currentReplyMap.value?.get(msgId)
    messageList?.forEach((id) => {
      const msg = currentMessageMap.value?.get(id)
      if (msg) {
        msg.message.body.reply.body = `原消息已被撤回`
      }
    })
  }
  // 删除消息
  const deleteMsg = (msgId: number) => {
    currentMessageMap.value?.delete(msgId)
  }
  // 更新消息
  const updateMsg = (msgId: number, newMessage: MessageType) => {
    deleteMsg(msgId)
    pushMsg(newMessage)
  }

  // 标记已读数为 0
  const markSessionRead = (roomId: number) => {
    const session = sessionList.find((item) => item.roomId === roomId)
    const unreadCount = session?.unreadCount || 0
    if (session) {
      session.unreadCount = 0
    }
    return unreadCount
  }

  // 根据消息id获取消息体
  const getMessage = (messageId: number) => {
    return currentMessageMap.value?.get(messageId)
  }

  // 删除会话
  const removeContact = (roomId: number) => {
    const index = sessionList.findIndex((session) => session.roomId === roomId)
    sessionList.splice(index, 1)
  }

  return {
    getMsgIndex,
    chatMessageList,
    pushMsg,
    deleteMsg,
    clearNewMsgCount,
    updateMarkCount,
    updateRecallStatus,
    updateMsg,
    chatListToBottomAction,
    newMsgCount,
    messageMap,
    currentMessageMap,
    currentMessageOptions,
    currentReplyMap,
    currentNewMsgCount,
    loadMore,
    currentMsgReply,
    filterUser,
    sessionList,
    sessionOptions,
    getSessionList,
    updateSession,
    updateSessionLastActiveTime,
    markSessionRead,
    getSession,
    isGroup,
    currentSessionInfo,
    getMessage,
    removeContact,
    fresh,
  }
})
