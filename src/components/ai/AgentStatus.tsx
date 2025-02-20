import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { aiService } from "@/lib/ai";

export function AgentStatus() {
  const { data: status, isLoading } = useQuery(["agent-status"], () =>
    aiService.getAgentStatuses(),
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agents Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Manager Status</h3>
            <Badge
              variant={
                status?.manager.status === "active" ? "default" : "secondary"
              }
            >
              {status?.manager.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Department Agents</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(status?.departments || {}).map(
                ([dept, info]: [string, any]) => (
                  <div
                    key={dept}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="capitalize">{dept}</span>
                    <Badge
                      variant={
                        info.status === "active" ? "default" : "secondary"
                      }
                    >
                      {info.status}
                    </Badge>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
