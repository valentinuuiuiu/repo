import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DepartmentNotifications } from "@/lib/notifications/department-notifications"
import { Bell, Check, AlertTriangle, Package, Zap, UserCog, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  departmentId: string
  type: 'inventory' | 'quality' | 'pricing' | 'supplier' | 'agent' | 'system'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  metadata?: Record<string, any>
  timestamp: Date
  read: boolean
  actionTaken: boolean
}

export function DepartmentAlerts({ 
  departmentId,
  departmentType 
}: { 
  departmentId: string
  departmentType: string
}) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [notifications] = useState(() => new DepartmentNotifications(departmentId, departmentType as any))

  useEffect(() => {
    const loadAlerts = async () => {
      const departmentAlerts = await notifications.getAlerts({
        unreadOnly: filter === 'unread'
      })
      setAlerts(departmentAlerts)
    }

    loadAlerts()

    // Subscribe to new alerts
    notifications.on('new_alert', (alert: Alert) => {
      setAlerts(prev => [alert, ...prev])
    })

    // Refresh alerts periodically
    const interval = setInterval(loadAlerts, 30000)
    return () => clearInterval(interval)
  }, [departmentId, filter])

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'inventory': return <Package className="h-5 w-5" />
      case 'quality': return <AlertTriangle className="h-5 w-5" />
      case 'agent': return <Zap className="h-5 w-5" />
      case 'supplier': return <UserCog className="h-5 w-5" />
      default: return <Settings2 className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-50'
      case 'high': return 'text-orange-500 bg-orange-50'
      case 'medium': return 'text-yellow-500 bg-yellow-50'
      case 'low': return 'text-blue-500 bg-blue-50'
    }
  }

  const markAsRead = async (alertId: string) => {
    await notifications.markAsRead(alertId)
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    )
  }

  const markActionTaken = async (alertId: string) => {
    await notifications.markActionTaken(alertId)
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, actionTaken: true } : alert
      )
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-medium">Department Alerts</h2>
          <Badge variant="secondary">
            {alerts.filter(a => !a.read).length} unread
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              filter === 'all' && "bg-primary text-primary-foreground"
            )}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              filter === 'unread' && "bg-primary text-primary-foreground"
            )}
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2" />
              <p>No alerts to display</p>
            </div>
          ) : (
            alerts.map(alert => (
              <Card
                key={alert.id}
                className={cn(
                  "p-4 transition-colors",
                  !alert.read && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-full",
                    getPriorityColor(alert.priority)
                  )}>
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                      </div>
                      <Badge variant={
                        alert.priority === 'critical' ? 'destructive' :
                        alert.priority === 'high' ? 'warning' :
                        'default'
                      }>
                        {alert.priority}
                      </Badge>
                    </div>

                    {alert.metadata && (
                      <Card className="mt-2 p-2 bg-muted/50">
                        <pre className="text-xs">
                          {JSON.stringify(alert.metadata, null, 2)}
                        </pre>
                      </Card>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.actionTaken && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markActionTaken(alert.id)}
                          >
                            Take Action
                          </Button>
                        )}
                        {!alert.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}