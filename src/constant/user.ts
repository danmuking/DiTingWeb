import { FriendTypeEnum } from '@/enums'

// 消息回复映射表
export const FriendTypeTextMap: Record<number, string> = {
  [FriendTypeEnum.NotAdd]: '添加',
  [FriendTypeEnum.WaitAgree]: '等待同意',
  [FriendTypeEnum.Added]: '已添加',
}
