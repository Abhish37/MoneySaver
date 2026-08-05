import webpush from 'web-push'
import { eq, inArray, lt } from 'drizzle-orm'
import { db } from '../db'
import { pushSubscriptions } from '../../db/schema'
import { enqueueJob } from '../queue/qstash'

try {
  webpush.setVapidDetails(
    'mailto:admin@moneysaver.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'dummy_public_key_for_build_time_purposes_only_which_must_be_long_enough',
    process.env.VAPID_PRIVATE_KEY || 'dummy_private_key_for_build'
  )
} catch (e) {
  console.warn('[WebPush] Failed to initialize VAPID details (safe during build)')
}

export type NotificationPayload = {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  url?: string
  actions?: Array<{ action: string; title: string }>
  tag?: string
  data?: any
  priority?: 'normal' | 'high'
  vibration?: number[]
}

export class NotificationService {
  /**
   * Register a new subscription for a user
   */
  static async subscribe(userId: string, subscription: webpush.PushSubscription, userAgent?: string, browser?: string, platform?: string) {
    const { endpoint, keys } = subscription
    
    if (!keys || !keys.p256dh || !keys.auth) {
      throw new Error('Invalid subscription keys')
    }

    const newSub = {
      id: crypto.randomUUID(),
      userId,
      endpoint,
      p256dhKey: keys.p256dh,
      authKey: keys.auth,
      userAgent: userAgent || null,
      browser: browser || null,
      platform: platform || null,
      isActive: true,
      updatedAt: new Date(),
    }

    await db
      .insert(pushSubscriptions)
      .values(newSub)
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          userId,
          isActive: true,
          updatedAt: new Date(),
        },
      })

    return { success: true }
  }

  /**
   * Remove a subscription by endpoint
   */
  static async unsubscribe(endpoint: string) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint))
    return { success: true }
  }

  /**
   * Queue a notification to a specific user
   */
  static async sendToUser(userId: string, payload: NotificationPayload) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://moneysaver-five.vercel.app'
    await enqueueJob(`${baseUrl}/api/notifications/worker`, {
      type: 'SEND_TO_USER',
      payload: { userId, notification: payload },
    })
  }

  /**
   * Queue a notification to multiple users
   */
  static async sendToUsers(userIds: string[], payload: NotificationPayload) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://moneysaver-five.vercel.app'
    await enqueueJob(`${baseUrl}/api/notifications/worker`, {
      type: 'SEND_TO_USERS',
      payload: { userIds, notification: payload },
    })
  }

  /**
   * Queue a broadcast notification
   */
  static async broadcast(payload: NotificationPayload) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://moneysaver-five.vercel.app'
    await enqueueJob(`${baseUrl}/api/notifications/worker`, {
      type: 'BROADCAST',
      payload: { notification: payload },
    })
  }

  /**
   * Send raw push using web-push (called by worker)
   */
  static async sendRaw(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: NotificationPayload) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload))
      
      // Update lastUsedAt
      await db.update(pushSubscriptions)
        .set({ lastUsedAt: new Date() })
        .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
        
      return { success: true }
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription is no longer valid, remove it
        await this.unsubscribe(subscription.endpoint)
      }
      throw error
    }
  }

  /**
   * Cleanup unused subscriptions (> 6 months)
   */
  static async cleanupExpiredSubscriptions() {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    await db.delete(pushSubscriptions)
      .where(lt(pushSubscriptions.updatedAt, sixMonthsAgo))
  }
}
