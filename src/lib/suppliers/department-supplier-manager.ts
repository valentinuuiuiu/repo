import { prisma } from '@/lib/prisma'
import { DepartmentAnalytics } from '../analytics/department-analytics'
import { DepartmentNotifications } from '../notifications/department-notifications'
import { AgentCoordinator } from '../ai/agent-coordinator'

interface SupplierMetrics {
  fulfillmentRate: number
  qualityScore: number
  responseTime: number
  pricingCompetitiveness: number
  leadTime: number
  returnRate: number
  communicationScore: number
}

interface SupplierRanking {
  score: number
  rank: number
  strengths: string[]
  improvements: string[]
}

export class DepartmentSupplierManager {
  private coordinator: AgentCoordinator
  private notifications: DepartmentNotifications

  constructor(
    private departmentId: string,
    private departmentType: string
  ) {
    this.coordinator = new AgentCoordinator(departmentId)
    this.notifications = new DepartmentNotifications(departmentId, departmentType as any)
  }

  async evaluateSupplier(supplierId: string): Promise<SupplierMetrics> {
    // Get supplier performance data
    const orders = await prisma.order.findMany({
      where: {
        supplierId,
        departmentId: this.departmentId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: {
        returns: true,
        reviews: true
      }
    })

    // Calculate metrics
    const metrics: SupplierMetrics = {
      fulfillmentRate: this.calculateFulfillmentRate(orders),
      qualityScore: this.calculateQualityScore(orders),
      responseTime: await this.calculateResponseTime(supplierId),
      pricingCompetitiveness: await this.analyzePricingCompetitiveness(supplierId),
      leadTime: this.calculateLeadTime(orders),
      returnRate: this.calculateReturnRate(orders),
      communicationScore: await this.calculateCommunicationScore(supplierId)
    }

    // Track metrics
    await DepartmentAnalytics.trackEvent({
      departmentId: this.departmentId,
      eventType: 'supplier_evaluation',
      value: Object.values(metrics).reduce((a, b) => a + b) / Object.keys(metrics).length,
      metadata: { supplierId, metrics },
      timestamp: new Date()
    })

    return metrics
  }

  async rankSuppliers(): Promise<Record<string, SupplierRanking>> {
    const suppliers = await prisma.supplier.findMany({
      where: { departmentId: this.departmentId }
    })

    const rankings: Record<string, SupplierRanking> = {}
    const evaluations = await Promise.all(
      suppliers.map(async supplier => ({
        id: supplier.id,
        metrics: await this.evaluateSupplier(supplier.id)
      }))
    )

    // Calculate scores and rank suppliers
    const scores = evaluations.map(({ id, metrics }) => ({
      id,
      score: this.calculateOverallScore(metrics)
    }))
    scores.sort((a, b) => b.score - a.score)

    // Generate rankings with insights
    scores.forEach(({ id, score }, index) => {
      const metrics = evaluations.find(e => e.id === id)!.metrics
      rankings[id] = {
        score,
        rank: index + 1,
        strengths: this.identifyStrengths(metrics),
        improvements: this.identifyImprovements(metrics)
      }
    })

    return rankings
  }

  async optimizeSupplierAllocation() {
    const rankings = await this.rankSuppliers()
    const products = await prisma.product.findMany({
      where: { departmentId: this.departmentId },
      include: { supplier: true }
    })

    const recommendations = []
    for (const product of products) {
      const currentSupplier = rankings[product.supplierId]
      const betterSuppliers = Object.entries(rankings)
        .filter(([id, ranking]) => 
          id !== product.supplierId && 
          ranking.score > (currentSupplier?.score || 0)
        )

      if (betterSuppliers.length > 0) {
        recommendations.push({
          productId: product.id,
          currentSupplierId: product.supplierId,
          recommendedSupplierId: betterSuppliers[0][0],
          improvement: betterSuppliers[0][1].score - (currentSupplier?.score || 0)
        })
      }
    }

    // Sort by potential improvement
    recommendations.sort((a, b) => b.improvement - a.improvement)

    // Create alerts for significant improvements
    for (const rec of recommendations.slice(0, 5)) {
      if (rec.improvement > 20) {
        await this.notifications.createAlert({
          type: 'supplier',
          priority: 'medium',
          title: 'Supplier Optimization Opportunity',
          message: `Better supplier found for product ${rec.productId}`,
          metadata: {
            improvement: rec.improvement,
            currentSupplierId: rec.currentSupplierId,
            recommendedSupplierId: rec.recommendedSupplierId
          }
        })
      }
    }

    return recommendations
  }

  async monitorSupplierHealth() {
    const suppliers = await prisma.supplier.findMany({
      where: { departmentId: this.departmentId }
    })

    for (const supplier of suppliers) {
      const metrics = await this.evaluateSupplier(supplier.id)
      
      // Check for concerning metrics
      if (metrics.fulfillmentRate < 90) {
        await this.notifications.createAlert({
          type: 'supplier',
          priority: 'high',
          title: 'Low Fulfillment Rate Alert',
          message: `Supplier ${supplier.id} fulfillment rate below threshold`,
          metadata: { supplierId: supplier.id, rate: metrics.fulfillmentRate }
        })
      }

      if (metrics.qualityScore < 85) {
        await this.notifications.createAlert({
          type: 'supplier',
          priority: 'high',
          title: 'Quality Issues Alert',
          message: `Supplier ${supplier.id} quality score declining`,
          metadata: { supplierId: supplier.id, score: metrics.qualityScore }
        })
      }

      // Department-specific checks
      switch (this.departmentType) {
        case 'FASHION':
          if (metrics.returnRate > 15) {
            await this.notifications.createAlert({
              type: 'supplier',
              priority: 'high',
              title: 'High Return Rate Alert',
              message: `Fashion supplier ${supplier.id} return rate above threshold`,
              metadata: { supplierId: supplier.id, rate: metrics.returnRate }
            })
          }
          break

        case 'ELECTRONICS':
          if (metrics.qualityScore < 90) {
            await this.notifications.createAlert({
              type: 'supplier',
              priority: 'critical',
              title: 'Critical Quality Alert',
              message: `Electronics supplier ${supplier.id} quality issues detected`,
              metadata: { supplierId: supplier.id, score: metrics.qualityScore }
            })
          }
          break
      }
    }
  }

  private calculateOverallScore(metrics: SupplierMetrics): number {
    const weights = {
      fulfillmentRate: 0.25,
      qualityScore: 0.2,
      responseTime: 0.1,
      pricingCompetitiveness: 0.15,
      leadTime: 0.15,
      returnRate: 0.1,
      communicationScore: 0.05
    }

    return Object.entries(metrics).reduce(
      (score, [key, value]) => score + value * weights[key as keyof typeof weights],
      0
    )
  }

  private identifyStrengths(metrics: SupplierMetrics): string[] {
    const strengths = []
    if (metrics.fulfillmentRate > 95) strengths.push('Excellent fulfillment rate')
    if (metrics.qualityScore > 90) strengths.push('High quality products')
    if (metrics.responseTime < 2) strengths.push('Fast response time')
    if (metrics.pricingCompetitiveness > 85) strengths.push('Competitive pricing')
    if (metrics.leadTime < 3) strengths.push('Short lead times')
    if (metrics.returnRate < 5) strengths.push('Low return rate')
    if (metrics.communicationScore > 90) strengths.push('Great communication')
    return strengths
  }

  private identifyImprovements(metrics: SupplierMetrics): string[] {
    const improvements = []
    if (metrics.fulfillmentRate < 90) improvements.push('Improve fulfillment rate')
    if (metrics.qualityScore < 85) improvements.push('Address quality issues')
    if (metrics.responseTime > 4) improvements.push('Reduce response time')
    if (metrics.pricingCompetitiveness < 80) improvements.push('Review pricing strategy')
    if (metrics.leadTime > 5) improvements.push('Optimize lead times')
    if (metrics.returnRate > 10) improvements.push('Reduce return rate')
    if (metrics.communicationScore < 85) improvements.push('Enhance communication')
    return improvements
  }

  private calculateFulfillmentRate(orders: any[]): number {
    const fulfilled = orders.filter(o => o.status === 'delivered').length
    return (fulfilled / orders.length) * 100
  }

  private calculateQualityScore(orders: any[]): number {
    const reviews = orders.flatMap(o => o.reviews)
    if (reviews.length === 0) return 0
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 20
  }

  private async calculateResponseTime(supplierId: string): Promise<number> {
    const messages = await prisma.supplierMessage.findMany({
      where: { supplierId }
    })
    if (messages.length === 0) return 0
    
    const responseTimes = messages.map(m => 
      m.responseTime ? m.responseTime.getTime() - m.sentTime.getTime() : 0
    )
    return responseTimes.reduce((a, b) => a + b) / responseTimes.length / (1000 * 3600)
  }

  private async analyzePricingCompetitiveness(supplierId: string): Promise<number> {
    const products = await prisma.product.findMany({
      where: { supplierId },
      include: { 
        category: {
          include: {
            products: {
              include: { supplier: true }
            }
          }
        }
      }
    })

    let competitivenessScore = 0
    for (const product of products) {
      const categoryProducts = product.category.products
        .filter(p => p.supplierId !== supplierId)
      
      if (categoryProducts.length === 0) continue

      const avgPrice = categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length
      const priceRatio = avgPrice / product.price
      competitivenessScore += priceRatio > 0.8 && priceRatio < 1.2 ? 100 : 
                             priceRatio > 0.6 && priceRatio < 1.4 ? 75 :
                             priceRatio > 0.4 && priceRatio < 1.6 ? 50 : 25
    }

    return competitivenessScore / products.length
  }

  private calculateLeadTime(orders: any[]): number {
    const leadTimes = orders
      .filter(o => o.deliveredAt)
      .map(o => (o.deliveredAt.getTime() - o.createdAt.getTime()) / (1000 * 3600 * 24))
    
    return leadTimes.length > 0 ? 
      leadTimes.reduce((a, b) => a + b) / leadTimes.length : 0
  }

  private calculateReturnRate(orders: any[]): number {
    const returns = orders.reduce((sum, o) => sum + o.returns.length, 0)
    return (returns / orders.length) * 100
  }

  private async calculateCommunicationScore(supplierId: string): Promise<number> {
    const messages = await prisma.supplierMessage.findMany({
      where: { supplierId }
    })

    if (messages.length === 0) return 0

    const metrics = {
      responseRate: messages.filter(m => m.responded).length / messages.length,
      avgResponseTime: this.calculateResponseTime(messages),
      clarity: messages.filter(m => m.wasHelpful).length / messages.length
    }

    return (metrics.responseRate * 40 + 
            (1 - Math.min(metrics.avgResponseTime / 24, 1)) * 30 +
            metrics.clarity * 30)
  }
}