import { DepartmentNotifications } from '../notifications';

export interface TeamAlert {
  id: string;
  type: 'task' | 'member' | 'performance' | 'system';
  priority: 'low' | 'medium' | 'high';
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  read: boolean;
}

export class TeamAlerts {
  private alerts: Map<string, TeamAlert>;
  private notifications: DepartmentNotifications;

  constructor(departmentId: string) {
    this.alerts = new Map();
    this.notifications = new DepartmentNotifications(departmentId, 'TEAM');
  }

  async createAlert(
    type: TeamAlert['type'],
    priority: TeamAlert['priority'],
    message: string,
    metadata?: Record<string, any>
  ) {
    const alert: TeamAlert = {
      id: crypto.randomUUID(),
      type,
      priority,
      message,
      metadata,
      timestamp: new Date(),
      read: false
    };

    this.alerts.set(alert.id, alert);

    await this.notifications.notify({
      type: 'TEAM_ALERT',
      departmentId: this.notifications.departmentId,
      message,
      metadata: { alertId: alert.id, priority, type }
    });

    return alert;
  }

  getUnreadAlerts() {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.read)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getPriorityAlerts(priority: TeamAlert['priority']) {
    return Array.from(this.alerts.values())
      .filter(alert => alert.priority === priority)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  markAsRead(alertId: string) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.read = true;
      this.alerts.set(alertId, alert);
    }
  }

  markAllAsRead() {
    for (const [id, alert] of this.alerts.entries()) {
      alert.read = true;
      this.alerts.set(id, alert);
    }
  }

  clearOldAlerts(olderThan: Date) {
    for (const [id, alert] of this.alerts.entries()) {
      if (alert.timestamp < olderThan) {
        this.alerts.delete(id);
      }
    }
  }
}