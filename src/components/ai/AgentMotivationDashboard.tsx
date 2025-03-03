import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, TrendingUp, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { aiService } from '@/lib/ai';
import { AgentStatus } from '@/lib/ai/types';

interface LeaderboardEntry {
  agentId: string;
  level: number;
  points: number;
  achievements: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  costPoints: number;
}

export function AgentMotivationDashboard({ agentId }: { agentId: string }) {
  const { data: agentStatus } = useQuery({
    queryKey: ['agent-status', agentId],
    queryFn: () => aiService.rewards.getAgentStatus(agentId)
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => aiService.rewards.getLeaderboard()
  });

  if (!agentStatus) return null;

  const nextLevel = agentStatus.level < 5 ? {
    level: agentStatus.level + 1,
    pointsNeeded: 1000 * Math.pow(2, agentStatus.level)
  } : null;

  return (
    <div className="space-y-6">
      {/* Agent Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <h3 className="font-medium">Level {agentStatus.level}</h3>
            </div>
            {nextLevel && (
              <div className="mt-2">
                <div className="text-sm text-muted-foreground mb-1">
                  Next Level: {nextLevel.pointsNeeded - agentStatus.points} points needed
                </div>
                <Progress 
                  value={(agentStatus.points / nextLevel.pointsNeeded) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <h3 className="font-medium">{agentStatus.points} Points</h3>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Total Experience Points
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <h3 className="font-medium">{agentStatus.achievements.length} Achievements</h3>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Completed Milestones
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <h3 className="font-medium">{agentStatus.availableRewards.length} Rewards</h3>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Available to Redeem
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {agentStatus.achievements.slice(-3).map((achievement: string, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{achievement}</h4>
                  <p className="text-sm text-muted-foreground">Unlocked recently</p>
                </div>
                <Badge className="ml-auto">+500 XP</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Department Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard?.slice(0, 5).map((entry: LeaderboardEntry, index: number) => (
              <div 
                key={entry.agentId}
                className={`flex items-center space-x-4 p-4 rounded-lg ${
                  entry.agentId === agentId ? 'bg-primary/10' : 'bg-muted'
                }`}
              >
                <div className="text-2xl font-bold text-muted-foreground w-8">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{entry.agentId}</div>
                  <div className="text-sm text-muted-foreground">
                    Level {entry.level} • {entry.achievements} Achievements
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{entry.points}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {agentStatus.availableRewards.map((reward) => (
              <Card key={reward.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {reward.description}
                      </p>
                    </div>
                    <Badge variant="secondary">{reward.costPoints} Points</Badge>
                  </div>
                  <button
                    className="mt-4 w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                    onClick={() => aiService.rewards.redeemReward(agentId, reward.id)}
                  >
                    Redeem Reward
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}