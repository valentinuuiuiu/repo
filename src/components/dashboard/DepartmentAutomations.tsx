import { useState, useEffect } from "react"
import { DepartmentAutomation } from "@/lib/automation/department-automation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Play, Pause, Settings, Trash2, Clock, Zap, FileCheck } from "lucide-react"

interface AutomationRule {
  id: string
  departmentId: string
  name: string
  trigger: {
    type: 'event' | 'schedule' | 'condition'
    config: Record<string, any>
  }
  actions: {
    type: string
    params: Record<string, any>
    retryConfig?: {
      maxAttempts: number
      backoffMs: number
    }
  }[]
  conditions?: {
    field: string
    operator: 'equals' | 'gt' | 'lt' | 'contains'
    value: any
  }[]
  priority: number
  enabled: boolean
}

function AutomationRuleForm({ 
  initialData,
  onSubmit,
  onCancel 
}: { 
  initialData?: Partial<AutomationRule>
  onSubmit: (data: Partial<AutomationRule>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    trigger: { type: 'event', config: {} },
    actions: [],
    priority: 2,
    enabled: true
  })

  const actionTypes = [
    { value: 'update_inventory', label: 'Update Inventory' },
    { value: 'notify_supplier', label: 'Notify Supplier' },
    { value: 'adjust_pricing', label: 'Adjust Pricing' },
    { value: 'quality_check', label: 'Quality Check' }
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Rule Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter rule name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Trigger Type</label>
        <Select
          value={formData.trigger?.type}
          onValueChange={(value) => 
            setFormData(prev => ({
              ...prev,
              trigger: { type: value as any, config: {} }
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="event">Event Based</SelectItem>
            <SelectItem value="schedule">Scheduled</SelectItem>
            <SelectItem value="condition">Conditional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Actions</label>
        <div className="space-y-4">
          {formData.actions?.map((action, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <Select
                  value={action.type}
                  onValueChange={(value) => {
                    const newActions = [...(formData.actions || [])]
                    newActions[index] = { ...action, type: value }
                    setFormData(prev => ({ ...prev, actions: newActions }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newActions = formData.actions?.filter((_, i) => i !== index)
                    setFormData(prev => ({ ...prev, actions: newActions }))
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          <Button
            variant="outline"
            onClick={() => 
              setFormData(prev => ({
                ...prev,
                actions: [...(prev.actions || []), { type: '', params: {} }]
              }))
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Priority</label>
        <Select
          value={String(formData.priority)}
          onValueChange={(value) => 
            setFormData(prev => ({ ...prev, priority: parseInt(value) }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">High</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.enabled}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, enabled: checked }))
            }
          />
          <label className="text-sm font-medium">Enabled</label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(formData)}>
          {initialData ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </div>
  )
}

export function DepartmentAutomations({ departmentId }: { departmentId: string }) {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [automation] = useState(() => new DepartmentAutomation(departmentId))

  useEffect(() => {
    const loadRules = async () => {
      const departmentRules = await automation.getRules()
      setRules(departmentRules)
    }
    loadRules()
  }, [departmentId])

  const handleSubmit = async (data: Partial<AutomationRule>) => {
    try {
      if (selectedRule) {
        await automation.updateRule(selectedRule.id, data)
      } else {
        await automation.createRule({
          ...data,
          departmentId
        } as AutomationRule)
      }
      
      // Refresh rules
      const updatedRules = await automation.getRules()
      setRules(updatedRules)
      setShowForm(false)
      setSelectedRule(null)
    } catch (error) {
      console.error('Failed to save rule:', error)
    }
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'event': return <Zap className="h-4 w-4" />
      case 'schedule': return <Clock className="h-4 w-4" />
      case 'condition': return <FileCheck className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <Card className="col-span-1">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">Automation Rules</h3>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedRule ? 'Edit Automation Rule' : 'Create New Rule'}
                </DialogTitle>
              </DialogHeader>
              <AutomationRuleForm
                initialData={selectedRule || undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false)
                  setSelectedRule(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="h-[700px]">
          <div className="p-4 space-y-4">
            {rules.map(rule => (
              <Card
                key={rule.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedRule?.id === rule.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedRule(rule)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getTriggerIcon(rule.trigger.type)}
                      <span className="font-medium">{rule.name}</span>
                    </div>
                    <Badge variant="outline">
                      {rule.trigger.type.charAt(0).toUpperCase() + rule.trigger.type.slice(1)}
                    </Badge>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={async (checked) => {
                      await automation.updateRule(rule.id, { enabled: checked })
                      const updatedRules = await automation.getRules()
                      setRules(updatedRules)
                    }}
                  />
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground">
                    {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {rule.actions.map((action, i) => (
                      <Badge key={i} variant="secondary">
                        {action.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="col-span-2">
        {selectedRule ? (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedRule.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    Priority {selectedRule.priority}
                  </Badge>
                  <Badge variant={selectedRule.enabled ? 'default' : 'secondary'}>
                    {selectedRule.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRule(selectedRule)
                    setShowForm(true)
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await automation.deleteRule(selectedRule.id)
                    const updatedRules = await automation.getRules()
                    setRules(updatedRules)
                    setSelectedRule(null)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Trigger Configuration</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium">Type:</span>
                  <Badge className="ml-2">
                    {selectedRule.trigger.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Configuration:</span>
                  <pre className="mt-2 p-4 bg-muted rounded-md">
                    {JSON.stringify(selectedRule.trigger.config, null, 2)}
                  </pre>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Actions</h3>
              <div className="space-y-4">
                {selectedRule.actions.map((action, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{action.type}</Badge>
                      {action.retryConfig && (
                        <div className="text-sm text-muted-foreground">
                          Retries: {action.retryConfig.maxAttempts}
                        </div>
                      )}
                    </div>
                    <pre className="mt-4 p-4 bg-muted rounded-md">
                      {JSON.stringify(action.params, null, 2)}
                    </pre>
                  </Card>
                ))}
              </div>
            </Card>

            {selectedRule.conditions && selectedRule.conditions.length > 0 && (
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Conditions</h3>
                <div className="space-y-4">
                  {selectedRule.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline">{condition.field}</Badge>
                      <span>{condition.operator}</span>
                      <Badge>{condition.value}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a rule to view details
          </div>
        )}
      </Card>
    </div>
  )
}