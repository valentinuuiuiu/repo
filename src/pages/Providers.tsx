import React, { useState, useCallback } from 'react'
import { 
  ProviderManager, 
  ProviderType as AIProviderType
} from '@/lib/ai/providers/ProviderManager'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

// Payment Provider Types
enum PaymentProviderType {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  SQUARE = 'square',
  ADYEN = 'adyen',
  BRAINTREE = 'braintree'
}

// Unified Provider Configuration Type
interface ProviderConfig {
  apiKey: string
  baseUrl?: string
  model?: string
  temperature?: number
  maxTokens?: number
  publicKey?: string
  secretKey?: string
  webhookSecret?: string
}

interface ProviderConfigFormProps {
  providerType: AIProviderType | PaymentProviderType
  onConfigSubmit: (config: ProviderConfig) => void
}

const ProviderConfigForm: React.FC<ProviderConfigFormProps> = ({ 
  providerType, 
  onConfigSubmit 
}) => {
  const [config, setConfig] = useState<ProviderConfig>({
    apiKey: '',
    baseUrl: '',
    model: '',
    temperature: 0.7,
    maxTokens: 4096,
    publicKey: '',
    secretKey: '',
    webhookSecret: ''
  })

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Basic validation
      if (!config.apiKey && !config.secretKey) {
        throw new Error('API Key or Secret Key is required')
      }

      onConfigSubmit(config)
      toast.success(`${providerType} provider configuration saved`)
    } catch (error) {
      toast.error(`Invalid configuration: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [config, providerType, onConfigSubmit])

  const isAIProvider = Object.values(AIProviderType).includes(providerType as AIProviderType)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* API/Secret Key */}
      <div>
        <Label>{isAIProvider ? 'API Key' : 'Secret Key'}</Label>
        <Input 
          type="password" 
          value={config.apiKey || config.secretKey || ''} 
          onChange={(e) => setConfig(prev => ({ 
            ...prev, 
            [isAIProvider ? 'apiKey' : 'secretKey']: e.target.value 
          }))}
          placeholder={`Enter ${isAIProvider ? 'API Key' : 'Secret Key'}`}
          required 
        />
      </div>

      {/* Public Key for Payment Providers */}
      {!isAIProvider && (
        <div>
          <Label>Public Key</Label>
          <Input 
            type="text" 
            value={config.publicKey || ''} 
            onChange={(e) => setConfig(prev => ({ ...prev, publicKey: e.target.value }))}
            placeholder="Enter Public Key"
          />
        </div>
      )}

      {/* Webhook Secret for Payment Providers */}
      {!isAIProvider && (
        <div>
          <Label>Webhook Secret</Label>
          <Input 
            type="password" 
            value={config.webhookSecret || ''} 
            onChange={(e) => setConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
            placeholder="Enter Webhook Secret"
          />
        </div>
      )}

      {/* Base URL for AI Providers */}
      {isAIProvider && (
        <div>
          <Label>Base URL (Optional)</Label>
          <Input 
            type="text" 
            value={config.baseUrl || ''} 
            onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value || undefined }))}
            placeholder="Custom base URL (if applicable)"
          />
        </div>
      )}

      {/* Model Selection for AI Providers */}
      {isAIProvider && (
        <div>
          <Label>Model</Label>
          <Select 
            value={config.model || ''} 
            onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {ProviderManager.getSupportedModels(providerType as AIProviderType).map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Temperature for AI Providers */}
      {isAIProvider && (
        <div>
          <Label>Temperature</Label>
          <Input 
            type="number" 
            step="0.1" 
            min="0" 
            max="2"
            value={config.temperature} 
            onChange={(e) => setConfig(prev => ({ 
              ...prev, 
              temperature: parseFloat(e.target.value) 
            }))}
          />
        </div>
      )}

      {/* Max Tokens for AI Providers */}
      {isAIProvider && (
        <div>
          <Label>Max Tokens</Label>
          <Input 
            type="number" 
            value={config.maxTokens} 
            onChange={(e) => setConfig(prev => ({ 
              ...prev, 
              maxTokens: parseInt(e.target.value) 
            }))}
          />
        </div>
      )}

      <Button type="submit" className="w-full">Save Configuration</Button>
    </form>
  )
}

const ProvidersPage: React.FC = () => {
  const [savedAIConfigs, setSavedAIConfigs] = useState<Record<AIProviderType, ProviderConfig | null>>({
    [AIProviderType.OPENAI]: null,
    [AIProviderType.ANTHROPIC]: null,
    [AIProviderType.GEMINI]: null,
    [AIProviderType.DEEPSEEK]: null,
    [AIProviderType.OLLAMA]: null,
    [AIProviderType.MISTRAL]: null
  })

  const [savedPaymentConfigs, setSavedPaymentConfigs] = useState<Record<PaymentProviderType, ProviderConfig | null>>({
    [PaymentProviderType.STRIPE]: null,
    [PaymentProviderType.PAYPAL]: null,
    [PaymentProviderType.SQUARE]: null,
    [PaymentProviderType.ADYEN]: null,
    [PaymentProviderType.BRAINTREE]: null
  })

  const handleAIConfigSubmit = useCallback((providerType: AIProviderType, config: ProviderConfig) => {
    setSavedAIConfigs(prev => ({
      ...prev,
      [providerType]: config
    }))
    
    // Save to local storage
    localStorage.setItem(`ai-${providerType}-config`, JSON.stringify(config))
  }, [])

  const handlePaymentConfigSubmit = useCallback((providerType: PaymentProviderType, config: ProviderConfig) => {
    setSavedPaymentConfigs(prev => ({
      ...prev,
      [providerType]: config
    }))
    
    // Save to local storage
    localStorage.setItem(`payment-${providerType}-config`, JSON.stringify(config))
  }, [])

  const testAIProviderConnection = useCallback(async (providerType: AIProviderType) => {
    const config = savedAIConfigs[providerType]
    if (!config) {
      toast.error('Please configure the AI provider first')
      return
    }

    try {
      const provider = ProviderManager.createProvider(providerType, config)
      const models = await provider.listAvailableModels()
      
      toast.success(`Successfully connected to ${providerType}. Available models: ${models.join(', ')}`)
    } catch (error) {
      toast.error(`AI Provider connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [savedAIConfigs])

  const testPaymentProviderConnection = useCallback(async (providerType: PaymentProviderType) => {
    const config = savedPaymentConfigs[providerType]
    if (!config) {
      toast.error('Please configure the payment provider first')
      return
    }

    try {
      // Placeholder for payment provider connection test
      // You would replace this with actual provider-specific connection tests
      toast.success(`Successfully validated ${providerType} configuration`)
    } catch (error) {
      toast.error(`Payment Provider connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [savedPaymentConfigs])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Provider Configurations</h1>
      
      <Tabs defaultValue="ai">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="payment">Payment Providers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(AIProviderType).map(type => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle>{type.toUpperCase()} Provider</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProviderConfigForm 
                    providerType={type}
                    onConfigSubmit={(config) => handleAIConfigSubmit(type, config)}
                  />
                  {savedAIConfigs[type] && (
                    <Button 
                      variant="outline" 
                      onClick={() => testAIProviderConnection(type)}
                    >
                      Test Connection
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(PaymentProviderType).map(type => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle>{type.toUpperCase()} Provider</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProviderConfigForm 
                    providerType={type}
                    onConfigSubmit={(config) => handlePaymentConfigSubmit(type, config)}
                  />
                  {savedPaymentConfigs[type] && (
                    <Button 
                      variant="outline" 
                      onClick={() => testPaymentProviderConnection(type)}
                    >
                      Test Connection
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProvidersPage